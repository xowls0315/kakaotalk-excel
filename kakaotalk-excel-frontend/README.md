# 카카오톡 대화 엑셀 변환기 - 프론트엔드

카카오톡에서 내보낸 대화 파일(.txt)을 엑셀, CSV, PDF 형식으로 변환하는 웹 애플리케이션의 프론트엔드입니다.

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능 상세](#주요-기능-상세)
- [인증 시스템](#인증-시스템)
- [API 연동](#api-연동)
- [컴포넌트 구조](#컴포넌트-구조)
- [상태 관리](#상태-관리)
- [스타일링](#스타일링)
- [개발 가이드](#개발-가이드)
- [배포](#배포)
- [문제 해결](#문제-해결)

## 📖 프로젝트 소개

카카오톡 대화 엑셀 변환기는 카카오톡에서 내보낸 텍스트 파일을 엑셀, CSV, PDF 형식으로 변환해주는 웹 애플리케이션입니다.

### 특징

- ✅ **게스트 모드 지원**: 로그인 없이도 변환 기능 사용 가능
- ✅ **다중 형식 지원**: Excel(.xlsx), CSV, PDF 형식 지원
- ✅ **고급 필터링**: 날짜 범위, 참여자, 시스템 메시지 필터링
- ✅ **변환 기록 관리**: 로그인 시 변환 기록 자동 저장 및 관리
- ✅ **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 디바이스 지원
- ✅ **실시간 미리보기**: 변환 전 대화 내용 미리보기
- ✅ **작업 통계**: 상태별 작업 통계 및 필터링

## ✨ 주요 기능

### 1. 파일 업로드 및 파싱

- 드래그 앤 드롭 파일 업로드
- 카카오톡 대화 형식 자동 파싱
- 파일 유효성 검증 (형식, 크기)

### 2. 미리보기 및 필터링

- 파싱된 대화 내용 테이블 형식 미리보기
- 실시간 필터링:
  - 시스템 메시지 제외/포함
  - 날짜 범위 필터 (시작일 ~ 종료일)
  - 참여자별 필터
- 필터링 결과 실시간 반영

### 3. 파일 변환

- **Excel (.xlsx)**: 서버 사이드 또는 클라이언트 사이드 변환
- **CSV**: 서버 사이드 또는 클라이언트 사이드 변환
- **PDF**: 서버 사이드 또는 클라이언트 사이드 변환
- 필터링된 메시지만 변환
- 자동 다운로드

### 4. 변환 기록 관리 (로그인 사용자)

- 변환 작업 목록 조회
- 작업 상태별 필터링 (전체, 완료, 처리 중, 실패, 만료)
- 작업 상세 정보 조회
- 완료된 작업 재다운로드
- 작업 통계 확인

### 5. 사용자 프로필

- 사용자 정보 조회
- 작업 통계 대시보드
- 계정 관리

## 🚀 기술 스택

### 프레임워크 & 라이브러리

- **Next.js 16.1.1** - React 프레임워크 (App Router)
- **React 19.2.3** - UI 라이브러리
- **TypeScript 5** - 타입 안정성
- **Tailwind CSS 4** - 유틸리티 CSS 프레임워크
- **Zustand 5.0.9** - 경량 상태 관리 라이브러리

### 주요 의존성

- **xlsx 0.18.5** - Excel 파일 생성/읽기
- **jspdf 3.0.4** - PDF 파일 생성
- **jspdf-autotable 5.0.2** - PDF 테이블 생성
- **date-fns 4.1.0** - 날짜 처리
- **remixicon 4.8.0** - 아이콘

### 개발 도구

- **ESLint** - 코드 품질 관리
- **TypeScript** - 정적 타입 검사

## 🛠️ 시작하기

### 필수 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 9.0.0 이상 또는 **yarn**: 1.22.0 이상

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd kakaotalk-excel-frontend
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API Base URL
# 프로덕션: https://kakaotalk-excel-backend.onrender.com
# 로컬 개발: http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
```

**참고사항:**

- 환경 변수를 설정하지 않으면 기본값으로 프로덕션 서버를 사용합니다
- 로컬 개발 시 로컬 백엔드를 사용하는 것을 권장합니다 (크로스 도메인 쿠키 문제 방지)

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
kakaotalk-excel-frontend/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 공개 페이지 그룹
│   │   ├── auth/
│   │   │   └── callback/         # OAuth 콜백 처리
│   │   │       └── page.tsx
│   │   ├── upload/               # 파일 업로드 페이지
│   │   │   └── page.tsx
│   │   ├── preview/              # 미리보기 및 필터 페이지
│   │   │   └── page.tsx
│   │   ├── result/               # 변환 완료 페이지
│   │   │   └── page.tsx
│   │   └── guide/                # 사용 가이드 페이지
│   │       └── page.tsx
│   ├── (user)/                   # 인증 필요 페이지 그룹
│   │   ├── dashboard/            # 대시보드 (내 기록)
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   └── [jobId]/          # 작업 상세 페이지
│   │   │       └── page.tsx
│   │   ├── profile/              # 사용자 프로필 페이지
│   │   │   └── page.tsx
│   │   └── settings/             # 설정 페이지
│   │       └── page.tsx
│   ├── login/                    # 로그인 페이지
│   │   └── page.tsx
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 랜딩 페이지
│   ├── error.tsx                 # 에러 페이지
│   └── not-found.tsx             # 404 페이지
│
├── components/                   # React 컴포넌트
│   ├── ui/                       # 재사용 가능한 UI 컴포넌트
│   │   ├── JobStatusBadge.tsx   # 작업 상태 배지
│   │   ├── LoadingSpinner.tsx   # 로딩 스피너
│   │   └── EmptyState.tsx       # 빈 상태 표시
│   ├── jobs/                     # 작업 관련 컴포넌트
│   │   ├── JobFilterButtons.tsx # 필터 버튼 그룹
│   │   └── JobStatsCards.tsx    # 통계 카드 그룹
│   ├── Header.tsx                # 헤더 컴포넌트
│   ├── Footer.tsx                # 푸터 컴포넌트
│   ├── LoginButton.tsx          # 로그인 버튼
│   ├── AuthInitializer.tsx      # 인증 초기화 컴포넌트
│   ├── UploadDropzone.tsx       # 파일 업로드 드롭존
│   ├── PreviewTable.tsx         # 미리보기 테이블
│   ├── FiltersPanel.tsx         # 필터 패널
│   └── JobListTable.tsx         # 작업 목록 테이블
│
├── hooks/                        # 커스텀 React 훅
│   ├── useJobStats.ts           # 작업 통계 관리 훅
│   └── useProtectedRoute.ts     # 인증 보호 라우트 훅
│
├── lib/                          # 유틸리티 및 헬퍼
│   ├── api/                      # API 클라이언트 함수
│   │   ├── convert.ts           # 파일 변환 API
│   │   ├── jobs.ts              # 작업 관리 API
│   │   ├── settings.ts          # 설정 API
│   │   └── index.ts
│   ├── utils/                    # 유틸리티 함수
│   │   ├── jobUtils.ts          # 작업 관련 유틸리티
│   │   ├── format.ts            # 포맷팅 유틸리티
│   │   ├── validation.ts        # 검증 유틸리티
│   │   └── index.ts
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   ├── apiClient.ts             # API 클라이언트 (fetch wrapper)
│   ├── auth.ts                  # 인증 관련 함수
│   ├── constants.ts             # 상수 정의
│   ├── download.ts              # 파일 다운로드 유틸리티
│   ├── excel.ts                 # Excel 변환 (클라이언트)
│   ├── pdf.ts                   # PDF 변환 (클라이언트)
│   └── kakaotalkParser.ts       # 카카오톡 파일 파서
│
├── store/                        # Zustand 상태 관리
│   ├── useAuthStore.ts          # 인증 상태 관리
│   └── useConvertStore.ts       # 변환 옵션 상태 관리
│
├── public/                       # 정적 파일
│   ├── talk_to_excel.png        # 로고 이미지
│   └── ...
│
├── .env.local                    # 환경 변수 (로컬)
├── next.config.ts               # Next.js 설정
├── tsconfig.json                # TypeScript 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── package.json                 # 프로젝트 메타데이터
└── README.md                    # 프로젝트 문서
```

## 📚 주요 기능 상세

### 1. 파일 업로드 (`/upload`)

**기능:**

- 드래그 앤 드롭 인터페이스
- 파일 선택 버튼
- 파일 유효성 검증:
  - 확장자: `.txt`만 허용
  - 크기: 최대 10MB
  - 인코딩: UTF-8 권장

**사용 흐름:**

1. 파일 업로드
2. 파일 내용 파싱
3. 미리보기 페이지로 이동

### 2. 미리보기 및 필터 (`/preview`)

**필터 옵션:**

- **시스템 메시지 제외**: 입장/퇴장 메시지 필터링
- **날짜 범위**: 시작일 ~ 종료일 지정
- **참여자 필터**: 특정 참여자 메시지만 표시

**변환 형식 선택:**

- Excel (.xlsx)
- CSV
- PDF

**기능:**

- 실시간 필터링 결과 확인
- 필터링된 메시지 개수 표시
- 선택한 형식으로 변환 및 다운로드

### 3. 대시보드 (`/dashboard`) - 인증 필요

**기능:**

- 작업 목록 테이블:
  - 파일명 (채팅방 이름)
  - 상태 (미리보기/처리 중/완료/실패/만료)
  - 생성일시
  - 상세보기 링크
- 상태별 필터 버튼:
  - 전체
  - 완료
  - 처리 중
  - 실패
  - 만료
- 각 필터 버튼에 해당 상태의 작업 개수 표시

### 4. 작업 상세 (`/jobs/[jobId]`) - 인증 필요

**표시 정보:**

- 작업 상태 카드
- 작업 정보:
  - 작업 ID
  - 채팅방 이름
  - 생성일시
  - 완료일시
  - 만료일시
  - 처리된 메시지 수
- 대화 미리보기 (최근 5줄)
- 변환 옵션 (사용된 필터 옵션)

### 5. 사용자 프로필 (`/profile`) - 인증 필요

**기능:**

- 기본 정보:
  - 닉네임
  - 이메일
- 작업 통계:
  - 전체 작업 수
  - 완료 수
  - 처리 중 수
  - 실패 수
  - 만료 수
  - 각 통계 클릭 시 대시보드에서 해당 상태로 필터링
- 계정 관리:
  - 내 기록 보기
  - 로그아웃

### 6. 설정 (`/settings`) - 인증 필요

**설정 항목:**

- 기본 변환 옵션:
  - 시스템 메시지 제외 (기본값)
  - 날짜 범위 (기본값)

## 🔐 인증 시스템

### 인증 방식

- **OAuth 2.0** (카카오 로그인)
- **HttpOnly 쿠키** 기반 세션 관리
- **JWT 토큰** (Access Token, Refresh Token)

### 인증 흐름

1. **로그인**: 카카오 OAuth 인증
2. **토큰 저장**:
   - Access Token: `localStorage` + 메모리 (Zustand)
   - Refresh Token: HttpOnly 쿠키 (서버에서 설정)
3. **인증 상태 확인**:
   - 앱 시작 시 `checkAuthStatus()` 호출
   - Access Token 확인 → `/auth/me` 호출
   - Access Token 만료 시 → `/auth/refresh`로 갱신
4. **자동 토큰 갱신**:
   - API 요청 시 401 에러 발생
   - 자동으로 Refresh Token으로 Access Token 갱신
   - 원래 요청 재시도

### 게스트 모드

- 로그인 없이도 파일 변환 가능
- 변환 기록 저장 불가
- 클라이언트 사이드에서만 변환 처리

### 보호된 라우트

인증이 필요한 페이지 (`(user)` 그룹):

- `/dashboard`
- `/jobs/[jobId]`
- `/profile`
- `/settings`

인증되지 않은 사용자는 로그인 페이지로 리다이렉트되며, 로그인 후 원래 페이지로 돌아옵니다.

## 🔌 API 연동

### API 클라이언트 (`lib/apiClient.ts`)

**주요 기능:**

- 모든 요청에 `credentials: "include"` 포함 (쿠키 자동 전송)
- Access Token 자동 포함 (Authorization 헤더)
- 401 에러 시 자동 토큰 갱신 및 재시도
- 에러 처리 및 네트워크 에러 처리

### API 엔드포인트

#### 인증 API

- `GET /auth/me` - 현재 사용자 정보 조회
- `POST /auth/refresh` - Access Token 갱신
- `POST /auth/logout` - 로그아웃
- `GET /auth/kakao` - 카카오 로그인 URL

#### 파일 변환 API

- `POST /convert/excel` - Excel/CSV/PDF 변환
  - `format` 파라미터: `xlsx`, `csv`, `pdf`
- `POST /convert/preview` - 파일 미리보기 (파싱)

#### 작업 관리 API

- `GET /jobs` - 작업 목록 조회
  - 쿼리 파라미터: `status`, `page`, `size`
- `GET /jobs/{jobId}` - 작업 상세 조회
- `GET /jobs/{jobId}/download` - 작업 파일 다운로드
- `POST /jobs/claim` - 게스트 작업 귀속

#### 설정 API

- `GET /settings` - 사용자 설정 조회
- `PUT /settings` - 사용자 설정 저장

### API Base URL

- **프로덕션**: `https://kakaotalk-excel-backend.onrender.com`
- **로컬 개발**: `http://localhost:3001`

환경 변수 `NEXT_PUBLIC_API_BASE_URL`로 설정 가능합니다.

## 🧩 컴포넌트 구조

### UI 컴포넌트 (`components/ui/`)

재사용 가능한 기본 UI 컴포넌트:

#### `JobStatusBadge`

작업 상태를 배지 형태로 표시하는 컴포넌트.

```tsx
<JobStatusBadge status="success" size="md" />
```

**Props:**

- `status`: 작업 상태 (`previewed` | `processing` | `success` | `failed` | `expired`)
- `size`: 배지 크기 (`sm` | `md` | `lg`)

#### `LoadingSpinner`

로딩 중임을 표시하는 스피너 컴포넌트.

```tsx
<LoadingSpinner message="로딩 중..." size="md" fullHeight />
```

**Props:**

- `message`: 로딩 메시지 (선택)
- `size`: 스피너 크기 (`sm` | `md` | `lg`)
- `fullHeight`: 전체 높이 사용 여부

#### `EmptyState`

데이터가 없을 때 표시하는 빈 상태 컴포넌트.

```tsx
<EmptyState
  icon="📭"
  title="작업이 없습니다"
  description="아직 변환한 작업이 없습니다"
  action={<Link href="/upload">시작하기</Link>}
/>
```

**Props:**

- `icon`: 아이콘 이모지 (기본값: "📭")
- `title`: 제목 (필수)
- `description`: 설명 (선택)
- `action`: 액션 버튼/링크 (선택)

### 작업 관련 컴포넌트 (`components/jobs/`)

#### `JobFilterButtons`

작업 상태별 필터 버튼 그룹 컴포넌트.

```tsx
<JobFilterButtons
  stats={jobStats}
  currentFilter={statusFilter}
  onFilterChange={handleFilterClick}
/>
```

**Props:**

- `stats`: 작업 통계 객체
- `currentFilter`: 현재 선택된 필터
- `onFilterChange`: 필터 변경 핸들러

#### `JobStatsCards`

작업 통계를 카드 형식으로 표시하는 컴포넌트.

```tsx
<JobStatsCards stats={jobStats} linkBasePath="/dashboard" />
```

**Props:**

- `stats`: 작업 통계 객체
- `linkBasePath`: 링크 기본 경로 (선택)
- `onClick`: 클릭 핸들러 (선택, `linkBasePath`와 함께 사용 불가)

### 페이지 컴포넌트

주요 페이지 컴포넌트는 `app/` 디렉토리에 있으며, Next.js App Router를 사용합니다.

## 📦 상태 관리

### Zustand Store

#### `useAuthStore` (`store/useAuthStore.ts`)

인증 상태를 관리하는 스토어.

**상태:**

- `user`: 현재 사용자 정보
- `accessToken`: Access Token (localStorage + 메모리)
- `isAuthenticated`: 인증 여부
- `isLoading`: 로딩 상태

**주요 메서드:**

- `checkAuthStatus()`: 인증 상태 확인 및 토큰 갱신
- `setUser(user)`: 사용자 정보 설정
- `setAccessToken(token)`: Access Token 설정 (localStorage + 메모리)
- `logout()`: 로그아웃 (토큰 제거)

**특징:**

- Access Token을 localStorage에 저장하여 새로고침 시에도 유지
- Refresh Token은 HttpOnly 쿠키로 관리
- 자동 토큰 갱신 로직 포함

#### `useConvertStore` (`store/useConvertStore.ts`)

변환 옵션 및 메시지 데이터를 관리하는 스토어.

**상태:**

- `messages`: 파싱된 메시지 배열
- `options`: 변환 옵션
  - `excludeSystemMessages`: 시스템 메시지 제외
  - `dateStart`: 시작 날짜
  - `dateEnd`: 종료 날짜
  - `selectedParticipants`: 선택된 참여자 배열

**주요 메서드:**

- `setMessages(messages)`: 메시지 설정
- `setOptions(options)`: 변환 옵션 설정
- `reset()`: 상태 초기화

**특징:**

- Zustand persist 미들웨어 사용 (세션 스토리지에 저장)

## 🎨 스타일링

### Tailwind CSS 4

**설정:**

- 커스텀 색상 테마
- 반응형 브레이크포인트:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

**주요 색상:**

- Primary: Sky (`#0EA5E9`)
- Success: Green (`#10B981`)
- Warning: Yellow (`#F59E0B`)
- Error: Red (`#EF4444`)
- Background: Beige (`#FFFEF8`)
- Accent: Yellow (`#FBE27A`)

### 반응형 디자인

모든 페이지와 컴포넌트는 모바일 우선 설계로, 다양한 화면 크기에서 최적화되어 있습니다.

**주요 반응형 패턴:**

- 그리드 레이아웃: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 텍스트 크기: `text-sm sm:text-base lg:text-lg`
- 패딩/마진: `p-4 sm:p-6 lg:p-8`
- 테이블: 모바일에서는 일부 컬럼 숨김, 카드 형식으로 변경

## 🛠️ 개발 가이드

### 코드 스타일

- **TypeScript**: 모든 컴포넌트와 함수에 타입 정의
- **ESLint**: 코드 품질 검사
- **컴포넌트 구조**: 함수형 컴포넌트 + Hooks
- **파일 명명**: PascalCase (컴포넌트), camelCase (유틸리티)

### 커스텀 훅 작성

커스텀 훅은 `hooks/` 디렉토리에 생성합니다.

**예시:**

```typescript
// hooks/useExample.ts
import { useState, useEffect } from "react";

export function useExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 초기화 로직
  }, []);

  return { data };
}
```

### 유틸리티 함수 작성

유틸리티 함수는 `lib/utils/` 디렉토리에 생성합니다.

**예시:**

```typescript
// lib/utils/example.ts
export function formatExample(value: string): string {
  // 포맷팅 로직
  return formattedValue;
}
```

### 컴포넌트 작성

컴포넌트는 `components/` 디렉토리에 생성합니다.

**구조:**

- `components/ui/`: 재사용 가능한 기본 UI 컴포넌트
- `components/jobs/`: 작업 관련 컴포넌트
- 기타 도메인별 컴포넌트: 적절한 하위 디렉토리 생성

**예시:**

```tsx
// components/ui/Example.tsx
"use client";

interface ExampleProps {
  title: string;
  description?: string;
}

export default function Example({ title, description }: ExampleProps) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### API 함수 작성

API 함수는 `lib/api/` 디렉토리에 생성합니다.

**예시:**

```typescript
// lib/api/example.ts
import { apiGet, apiPost } from "../apiClient";

export interface ExampleResponse {
  id: string;
  name: string;
}

export async function getExample(id: string): Promise<ExampleResponse> {
  return apiGet<ExampleResponse>(`/example/${id}`);
}

export async function createExample(
  data: CreateExampleRequest
): Promise<ExampleResponse> {
  return apiPost<ExampleResponse>("/example", data);
}
```

## 🚢 배포

### 빌드

```bash
npm run build
```

### 환경 변수 설정

프로덕션 환경에서는 환경 변수를 설정해야 합니다:

```env
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
```

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 배포

### 다른 플랫폼 배포

Next.js 애플리케이션으로 빌드되므로 Node.js를 지원하는 모든 플랫폼에서 배포 가능합니다:

- Vercel (권장)
- Netlify
- AWS Amplify
- 자체 서버 (Node.js)

## 🐛 문제 해결

### 백엔드 연결 오류

**증상:**

- API 요청 실패
- 401 에러 반복 발생

**해결 방법:**

1. 환경 변수 확인: `.env.local` 파일에 `NEXT_PUBLIC_API_BASE_URL` 설정 확인
2. 백엔드 서버 상태 확인
3. CORS 설정 확인 (백엔드)
4. 로컬 백엔드 사용 시 크로스 도메인 문제 확인

**참고:** 백엔드 없이도 클라이언트 사이드 변환 기능은 동작합니다.

### 로그인 상태가 유지되지 않음

**증상:**

- 새로고침 시 로그아웃됨
- 로그인 후 바로 로그아웃됨

**원인:**

- 크로스 도메인 쿠키 문제 (로컬 프론트엔드 + 프로덕션 백엔드)
- localStorage 접근 권한 문제
- 브라우저 쿠키 설정

**해결 방법:**

1. 로컬 개발 시 로컬 백엔드 사용 권장
2. 브라우저 개발자 도구에서 쿠키 확인
3. localStorage 확인 (Application 탭)
4. 시크릿 모드에서 쿠키 차단 여부 확인

### 파일 업로드 오류

**증상:**

- 파일 업로드가 안 됨
- 파싱 실패

**해결 방법:**

1. 파일 형식 확인: `.txt` 파일만 지원
2. 파일 크기 확인: 10MB 이하여야 함
3. 파일 인코딩 확인: UTF-8 권장
4. 카카오톡 대화 형식 확인: 지원 형식과 일치하는지 확인

### 빌드 오류

**증상:**

- `npm run build` 실패
- TypeScript 에러

**해결 방법:**

```bash
# .next 폴더 삭제 후 재빌드
rm -rf .next
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 타입 에러

**증상:**

- TypeScript 컴파일 에러
- 타입 불일치 경고

**해결 방법:**

1. 타입 정의 확인: `lib/types/` 또는 각 파일의 인터페이스 확인
2. API 응답 타입 확인: `lib/api/`의 응답 타입 정의 확인
3. `any` 타입 사용 최소화, 명시적 타입 정의

## 📝 카카오톡 대화 형식

지원하는 카카오톡 대화 내보내기 형식:

```
카카오톡 대화 내보내기
2024. 1. 1. 오전 10:00, 사용자1님이 들어왔습니다.
2024. 1. 1. 오전 10:01, 사용자2님이 들어왔습니다.

[2024. 1. 1. 오전 10:05] 사용자1 : 안녕하세요!
[2024. 1. 1. 오전 10:06] 사용자2 : 안녕하세요! 반갑습니다.
[2024. 1. 1. 오전 10:10] 사용자1 : 오늘 날씨가 좋네요
```

**형식 규칙:**

- 날짜 형식: `YYYY. M. D.`
- 시간 형식: `오전/오후 H:MM`
- 메시지 형식: `[날짜 시간] 발신자 : 내용`
- 시스템 메시지: `날짜 시간, 사용자님이 들어왔습니다.`

## 🔄 버전 정보

- **현재 버전**: 0.1.0
- **Next.js**: 16.1.1
- **React**: 19.2.3
- **TypeScript**: 5.x

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 기여

프로젝트 개선을 위한 제안이나 버그 리포트는 이슈로 등록해주세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for organizing KakaoTalk conversations**
