# 프론트엔드 개발자 가이드

이 문서는 프론트엔드 개발자가 백엔드 API를 사용하기 위한 가이드입니다.

## 목차

1. [시작하기](#1-시작하기)
2. [백엔드 서버 접근 방법](#2-백엔드-서버-접근-방법)
3. [환경 설정](#3-환경-설정)
4. [API 기본 정보](#4-api-기본-정보)
5. [인증 플로우](#5-인증-플로우)
6. [주요 API 사용법](#6-주요-api-사용법)
7. [에러 처리](#7-에러-처리)
8. [예제 코드](#8-예제-코드)

---

## 1. 시작하기

### 1.1. Swagger UI 접속

백엔드 서버가 실행 중이면 다음 URL로 접속하세요:

```
http://localhost:3001/api
```

또는 백엔드 개발자가 제공한 서버 URL:

```
https://your-backend-server.com/api
```

Swagger UI에서 모든 API를 확인하고 테스트할 수 있습니다.

### 1.2. API 기본 URL

- **로컬 개발**: `http://localhost:3001` (백엔드 개발자가 로컬 서버 실행 시)
- **공유 개발 서버**: 백엔드 개발자가 제공한 URL
- **프로덕션**: 배포된 서버 URL

---

## 2. 백엔드 서버 접근 방법

프론트엔드 개발자가 백엔드 API를 사용하는 방법은 세 가지입니다:

### 방법 1: 배포된 서버 사용 (가장 권장) 🚀

**백엔드 개발자가 Render 등으로 서버를 배포한 경우:**

1. 백엔드 개발자에게 배포된 서버 URL 요청
   - 예: `https://kakaotalk-excel-backend.onrender.com`
   - 또는: `https://your-backend-domain.com`

2. Swagger UI 접속

   ```
   https://kakaotalk-excel-backend.onrender.com/api
   ```

3. 프론트엔드 코드에서 API URL 설정:
   ```typescript
   // .env.local 또는 환경 변수
   NEXT_PUBLIC_API_URL=https://kakaotalk-excel-backend.onrender.com
   ```

**장점:**

- ✅ 환경 설정 완전히 불필요
- ✅ 24/7 접근 가능
- ✅ 네트워크 제약 없음
- ✅ 실제 프로덕션 환경과 유사
- ✅ 가장 빠른 개발 시작

**단점:**

- 없음 (가장 이상적인 방법)

### 방법 2: 백엔드 개발자의 로컬 서버 사용

**백엔드 개발자가 서버를 실행하고 Swagger UI URL을 공유하는 경우:**

1. 백엔드 개발자에게 Swagger UI URL 요청
   - 예: `http://localhost:3001/api` (로컬 네트워크)
   - 또는: `https://dev-backend.example.com/api` (배포된 서버)

2. 브라우저에서 Swagger UI 접속하여 API 테스트

3. 프론트엔드 코드에서 API URL 설정:
   ```typescript
   // .env.local 또는 환경 변수
   NEXT_PUBLIC_API_URL=http://localhost:3001
   // 또는
   NEXT_PUBLIC_API_URL=https://dev-backend.example.com
   ```

**장점:**

- 프론트엔드 개발자는 백엔드 설정 없이 바로 API 사용 가능
- 백엔드 개발자가 환경 변수와 데이터베이스를 관리
- 빠른 개발 시작

**단점:**

- 백엔드 개발자의 서버가 실행 중이어야 함
- 네트워크 연결 필요 (로컬 네트워크 또는 인터넷)

### 방법 3: 프론트엔드 개발자가 직접 백엔드 실행

**프론트엔드 개발자가 백엔드 폴더를 받아서 직접 실행하는 경우:**

1. 백엔드 폴더로 이동

   ```bash
   cd kakaotalk-excel-backend
   ```

2. 의존성 설치

   ```bash
   npm install
   ```

3. 환경 변수 설정
   - `.env.example` 파일을 복사하여 `.env` 파일 생성
   - 각 환경 변수에 실제 값 입력
   - 자세한 방법은 `ENV_SETUP_GUIDE.md` 참고

4. 데이터베이스 설정
   - PostgreSQL 설치 및 데이터베이스 생성
   - `database/schema.sql` 파일 실행

5. 카카오 OAuth 설정
   - 카카오 개발자 콘솔에서 앱 생성
   - Client ID 및 Secret 발급
   - Redirect URI 등록
   - 자세한 방법은 `KAKAO_OAUTH_SETUP.md` 참고

6. 서버 실행

   ```bash
   npm run start:dev
   ```

7. Swagger UI 접속
   ```
   http://localhost:3001/api
   ```

**장점:**

- 백엔드 개발자와 독립적으로 개발 가능
- 로컬에서 모든 기능 테스트 가능

**단점:**

- 환경 설정이 복잡함
- 데이터베이스 및 카카오 OAuth 설정 필요
- 시간이 더 소요됨

### 추천 방법

**개발 초기 단계**: 방법 1 (배포된 서버 사용) - 가장 권장

- 가장 빠른 시작
- 환경 설정 불필요
- 24/7 접근 가능

**백엔드 개발자가 로컬 서버를 실행하는 경우**: 방법 2 (백엔드 개발자의 로컬 서버 사용)

- 빠른 시작
- API 구조 파악
- 기본 통합 테스트

**개발 후반 단계**: 방법 2 (직접 백엔드 실행)

- 독립적인 개발 환경
- 전체 플로우 테스트
- 프로덕션 배포 준비

---

## 2. 환경 설정

### 2.1. .env 파일 설정 (프론트엔드)

프론트엔드 프로젝트의 `.env` 파일에 다음 변수를 추가하세요:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# 또는 프로덕션 URL
# NEXT_PUBLIC_API_URL=https://your-production-url.com
```

### 2.2. API 클라이언트 설정

Axios 또는 Fetch를 사용하여 API 클라이언트를 설정하세요:

```typescript
// lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // 쿠키 자동 전송 (Refresh Token용)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Access Token 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 에러 시 자동 토큰 재발급
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Refresh Token으로 새 Access Token 받기
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        localStorage.setItem('access_token', data.accessToken);
        // 원래 요청 재시도
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그인 페이지로 리다이렉트
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
```

---

## 3. API 기본 정보

### 3.1. 인증 방식

- **Access Token**: JWT Bearer Token
- **Refresh Token**: httpOnly 쿠키로 자동 관리 (프론트엔드에서 신경 쓸 필요 없음)

### 3.2. 요청 형식

- **JSON API**: 대부분의 API는 JSON 형식
- **파일 업로드**: `multipart/form-data` 형식 사용

### 3.3. 응답 형식

- **성공**: HTTP 200, 201 등 + JSON 데이터
- **에러**: HTTP 4xx, 5xx + 에러 메시지

---

## 4. 인증 플로우

### 4.1. 카카오 로그인

```typescript
// 1. 카카오 로그인 시작
window.location.href = `${API_URL}/auth/kakao`;

// 2. 카카오 로그인 완료 후 콜백 처리
// 백엔드가 자동으로 리다이렉트:
// 개발 환경: JSON 응답 (accessToken 포함)
// 프로덕션: {FRONTEND_URL}/auth/callback?token={accessToken}

// 3. 콜백 페이지에서 토큰 저장
// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('access_token', token);
      router.push('/dashboard');
    } else {
      const error = searchParams.get('error');
      if (error) {
        alert(`로그인 실패: ${error}`);
        router.push('/login');
      }
    }
  }, [searchParams, router]);

  return <div>로그인 처리 중...</div>;
}
```

### 4.2. 현재 사용자 정보 조회

```typescript
const response = await apiClient.get('/auth/me');
const user = response.data;
// { id: 1, nickname: '홍길동', email: 'user@example.com', provider: 'kakao' }
```

### 4.3. 로그아웃

```typescript
await apiClient.post('/auth/logout');
localStorage.removeItem('access_token');
router.push('/');
```

---

## 5. 주요 API 사용법

### 5.1. 파일 업로드 및 미리보기

```typescript
const formData = new FormData();
formData.append('file', file); // File 객체
formData.append('includeSystem', 'false');
formData.append('dateFrom', '2024-01-01');
formData.append('dateTo', '2024-12-31');
formData.append('participants', JSON.stringify(['홍길동', '김철수']));

const response = await apiClient.post('/convert/preview', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const { jobId, roomName, messages, participants, stats } = response.data;
```

### 5.2. 엑셀 파일 생성 및 다운로드

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('includeSystem', 'false');
formData.append('splitSheetsByDay', 'true');

const response = await apiClient.post('/convert/excel', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  responseType: 'blob', // 파일 다운로드를 위해 필요
});

// Blob을 파일로 다운로드
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'chat.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
```

### 5.3. 작업 목록 조회

```typescript
const response = await apiClient.get('/jobs', {
  params: {
    status: 'success', // optional: 'previewed', 'processing', 'success', 'failed', 'expired'
    page: 1,
    size: 20,
  },
});

const { jobs, total, page, size } = response.data;
```

### 5.4. 작업 상세 조회

```typescript
const response = await apiClient.get(`/jobs/${jobId}`);
const job = response.data;
```

### 5.5. 작업 파일 재다운로드

```typescript
const response = await apiClient.get(`/jobs/${jobId}/download`, {
  responseType: 'blob',
});

// Blob을 파일로 다운로드
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute(
  'download',
  `${job.originalFileName.replace('.txt', '.xlsx')}`,
);
document.body.appendChild(link);
link.click();
link.remove();
```

### 5.6. 게스트 작업 귀속

```typescript
// 로그인 후 한 번만 호출
const response = await apiClient.post('/jobs/claim');
const { claimed } = response.data; // 귀속된 작업 개수
```

### 5.7. 사용자 설정 조회/업데이트

```typescript
// 설정 조회
const response = await apiClient.get('/settings');
const settings = response.data;

// 설정 업데이트
await apiClient.put('/settings', {
  defaultIncludeSystem: false,
  defaultSplitSheetsByDay: true,
  defaultDateRangeDays: 30,
});
```

---

## 6. 에러 처리

### 6.1. 에러 응답 형식

```typescript
try {
  const response = await apiClient.get('/some-endpoint');
} catch (error) {
  if (error.response) {
    // 서버가 응답을 반환한 경우
    const { statusCode, message, path } = error.response.data;
    console.error(`에러 ${statusCode}: ${message} (${path})`);
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우
    console.error('서버에 연결할 수 없습니다.');
  } else {
    // 요청 설정 중 에러 발생
    console.error('요청 설정 오류:', error.message);
  }
}
```

### 6.2. 주요 에러 코드

- **400 Bad Request**: 잘못된 요청 (파일 없음, 잘못된 형식 등)
- **401 Unauthorized**: 인증 실패 (토큰 없음, 만료 등)
- **404 Not Found**: 리소스를 찾을 수 없음
- **500 Internal Server Error**: 서버 내부 오류

---

## 7. 예제 코드

### 7.1. 전체 플로우 예제

```typescript
// 1. 파일 업로드 및 미리보기
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const previewResponse = await apiClient.post('/convert/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const { jobId, messages, participants } = previewResponse.data;

  // 2. 미리보기 확인 후 엑셀 생성
  const excelFormData = new FormData();
  excelFormData.append('file', file);
  excelFormData.append('splitSheetsByDay', 'true');

  const excelResponse = await apiClient.post('/convert/excel', excelFormData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  });

  // 3. 파일 다운로드
  const url = window.URL.createObjectURL(new Blob([excelResponse.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'chat.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### 7.2. 로그인 상태 확인

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { user, loading };
}
```

---

## 8. 추가 참고사항

### 8.1. CORS 설정

백엔드에서 CORS가 설정되어 있으므로, 프론트엔드에서 `withCredentials: true`를 사용하여 쿠키를 전송할 수 있습니다.

### 8.2. 파일 크기 제한

백엔드 개발자에게 파일 크기 제한을 확인하세요. 일반적으로 몇 MB 이하로 제한됩니다.

### 8.3. Swagger UI 활용

개발 중에는 Swagger UI (`http://localhost:3001/api`)를 활용하여 API를 테스트하고 응답 형식을 확인하세요.

---

## 9. 문의사항

API 사용 중 문제가 발생하면:

1. Swagger UI에서 API를 직접 테스트하여 문제 확인
2. 브라우저 개발자 도구의 Network 탭에서 요청/응답 확인
3. 백엔드 개발자에게 문의

---

이 가이드를 참고하여 프론트엔드를 개발하세요!
