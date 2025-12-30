# 빠른 시작 가이드

프론트엔드 개발자가 백엔드 API를 빠르게 시작하는 방법을 안내합니다.

## 방법 1: 배포된 서버 사용 (가장 권장) 🚀

백엔드 개발자가 Render 등으로 서버를 배포했다면, 배포된 URL만 받아서 바로 사용할 수 있습니다.

### 단계

1. **백엔드 개발자에게 배포된 서버 URL 요청**

   ```
   예: https://kakaotalk-excel-backend.onrender.com
   ```

2. **Swagger UI 접속**

   ```
   https://kakaotalk-excel-backend.onrender.com/api
   ```

   - 브라우저에서 바로 접속 가능
   - 모든 API 엔드포인트 확인 및 테스트 가능

3. **프론트엔드 코드에서 API URL 설정**

   ```typescript
   // .env.local 또는 환경 변수
   NEXT_PUBLIC_API_URL=https://kakaotalk-excel-backend.onrender.com
   ```

4. **API 사용 시작**
   - Swagger UI에서 API 테스트
   - 프론트엔드 코드에서 API 호출

**이 방법의 장점:**

- ✅ 환경 설정 완전히 불필요
- ✅ 데이터베이스 설정 불필요
- ✅ 카카오 OAuth 설정 불필요
- ✅ 24/7 접근 가능 (서버가 항상 실행 중)
- ✅ 네트워크 제약 없음 (어디서든 접근 가능)
- ✅ 실제 프로덕션 환경과 유사
- ✅ 즉시 개발 시작 가능

**주의사항:**

- 배포된 서버의 카카오 OAuth Redirect URI는 배포된 URL로 설정되어 있어야 함
- 예: `https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback`

---

## 방법 2: 백엔드 개발자의 로컬 서버 사용 ⚡

백엔드 개발자가 로컬에서 서버를 실행하고 있다면, Swagger UI URL만 받아서 사용할 수 있습니다.

### 단계

1. **백엔드 개발자에게 Swagger UI URL 요청**

   ```
   예: http://localhost:3001/api
   또는: https://dev-backend.example.com/api
   ```

2. **브라우저에서 Swagger UI 접속**
   - 제공받은 URL로 접속
   - 모든 API 엔드포인트 확인 및 테스트 가능

3. **프론트엔드 코드에서 API URL 설정**

   ```typescript
   // .env.local 또는 환경 변수
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **API 사용 시작**
   - Swagger UI에서 API 테스트
   - 프론트엔드 코드에서 API 호출

**이 방법의 장점:**

- ✅ 환경 설정 불필요
- ✅ 데이터베이스 설정 불필요
- ✅ 카카오 OAuth 설정 불필요
- ✅ 즉시 개발 시작 가능

---

## 방법 3: 직접 백엔드 실행 (독립적 개발)

프론트엔드 개발자가 백엔드를 직접 실행하려면 다음 단계를 따르세요.

### 필수 사전 준비

1. **Node.js 설치** (v18 이상)
2. **PostgreSQL 설치 및 실행**
3. **카카오 개발자 계정** (카카오 로그인 사용 시)

### 단계별 설정

#### 1단계: 의존성 설치

```bash
cd kakaotalk-excel-backend
npm install
```

#### 2단계: 환경 변수 설정

```bash
# .env.example 파일을 .env로 복사
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

`.env` 파일을 열고 다음 값들을 설정하세요:

```env
# 데이터베이스 설정 (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=kakaotalk_excel
DB_SCHEMA=kakaotalk-excel

# JWT 시크릿 키 (랜덤 문자열 생성)
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# 카카오 OAuth (카카오 개발자 콘솔에서 발급)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=http://localhost:3001/auth/kakao/callback
```

**JWT 시크릿 키 생성 방법:**

```bash
# OpenSSL 사용
openssl rand -base64 32

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 3단계: 데이터베이스 설정

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE kakaotalk_excel;

# 스키마 파일 실행
\c kakaotalk_excel
\i database/schema.sql
```

또는 명령줄에서:

```bash
psql -U postgres -d kakaotalk_excel -f database/schema.sql
```

#### 4단계: 카카오 OAuth 설정 (선택사항)

카카오 로그인을 사용하지 않는다면 이 단계는 건너뛰어도 됩니다.

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 앱 생성 및 REST API 키 확인
3. 카카오 로그인 활성화 및 Client Secret 생성
4. Redirect URI 등록: `http://localhost:3001/auth/kakao/callback`

자세한 방법은 `KAKAO_OAUTH_SETUP.md` 참고

#### 5단계: 서버 실행

```bash
npm run start:dev
```

서버가 실행되면:

- API 서버: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/api`

---

## 어떤 방법을 선택해야 할까?

### 방법 1을 선택하는 경우 (배포된 서버 사용) - 가장 권장

- ✅ 가장 빠르고 간편한 방법
- ✅ 환경 설정 완전히 불필요
- ✅ 24/7 접근 가능
- ✅ 네트워크 제약 없음
- ✅ 실제 프로덕션 환경과 유사

### 방법 2를 선택하는 경우 (백엔드 개발자 로컬 서버 사용)

- ✅ 빠르게 시작하고 싶을 때
- ✅ 환경 설정이 복잡해 보일 때
- ✅ API 구조만 먼저 파악하고 싶을 때
- ✅ 백엔드 개발자와 같은 네트워크에 있을 때

### 방법 3을 선택하는 경우 (직접 백엔드 실행)

- ✅ 독립적으로 개발하고 싶을 때
- ✅ 백엔드 코드를 수정하고 싶을 때
- ✅ 전체 플로우를 로컬에서 테스트하고 싶을 때
- ✅ 프로덕션 배포를 준비할 때

---

## 문제 해결

### 백엔드 개발자의 서버에 접속할 수 없는 경우

1. **네트워크 확인**
   - 같은 Wi-Fi/네트워크에 연결되어 있는지 확인
   - 백엔드 개발자에게 IP 주소 확인

2. **방화벽 확인**
   - 백엔드 개발자의 방화벽에서 포트 3001이 열려있는지 확인

3. **대안: 터널링 서비스 사용**
   - ngrok, localtunnel 등을 사용하여 공개 URL 생성
   - 백엔드 개발자가 터널링 URL 공유

### 직접 백엔드 실행 시 오류 발생

1. **데이터베이스 연결 오류**
   - PostgreSQL이 실행 중인지 확인
   - `.env` 파일의 데이터베이스 정보 확인

2. **포트 충돌**
   - 포트 3001이 이미 사용 중인지 확인
   - `.env` 파일에서 `PORT` 변경

3. **환경 변수 오류**
   - 모든 필수 환경 변수가 설정되었는지 확인
   - `.env.example` 파일과 비교

---

## 다음 단계

환경 설정이 완료되면:

1. **Swagger UI 접속**: `http://localhost:3001/api`
2. **API 테스트**: Swagger UI에서 직접 API 호출 테스트
3. **프론트엔드 통합**: `FRONTEND_DEVELOPER_GUIDE.md` 참고

---

## 추가 문서

- **프론트엔드 개발자 가이드**: `FRONTEND_DEVELOPER_GUIDE.md`
- **환경 변수 설정 가이드**: `ENV_SETUP_GUIDE.md` (직접 실행 시)
- **카카오 OAuth 설정**: `KAKAO_OAUTH_SETUP.md` (직접 실행 시)
- **Swagger UI 사용법**: `README_SWAGGER.md`
