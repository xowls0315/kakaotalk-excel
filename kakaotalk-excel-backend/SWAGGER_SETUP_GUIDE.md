# Swagger UI 설정 가이드

이 문서는 백엔드 개발자가 Swagger UI를 설정하고 프론트엔드 개발자에게 API 명세를 전달하는 방법을 설명합니다.

## 목차

1. [Swagger 패키지 설치](#1-swagger-패키지-설치)
2. [Swagger 설정 완료 확인](#2-swagger-설정-완료-확인)
3. [Swagger UI 접속](#3-swagger-ui-접속)
4. [프론트엔드 개발자용 가이드](#4-프론트엔드-개발자용-가이드)

---

## 1. Swagger 패키지 설치

Swagger 패키지는 이미 설치되어 있습니다. 만약 설치가 필요하다면:

```bash
cd kakaotalk-excel/kakaotalk-excel-backend
npm install --save @nestjs/swagger swagger-ui-express
```

---

## 2. Swagger 설정 완료 확인

### 2.1. main.ts 확인

`src/main.ts` 파일에 Swagger 설정이 추가되어 있는지 확인하세요:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// ... 기존 코드 ...

// Swagger 설정
const config = new DocumentBuilder()
  .setTitle('카카오톡 메시지 엑셀 변환 API')
  .setDescription('...')
  .setVersion('1.0')
  .addBearerAuth(/* ... */)
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### 2.2. 컨트롤러에 Swagger 데코레이터 확인

다음 파일들이 Swagger 데코레이터를 포함하고 있는지 확인하세요:

- ✅ `src/modules/auth/auth.controller.ts` - `@ApiTags('Auth')` 추가됨
- ✅ `src/modules/jobs/jobs.controller.ts` - `@ApiTags('Convert')`, `@ApiTags('Jobs')` 추가됨
- ✅ `src/modules/settings/settings.controller.ts` - `@ApiTags('Settings')` 추가됨

### 2.3. DTO에 Swagger 데코레이터 확인

다음 DTO 파일들이 `@ApiProperty` 데코레이터를 포함하고 있는지 확인하세요:

- ✅ `src/modules/jobs/dto/preview-request.dto.ts`
- ✅ `src/modules/jobs/dto/excel-request.dto.ts`
- ✅ `src/modules/settings/dto/update-settings.dto.ts`
- ✅ `src/modules/auth/dto/login-response.dto.ts`

---

## 3. Swagger UI 접속

### 3.1. 서버 실행

```bash
cd kakaotalk-excel/kakaotalk-excel-backend
npm run start:dev
```

### 3.2. Swagger UI 접속

서버가 실행되면 다음 URL로 접속하세요:

```
http://localhost:3001/api
```

브라우저에서 Swagger UI가 표시됩니다.

---

## 4. 프론트엔드 개발자용 가이드

프론트엔드 개발자에게 다음 정보를 전달하세요:

### 4.1. Swagger UI 접속 방법

1. **백엔드 서버 실행 확인**
   - 백엔드 개발자에게 서버가 실행 중인지 확인
   - 서버 주소: `http://localhost:3001` (또는 배포된 서버 주소)

2. **Swagger UI 접속**
   - 브라우저에서 `http://localhost:3001/api` 접속
   - API 문서가 표시됩니다

### 4.2. API 테스트 방법

#### 4.2.1. 인증이 필요한 API 테스트

1. **카카오 로그인**
   - 브라우저에서 `http://localhost:3001/auth/kakao` 접속
   - 카카오 로그인 완료 후 Access Token 획득

2. **Swagger UI에서 인증 설정**
   - Swagger UI 우측 상단의 **"Authorize"** 버튼 클릭
   - `JWT-auth` 섹션에 Access Token 입력
   - 형식: `Bearer {your-access-token}` 또는 토큰만 입력
   - **"Authorize"** 클릭
   - **"Close"** 클릭

3. **인증이 필요한 API 테스트**
   - 이제 인증이 필요한 API를 테스트할 수 있습니다
   - 각 API 요청 시 자동으로 Authorization 헤더가 포함됩니다

#### 4.2.2. 파일 업로드 API 테스트

1. **미리보기 API (`POST /convert/preview`)**
   - Swagger UI에서 해당 API 클릭
   - **"Try it out"** 버튼 클릭
   - `file` 필드에서 파일 선택 버튼 클릭
   - 카카오톡 대화 내보내기 `.txt` 파일 선택
   - 옵션 필드 입력 (선택사항)
   - **"Execute"** 버튼 클릭

2. **엑셀 생성 API (`POST /convert/excel`)**
   - 위와 동일한 방법으로 파일 업로드
   - 응답으로 엑셀 파일이 다운로드됩니다

### 4.3. API 엔드포인트 목록

#### 인증 관련 (Auth)

- `GET /auth/kakao` - 카카오 로그인 시작 (브라우저에서 직접 접속)
- `GET /auth/kakao/callback` - 카카오 로그인 콜백 (자동 처리)
- `GET /auth/me` - 현재 사용자 정보 조회 (인증 필요)
- `POST /auth/refresh` - Access Token 재발급
- `POST /auth/logout` - 로그아웃 (인증 필요)

#### 파일 변환 (Convert)

- `POST /convert/preview` - 카카오톡 메시지 미리보기 (게스트/로그인 공통)
- `POST /convert/excel` - 엑셀 파일 생성 및 다운로드 (게스트/로그인 공통)

#### 작업 관리 (Jobs) - 인증 필요

- `GET /jobs` - 작업 목록 조회
- `GET /jobs/{jobId}` - 작업 상세 조회
- `GET /jobs/{jobId}/download` - 작업 파일 재다운로드
- `POST /jobs/claim` - 게스트 작업 귀속

#### 설정 관리 (Settings) - 인증 필요

- `GET /settings` - 사용자 설정 조회
- `PUT /settings` - 사용자 설정 업데이트

### 4.4. 인증 방식

#### Access Token 사용

- **헤더 형식**: `Authorization: Bearer {access-token}`
- **Swagger UI**: "Authorize" 버튼에서 설정
- **프론트엔드 코드 예시**:
  ```typescript
  fetch('http://localhost:3001/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  ```

#### Refresh Token

- **자동 관리**: httpOnly 쿠키로 자동 관리됨
- **프론트엔드**: 별도 처리 불필요
- **토큰 재발급**: `POST /auth/refresh` 호출 시 자동으로 쿠키에서 읽어옴

### 4.5. 에러 응답 형식

모든 API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/api/endpoint",
  "message": "에러 메시지"
}
```

### 4.6. 주요 에러 코드

- `400 Bad Request`: 잘못된 요청 (파일 없음, 잘못된 형식 등)
- `401 Unauthorized`: 인증 실패 (토큰 없음, 만료 등)
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

---

## 5. 추가 설정 (선택사항)

### 5.1. 프로덕션 서버 URL 추가

`src/main.ts`에서 프로덕션 서버 URL을 추가할 수 있습니다:

```typescript
.addServer('https://your-production-url.com', '프로덕션 서버')
```

### 5.2. Swagger UI 커스터마이징

`SwaggerModule.setup()` 옵션을 수정하여 UI를 커스터마이징할 수 있습니다:

```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true, // 페이지 새로고침 시에도 인증 정보 유지
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
  customSiteTitle: '카카오톡 엑셀 변환 API 문서',
});
```

---

## 6. 문제 해결

### Swagger UI가 표시되지 않는 경우

1. 서버가 실행 중인지 확인
2. `http://localhost:3001/api` URL이 정확한지 확인
3. 브라우저 콘솔에서 에러 확인
4. 서버 로그에서 에러 확인

### API 테스트 시 401 에러가 발생하는 경우

1. "Authorize" 버튼에서 토큰이 제대로 설정되었는지 확인
2. 토큰이 만료되지 않았는지 확인
3. 토큰 형식이 올바른지 확인 (`Bearer {token}` 또는 토큰만)

### 파일 업로드가 작동하지 않는 경우

1. 파일 형식이 `.txt`인지 확인
2. 파일 크기가 너무 크지 않은지 확인
3. 브라우저 콘솔에서 에러 확인

---

이제 프론트엔드 개발자가 Swagger UI를 통해 API를 테스트하고 통합할 수 있습니다!
