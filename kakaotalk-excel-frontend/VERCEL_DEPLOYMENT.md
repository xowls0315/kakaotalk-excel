# Vercel 배포 가이드

이 문서는 Vercel에 프론트엔드를 배포하기 위한 가이드입니다.

## 필수 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수

1. **NEXT_PUBLIC_API_BASE_URL**
   - 백엔드 API Base URL
   - 예: `https://kakaotalk-excel-backend.onrender.com`
   - 프로덕션 백엔드 서버 주소를 입력하세요

2. **NEXT_PUBLIC_FRONTEND_URL** (선택사항)
   - 프론트엔드 URL (OAuth 콜백 리다이렉트용)
   - 설정하지 않으면 자동으로 현재 도메인을 사용합니다
   - 예: `https://kakaotalk-excel-frontend.vercel.app`

### 환경 변수 설정 방법

1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴로 이동
4. 위의 환경 변수들을 추가
5. Production, Preview, Development 환경 모두에 적용

## 배포 단계

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Vercel에서 프로젝트 연결

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `kakaotalk-excel-frontend` (프로젝트 루트가 하위 디렉토리인 경우)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

### 3. 환경 변수 설정

위의 "필수 환경 변수 설정" 섹션을 참고하여 환경 변수를 설정하세요.

### 4. 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (보통 2-5분 소요)
3. 배포 완료 후 제공되는 URL로 접속하여 확인

## 배포 후 확인 사항

### 1. 기본 기능 확인

- [ ] 메인 페이지 로드 확인
- [ ] 파일 업로드 기능 확인
- [ ] 미리보기 페이지 확인
- [ ] 변환 기능 확인

### 2. 인증 기능 확인

- [ ] 로그인 버튼 클릭 시 카카오 로그인 페이지로 이동
- [ ] 로그인 후 콜백 페이지에서 정상 리다이렉트
- [ ] 로그인 상태 유지 확인
- [ ] 대시보드 접근 확인

### 3. API 연결 확인

- [ ] 브라우저 개발자 도구 → Network 탭에서 API 요청 확인
- [ ] CORS 에러 없는지 확인
- [ ] 쿠키 전송 확인 (Application → Cookies)

## 문제 해결

### 빌드 실패

**증상**: Vercel 배포 시 빌드 실패

**해결 방법**:
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. 빌드 로그 확인하여 에러 메시지 확인
3. TypeScript 에러가 있는 경우 수정
4. 환경 변수 누락 확인

### API 연결 실패

**증상**: API 요청이 실패하거나 CORS 에러 발생

**해결 방법**:
1. `NEXT_PUBLIC_API_BASE_URL` 환경 변수 확인
2. 백엔드 서버 CORS 설정 확인
3. 백엔드 서버 상태 확인

### OAuth 콜백 실패

**증상**: 로그인 후 콜백 페이지에서 리다이렉트 실패

**해결 방법**:
1. `NEXT_PUBLIC_FRONTEND_URL` 환경 변수 설정 확인
2. 백엔드 OAuth 콜백 URL 설정 확인 (프론트엔드 URL로 설정되어야 함)
3. 브라우저 콘솔에서 에러 메시지 확인

### 쿠키 전송 문제

**증상**: 로그인 상태가 유지되지 않음

**해결 방법**:
1. 백엔드 CORS 설정에서 `credentials: true` 확인
2. 프론트엔드 API 요청에서 `credentials: "include"` 확인 (이미 설정됨)
3. 쿠키 도메인 설정 확인

## 추가 최적화

### 1. 커스텀 도메인 설정

Vercel에서 커스텀 도메인을 설정할 수 있습니다:
1. Settings → Domains
2. 도메인 추가
3. DNS 설정 안내에 따라 DNS 레코드 추가

### 2. 환경별 설정

프로덕션, 프리뷰, 개발 환경별로 다른 환경 변수를 설정할 수 있습니다:
- Production: 프로덕션 백엔드 URL
- Preview: 스테이징 백엔드 URL (있는 경우)
- Development: 로컬 백엔드 URL

### 3. 성능 모니터링

Vercel Analytics를 활성화하여 성능을 모니터링할 수 있습니다:
1. Settings → Analytics
2. Web Analytics 활성화

## 참고사항

- Vercel은 Next.js를 완벽하게 지원하므로 추가 설정이 거의 필요 없습니다
- 환경 변수는 빌드 시점에 주입되므로, 변경 후 재배포가 필요합니다
- 프리뷰 배포는 모든 Pull Request에 대해 자동으로 생성됩니다

