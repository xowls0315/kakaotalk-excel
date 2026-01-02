# 프론트엔드 문제 해결 가이드

## 문제 1: 새로고침 시 로그인 정보가 날라가는 문제

### 문제 분석

로그인은 되는데 새로고침하면 로그인 정보가 날라가는 문제는 **프론트엔드와 백엔드 양쪽 모두** 확인이 필요합니다.

### 진단 방법 (프론트엔드 개발자에게 확인 요청)

#### (A) 쿠키 저장 확인

**크롬 개발자 도구에서 확인:**

1. `Application` 탭 → `Cookies` → `kakaotalk-excel-backend.onrender.com`
2. `refresh_token` 쿠키가 있는지 확인
3. 쿠키 속성 확인:
   - `HttpOnly`: ✅
   - `Secure`: ✅
   - `SameSite`: `None` (프로덕션 환경)
   - `Path`: `/`

**결과:**

- ❌ 쿠키가 없음 → 백엔드 쿠키 설정 문제 또는 CORS 문제
- ✅ 쿠키가 있음 → 다음 단계로

#### (B) 쿠키 전송 확인

**Network 탭에서 확인:**

1. 새로고침 후 `/auth/me` 또는 `/auth/refresh` 요청 확인
2. **Request Headers**에 `Cookie: refresh_token=...`가 있는지 확인

**결과:**

- ❌ Cookie 헤더가 없음 → 프론트엔드 `credentials: "include"` 누락
- ✅ Cookie 헤더가 있음 → 다음 단계로

#### (C) 새로고침 시 복구 로직 확인

**프론트엔드 코드 확인:**

1. 앱 시작 시 `/auth/me` 호출하는지 확인
2. 401 에러 시 `/auth/refresh` 호출하는지 확인
3. 새로운 Access Token을 저장하는지 확인

**결과:**

- ❌ 복구 로직이 없음 → 프론트엔드 문제 (구현 필요)
- ✅ 복구 로직이 있음 → 백엔드 문제 (토큰 검증 실패)

### 해결 방법

#### 프론트엔드에서 해결해야 할 부분

**1. Access Token을 localStorage에 저장**

```typescript
// 로그인 콜백 페이지에서
const token = searchParams.get('token');
if (token) {
  localStorage.setItem('accessToken', token); // ✅ 필수!
  // 또는 상태 관리 라이브러리 사용
}
```

**2. 새로고침 시 로그인 상태 복구**

```typescript
// 앱 최상위 컴포넌트 또는 레이아웃
useEffect(() => {
  const restoreAuth = async () => {
    // 1. localStorage에서 accessToken 확인
    const savedToken = localStorage.getItem('accessToken');

    if (savedToken) {
      // 2. /auth/me 호출하여 유효성 확인
      try {
        const user = await apiGet('/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setUser(user);
        return;
      } catch (error) {
        // 토큰이 만료되었으면 localStorage에서 제거
        localStorage.removeItem('accessToken');
      }
    }

    // 3. accessToken이 없거나 만료되었으면 refresh 시도
    try {
      const refreshResponse = await apiPost(
        '/auth/refresh',
        {},
        {
          credentials: 'include', // ⚠️ 필수!
        },
      );

      // 4. 새로운 accessToken 저장
      localStorage.setItem('accessToken', refreshResponse.accessToken);

      // 5. 다시 /auth/me 호출
      const user = await apiGet('/auth/me', {
        headers: { Authorization: `Bearer ${refreshResponse.accessToken}` },
      });
      setUser(user);
    } catch (refreshError) {
      // Refresh 실패 시 로그인 페이지로
      console.error('Token refresh failed:', refreshError);
      // 로그인 상태 초기화
    }
  };

  restoreAuth();
}, []);
```

**3. 모든 API 요청에 credentials 포함**

```typescript
// apiClient.ts
const response = await fetch(url, {
  ...options,
  credentials: 'include', // ⚠️ 필수! (쿠키 전송)
  headers,
});
```

#### 백엔드에서 해결한 부분

✅ **쿠키 설정 개선:**

- Render 환경 변수 자동 감지로 프로덕션 설정 적용
- `sameSite: 'none'`, `secure: true` 자동 설정

✅ **에러 로깅 개선:**

- 상세한 로깅으로 문제 추적 용이

### 확인 체크리스트

프론트엔드 개발자가 확인해야 할 사항:

- [ ] 로그인 콜백에서 `accessToken`을 `localStorage`에 저장하는가?
- [ ] 앱 시작 시 로그인 상태 복구 로직이 있는가?
- [ ] 모든 API 요청에 `credentials: "include"`가 포함되어 있는가?
- [ ] 401 에러 시 자동으로 `/auth/refresh`를 호출하는가?
- [ ] 새로운 Access Token을 받으면 `localStorage`에 저장하는가?

---

## 문제 2: `/jobs` GET 요청 시 500 에러

### 문제 분석

500 에러는 서버 내부 오류를 의미합니다. 가능한 원인:

1. `user` 객체가 `undefined`이거나 `user.id`가 없음
2. 데이터베이스 쿼리 중 에러 발생
3. 입력 파라미터 검증 실패

### 백엔드 수정 사항

#### 1. 사용자 정보 검증 추가

```typescript
async getJobs(
  @CurrentUser() user: User,
  @Query('status') status?: string,
  @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  @Query('size', new ParseIntPipe({ optional: true })) size = 20,
) {
  // ✅ 사용자 정보 검증 추가
  if (!user) {
    console.error('[getJobs] User is undefined');
    throw new BadRequestException('User information is missing');
  }
  if (!user.id) {
    console.error('[getJobs] User ID is missing', { user });
    throw new BadRequestException('User ID is missing');
  }

  try {
    console.log('[getJobs] Fetching jobs for user:', user.id);
    return await this.jobsService.findUserJobs(user.id, status, page, size);
  } catch (error) {
    console.error('[getJobs] Error fetching jobs:', error);
    // 에러 처리
  }
}
```

#### 2. 입력 검증 및 에러 핸들링 강화

```typescript
async findUserJobs(userId: number, status?: string, page = 1, size = 20) {
  try {
    // ✅ 입력 검증
    if (!userId || typeof userId !== 'number' || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (size < 1 || size > 100) {
      throw new BadRequestException('Size must be between 1 and 100');
    }

    // ✅ 상태 검증
    if (status) {
      const validStatuses = ['previewed', 'processing', 'success', 'failed', 'expired'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }
    }

    // 쿼리 실행
    // ...
  } catch (error) {
    console.error('[findUserJobs] Error:', error);
    // 에러 처리
  }
}
```

### 프론트엔드 확인 사항

**1. Access Token이 제대로 전송되는지 확인**

```typescript
// Network 탭에서 확인
// Request Headers에 다음이 있어야 함:
Authorization: Bearer {accessToken}
```

**2. 에러 응답 확인**

```typescript
try {
  const response = await apiGet('/jobs');
  return response;
} catch (error) {
  // 에러 상세 정보 확인
  console.error('Error response:', error.response?.data);
  console.error('Error status:', error.statusCode);

  // 400 에러인 경우: 잘못된 요청 (명확한 메시지 제공)
  // 401 에러인 경우: 인증 실패 (토큰 재발급 시도)
  // 500 에러인 경우: 서버 오류 (백엔드 로그 확인 필요)
}
```

### 해결 방법

#### 프론트엔드에서 확인할 사항

1. **Access Token이 제대로 전송되는지 확인**
   - Network 탭에서 Request Headers 확인
   - `Authorization: Bearer {token}` 형식인지 확인

2. **에러 응답 확인**
   - 500 에러 응답 본문 확인
   - 백엔드 로그와 비교

#### 백엔드에서 해결한 부분

✅ **사용자 정보 검증 추가**
✅ **입력 검증 강화**
✅ **에러 핸들링 개선**
✅ **상세한 로깅 추가**

---

## 문제 3: `/auth/logout` POST 요청 시 500 에러

### 문제 분석

500 에러는 서버 내부 오류를 의미합니다. 가능한 원인:

1. `user` 객체가 `undefined`이거나 `user.id`가 없음
2. Refresh Token 삭제 중 에러 발생
3. 쿠키 삭제 중 에러 발생

### 백엔드 수정 사항

#### 1. 사용자 정보 검증 추가

```typescript
async logout(@CurrentUser() user: User, @Res() res: Response) {
  // ✅ 사용자 정보 검증 추가
  if (!user) {
    console.error('[logout] User is undefined');
    throw new UnauthorizedException('User information is missing');
  }
  if (!user.id) {
    console.error('[logout] User ID is missing', { user });
    throw new UnauthorizedException('User ID is missing');
  }

  try {
    console.log('[logout] Logging out user:', user.id);
    await this.authService.logout(user.id);

    // ✅ 쿠키 삭제 (프로덕션 환경 고려)
    const isProduction =
      this.configService.get<boolean>('app.isProduction') ?? false;
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      path: '/',
    });

    console.log('[logout] Logout successful for user:', user.id);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[logout] Logout failed:', error);
    // 에러 처리
  }
}
```

#### 2. auth.service.ts의 logout 메서드 개선

```typescript
async logout(userId: number) {
  try {
    console.log('[logout] Deleting refresh tokens for user:', userId);
    await this.refreshTokenRepository.delete({ userId });
    console.log('[logout] Refresh tokens deleted successfully');
  } catch (error) {
    console.error('[logout] Failed to delete refresh tokens:', error);
    throw error;
  }
}
```

### 프론트엔드 확인 사항

**1. Access Token이 제대로 전송되는지 확인**

```typescript
// Network 탭에서 확인
// Request Headers에 다음이 있어야 함:
Authorization: Bearer {accessToken}
```

**2. 로그아웃 후 처리**

```typescript
const handleLogout = async () => {
  try {
    await apiPost(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ⚠️ 필수!
        },
        credentials: 'include', // ⚠️ 필수! (쿠키 삭제를 위해)
      },
    );

    // ✅ 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');

    // ✅ 사용자 상태 초기화
    setUser(null);

    // ✅ 로그인 페이지로 리다이렉트
    navigate('/login');
  } catch (error) {
    console.error('Logout error:', error);
    // 에러가 발생해도 로컬 상태는 초기화
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  }
};
```

### 해결 방법

#### 프론트엔드에서 확인할 사항

1. **Access Token이 제대로 전송되는지 확인**
   - Network 탭에서 Request Headers 확인
   - `Authorization: Bearer {token}` 형식인지 확인

2. **에러 응답 확인**
   - 500 에러 응답 본문 확인
   - 백엔드 로그와 비교

#### 백엔드에서 해결한 부분

✅ **사용자 정보 검증 추가**
✅ **쿠키 삭제 설정 개선** (프로덕션 환경 고려)
✅ **에러 핸들링 개선**
✅ **상세한 로깅 추가**

---

## 전체 해결 체크리스트

### 백엔드 확인 사항

- [x] Render 환경 변수 자동 감지 구현
- [x] 쿠키 설정이 프로덕션 모드로 동작
- [x] `/jobs` 엔드포인트에 사용자 검증 추가
- [x] `/auth/logout` 엔드포인트에 사용자 검증 추가
- [x] 에러 핸들링 개선
- [x] 상세한 로깅 추가

### 프론트엔드 확인 사항

- [ ] 로그인 콜백에서 `accessToken`을 `localStorage`에 저장
- [ ] 앱 시작 시 로그인 상태 복구 로직 구현
- [ ] 모든 API 요청에 `credentials: "include"` 포함
- [ ] 401 에러 시 자동으로 `/auth/refresh` 호출
- [ ] 새로운 Access Token을 받으면 `localStorage`에 저장
- [ ] 로그아웃 시 `localStorage`에서 토큰 제거

---

## 디버깅 방법

### 1. 백엔드 로그 확인

Render 대시보드에서 로그 확인:

```
[getJobs] Fetching jobs for user: 1
[findUserJobs] Searching for jobs with userId: 1, status: all
[findUserJobs] Found 5 jobs for userId: 1
```

**에러가 발생하면:**

```
[getJobs] User is undefined
[getJobs] User ID is missing
[findUserJobs] Error: ...
```

### 2. 프론트엔드 Network 탭 확인

**성공적인 요청:**

- Request Headers: `Authorization: Bearer {token}`, `Cookie: refresh_token=...`
- Status Code: `200 OK`
- Response: 정상 데이터

**실패한 요청:**

- Request Headers: `Authorization` 헤더가 없거나 잘못됨
- Status Code: `401 Unauthorized` 또는 `500 Internal Server Error`
- Response: 에러 메시지

### 3. 쿠키 확인

**크롬 개발자 도구:**

1. `Application` 탭 → `Cookies` → `kakaotalk-excel-backend.onrender.com`
2. `refresh_token` 쿠키 확인
3. 쿠키 속성 확인:
   - `SameSite`: `None` (프로덕션)
   - `Secure`: `true` (프로덕션)
   - `HttpOnly`: `true`

---

## 예상되는 개선 효과

### 1. 새로고침 시 로그인 유지

- ✅ Access Token을 localStorage에 저장
- ✅ 새로고침 시 자동으로 로그인 상태 복구
- ✅ Refresh Token으로 Access Token 재발급

### 2. `/jobs` API 안정성 향상

- ✅ 사용자 정보 검증으로 500 에러 방지
- ✅ 입력 검증으로 잘못된 요청 방지
- ✅ 명확한 에러 메시지 제공

### 3. `/auth/logout` 안정성 향상

- ✅ 사용자 정보 검증으로 500 에러 방지
- ✅ 쿠키 삭제 설정 개선
- ✅ 명확한 에러 메시지 제공

---

## 관련 파일

- `src/modules/jobs/jobs.controller.ts` (사용자 검증 및 에러 핸들링)
- `src/modules/jobs/jobs.service.ts` (입력 검증 및 에러 핸들링)
- `src/modules/auth/auth.controller.ts` (로그아웃 개선)
- `src/modules/auth/auth.service.ts` (로그아웃 로직)
- `src/config/app.config.ts` (프로덕션 환경 감지)
