# 프로덕션 환경 자동 감지 및 쿠키 설정 수정 가이드

## 문제 상황

1. 로그인 시도 시 500 에러 발생
2. 가끔 로그인이 되는데 새로고침하면 로그인이 풀림
3. `/auth/refresh`에서 401 에러 발생
4. `NODE_ENV=production` 설정 시 배포 실패

## 원인 분석

### 1. NODE_ENV=production 없이 배포 성공했지만...

**현재 문제:**

- `NODE_ENV`가 없으면 기본값이 `'development'`
- 쿠키 설정이 개발 모드로 동작:
  ```typescript
  sameSite: 'lax',  // ❌ 크로스 도메인 쿠키 전송 불가
  secure: false,    // ❌ HTTP에서도 쿠키 전송
  ```
- 프론트엔드(`localhost:3000`)에서 백엔드(`onrender.com`) 쿠키를 받을 수 없음
- 결과: 로그인 후 새로고침 시 쿠키가 없어서 로그인이 풀림

### 2. NODE_ENV=production 설정 시 배포 실패

**원인:**

- `synchronize: false`가 되어 데이터베이스 테이블이 자동 생성되지 않음
- 테이블이 없으면 애플리케이션이 시작되지 않음

## 해결 방법

### ✅ Render 환경 변수 자동 감지

`NODE_ENV=production`을 설정하지 않아도, Render의 환경 변수를 자동으로 감지하여 프로덕션 모드로 설정합니다.

## 수정 사항

### 1. `app.config.ts` - 프로덕션 환경 자동 감지

```typescript
// Render 환경 변수 자동 감지
const isRender =
  process.env.RENDER === 'true' ||
  !!process.env.RENDER_EXTERNAL_URL ||
  !!process.env.RENDER_SERVICE_NAME;
const isProduction =
  nodeEnv === 'production' || isRender || process.env.IS_PRODUCTION === 'true';

return {
  nodeEnv: isProduction ? 'production' : 'development',
  isProduction, // 명시적인 프로덕션 플래그
  // ...
};
```

**변경 사항:**

- Render 환경 변수(`RENDER`, `RENDER_EXTERNAL_URL`, `RENDER_SERVICE_NAME`) 자동 감지
- `isProduction` 플래그 추가 (NODE_ENV 없이도 사용 가능)

### 2. `auth.controller.ts` - 쿠키 설정 개선

**변경 전:**

```typescript
const nodeEnv = this.configService.get<string>('app.nodeEnv');
const isProduction = nodeEnv === 'production';
```

**변경 후:**

```typescript
const isProduction =
  this.configService.get<boolean>('app.isProduction') ?? false;
```

**효과:**

- `NODE_ENV` 없이도 Render 환경에서 프로덕션 설정 적용
- 쿠키 설정이 올바르게 작동:
  ```typescript
  sameSite: 'none',  // ✅ 크로스 도메인 쿠키 허용
  secure: true,      // ✅ HTTPS에서만 쿠키 전송
  ```

### 3. `auth.controller.ts` - 에러 핸들링 개선

**추가된 로깅:**

```typescript
console.log('[kakaoCallback] User authenticated:', {
  id: user.id,
  nickname: user.nickname,
  email: user.email,
});

// 에러 발생 시 상세 로깅
console.error('[kakaoCallback] Error occurred:', error);
if (error instanceof Error) {
  console.error('[kakaoCallback] Error message:', error.message);
  console.error('[kakaoCallback] Error stack:', error.stack);
}
```

**효과:**

- 500 에러 발생 시 원인 파악 용이
- 디버깅 정보 제공

### 4. `auth.service.ts` - login 메서드 에러 핸들링 개선

**추가된 로깅:**

```typescript
console.log('[login] Starting login process for user:', user.id);
// ...
console.log('[login] Login successful for user:', user.id);
```

**에러 처리:**

```typescript
try {
  // 로그인 로직
} catch (error) {
  console.error('[login] Login failed:', error);
  throw error;
}
```

**효과:**

- 로그인 실패 시 원인 파악 용이
- 단계별 로깅으로 문제 추적 가능

### 5. `database.config.ts` - 프로덕션 환경 자동 감지

**변경 전:**

```typescript
synchronize: process.env.NODE_ENV !== 'production',
logging: process.env.NODE_ENV === 'development',
ssl: process.env.NODE_ENV === 'production' ? { ... } : false,
```

**변경 후:**

```typescript
const isProduction = /* Render 환경 변수 자동 감지 */;
synchronize: !isProduction,
logging: !isProduction,
ssl: isProduction ? { ... } : false,
```

**효과:**

- `NODE_ENV` 없이도 프로덕션 설정 적용
- Render 환경에서 자동으로 SSL 연결 활성화

### 6. `guest-session.middleware.ts` - 프로덕션 환경 자동 감지

**변경 전:**

```typescript
secure: process.env.NODE_ENV === 'production',
sameSite: 'lax',
```

**변경 후:**

```typescript
const isProduction = this.configService.get<boolean>('app.isProduction') ?? false;
secure: isProduction,
sameSite: isProduction ? 'none' : 'lax',
```

**효과:**

- 게스트 세션 쿠키도 크로스 도메인에서 작동
- 프로덕션 환경에서 올바른 쿠키 설정 적용

### 7. `main.ts` - CORS 설정 개선

**변경 전:**

```typescript
const nodeEnv = configService.get<string>('app.nodeEnv');
if (nodeEnv === 'production') { ... }
```

**변경 후:**

```typescript
const isProduction = configService.get<boolean>('app.isProduction') ?? false;
if (isProduction) { ... }
```

**효과:**

- `NODE_ENV` 없이도 프로덕션 CORS 설정 적용

## Render 환경 변수 설정

### ✅ 설정하지 않아도 되는 것

- `NODE_ENV=production` (자동 감지됨)

### ✅ 필수 환경 변수

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `FRONTEND_URL` (예: `http://localhost:3000`)

### ✅ Render가 자동으로 설정하는 환경 변수

- `RENDER`: `'true'` (Render 서비스임을 나타냄)
- `RENDER_EXTERNAL_URL`: Render 서비스의 외부 URL
- `RENDER_SERVICE_NAME`: Render 서비스 이름

이 환경 변수들이 있으면 자동으로 프로덕션 환경으로 감지됩니다.

## 예상되는 개선 효과

### 1. 쿠키 설정 개선

**변경 전 (NODE_ENV 없음):**

```typescript
sameSite: 'lax',  // ❌ 크로스 도메인 쿠키 전송 불가
secure: false,    // ❌ HTTP에서도 쿠키 전송
```

→ 프론트엔드에서 쿠키를 받을 수 없어서 로그인이 풀림

**변경 후 (Render 환경 변수 자동 감지):**

```typescript
sameSite: 'none',  // ✅ 크로스 도메인 쿠키 허용
secure: true,      // ✅ HTTPS에서만 쿠키 전송
```

→ 프론트엔드에서 쿠키를 받을 수 있어서 로그인이 유지됨

### 2. 배포 성공률 향상

- `NODE_ENV=production` 설정 없이도 배포 가능
- Render 환경 변수 자동 감지로 프로덕션 설정 적용

### 3. 디버깅 용이성 향상

- 상세한 로깅으로 문제 추적 용이
- 500 에러 발생 시 원인 파악 가능

## 테스트 방법

### 1. 배포 후 확인

1. Render 대시보드에서 로그 확인:

   ```
   [kakaoCallback] Refresh token cookie set: {
     sameSite: 'none',  // ✅ 프로덕션 설정
     secure: true,      // ✅ 프로덕션 설정
     ...
   }
   ```

2. 프론트엔드 개발자 도구에서 확인:
   - `Application` 탭 → `Cookies` → `kakaotalk-excel-backend.onrender.com`
   - `refresh_token` 쿠키가 있는지 확인
   - 쿠키 속성 확인:
     - `SameSite`: `None` ✅
     - `Secure`: `true` ✅

### 2. 로그인 테스트

1. 카카오 로그인 시도
2. 로그인 성공 확인
3. 새로고침 후 로그인 상태 유지 확인

### 3. Refresh Token 테스트

1. 새로고침 시 `/auth/refresh` 호출 확인
2. 401 에러가 발생하지 않는지 확인
3. 새로운 Access Token이 발급되는지 확인

## 문제 해결 체크리스트

### 백엔드 확인

- [x] Render 환경 변수 자동 감지 구현
- [x] 쿠키 설정이 프로덕션 모드로 동작
- [x] 에러 핸들링 개선
- [x] 상세한 로깅 추가

### 프론트엔드 확인

- [ ] 모든 API 요청에 `credentials: "include"` 포함
- [ ] 새로고침 시 로그인 상태 복구 로직 구현
- [ ] 쿠키 저장 확인 (개발자 도구)
- [ ] Network 탭에서 쿠키 전송 확인

## 추가 권장 사항

### 1. 데이터베이스 마이그레이션

프로덕션 환경에서는 `synchronize: false`이므로, 데이터베이스 테이블을 수동으로 생성하거나 마이그레이션을 사용해야 합니다.

**초기 배포 시:**

1. `synchronize: true`로 임시 설정
2. 배포 후 테이블 생성 확인
3. `synchronize: false`로 변경

또는 TypeORM Migrations를 사용하세요.

### 2. 모니터링

- 로그인 실패율 모니터링
- Refresh Token 실패율 모니터링
- 쿠키 저장 실패율 모니터링

## 관련 파일

- `src/config/app.config.ts` (프로덕션 환경 감지 로직)
- `src/modules/auth/auth.controller.ts` (쿠키 설정 및 에러 핸들링)
- `src/modules/auth/auth.service.ts` (로그인 로직 개선)
- `src/config/database.config.ts` (데이터베이스 설정)
- `src/common/middleware/guest-session.middleware.ts` (게스트 세션 쿠키)
- `src/main.ts` (CORS 설정)

## FAQ

### Q: NODE_ENV=production을 설정해야 하나요?

**A:** 아니요. Render 환경에서는 자동으로 감지되므로 설정하지 않아도 됩니다. 설정하면 배포가 실패할 수 있습니다.

### Q: 프로덕션 환경이 제대로 감지되는지 확인하려면?

**A:** Render 로그에서 다음을 확인하세요:

```
[kakaoCallback] Refresh token cookie set: { sameSite: 'none', secure: true, ... }
```

`sameSite: 'none'`과 `secure: true`가 보이면 프로덕션 환경으로 올바르게 감지된 것입니다.

### Q: 여전히 쿠키가 저장되지 않으면?

**A:** 다음을 확인하세요:

1. 프론트엔드에서 `credentials: "include"` 포함 여부
2. CORS 설정에서 `credentials: true` 확인
3. 브라우저 쿠키 정책 확인 (Chrome: Settings → Privacy → Cookies)
