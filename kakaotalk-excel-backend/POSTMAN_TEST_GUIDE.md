# Postman 테스트 가이드

이 가이드는 Postman을 사용하여 카카오톡 메시지 엑셀 변환 백엔드 API를 테스트하는 방법을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [카카오 OAuth 설정](#카카오-oauth-설정)
3. [Postman 환경 변수 설정](#postman-환경-변수-설정)
4. [API 테스트 순서](#api-테스트-순서)
5. [각 API 상세 가이드](#각-api-상세-가이드)

---

## 사전 준비

### 1. 백엔드 서버 실행 확인

```bash
cd kakaotalk-excel/kakaotalk-excel-backend
npm run start:dev
```

서버가 `http://localhost:3001`에서 실행 중이어야 합니다.

### 2. 테스트용 카카오톡 대화 내보내기 파일 준비

- 카카오톡에서 대화를 `.txt` 형식으로 내보내기
- 파일을 준비해두세요 (예: `test_chat.txt`)

### 3. Postman 설치

- [Postman 다운로드](https://www.postman.com/downloads/)
- Postman 계정 생성 (선택사항)

---

## 카카오 OAuth 설정

### 1. 카카오 개발자 콘솔 접속

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 로그인 후 "내 애플리케이션" 클릭

### 2. 애플리케이션 생성

1. "애플리케이션 추가하기" 클릭
2. 앱 이름 입력 (예: "카카오톡 엑셀 변환")
3. 저장

### 3. REST API 키 확인

1. 생성한 애플리케이션 클릭
2. "앱 키" 섹션에서 **REST API 키** 복사
3. 이 키를 `.env` 파일의 `KAKAO_CLIENT_ID`에 설정

### 4. Client Secret 생성

1. "보안" 탭 클릭
2. "Client Secret" 섹션에서 "생성" 클릭
3. 생성된 Client Secret 복사
4. 이 값을 `.env` 파일의 `KAKAO_CLIENT_SECRET`에 설정

### 5. Redirect URI 등록

1. "카카오 로그인" 메뉴 클릭
2. "활성화" 상태로 변경
3. "Redirect URI" 섹션에서 "URI 추가" 클릭
4. 다음 URI 추가:
   ```
   http://localhost:3001/auth/kakao/callback
   ```
5. 저장

### 6. 동의항목 설정 (선택사항)

1. "동의항목" 탭 클릭
2. 필요한 정보 동의항목 활성화:
   - **닉네임** (필수)
   - **카카오계정(이메일)** (선택, 이메일 필요 시)

### 7. .env 파일 확인

`.env` 파일에 다음 값들이 설정되어 있는지 확인:

```env
KAKAO_CLIENT_ID=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret
KAKAO_CALLBACK_URL=http://localhost:3001/auth/kakao/callback
FRONTEND_URL=http://localhost:3001
```

---

## Postman 환경 변수 설정

### 1. Postman 환경 생성

1. Postman 우측 상단의 환경 선택 드롭다운 클릭
2. "Add" 또는 "관리" 클릭
3. "Add" 버튼 클릭하여 새 환경 생성
4. 환경 이름 입력: "KakaoTalk Excel Backend"

### 2. 환경 변수 추가

다음 변수들을 추가하세요:

| 변수명          | 초기값                  | 현재값                  |
| --------------- | ----------------------- | ----------------------- |
| `base_url`      | `http://localhost:3001` | `http://localhost:3001` |
| `access_token`  | (비워둠)                | (자동 설정됨)           |
| `refresh_token` | (비워둠)                | (자동 설정됨)           |
| `job_id`        | (비워둠)                | (자동 설정됨)           |

### 3. 환경 활성화

생성한 환경을 선택하여 활성화합니다.

---

## API 테스트 순서

### 전체 플로우

1. **게스트 모드 테스트** (로그인 없이)
   - 미리보기 API
   - 엑셀 생성 API

2. **카카오 로그인 테스트**
   - 카카오 로그인 (브라우저)
   - Access Token 획득
   - 현재 사용자 정보 조회

3. **로그인 사용자: 파일 업로드 및 변환**
   - 미리보기 API (인증 포함)
   - 엑셀 생성 API (인증 포함)
   - 작업 목록 조회
   - 작업 상세 조회
   - 작업 재다운로드

4. **추가 기능 테스트**
   - 게스트 작업 귀속
   - 설정 관리
   - 토큰 재발급
   - 로그아웃

---

## 각 API 상세 가이드

### 1. 헬스 체크

**요청:**

- Method: `GET`
- URL: `{{base_url}}/`
- Headers: 없음

**예상 응답:**

```json
"Hello World!"
```

---

### 2. 게스트 모드: 미리보기

**요청:**

- Method: `POST`
- URL: `{{base_url}}/convert/preview`
- Headers:
  - `Content-Type: multipart/form-data` (자동 설정)
- Body:
  - Type: `form-data`
  - Key: `file` (Type: File)
    - Value: 테스트용 `.txt` 파일 선택
  - Key: `includeSystem` (Type: Text, Optional)
    - Value: `false` (시스템 메시지 제외)
  - Key: `dateFrom` (Type: Text, Optional)
    - Value: `2024-01-01` (시작 날짜)
  - Key: `dateTo` (Type: Text, Optional)
    - Value: `2024-12-31` (종료 날짜)
  - Key: `participants` (Type: Text, Optional)
    - Value: `["홍길동", "김철수"]` (JSON 배열 문자열)

**예상 응답:**

```json
{
  "jobId": "uuid-string",
  "roomName": "채팅방 이름",
  "messages": [
    {
      "at": "2024-01-01T10:00:00.000Z",
      "sender": "홍길동",
      "message": "안녕하세요",
      "type": "text"
    }
  ],
  "participants": ["홍길동", "김철수"],
  "stats": {
    "totalLines": 1000,
    "previewCount": 200
  }
}
```

**Postman Script (Tests 탭):**

```javascript
// jobId를 환경 변수에 저장
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set('job_id', response.jobId);
  console.log('Job ID saved:', response.jobId);
}
```

---

### 3. 게스트 모드: 엑셀 생성

**요청:**

- Method: `POST`
- URL: `{{base_url}}/convert/excel`
- Headers:
  - `Content-Type: multipart/form-data` (자동 설정)
- Body:
  - Type: `form-data`
  - Key: `file` (Type: File)
    - Value: 테스트용 `.txt` 파일 선택
  - Key: `includeSystem` (Type: Text, Optional)
    - Value: `false`
  - Key: `splitSheetsByDay` (Type: Text, Optional)
    - Value: `true` (날짜별로 시트 분할)
  - Key: `dateFrom` (Type: Text, Optional)
  - Key: `dateTo` (Type: Text, Optional)
  - Key: `participants` (Type: Text, Optional)

**예상 응답:**

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 파일 다운로드 (`.xlsx` 파일)

**Postman Script (Tests 탭):**

```javascript
// 응답이 파일인지 확인
pm.test('Excel file received', function () {
  pm.response.to.have.header('Content-Type');
  pm.expect(pm.response.headers.get('Content-Type')).to.include(
    'spreadsheetml',
  );
});
```

---

### 4. 로그인 사용자: 미리보기 (인증 필요)

**주의:** 이 API는 게스트 모드와 동일하지만, 로그인 사용자가 사용하면 작업이 자동으로 저장됩니다.

**요청:**

- Method: `POST`
- URL: `{{base_url}}/convert/preview`
- Headers:
  - `Authorization: Bearer {{access_token}}` (로그인 사용자용)
  - `Content-Type: multipart/form-data` (자동 설정)
- Body:
  - Type: `form-data`
  - Key: `file` (Type: File)
    - Value: 테스트용 `.txt` 파일 선택
  - Key: `includeSystem` (Type: Text, Optional)
    - Value: `false` (시스템 메시지 제외)
  - Key: `dateFrom` (Type: Text, Optional)
    - Value: `2024-01-01` (시작 날짜)
  - Key: `dateTo` (Type: Text, Optional)
    - Value: `2024-12-31` (종료 날짜)
  - Key: `participants` (Type: Text, Optional)
    - Value: `["홍길동", "김철수"]` (JSON 배열 문자열)

**예상 응답:**

```json
{
  "jobId": "uuid-string",
  "roomName": "채팅방 이름",
  "messages": [
    {
      "at": "2024-01-01T10:00:00.000+09:00",
      "sender": "홍길동",
      "message": "안녕하세요",
      "type": "text"
    }
  ],
  "participants": ["홍길동", "김철수"],
  "stats": {
    "totalLines": 1000,
    "previewCount": 200
  }
}
```

**차이점 (게스트 모드 vs 로그인 사용자):**

- **게스트 모드**: 작업이 `guest_session` 쿠키로만 연결됨, 로그인 후 귀속 필요
- **로그인 사용자**: 작업이 자동으로 사용자 계정에 저장됨, `/jobs` API로 조회 가능

**Postman Script (Tests 탭):**

```javascript
// jobId를 환경 변수에 저장
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set('job_id', response.jobId);
  console.log('Job ID saved:', response.jobId);
  console.log('This job is now saved to your account!');
}
```

---

### 5. 로그인 사용자: 엑셀 생성 (인증 필요)

**주의:** 이 API는 게스트 모드와 동일하지만, 로그인 사용자가 사용하면 작업이 자동으로 저장되고 나중에 재다운로드 가능합니다.

**요청:**

- Method: `POST`
- URL: `{{base_url}}/convert/excel`
- Headers:
  - `Authorization: Bearer {{access_token}}` (로그인 사용자용)
  - `Content-Type: multipart/form-data` (자동 설정)
- Body:
  - Type: `form-data`
  - Key: `file` (Type: File)
    - Value: 테스트용 `.txt` 파일 선택
  - Key: `includeSystem` (Type: Text, Optional)
    - Value: `false`
  - Key: `splitSheetsByDay` (Type: Text, Optional)
    - Value: `true` (날짜별로 시트 분할)
  - Key: `dateFrom` (Type: Text, Optional)
  - Key: `dateTo` (Type: Text, Optional)
  - Key: `participants` (Type: Text, Optional)

**예상 응답:**

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 파일 다운로드 (`.xlsx` 파일)

**차이점 (게스트 모드 vs 로그인 사용자):**

- **게스트 모드**:
  - 파일 다운로드 후 작업 기록이 `guest_session`에만 저장
  - 로그인 후 `/jobs/claim`으로 귀속 필요
- **로그인 사용자**:
  - 파일 다운로드 후 작업이 자동으로 사용자 계정에 저장
  - `/jobs` API로 작업 목록 조회 가능
  - `/jobs/{{job_id}}/download`로 재다운로드 가능

**Postman Script (Tests 탭):**

```javascript
// 응답이 파일인지 확인
pm.test('Excel file received', function () {
  pm.response.to.have.header('Content-Type');
  pm.expect(pm.response.headers.get('Content-Type')).to.include(
    'spreadsheetml',
  );
});

// jobId를 환경 변수에 저장 (응답 헤더에서 추출 가능한 경우)
// 주의: 엑셀 생성 API는 파일을 반환하므로 jobId를 직접 받을 수 없습니다.
// 대신 /jobs API로 최근 작업을 조회하여 jobId를 확인할 수 있습니다.
```

**작업 ID 확인 방법:**

엑셀 생성 후 작업 ID를 확인하려면:

1. `/jobs` API를 호출하여 최근 작업 목록 조회
2. 가장 최근 작업의 `id`를 확인
3. 해당 `id`로 `/jobs/{{job_id}}`로 상세 조회 또는 `/jobs/{{job_id}}/download`로 재다운로드

---

### 6. 카카오 로그인 (브라우저)

**주의:** 카카오 로그인은 브라우저에서 직접 진행해야 합니다.

1. 브라우저에서 다음 URL 접속:

   ```
   http://localhost:3001/auth/kakao
   ```

2. 카카오 로그인 진행

3. 로그인 성공 후 리다이렉트된 URL에서 Access Token 추출:

   ```
   http://localhost:3001/auth/callback?token=YOUR_ACCESS_TOKEN
   ```

   - `YOUR_ACCESS_TOKEN` 부분을 복사

4. Postman 환경 변수에 저장:
   - `access_token` = 복사한 토큰 값

**또는 Postman Script로 자동화:**

Postman에서 "Interceptor" 또는 "Browser Extension"을 사용하여 브라우저의 리다이렉트를 가로채 토큰을 자동으로 추출할 수 있습니다.

---

### 7. 현재 사용자 정보 조회

**요청:**

- Method: `GET`
- URL: `{{base_url}}/auth/me`
- Headers:
  - `Authorization: Bearer {{access_token}}`

**예상 응답:**

```json
{
  "id": 1,
  "nickname": "홍길동",
  "email": "user@example.com",
  "provider": "kakao"
}
```

---

### 8. 토큰 재발급

**요청:**

- Method: `POST`
- URL: `{{base_url}}/auth/refresh`
- Headers:
  - `Cookie: refresh_token={{refresh_token}}`
  - 또는 Postman의 Cookie 관리 기능 사용 (아래 참고)
- Body: 없음

**Postman에서 쿠키 설정 방법:**

#### 방법 1: Headers에 직접 설정 (권장)

1. **Headers** 탭 클릭
2. **Key**: `Cookie`
3. **Value**: `refresh_token={{refresh_token}}`
   - 또는 직접 값 입력: `refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **주의**: URL에 쿠키를 넣지 마세요! Headers에만 설정하세요.

#### 방법 2: Postman Cookie 관리 기능 사용

1. Postman 상단의 **Cookies** 링크 클릭 (또는 요청 옆의 쿠키 아이콘)
2. `localhost` 도메인 선택
3. **+ Add Cookie** 클릭
4. 다음 정보 입력:
   - **Name**: `refresh_token`
   - **Value**: `{{refresh_token}}` 또는 실제 토큰 값
   - **Domain**: `localhost`
   - **Path**: `/`
   - **Expires**: 적절한 만료 시간 설정
5. **Save** 클릭

**주의사항:**

- ❌ **잘못된 방법**: URL에 쿠키를 포함시키기
  - 예: `{{base_url}}/auth/refresh?cookie=refresh_token=...` (이렇게 하면 안 됩니다!)
- ✅ **올바른 방법**: Headers의 `Cookie` 필드에 설정
  - 예: `Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**예상 응답:**

```json
{
  "accessToken": "new-access-token"
}
```

**에러 해결:**

- **404 에러**: URL에 공백이나 잘못된 문자가 포함되어 있는지 확인
- **401 에러**: `refresh_token` 쿠키가 제대로 전송되지 않았는지 확인
- **쿠키가 전송되지 않는 경우**: Postman의 Cookie 관리 기능을 사용하거나, Headers에 직접 설정

**Postman Script (Tests 탭):**

```javascript
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set('access_token', response.accessToken);
  console.log('Access token refreshed');
}
```

**참고:** Refresh Token은 httpOnly 쿠키로 저장되므로, 실제 브라우저에서 로그인한 후 쿠키를 Postman에 수동으로 설정해야 합니다.

---

### 9. 로그인 사용자: 작업 목록 조회

**요청:**

- Method: `GET`
- URL: `{{base_url}}/jobs`
- Headers:
  - `Authorization: Bearer {{access_token}}`
- Query Parameters:
  - `status` (Optional): `previewed`, `processing`, `success`, `failed`, `expired`
  - `page` (Optional): `1` (기본값: 1)
  - `size` (Optional): `20` (기본값: 20)

**예상 응답:**

```json
{
  "jobs": [
    {
      "id": "uuid-string",
      "originalFileName": "chat.txt",
      "status": "success",
      "roomName": "채팅방",
      "totalMessages": 1000,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "finishedAt": "2024-01-01T10:05:00.000Z",
      "hasFile": true,
      "fileExpiresAt": "2024-01-08T10:05:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "size": 20
}
```

---

### 10. 로그인 사용자: 작업 상세 조회

**요청:**

- Method: `GET`
- URL: `{{base_url}}/jobs/{{job_id}}`
- Headers:
  - `Authorization: Bearer {{access_token}}`

**예상 응답:**

```json
{
  "id": "uuid-string",
  "originalFileName": "chat.txt",
  "status": "success",
  "optionsJson": {
    "includeSystem": false,
    "splitSheetsByDay": true
  },
  "roomName": "채팅방",
  "totalMessages": 1000,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "finishedAt": "2024-01-01T10:05:00.000Z",
  "files": [
    {
      "id": 1,
      "sizeBytes": 1024000,
      "expiresAt": "2024-01-08T10:05:00.000Z",
      "createdAt": "2024-01-01T10:05:00.000Z"
    }
  ]
}
```

---

### 11. 로그인 사용자: 작업 다운로드

**요청:**

- Method: `GET`
- URL: `{{base_url}}/jobs/{{job_id}}/download`
- Headers:
  - `Authorization: Bearer {{access_token}}`

**예상 응답:**

- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 파일 다운로드 (`.xlsx` 파일)

**Postman에서 파일 다운로드 받는 방법:**

1. **자동 다운로드 (권장):**
   - Postman에서 요청을 보낸 후, 응답 영역 하단에 **"Save Response"** 버튼이 나타납니다
   - **"Save Response"** → **"Save to a file"** 클릭
   - 파일 이름을 입력하고 저장 위치를 선택한 후 저장
   - 또는 응답 영역에서 **"..." (점 3개)** 메뉴 → **"Save Response"** → **"Save to a file"**

2. **수동 다운로드:**
   - 응답 영역에서 **"Send and Download"** 버튼 클릭 (요청 전송 전)
   - 또는 응답이 받아진 후, 응답 본문 영역에서 **"Save Response"** → **"Save to a file"**

3. **파일 위치 확인:**
   - Postman 기본 다운로드 폴더: `C:\Users\<사용자명>\Downloads\`
   - 또는 저장할 때 선택한 폴더 위치

**참고:**

- 파일 이름은 `Content-Disposition` 헤더의 `filename` 값으로 자동 설정됩니다
- 예: `카톡예시2.xlsx` (원본 파일명에서 `.txt`를 `.xlsx`로 변경)

---

### 12. 게스트 작업 귀속 (Claim) - 게스트 작업을 내 계정으로 가져오기

**"귀속(Claim)"이란?**

"귀속"은 "내 것으로 만들기", "내 계정에 연결하기"를 의미합니다.

**시나리오 예시:**

1. **게스트 모드로 작업 생성** (로그인 없이)
   - 사용자가 로그인하지 않은 상태로 카카오톡 파일을 업로드
   - 엑셀 파일을 생성하고 다운로드
   - 이 작업은 `guest_session` 쿠키에만 연결되어 있음
   - 로그인하지 않으면 나중에 이 작업을 찾을 수 없음

2. **나중에 로그인**
   - 사용자가 카카오 로그인을 진행
   - 로그인 전에 만든 게스트 작업들은 아직 내 계정에 연결되지 않음

3. **게스트 작업 귀속 (Claim)**
   - `/jobs/claim` API를 호출하면
   - 게스트 모드로 만든 모든 작업들이 내 계정으로 이동됨
   - 이제 `/jobs` API로 내 작업 목록에서 확인 가능
   - 재다운로드도 가능해짐

**요청:**

- Method: `POST`
- URL: `{{base_url}}/jobs/claim`
- Headers:
  - `Authorization: Bearer {{access_token}}` (로그인 필수)
  - `Cookie: guest_session=YOUR_GUEST_SESSION_ID` (게스트 세션 쿠키 필요)

**게스트 세션 쿠키 확인 방법:**

1. **게스트 모드로 API 호출 후 쿠키 확인:**
   - 게스트 모드로 `/convert/preview` 또는 `/convert/excel` 호출
   - Postman의 **Cookies** 링크 클릭
   - `localhost` 도메인에서 `guest_session` 쿠키 확인
   - 쿠키 값을 복사

2. **Headers에 쿠키 추가:**
   - Headers 탭에서
   - Key: `Cookie`
   - Value: `guest_session=복사한_쿠키_값`

**예상 응답:**

```json
{
  "claimed": 3
}
```

- `claimed`: 내 계정으로 이동된 작업의 개수

**전체 플로우 예시:**

```
1. 게스트 모드로 작업 생성
   POST /convert/excel (쿠키 없음)
   → guest_session 쿠키 자동 생성
   → 작업이 guest_session에 연결됨

2. 카카오 로그인
   GET /auth/kakao (브라우저)
   → access_token 획득

3. 게스트 작업 귀속
   POST /jobs/claim
   Headers:
     - Authorization: Bearer {access_token}
     - Cookie: guest_session={게스트_세션_값}
   → 게스트 작업들이 내 계정으로 이동됨

4. 작업 목록 확인
   GET /jobs
   Headers:
     - Authorization: Bearer {access_token}
   → 귀속된 작업들이 목록에 나타남
```

**참고:**

- 게스트 세션 쿠키는 게스트 모드로 API를 호출할 때 자동으로 생성됩니다
- Postman에서 쿠키를 확인하여 수동으로 설정해야 합니다
- 한 번 귀속하면 다시 귀속할 필요가 없습니다 (이미 내 계정에 연결됨)

---

### 13. 설정 조회

**요청:**

- Method: `GET`
- URL: `{{base_url}}/settings`
- Headers:
  - `Authorization: Bearer {{access_token}}`

**예상 응답:**

```json
{
  "id": 1,
  "userId": 1,
  "defaultIncludeSystem": false,
  "defaultSplitSheetsByDay": false,
  "defaultDateRangeDays": null,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

---

### 14. 설정 업데이트

**요청:**

- Method: `PUT`
- URL: `{{base_url}}/settings`
- Headers:
  - `Authorization: Bearer {{access_token}}`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "defaultIncludeSystem": true,
  "defaultSplitSheetsByDay": true,
  "defaultDateRangeDays": 30
}
```

**예상 응답:**

```json
{
  "id": 1,
  "userId": 1,
  "defaultIncludeSystem": true,
  "defaultSplitSheetsByDay": true,
  "defaultDateRangeDays": 30,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:10:00.000Z"
}
```

---

### 15. 로그아웃

**요청:**

- Method: `POST`
- URL: `{{base_url}}/auth/logout`
- Headers:
  - `Authorization: Bearer {{access_token}}`

**예상 응답:**

```json
{
  "message": "Logged out successfully"
}
```

---

## Postman Collection 생성

### Collection 구조 제안

```
KakaoTalk Excel Backend
├── 1. Health Check
│   └── GET /
├── 2. Guest Mode
│   ├── POST /convert/preview
│   └── POST /convert/excel
├── 3. Authentication
│   ├── GET /auth/kakao (브라우저)
│   ├── GET /auth/me
│   ├── POST /auth/refresh
│   └── POST /auth/logout
├── 4. Jobs (Authenticated)
│   ├── GET /jobs
│   ├── GET /jobs/:jobId
│   ├── GET /jobs/:jobId/download
│   └── POST /jobs/claim
└── 5. Settings (Authenticated)
    ├── GET /settings
    └── PUT /settings
```

---

## 자주 발생하는 문제 해결

### 1. "Unauthorized" 오류

- Access Token이 만료되었을 수 있습니다.
- `/auth/refresh`로 토큰을 재발급하거나, 브라우저에서 다시 로그인하세요.

### 2. "Guest session not found" 오류

- 게스트 세션 쿠키가 없습니다.
- 먼저 게스트 모드 API를 호출하여 쿠키를 생성하세요.

### 3. 카카오 로그인 리다이렉트 오류

- 카카오 개발자 콘솔에서 Redirect URI가 정확히 등록되었는지 확인하세요.
- `.env` 파일의 `KAKAO_CALLBACK_URL`이 등록된 URI와 일치하는지 확인하세요.

### 4. 파일 업로드 오류

- 파일 형식이 `.txt`인지 확인하세요.
- Postman에서 `form-data` 타입을 사용하고, `file` 키를 선택하세요.

### 5. CORS 오류

- `.env` 파일의 `FRONTEND_URL`이 올바르게 설정되었는지 확인하세요.
- Postman은 CORS 제한이 없지만, 브라우저에서 테스트할 때 발생할 수 있습니다.

---

## 추가 팁

### 1. Postman Pre-request Script

모든 요청에 자동으로 Authorization 헤더를 추가하려면 Collection의 "Pre-request Script"에 다음을 추가:

```javascript
// Access Token이 있으면 자동으로 헤더 추가
const accessToken = pm.environment.get('access_token');
if (accessToken) {
  pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + accessToken,
  });
}
```

### 2. 자동 토큰 갱신

401 오류가 발생하면 자동으로 토큰을 갱신하려면 Collection의 "Tests"에 다음을 추가:

```javascript
if (pm.response.code === 401) {
  // Refresh token으로 새 access token 받기
  pm.sendRequest(
    {
      url: pm.environment.get('base_url') + '/auth/refresh',
      method: 'POST',
      header: {
        Cookie: 'refresh_token=' + pm.environment.get('refresh_token'),
      },
    },
    function (err, res) {
      if (!err && res.code === 200) {
        const newToken = res.json().accessToken;
        pm.environment.set('access_token', newToken);
        console.log('Token auto-refreshed');
      }
    },
  );
}
```

### 3. 환경 변수 자동 저장

각 API의 "Tests" 탭에 응답 데이터를 환경 변수에 자동 저장하는 스크립트를 추가하면 편리합니다.

---

## 테스트 체크리스트

### 기본 테스트

- [ ] 헬스 체크 API 동작 확인

### 게스트 모드 테스트

- [ ] 게스트 모드 미리보기 API 동작 확인
- [ ] 게스트 모드 엑셀 생성 API 동작 확인

### 인증 테스트

- [ ] 카카오 로그인 성공
- [ ] Access Token 획득
- [ ] 현재 사용자 정보 조회
- [ ] 토큰 재발급

### 로그인 사용자: 파일 업로드 및 변환

- [ ] 로그인 사용자 미리보기 API 동작 확인 (작업 자동 저장 확인)
- [ ] 로그인 사용자 엑셀 생성 API 동작 확인 (작업 자동 저장 확인)
- [ ] 작업 목록 조회 (생성한 작업이 목록에 나타나는지 확인)
- [ ] 작업 상세 조회
- [ ] 작업 재다운로드

### 추가 기능 테스트

- [ ] 게스트 작업 귀속
- [ ] 설정 조회 및 업데이트
- [ ] 로그아웃

---

이 가이드를 따라하면 모든 API를 테스트할 수 있습니다. 문제가 발생하면 위의 "자주 발생하는 문제 해결" 섹션을 참고하세요.
