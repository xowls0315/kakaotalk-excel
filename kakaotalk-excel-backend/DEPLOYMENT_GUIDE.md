# Render 배포 가이드

백엔드를 Render에 배포하여 프론트엔드 개발자가 사용할 수 있도록 하는 방법을 안내합니다.

## 목차

1. [Render 계정 생성 및 서비스 생성](#1-render-계정-생성-및-서비스-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 설정](#3-데이터베이스-설정)
4. [배포 및 확인](#4-배포-및-확인)
5. [프론트엔드 개발자에게 전달](#5-프론트엔드-개발자에게-전달)

---

## 1. Render 계정 생성 및 서비스 생성

### 1.1. Render 계정 생성

1. [Render](https://render.com) 접속
2. GitHub 계정으로 로그인 (또는 이메일로 회원가입)

### 1.2. 새 Web Service 생성

1. Render 대시보드에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결
   - 백엔드 코드가 있는 저장소 선택
   - 또는 저장소를 먼저 GitHub에 푸시

### 1.3. 서비스 설정

- **Name**: `kakaotalk-excel-backend` (또는 원하는 이름)
- **Region**: `Singapore` (한국과 가까운 지역)
- **Branch**: `main` 또는 `backend` (배포할 브랜치)
- **Root Directory**: `kakaotalk-excel/kakaotalk-excel-backend` (백엔드 폴더 경로)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

---

## 2. 환경 변수 설정

Render 대시보드의 **"Environment"** 섹션에서 다음 환경 변수를 설정하세요:

### 2.1. 애플리케이션 설정

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com
```

**중요**:

- `FRONTEND_URL`은 프론트엔드가 배포된 URL로 설정하세요
- 프론트엔드가 아직 배포되지 않은 경우, 이 값을 설정하지 않으면 로그인 후 JSON으로 토큰을 반환합니다
- 프론트엔드 배포 후 올바른 URL로 설정하면 자동으로 리다이렉트됩니다

**주의**: Render는 자동으로 `PORT` 환경 변수를 제공하므로, `PORT=10000`으로 설정하거나 코드에서 `process.env.PORT`를 사용하세요.

### 2.2. 데이터베이스 설정

Render PostgreSQL을 사용하는 경우:

1. **"New +"** > **"PostgreSQL"** 선택하여 데이터베이스 생성
2. 생성된 데이터베이스의 **"Internal Database URL"** 복사
3. 환경 변수에 설정:
   ```env
   DB_HOST=your-database-host.onrender.com
   DB_PORT=5432
   DB_USERNAME=your-username
   DB_PASSWORD=your-password
   DB_DATABASE=your-database-name
   DB_SCHEMA=kakaotalk-excel
   DB_SSL=true
   DB_SSL_REQUIRED=true
   ```

또는 **"Internal Database URL"** 전체를 파싱하여 사용할 수도 있습니다.

### 2.3. JWT 시크릿 키

```env
JWT_ACCESS_SECRET=your-strong-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-strong-refresh-secret-key-min-32-chars
```

**중요**: 프로덕션 환경에서는 반드시 강력한 랜덤 문자열을 사용하세요.

```bash
# 로컬에서 생성
openssl rand -base64 32
```

### 2.4. 카카오 OAuth 설정

```env
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://your-backend-url.onrender.com/auth/kakao/callback
```

**중요**:

- `KAKAO_CALLBACK_URL`은 배포된 서버 URL로 설정해야 합니다
- 카카오 개발자 콘솔에서도 동일한 Redirect URI를 등록해야 합니다

### 2.5. 파일 저장 설정

```env
STORAGE_TYPE=local
STORAGE_PATH=./uploads
FILE_EXPIRES_IN_DAYS=7
GUEST_SESSION_EXPIRES_IN_DAYS=7
```

---

## 3. 데이터베이스 설정

### 3.1. 데이터베이스 생성

Render에서 PostgreSQL 데이터베이스를 생성하면 자동으로 연결 정보가 제공됩니다.

### 3.2. 스키마 적용

배포 후 데이터베이스에 스키마를 적용해야 합니다:

**방법 1: Render Shell 사용**

1. Render 대시보드에서 데이터베이스 선택
2. **"Connect"** 탭에서 **"psql"** 명령어 복사
3. 로컬 터미널에서 실행하여 데이터베이스에 접속
4. `database/schema.sql` 파일 내용 실행

**방법 2: 로컬에서 연결**

1. Render 데이터베이스의 **"External Database URL"** 복사
2. 로컬에서 연결:
   ```bash
   psql "postgresql://user:password@host:port/database"
   ```
3. `database/schema.sql` 파일 실행

---

## 4. 배포 및 확인

### 4.1. 배포 시작

1. Render 대시보드에서 **"Manual Deploy"** 클릭
2. 또는 GitHub에 코드를 푸시하면 자동 배포 시작

### 4.2. 배포 확인

배포가 완료되면:

1. **"Logs"** 탭에서 배포 로그 확인
2. **"Events"** 탭에서 배포 상태 확인
3. 서버 URL 확인 (예: `https://kakaotalk-excel-backend.onrender.com`)

### 4.3. Swagger UI 확인

브라우저에서 다음 URL 접속:

```
https://your-backend-url.onrender.com/api
```

Swagger UI가 정상적으로 표시되면 배포 성공!

### 4.4. 헬스 체크

```
https://your-backend-url.onrender.com/
```

`Hello World!` 또는 서버 응답이 표시되면 정상 작동 중입니다.

---

## 5. 프론트엔드 개발자에게 전달

배포가 완료되면 프론트엔드 개발자에게 다음 정보를 전달하세요:

### 5.1. 필수 정보

```
백엔드 API URL: https://your-backend-url.onrender.com
Swagger UI URL: https://your-backend-url.onrender.com/api
```

### 5.2. 프론트엔드 환경 변수 설정

프론트엔드 개발자가 `.env.local` 파일에 다음을 추가하도록 안내:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 5.3. 문서 전달

다음 문서들을 함께 전달하세요:

- `QUICK_START.md` - 빠른 시작 가이드
- `FRONTEND_DEVELOPER_GUIDE.md` - 프론트엔드 개발자 가이드
- `README_SWAGGER.md` - Swagger UI 사용법

---

## 문제 해결

### 배포 실패

1. **빌드 로그 확인**
   - Render 대시보드의 **"Logs"** 탭 확인
   - 빌드 오류 메시지 확인

2. **환경 변수 확인**
   - 모든 필수 환경 변수가 설정되었는지 확인
   - 특히 데이터베이스 연결 정보 확인

3. **포트 설정 확인**
   - Render는 자동으로 `PORT` 환경 변수를 제공
   - 코드에서 `process.env.PORT`를 사용하는지 확인

### 데이터베이스 연결 오류

1. **SSL 설정 확인**
   - Render PostgreSQL은 SSL 필수
   - `DB_SSL=true` 및 `DB_SSL_REQUIRED=true` 설정 확인

2. **Internal Database URL 사용**
   - Render 내부 네트워크를 사용하는 것이 더 안정적
   - External URL은 공개 IP이므로 방화벽 제한이 있을 수 있음

### 카카오 로그인 오류 (KOE006)

**에러 메시지**: "앱 관리자 설정 오류 (KOE006)"

**원인**: 카카오 개발자 콘솔에 배포된 서버의 Redirect URI가 등록되지 않음

**해결 방법**:

1. **카카오 개발자 콘솔 접속**
   - [카카오 개발자 콘솔](https://developers.kakao.com/) 로그인
   - 내 애플리케이션 선택

2. **Redirect URI 등록**
   - **"카카오 로그인"** > **"일반"** 탭 클릭
   - **"Redirect URI"** 섹션에서 **"+ 추가"** 클릭
   - 다음 URI 입력:
     ```
     https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback
     ```
   - **"저장"** 클릭

3. **환경 변수 확인**
   - Render 대시보드의 **Environment** 섹션에서 `KAKAO_CALLBACK_URL` 확인
   - 다음 값으로 설정되어 있어야 합니다:
     ```
     KAKAO_CALLBACK_URL=https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback
     ```

4. **서버 재시작** (필요시)
   - 환경 변수를 변경한 경우 서비스를 재배포하거나 재시작

**참고**:

- 개발 환경 URI (`http://localhost:3001/auth/kakao/callback`)와 프로덕션 URI를 모두 등록할 수 있습니다
- URI는 정확히 일치해야 합니다 (대소문자, 슬래시, 프로토콜 포함)

---

## 추가 팁

### 무료 플랜 제한사항

Render 무료 플랜의 경우:

- 서버가 15분간 요청이 없으면 자동으로 sleep 모드로 전환
- 첫 요청 시 약 30초 정도의 cold start 시간 소요
- 이를 고려하여 프론트엔드 개발자에게 안내

### 성능 최적화

1. **Health Check 엔드포인트 설정**
   - Render의 Health Check URL 설정
   - 주기적으로 요청을 보내 서버를 깨어있게 유지

2. **환경 변수 최적화**
   - 불필요한 로깅 비활성화 (`NODE_ENV=production`)
   - 데이터베이스 연결 풀 최적화

---

배포가 완료되면 프론트엔드 개발자는 배포된 URL만으로 바로 개발을 시작할 수 있습니다! 🚀
