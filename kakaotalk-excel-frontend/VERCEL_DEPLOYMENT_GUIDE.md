# Vercel 배포 가이드

프론트엔드 코드를 Vercel에 배포하기 위한 설정 가이드입니다.

## 📋 사전 준비

### 1. Vercel 계정 생성

1. [Vercel](https://vercel.com)에 가입
2. GitHub 계정으로 연동 (권장)

### 2. 프로젝트 준비

- ✅ 코드가 GitHub 저장소에 푸시되어 있어야 함
- ✅ `develop` 또는 `main` 브랜치에 최신 코드가 있어야 함

---

## 🚀 Vercel 배포 단계

### 1단계: 프로젝트 Import

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 선택
3. 프로젝트 선택:
   - **Repository**: `kakaotalk-excel-frontend` (또는 해당 저장소)
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (프로젝트 루트)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

### 2단계: 환경 변수 설정

**중요**: Vercel 대시보드에서 환경 변수를 설정해야 합니다.

#### 필수 환경 변수

```env
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
```

**설정 방법:**

1. Vercel 프로젝트 설정 페이지에서 **"Environment Variables"** 클릭
2. **"Add New"** 버튼 클릭
3. 다음 정보 입력:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://kakaotalk-excel-backend.onrender.com`
   - **Environment**: `Production`, `Preview`, `Development` 모두 선택
4. **"Save"** 클릭

#### 선택적 환경 변수

```env
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**설정 방법:**

- 배포 후 Vercel에서 제공하는 도메인 URL을 설정
- 예: `https://kakaotalk-excel-frontend.vercel.app`
- 카카오 로그인 콜백 URL 설정 시 사용

**참고:**

- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수만 클라이언트에서 사용 가능
- 환경 변수 변경 후 재배포 필요

### 3단계: 빌드 설정 확인

Vercel은 Next.js를 자동으로 감지하므로 기본 설정으로 작동합니다.

**기본 빌드 설정:**

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**커스텀 빌드 설정이 필요한 경우:**

- `vercel.json` 파일 생성 (일반적으로 불필요)

### 4단계: 배포 실행

1. **"Deploy"** 버튼 클릭
2. 빌드 진행 상황 확인
3. 배포 완료 후 URL 확인

---

## ⚙️ 환경 변수 상세 설명

### `NEXT_PUBLIC_API_BASE_URL`

**설명:**

- 백엔드 API 서버의 기본 URL
- 모든 API 요청의 기본 경로로 사용됨

**값:**

```
https://kakaotalk-excel-backend.onrender.com
```

**사용 위치:**

- `lib/constants.ts`: `API_BASE_URL` 상수 정의
- `lib/apiClient.ts`: API 요청 URL 생성
- `lib/auth.ts`: 인증 관련 API 호출
- `lib/api/convert.ts`: 파일 변환 API 호출
- `lib/api/jobs.ts`: 작업 관리 API 호출

**주의사항:**

- ✅ `NEXT_PUBLIC_` 접두사 필수 (클라이언트에서 사용)
- ✅ `https://` 프로토콜 사용 (프로덕션)
- ✅ 백엔드 서버 URL과 정확히 일치해야 함

### `NEXT_PUBLIC_FRONTEND_URL` (선택사항)

**설명:**

- 프론트엔드 애플리케이션의 URL
- 카카오 로그인 콜백 URL 생성 시 사용

**값:**

```
https://your-frontend-domain.vercel.app
```

**설정 시점:**

- 배포 후 Vercel에서 제공하는 도메인 URL 확인
- 환경 변수에 설정

**사용 위치:**

- `app/(public)/auth/callback/page.tsx`: 카카오 로그인 콜백 처리

---

## 🔧 Vercel 프로젝트 설정

### 1. General Settings

**Project Name:**

- 프로젝트 이름 설정
- URL에 반영됨 (예: `kakaotalk-excel-frontend.vercel.app`)

**Framework:**

- Next.js (자동 감지)

**Node.js Version:**

- 기본값 사용 (또는 `20.x` 명시)

### 2. Build & Development Settings

**Build Command:**

```
npm run build
```

**Output Directory:**

```
.next
```

**Install Command:**

```
npm install
```

**Development Command:**

```
npm run dev
```

### 3. Environment Variables

**Production:**

```
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**Preview:**

```
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-preview-domain.vercel.app
```

**Development:**

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 4. Git Settings

**Production Branch:**

- `main` 또는 `develop` (선택)

**Preview Branches:**

- 모든 브랜치에서 Preview 배포 (권장)
- Pull Request마다 Preview URL 생성

---

## 🔐 백엔드 CORS 설정 확인

프론트엔드가 Vercel에 배포되면 새로운 도메인에서 요청이 발생하므로, 백엔드 CORS 설정을 확인해야 합니다.

### 백엔드 CORS 설정 확인

**Render 환경 변수 확인:**

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

**백엔드 코드 확인:**

- `src/main.ts`에서 CORS 설정 확인
- Vercel 도메인이 허용된 origin에 포함되어 있는지 확인

**백엔드 CORS 설정 예시:**

```typescript
// main.ts
const allowedOrigins: string[] = [];

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

// Vercel 도메인 추가
allowedOrigins.push("https://your-frontend-domain.vercel.app");
```

---

## 📝 카카오 OAuth 설정 업데이트

프론트엔드가 Vercel에 배포되면 카카오 개발자 콘솔에서 Redirect URI를 추가해야 합니다.

### 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 애플리케이션 선택
3. **"플랫폼"** → **"Web 플랫폼 등록"** 클릭
4. **"사이트 도메인"** 추가:
   ```
   https://your-frontend-domain.vercel.app
   ```
5. **"Redirect URI"** 추가:
   ```
   https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback
   ```
   (백엔드 URL은 변경하지 않음)

**참고:**

- Redirect URI는 백엔드 URL을 사용 (변경 불필요)
- 프론트엔드 URL은 카카오 로그인 후 리다이렉트되는 곳

---

## 🧪 배포 후 테스트

### 1. 기본 기능 테스트

1. **홈페이지 접속**

   - Vercel에서 제공하는 URL로 접속
   - 정상적으로 로드되는지 확인

2. **파일 업로드 테스트**

   - 게스트 모드로 파일 업로드
   - 미리보기 기능 확인

3. **엑셀 변환 테스트**
   - 파일 변환 및 다운로드 확인

### 2. 인증 기능 테스트

1. **카카오 로그인**

   - 카카오 로그인 버튼 클릭
   - 로그인 성공 후 리다이렉트 확인

2. **로그인 상태 유지**

   - 새로고침 후 로그인 상태 유지 확인
   - `/dashboard` 접근 가능한지 확인

3. **작업 목록 조회**
   - 로그인 후 `/dashboard`에서 작업 목록 확인

### 3. API 연동 테스트

**Network 탭에서 확인:**

- 모든 API 요청이 `https://kakaotalk-excel-backend.onrender.com`으로 전송되는지 확인
- CORS 에러가 발생하지 않는지 확인
- 쿠키가 정상적으로 전송되는지 확인

---

## 🐛 문제 해결

### 문제 1: CORS 에러

**증상:**

```
Access to fetch at 'https://kakaotalk-excel-backend.onrender.com/...' from origin 'https://your-frontend-domain.vercel.app' has been blocked by CORS policy
```

**해결 방법:**

1. 백엔드 Render 환경 변수 확인:
   ```env
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
2. 백엔드 `main.ts`에서 CORS 설정 확인
3. 백엔드 재배포

### 문제 2: API 요청 실패

**증상:**

- API 요청이 실패하거나 404 에러 발생

**해결 방법:**

1. 환경 변수 확인:
   - `NEXT_PUBLIC_API_BASE_URL`이 올바르게 설정되었는지 확인
   - Vercel 대시보드에서 환경 변수 확인
2. 재배포:
   - 환경 변수 변경 후 재배포 필요

### 문제 3: 카카오 로그인 실패

**증상:**

- 카카오 로그인 후 리다이렉트되지 않음

**해결 방법:**

1. 카카오 개발자 콘솔에서 Redirect URI 확인
2. 백엔드 `FRONTEND_URL` 환경 변수 확인
3. 프론트엔드 `NEXT_PUBLIC_FRONTEND_URL` 환경 변수 확인

### 문제 4: 빌드 실패

**증상:**

- Vercel 빌드가 실패함

**해결 방법:**

1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. 빌드 로그 확인:
   - Vercel 대시보드에서 빌드 로그 확인
   - 에러 메시지 확인
3. 의존성 문제:
   - `package.json` 확인
   - `node_modules` 삭제 후 재설치

---

## 📊 배포 체크리스트

### 배포 전 확인

- [ ] 코드가 GitHub에 푸시되어 있음
- [ ] `package.json`에 빌드 스크립트가 있음
- [ ] 환경 변수 목록 확인

### Vercel 설정

- [ ] 프로젝트 Import 완료
- [ ] `NEXT_PUBLIC_API_BASE_URL` 환경 변수 설정
- [ ] `NEXT_PUBLIC_FRONTEND_URL` 환경 변수 설정 (선택사항)
- [ ] 빌드 설정 확인

### 백엔드 설정

- [ ] Render 환경 변수 `FRONTEND_URL`에 Vercel 도메인 추가
- [ ] 백엔드 CORS 설정 확인
- [ ] 백엔드 재배포

### 카카오 OAuth 설정

- [ ] 카카오 개발자 콘솔에서 사이트 도메인 추가
- [ ] Redirect URI 확인 (백엔드 URL 사용)

### 배포 후 테스트

- [ ] 홈페이지 정상 로드
- [ ] 파일 업로드 기능 작동
- [ ] 카카오 로그인 작동
- [ ] 작업 목록 조회 작동
- [ ] 파일 다운로드 작동

---

## 🔄 환경별 설정

### Production (프로덕션)

```env
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Preview (프리뷰)

```env
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-preview-domain.vercel.app
```

### Development (로컬 개발)

`.env.local` 파일:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 📚 추가 참고 자료

### Vercel 공식 문서

- [Next.js 배포 가이드](https://vercel.com/docs/frameworks/nextjs)
- [환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)
- [빌드 설정](https://vercel.com/docs/concepts/builds)

### 관련 문서

- `README.md`: 프로젝트 개요 및 개발 가이드
- 백엔드 `DEPLOYMENT_GUIDE.md`: 백엔드 배포 가이드
- 백엔드 `FRONTEND_DEVELOPER_GUIDE.md`: 프론트엔드 개발자 가이드

---

## ✅ 배포 완료 후

배포가 완료되면:

1. **Vercel 도메인 확인**

   - Vercel 대시보드에서 제공하는 URL 확인
   - 예: `https://kakaotalk-excel-frontend.vercel.app`

2. **백엔드 설정 업데이트**

   - Render 환경 변수 `FRONTEND_URL`에 Vercel 도메인 추가
   - 백엔드 재배포

3. **카카오 OAuth 설정 업데이트**

   - 카카오 개발자 콘솔에서 사이트 도메인 추가

4. **테스트**
   - 모든 기능이 정상 작동하는지 확인

---

배포 성공을 기원합니다! 🚀
