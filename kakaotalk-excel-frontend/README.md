# 카카오톡 대화 엑셀 변환기 - 프론트엔드

카카오톡에서 내보낸 대화 파일(.txt)을 엑셀 형식으로 변환하는 웹 애플리케이션의 프론트엔드입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16.1.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.9
- **Excel Library**: xlsx
- **React**: 19.2.3

## 📁 프로젝트 구조

```
kakaotalk-excel-frontend/
├── app/
│   ├── (public)/              # 공개 페이지
│   │   ├── upload/           # 파일 업로드
│   │   ├── preview/          # 미리보기 및 필터
│   │   ├── result/           # 변환 완료 안내
│   │   ├── guide/            # 사용 가이드
│   │   └── auth/
│   │       └── callback/     # OAuth 콜백
│   ├── (user)/               # 인증 필요 페이지
│   │   ├── dashboard/        # 내 변환 기록
│   │   ├── jobs/
│   │   │   └── [jobId]/      # 작업 상세
│   │   └── settings/         # 설정 저장
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 랜딩 페이지
├── components/
│   ├── Header.tsx            # 헤더 컴포넌트
│   ├── Footer.tsx            # 푸터 컴포넌트
│   ├── LoginButton.tsx      # 로그인 버튼
│   ├── UploadDropzone.tsx   # 파일 업로드 드롭존
│   ├── PreviewTable.tsx     # 미리보기 테이블
│   ├── FiltersPanel.tsx     # 필터 패널
│   └── JobListTable.tsx     # 작업 목록 테이블
├── lib/
│   ├── apiClient.ts         # API 클라이언트 (fetch wrapper)
│   ├── auth.ts              # 인증 관련 함수
│   ├── download.ts          # 파일 다운로드 유틸리티
│   ├── excel.ts             # 엑셀 변환 함수
│   └── constants.ts         # 상수 정의
├── store/
│   ├── useAuthStore.ts      # 인증 상태 관리
│   └── useConvertStore.ts   # 변환 옵션 상태 관리
└── public/                  # 정적 파일
```

## 🛠️ 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
cd kakaotalk-excel-frontend
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Base URL
# 배포된 서버: https://kakaotalk-excel-backend.onrender.com
# 로컬 개발: http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=https://kakaotalk-excel-backend.onrender.com
```

**참고**: 환경 변수를 설정하지 않으면 기본값으로 배포된 서버(`https://kakaotalk-excel-backend.onrender.com`)를 사용합니다.

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

## ✨ 주요 기능

### 1. 파일 업로드 (`/upload`)

- 드래그 앤 드롭으로 파일 업로드
- .txt 파일만 허용 (최대 10MB)
- 파일 포맷 안내 및 사용 가이드 제공

### 2. 미리보기 및 필터 (`/preview`)

- 파싱된 대화 내용 미리보기
- 필터 옵션:
  - 시스템 메시지 제외
  - 날짜 범위 필터
  - 참여자 필터
- 실시간 필터링 결과 확인

### 3. 엑셀 변환

- 클라이언트 사이드에서 직접 변환 (백엔드 불필요)
- 필터링된 메시지만 변환
- 자동 다운로드

### 4. 변환 기록 관리 (`/dashboard`) - 인증 필요

- 내 변환 작업 목록 조회
- 작업 상태 확인 (처리 중/완료/만료/실패)
- 완료된 작업 다운로드

### 5. 설정 저장 (`/settings`) - 인증 필요

- 기본 변환 옵션 저장
- 시스템 메시지 제외 기본값 설정
- 날짜 범위 기본값 설정

## 📄 카카오톡 대화 형식

지원하는 카카오톡 대화 내보내기 형식:

```
카카오톡 대화 내보내기
2024. 1. 1. 오전 10:00, 사용자1님이 들어왔습니다.
2024. 1. 1. 오전 10:01, 사용자2님이 들어왔습니다.

[2024. 1. 1. 오전 10:05] 사용자1 : 안녕하세요!
[2024. 1. 1. 오전 10:06] 사용자2 : 안녕하세요! 반갑습니다.
```

## 🔧 환경 변수

`.env.local` 파일을 생성하여 다음 환경 변수를 설정할 수 있습니다:

```env
# 백엔드 API URL (선택사항)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# 백엔드 활성화 여부 (선택사항, 기본값: true)
NEXT_PUBLIC_BACKEND_ENABLED=true
```

## 🎯 주요 페이지

### 랜딩 페이지 (`/`)

- 기능 소개
- "바로 변환하기" 버튼
- 로그인 유도 (비로그인 시)

### 업로드 페이지 (`/upload`)

- 파일 드래그 앤 드롭 업로드
- 파일 포맷 안내
- 사용 가이드 링크

### 미리보기 페이지 (`/preview`)

- 파싱된 메시지 테이블
- 필터 패널
- "엑셀로 변환" 버튼

### 결과 페이지 (`/result`)

- 변환 완료 안내
- 로그인 유도 (게스트 사용자)
- 홈으로 돌아가기

### 대시보드 (`/dashboard`) - 인증 필요

- 내 변환 기록 목록
- 작업 상태별 필터링
- 다운로드 버튼

### 작업 상세 (`/jobs/[jobId]`) - 인증 필요

- 작업 상세 정보
- 변환 옵션 확인
- 파일 다운로드

### 설정 (`/settings`) - 인증 필요

- 기본 변환 옵션 저장
- 설정 관리

## 🔐 인증

- OAuth 기반 인증 (백엔드 연동 시)
- 게스트 모드 지원 (로그인 없이 변환 가능)
- 세션 쿠키 기반 인증 상태 관리

### 배포된 백엔드 서버

- **배포 링크**: https://kakaotalk-excel-backend.onrender.com/
- **카카오 로그인 링크**: https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback
- **Swagger UI**: https://kakaotalk-excel-backend.onrender.com/api

프론트엔드는 기본적으로 배포된 서버를 사용하도록 설정되어 있습니다.

## 📦 상태 관리

### useAuthStore

- 사용자 인증 상태
- 로그인/로그아웃
- 인증 상태 확인

### useConvertStore

- 변환 옵션 저장 (Zustand persist)
- 필터 설정
- 메시지 데이터

## 🎨 스타일링

- Tailwind CSS 4 사용
- 반응형 디자인
- Sky 색상 테마

## 🐛 문제 해결

### 백엔드 연결 오류

백엔드 없이도 프론트엔드만으로 실행 가능합니다. 엑셀 변환은 클라이언트 사이드에서 처리됩니다.

### 파일 업로드 오류

- .txt 파일만 지원합니다
- 파일 크기는 10MB 이하여야 합니다
- UTF-8 인코딩을 권장합니다

### 빌드 오류

```bash
# .next 폴더 삭제 후 재빌드
rm -rf .next
npm run build
```

## 📝 라이선스

이 프로젝트는 비공개 프로젝트입니다.

## 👥 기여

프로젝트 개선을 위한 제안이나 버그 리포트는 이슈로 등록해주세요.
