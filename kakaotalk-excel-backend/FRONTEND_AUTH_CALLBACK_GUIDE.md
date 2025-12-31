# 프론트엔드 인증 콜백 처리 가이드

카카오 로그인 후 백엔드에서 프론트엔드로 리다이렉트되는 콜백을 처리하는 방법입니다.

---

## 📋 개요

카카오 로그인 성공 후, 백엔드는 다음과 같이 프론트엔드로 리다이렉트합니다:

### 성공 시

```
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 실패 시

```
http://localhost:3000/auth/callback?error=Authentication%20failed
```

---

## 🚀 구현 방법

### 1. 프론트엔드 서버 실행

**중요**: 프론트엔드를 반드시 `http://localhost:3000`에서 실행해야 합니다!

```bash
# 예시: React 앱 실행
npm start
# 또는
npm run dev
```

프론트엔드가 실행 중이어야 백엔드의 리다이렉트를 받을 수 있습니다.

---

### 2. 콜백 페이지 생성

프론트엔드에 `/auth/callback` 경로를 처리하는 페이지/컴포넌트를 만드세요.

#### React + React Router 예시

```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // 에러 처리
      console.error('로그인 실패:', decodeURIComponent(error));
      // 에러 페이지로 리다이렉트 또는 에러 메시지 표시
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      // ✅ 토큰 저장
      localStorage.setItem('accessToken', token);

      // ✅ 사용자 정보 가져오기 (선택사항)
      // fetchUserInfo(token);

      // ✅ 메인 페이지로 리다이렉트
      navigate('/');
    } else {
      // 토큰이 없는 경우 로그인 페이지로 리다이렉트
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>로그인 처리 중...</div>
    </div>
  );
}
```

#### Next.js 예시

```typescript
// pages/auth/callback.tsx 또는 app/auth/callback/page.tsx
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('로그인 실패:', decodeURIComponent(error));
      router.push('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      localStorage.setItem('accessToken', token);
      router.push('/');
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return <div>로그인 처리 중...</div>;
}
```

---

### 3. 라우팅 설정

#### React Router 예시

```typescript
// src/App.tsx 또는 라우터 설정 파일
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* 다른 라우트들... */}
      </Routes>
    </BrowserRouter>
  );
}
```

#### Next.js 예시

Next.js는 파일 기반 라우팅을 사용하므로, 파일을 만들면 자동으로 라우트가 생성됩니다:

- `pages/auth/callback.tsx` (Pages Router)
- `app/auth/callback/page.tsx` (App Router)

---

### 4. API 호출 시 토큰 사용

토큰을 저장한 후, API 호출 시 헤더에 포함하세요.

#### Axios 예시

```typescript
// src/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://kakaotalk-excel-backend.onrender.com',
});

// 요청 인터셉터: 모든 요청에 토큰 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 에러 시 토큰 재발급 시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh Token으로 Access Token 재발급
      try {
        const response = await axios.post(
          'https://kakaotalk-excel-backend.onrender.com/auth/refresh',
          {},
          { withCredentials: true }, // 쿠키 전송
        );
        const newToken = response.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        // 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh 실패 시 로그인 페이지로
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

---

## 🔍 문제 해결

### 문제 1: "사이트에 연결할 수 없음" (ERR_CONNECTION_REFUSED)

**원인**: 프론트엔드가 `localhost:3000`에서 실행되지 않음

**해결**:

1. 프론트엔드 서버를 실행하세요
2. `http://localhost:3000`에서 접근 가능한지 확인하세요

```bash
# 프론트엔드 실행
npm start
# 또는
npm run dev
```

---

### 문제 2: 리다이렉트는 되지만 토큰이 없음

**원인**: URL 파라미터를 제대로 파싱하지 못함

**해결**: `useSearchParams()` 또는 `URLSearchParams`를 사용하여 쿼리 파라미터를 올바르게 파싱하세요.

```typescript
// ✅ 올바른 방법
const token = searchParams.get('token');

// ❌ 잘못된 방법
const token = window.location.search.split('token=')[1];
```

---

### 문제 3: CORS 에러

**원인**: 백엔드 CORS 설정 문제

**해결**: 백엔드의 `FRONTEND_URL` 환경 변수가 `http://localhost:3000`으로 설정되어 있는지 확인하세요.

Render 환경 변수:

```env
FRONTEND_URL=http://localhost:3000
```

---

## 📝 전체 플로우 요약

```
1. 사용자가 "카카오 로그인" 버튼 클릭
   ↓
2. 프론트엔드: window.location.href = 'https://kakaotalk-excel-backend.onrender.com/auth/kakao'
   ↓
3. 백엔드: 카카오 로그인 페이지로 리다이렉트
   ↓
4. 사용자가 카카오에서 로그인
   ↓
5. 카카오: 백엔드 콜백 URL로 리다이렉트
   ↓
6. 백엔드: 토큰 생성 후 프론트엔드로 리다이렉트
   http://localhost:3000/auth/callback?token=...
   ↓
7. 프론트엔드: /auth/callback 페이지에서 토큰 받아서 저장
   ↓
8. 프론트엔드: 메인 페이지로 리다이렉트
```

---

## ✅ 체크리스트

프론트엔드 개발자가 확인해야 할 사항:

- [ ] 프론트엔드가 `http://localhost:3000`에서 실행 중인가?
- [ ] `/auth/callback` 경로가 라우터에 등록되어 있는가?
- [ ] 콜백 페이지에서 `token` 쿼리 파라미터를 올바르게 파싱하는가?
- [ ] 토큰을 `localStorage` 또는 상태 관리에 저장하는가?
- [ ] API 호출 시 `Authorization: Bearer {token}` 헤더를 포함하는가?
- [ ] 에러 처리 (`error` 쿼리 파라미터)를 구현했는가?

---

## 🎯 빠른 시작 예제

### 1. 로그인 버튼 컴포넌트

```typescript
// src/components/LoginButton.tsx
export default function LoginButton() {
  const handleKakaoLogin = () => {
    window.location.href = 'https://kakaotalk-excel-backend.onrender.com/auth/kakao';
  };

  return (
    <button onClick={handleKakaoLogin}>
      카카오 로그인
    </button>
  );
}
```

### 2. 콜백 페이지 (최소 구현)

```typescript
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      localStorage.setItem('accessToken', token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div>로그인 처리 중...</div>;
}
```

### 3. API 호출 예제

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://kakaotalk-excel-backend.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 📚 관련 문서

- [프론트엔드 개발자 가이드](./FRONTEND_DEVELOPER_GUIDE.md)
- [카카오 OAuth 설정 가이드](./KAKAO_OAUTH_SETUP.md)

---

**질문이나 문제가 있으면 백엔드 개발자에게 문의하세요!** 🚀
