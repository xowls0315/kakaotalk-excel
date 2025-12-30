# Swagger UI 설정 완료 안내

## ✅ 완료된 작업

1. ✅ Swagger 패키지 설치 (`@nestjs/swagger`, `swagger-ui-express`)
2. ✅ `main.ts`에 Swagger 설정 추가
3. ✅ 모든 컨트롤러에 Swagger 데코레이터 추가
4. ✅ 모든 DTO에 Swagger 데코레이터 추가
5. ✅ 프론트엔드 개발자용 가이드 작성

## 📚 문서 위치

- **백엔드 개발자용**: `SWAGGER_SETUP_GUIDE.md`
- **프론트엔드 개발자용**: `FRONTEND_DEVELOPER_GUIDE.md`

## 🚀 사용 방법

### 1. 서버 실행

```bash
cd kakaotalk-excel/kakaotalk-excel-backend
npm run start:dev
```

### 2. Swagger UI 접속

브라우저에서 다음 URL로 접속:

```
http://localhost:3001/api
```

### 3. API 테스트

1. Swagger UI에서 API 선택
2. **"Try it out"** 버튼 클릭
3. 필요한 파라미터 입력
4. **"Execute"** 버튼 클릭
5. 응답 확인

### 4. 인증이 필요한 API 테스트

1. 우측 상단의 **"Authorize"** 버튼 클릭
2. `JWT-auth` 섹션에 Access Token 입력
   - 형식: `Bearer {token}` 또는 토큰만 입력
3. **"Authorize"** 클릭
4. 이제 인증이 필요한 API를 테스트할 수 있습니다

## 📋 API 엔드포인트 목록

### Health

- `GET /` - 헬스 체크

### Auth (인증)

- `GET /auth/kakao` - 카카오 로그인 시작
- `GET /auth/kakao/callback` - 카카오 로그인 콜백
- `GET /auth/me` - 현재 사용자 정보 조회 (인증 필요)
- `POST /auth/refresh` - Access Token 재발급
- `POST /auth/logout` - 로그아웃 (인증 필요)

### Convert (파일 변환)

- `POST /convert/preview` - 카카오톡 메시지 미리보기
- `POST /convert/excel` - 엑셀 파일 생성 및 다운로드

### Jobs (작업 관리) - 인증 필요

- `GET /jobs` - 작업 목록 조회
- `GET /jobs/{jobId}` - 작업 상세 조회
- `GET /jobs/{jobId}/download` - 작업 파일 재다운로드
- `POST /jobs/claim` - 게스트 작업 귀속

### Settings (설정 관리) - 인증 필요

- `GET /settings` - 사용자 설정 조회
- `PUT /settings` - 사용자 설정 업데이트

## 🔑 인증 방식

- **Access Token**: JWT Bearer Token
  - 헤더: `Authorization: Bearer {token}`
  - Swagger UI에서 "Authorize" 버튼으로 설정
- **Refresh Token**: httpOnly 쿠키로 자동 관리
  - 프론트엔드에서 별도 처리 불필요

## 📝 프론트엔드 개발자에게 전달할 내용

프론트엔드 개발자에게 다음을 전달하세요:

1. **Swagger UI 접속 URL**: `http://localhost:3001/api`
2. **프론트엔드 개발자 가이드**: `FRONTEND_DEVELOPER_GUIDE.md` 파일
3. **API 기본 URL**:
   - 개발: `http://localhost:3001`
   - 프로덕션: (배포 후 전달)

## 🎯 다음 단계

1. 서버 실행 후 Swagger UI 접속 확인
2. 각 API를 Swagger UI에서 테스트
3. 프론트엔드 개발자에게 `FRONTEND_DEVELOPER_GUIDE.md` 전달
4. 프론트엔드 개발자와 협의하여 API 통합 진행

---

모든 설정이 완료되었습니다! 🎉
