# Refresh Token 401 에러 해결 가이드

## 문제 상황

1. 로그인은 잘 되는데 새로고침하면 로그인이 풀림
2. `/auth/refresh`에서 401 Unauthorized 에러 발생
3. 로그인 풀린 상태에서 뒤로가기 하면 다시 로그인이 됨

## 원인 분석

### 1. 쿠키 저장/전송 문제

크로스 도메인 환경(`localhost:3000` → `onrender.com`)에서 쿠키가 제대로 저장되지 않거나 전송되지 않을 수 있습니다.

**필수 조건:**

- `sameSite: 'none'` (크로스 사이트 쿠키 허용)
- `secure: true` (HTTPS 필수)
- `httpOnly: true` (XSS 방지)
- CORS `credentials: true`
- 프론트엔드 요청에 `credentials: "include"` 또는 `withCredentials: true`

### 2. 새로고침 시 복구 로직 부재

SPA는 새로고침 시 메모리 상태가 초기화되므로, 앱 시작 시 로그인 상태를 복구하는 로직이 필요합니다.

## 백엔드 수정 사항

### 1. `/auth/refresh` 엔드포인트 개선

**수정 내용:**

- 쿠키 읽기 로직 개선 (여러 방법 시도)
- 상세한 에러 로깅 추가
- 디버깅 정보 추가

**주요 변경:**

```typescript
async refresh(@Req() req: Request) {
  // 쿠키 읽기 (여러 방법 시도)
  const cookies = req.cookies as { refresh_token?: string } | undefined;
  let refreshToken = cookies?.refresh_token;

  // 쿠키가 없으면 헤더에서 직접 읽기 시도
  if (!refreshToken) {
    const cookieHeader = req.headers.cookie;
    // Cookie 헤더에서 직접 파싱 시도
    // ...
  }

  // 상세한 에러 로깅
  if (!refreshToken) {
    console.error('[refresh] Refresh token not found in cookies');
    console.error('[refresh] Request headers:', {
      cookie: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
    });
    throw new UnauthorizedException('Refresh token not found in cookies');
  }
  // ...
}
```

### 2. 쿠키 설정 확인

**현재 설정:**

```typescript
const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax', // 프로덕션: 'none'
  secure: isProduction, // 프로덕션: true
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
  path: '/',
};
```

**중요:** `domain`은 명시하지 않습니다. 명시하면 쿠키가 저장되지 않을 수 있습니다.

### 3. 에러 로깅 개선

`auth.service.ts`의 `refreshToken` 메서드에 상세한 로깅을 추가했습니다.

## 프론트엔드 확인 사항

### 1. 쿠키 저장 확인

**크롬 개발자 도구에서 확인:**

1. `Application` 탭 → `Cookies` → 백엔드 도메인(`kakaotalk-excel-backend.onrender.com`)
2. `refresh_token` 쿠키가 있는지 확인
3. 쿠키 속성 확인:
   - `HttpOnly`: ✅
   - `Secure`: ✅
   - `SameSite`: `None`
   - `Path`: `/`

**쿠키가 없으면:**

- 쿠키 설정 문제 (백엔드)
- CORS 설정 문제
- 브라우저 쿠키 정책 문제

### 2. API 요청에 credentials 포함 확인

**모든 API 요청에 `credentials: "include"` 포함:**

```typescript
// ✅ 올바른 방법
fetch('https://kakaotalk-excel-backend.onrender.com/auth/refresh', {
  method: 'POST',
  credentials: 'include', // ⚠️ 필수!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 사용 시
axios.post(
  'https://kakaotalk-excel-backend.onrender.com/auth/refresh',
  {},
  {
    withCredentials: true, // ⚠️ 필수!
  },
);
```

### 3. 새로고침 시 복구 로직 확인

**앱 시작 시 로그인 상태 복구:**

```typescript
// 앱 최상위 컴포넌트 또는 레이아웃
useEffect(() => {
  const restoreAuth = async () => {
    try {
      // 1. /auth/me 호출 시도
      const user = await apiGet('/auth/me');
      // 사용자 정보 저장
      setUser(user);
    } catch (error) {
      // 2. 401이면 /auth/refresh 호출
      if (error.statusCode === 401) {
        try {
          const refreshResponse = await apiPost(
            '/auth/refresh',
            {},
            {
              credentials: 'include', // ⚠️ 필수!
            },
          );

          // 3. 새로운 accessToken 저장
          setAccessToken(refreshResponse.accessToken);

          // 4. 다시 /auth/me 호출
          const user = await apiGet('/auth/me', {
            headers: {
              Authorization: `Bearer ${refreshResponse.accessToken}`,
            },
          });
          setUser(user);
        } catch (refreshError) {
          // Refresh 실패 시 로그인 페이지로
          console.error('Token refresh failed:', refreshError);
          // 로그인 페이지로 리다이렉트 또는 로그인 상태 초기화
        }
      }
    }
  };

  restoreAuth();
}, []);
```

### 4. Network 탭에서 확인

**개발자 도구 → Network 탭:**

1. `/auth/refresh` 요청 확인
2. **Request Headers**에 `Cookie: refresh_token=...`가 있는지 확인
3. **Response Headers**에 `Set-Cookie`가 있는지 확인
4. **Status Code**가 401인지 확인

**401 에러가 발생하면:**

- Request Headers에 Cookie가 없음 → `credentials: "include"` 누락
- Cookie는 있지만 401 → 쿠키가 만료되었거나 DB에 없음

## 디버깅 체크리스트

### 백엔드 로그 확인

Render 대시보드에서 로그를 확인하세요:

```
[refresh] Cookie header: refresh_token=...
[refresh] Parsed cookies: { refresh_token: '...' }
[refreshToken] Starting token refresh process
[refreshToken] Token verified, userId: 1
[refreshToken] User found, generating new access token for userId: 1
[refresh] Token refreshed successfully
```

**에러가 발생하면:**

```
[refresh] Refresh token not found in cookies
[refresh] Request headers: { cookie: undefined, ... }
```

### 프론트엔드 콘솔 확인

```typescript
// apiClient.ts에 디버깅 로그 추가
console.log('Refresh URL:', `${API_BASE_URL}/auth/refresh`);
console.log('Refresh request with credentials:', true);
console.log('Refresh response status:', response.status);
```

## 해결 방법

### 방법 1: 쿠키가 저장되지 않는 경우

**백엔드 확인:**

1. Render 환경 변수 확인:
   - `NODE_ENV=production`
   - `FRONTEND_URL=http://localhost:3000` (또는 프론트엔드 배포 URL)

2. CORS 설정 확인 (`main.ts`):
   ```typescript
   app.enableCors({
     origin: (origin, callback) => {
       // 프론트엔드 URL 허용
       if (
         origin === 'http://localhost:3000' ||
         origin === '프론트엔드_배포_URL'
       ) {
         callback(null, true);
       } else {
         callback(null, false);
       }
     },
     credentials: true, // ⚠️ 필수!
   });
   ```

**프론트엔드 확인:**

1. 모든 API 요청에 `credentials: "include"` 포함
2. 브라우저 쿠키 정책 확인 (Chrome: Settings → Privacy → Cookies)

### 방법 2: 새로고침 시 복구 로직 추가

프론트엔드에서 앱 시작 시 로그인 상태를 복구하는 로직을 추가하세요 (위의 "새로고침 시 복구 로직 확인" 참고).

### 방법 3: 임시 해결책 (권장하지 않음)

**⚠️ 보안상 권장하지 않지만, 테스트용으로만 사용:**

```typescript
// localStorage에 accessToken 저장 (XSS 위험)
localStorage.setItem('accessToken', token);

// 새로고침 시 복구
const token = localStorage.getItem('accessToken');
if (token) {
  // /auth/me 호출하여 유효성 확인
  try {
    const user = await apiGet('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(user);
  } catch {
    // 토큰이 만료되었으면 refresh 시도
    // ...
  }
}
```

## 예상되는 개선 효과

1. **명확한 에러 메시지**: 로그에서 정확한 원인 파악 가능
2. **디버깅 용이**: 상세한 로깅으로 문제 추적 용이
3. **안정성 향상**: 쿠키 읽기 로직 개선으로 쿠키 전송 문제 해결

## 추가 권장 사항

1. **프론트엔드에서 에러 처리 개선:**

   ```typescript
   // 401 에러 시 자동으로 refresh 시도
   if (error.statusCode === 401) {
     try {
       const newToken = await refreshToken();
       // 원래 요청 재시도
       return retryRequest(newToken);
     } catch {
       // 로그인 페이지로 리다이렉트
     }
   }
   ```

2. **토큰 만료 전 자동 갱신:**

   ```typescript
   // Access Token 만료 5분 전에 자동 갱신
   const tokenExpiry = getTokenExpiry(accessToken);
   const refreshTime = tokenExpiry - 5 * 60 * 1000; // 5분 전
   setTimeout(() => {
     refreshToken();
   }, refreshTime);
   ```

3. **모니터링 추가:**
   - Refresh Token 실패율 모니터링
   - 쿠키 저장 실패율 모니터링
   - 사용자별 로그인 세션 지속 시간 추적

## 관련 파일

- `src/modules/auth/auth.controller.ts` (쿠키 설정 및 refresh 엔드포인트)
- `src/modules/auth/auth.service.ts` (refreshToken 메서드)
- `src/main.ts` (CORS 설정)
