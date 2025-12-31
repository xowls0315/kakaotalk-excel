# Render Environment Variables 설정 가이드

Render 대시보드의 **Environment** 섹션에 다음 환경 변수들을 설정하세요.

## 📋 필수 환경 변수 목록

### 1. 애플리케이션 설정

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:3000
```

**참고**:

- Render는 자동으로 `PORT` 환경 변수를 제공하지만, 명시적으로 설정하는 것을 권장합니다
- `FRONTEND_URL`은 프론트엔드 개발자가 로컬에서 개발할 때 사용하는 URL입니다
  - 프론트엔드 개발자가 `localhost:3000`에서 개발하는 경우: `http://localhost:3000`
  - 프론트엔드가 배포된 경우: 배포된 프론트엔드 URL (예: `https://your-frontend-domain.com`)
- **중요**: 프론트엔드 개발자가 로컬에서 개발하는 경우 `http://localhost:3000`으로 설정해야 CORS 에러가 발생하지 않습니다

---

### 2. 데이터베이스 설정 (PostgreSQL)

Render에서 PostgreSQL 데이터베이스를 생성한 후, 다음 정보를 설정하세요:

```env
DB_HOST=your-database-host.onrender.com
DB_PORT=5432
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
DB_DATABASE=your-database-name
DB_SCHEMA=kakaotalk-excel
DB_SSL=true
DB_SSL_REQUIRED=true
```

**중요**:

- Render PostgreSQL은 SSL 연결이 필수입니다
- 데이터베이스 생성 후 **"Internal Database URL"** 또는 **"External Database URL"**에서 정보를 추출하세요

**Internal Database URL 예시**:

```
postgresql://username:password@hostname:5432/database_name
```

이 URL을 파싱하여 위의 환경 변수들을 설정하세요.

---

### 3. JWT 시크릿 키

```env
JWT_ACCESS_SECRET=your-strong-access-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-strong-refresh-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**중요**:

- 프로덕션 환경에서는 반드시 강력한 랜덤 문자열을 사용하세요
- 최소 32자 이상의 랜덤 문자열을 권장합니다

**시크릿 키 생성 방법** (로컬 터미널):

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# 또는 온라인 도구 사용
# https://www.random.org/strings/
```

---

### 4. 카카오 OAuth 설정

```env
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://your-backend-url.onrender.com/auth/kakao/callback
```

**중요**:

- `KAKAO_CALLBACK_URL`은 배포된 Render 서버 URL로 설정해야 합니다
- 예: `https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback`
- 카카오 개발자 콘솔에서도 동일한 Redirect URI를 등록해야 합니다

---

### 5. 파일 저장 설정

```env
STORAGE_TYPE=local
STORAGE_PATH=./uploads
FILE_EXPIRES_IN_DAYS=7
GUEST_SESSION_EXPIRES_IN_DAYS=7
```

**참고**:

- Render는 임시 파일 시스템을 사용하므로, 파일은 서버 재시작 시 삭제될 수 있습니다
- 프로덕션에서는 S3나 다른 영구 저장소 사용을 권장합니다

---

## 🔧 Render 대시보드에서 설정하는 방법

1. Render 대시보드에서 Web Service 선택
2. 왼쪽 메뉴에서 **"Environment"** 클릭
3. **"Add Environment Variable"** 버튼 클릭
4. Key와 Value를 입력하고 **"Save Changes"** 클릭
5. 모든 환경 변수를 추가한 후 서비스를 재배포

---

## ✅ 설정 확인 체크리스트

배포 전 다음 사항을 확인하세요:

- [ ] `NODE_ENV=production` 설정
- [ ] 데이터베이스 연결 정보 모두 설정 (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SCHEMA)
- [ ] `DB_SSL=true` 및 `DB_SSL_REQUIRED=true` 설정
- [ ] JWT 시크릿 키 설정 (최소 32자 이상)
- [ ] 카카오 OAuth 설정 (CLIENT_ID, CLIENT_SECRET, CALLBACK_URL)
- [ ] `KAKAO_CALLBACK_URL`이 배포된 서버 URL로 설정되었는지 확인
- [ ] 카카오 개발자 콘솔에 Redirect URI 등록 완료

---

## 🚨 주의사항

1. **민감한 정보 보호**

   - `.env` 파일은 절대 Git에 커밋하지 마세요
   - Render의 Environment Variables는 암호화되어 저장됩니다

2. **카카오 Redirect URI**

   - 배포 후 서버 URL이 확정되면 카카오 개발자 콘솔에서 Redirect URI를 업데이트하세요
   - 개발 환경과 프로덕션 환경의 URI를 모두 등록할 수 있습니다

3. **데이터베이스 스키마**
   - 배포 후 데이터베이스에 스키마를 적용해야 합니다
   - `database/schema.sql` 파일을 실행하세요

---

## 📝 예시: 전체 환경 변수 설정

```env
# 애플리케이션
NODE_ENV=production
PORT=10000
FRONTEND_URL=http://localhost:3000  # 프론트엔드 개발자가 로컬에서 개발하는 경우
# 또는 프론트엔드가 배포된 경우: FRONTEND_URL=https://your-frontend-domain.com

# 데이터베이스
DB_HOST=dpg-xxxxx-a.singapore-postgres.render.com
DB_PORT=5432
DB_USERNAME=kakaotalk_excel_user
DB_PASSWORD=your-secure-password-here
DB_DATABASE=kakaotalk_excel
DB_SCHEMA=kakaotalk-excel
DB_SSL=true
DB_SSL_REQUIRED=true

# JWT
JWT_ACCESS_SECRET=your-very-long-and-secure-access-secret-key-here-min-32-chars
JWT_REFRESH_SECRET=your-very-long-and-secure-refresh-secret-key-here-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 카카오 OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback

# 파일 저장
STORAGE_TYPE=local
STORAGE_PATH=./uploads
FILE_EXPIRES_IN_DAYS=7
GUEST_SESSION_EXPIRES_IN_DAYS=7
```

---

배포 후 `https://your-backend-url.onrender.com/api`에서 Swagger UI를 확인할 수 있습니다! 🚀
