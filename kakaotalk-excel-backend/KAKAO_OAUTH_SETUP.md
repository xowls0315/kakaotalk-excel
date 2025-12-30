# 카카오 OAuth 설정 가이드

이 가이드는 카카오 개발자 콘솔에서 OAuth를 설정하는 상세한 과정을 설명합니다.

## 목차

1. [카카오 개발자 계정 생성](#1-카카오-개발자-계정-생성)
2. [애플리케이션 생성](#2-애플리케이션-생성)
3. [앱 키 확인](#3-앱-키-확인)
4. [카카오 로그인 활성화](#4-카카오-로그인-활성화)
5. [Redirect URI 등록](#5-redirect-uri-등록)
6. [Client Secret 생성](#6-client-secret-생성)
7. [동의항목 설정](#7-동의항목-설정)
8. [환경 변수 설정](#8-환경-변수-설정)
9. [테스트](#9-테스트)

---

## 1. 카카오 개발자 계정 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. 처음 접속하는 경우, 개발자 등록 절차 진행

---

## 2. 애플리케이션 생성

1. 로그인 후 메인 화면에서 **"내 애플리케이션"** 클릭
2. **"애플리케이션 추가하기"** 버튼 클릭
3. 다음 정보 입력:
   - **앱 이름**: 예) "카카오톡 엑셀 변환"
   - **사업자명**: 개인/회사 이름
4. **"저장"** 클릭

---

## 3. 앱 키 확인

1. 생성한 애플리케이션 클릭
2. **"앱 키"** 섹션 확인
3. **REST API 키** 복사
   - 이 값이 `KAKAO_CLIENT_ID`입니다
   - 예: `1234567890abcdef1234567890abcdef`

---

## 4. 카카오 로그인 활성화

1. 좌측 메뉴에서 **"제품 설정"** → **"카카오 로그인"** 클릭
2. **"활성화 설정"** 섹션에서 **"활성화"** 상태로 변경
3. **"저장"** 클릭

---

## 5. Redirect URI 등록

### 중요: 이 단계가 가장 중요합니다!

1. **"카카오 로그인"** 메뉴에서 **"일반"** 탭 클릭
   - ⚠️ "고급" 탭이 아닙니다!
2. 페이지를 아래로 스크롤하여 **"Redirect URI"** 섹션 찾기
3. **"Redirect URI 등록"** 또는 **"+ 추가"** 버튼 클릭
4. 다음 URI 입력:
   ```
   http://localhost:3001/auth/kakao/callback
   ```
5. **"저장"** 클릭

### 개발/프로덕션 환경별 URI

- **개발 환경**: `http://localhost:3001/auth/kakao/callback`
- **프로덕션 환경 (Render)**: `https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback`
- **프로덕션 환경 (기타)**: `https://yourdomain.com/auth/kakao/callback`

**중요**:

- 여러 URI를 등록할 수 있습니다
- **개발 환경과 프로덕션 환경의 URI를 모두 등록해야 합니다**
- URI는 정확히 일치해야 합니다 (대소문자, 슬래시, 프로토콜 포함)
- Render에 배포한 경우: `https://kakaotalk-excel-backend.onrender.com/auth/kakao/callback`를 반드시 등록하세요

---

## 6. Client Secret 생성

1. **"보안"** 탭 클릭
2. **"클라이언트 시크릿"** 섹션 확인
3. **"카카오 로그인"** 행의 Client Secret 코드 복사
   - ⚠️ **"비즈니스 인증"이 아닌 "카카오 로그인"의 코드를 사용하세요!**
   - 이 값이 `KAKAO_CLIENT_SECRET`입니다
   - 예: `n79FGq09DMqQL6Aw6l2tbwbxJtciYNvf` (이미지 기준)
4. 안전한 곳에 저장

**중요:**

- **"카카오 로그인"**의 Client Secret을 사용해야 합니다
- **"비즈니스 인증"**의 Client Secret은 사용하지 않습니다
- Client Secret이 없으면 "코드 재발급" 버튼을 클릭하여 생성하세요
- Client Secret을 잃어버리면 다시 생성해야 합니다

---

## 7. 동의항목 설정

1. **"동의항목"** 탭 클릭
2. 필요한 동의항목 활성화:

### 필수 동의항목

- **닉네임** (필수)
  - 필수 동의로 설정
  - 사용자에게 항상 요청됨

### 선택 동의항목

- **카카오계정(이메일)** (선택)
  - 이메일 정보가 필요한 경우 활성화
  - 선택 동의로 설정 가능

### 동의항목 설정 방법

1. 각 항목의 **"활성화"** 토글을 켜기
2. **"필수 동의"** 또는 **"선택 동의"** 선택
3. **"저장"** 클릭

### ⚠️ "권한 없음" 상태인 경우 해결 방법

**"카카오계정(이메일)"이 "권한 없음"으로 표시되는 경우:**

1. **"동의항목" 탭에서 확인:**
   - "카카오계정(이메일)" 항목 찾기
   - **"활성화"** 토글을 **켜기** (ON)
   - **"선택 동의"** 또는 **"필수 동의"** 선택
   - **"저장"** 클릭

2. **여전히 "권한 없음"으로 표시되는 경우:**
   - 카카오 로그인 → **"고급"** 탭 확인
   - **"OpenID Connect 활성화"** 확인 (필요한 경우)
   - 또는 **"카카오 로그인"** → **"일반"** 탭에서 **"OpenID Connect"** 활성화

3. **앱 상태 확인:**
   - 앱이 **"활성화"** 상태인지 확인
   - 앱이 비활성화되어 있으면 동의항목을 설정할 수 없습니다

4. **저장 후 재시도:**
   - 설정을 저장한 후 페이지를 새로고침
   - 몇 분 기다린 후 다시 확인 (카카오 서버 반영 시간)

### 이메일 동의항목 활성화 상세 가이드

1. **카카오 로그인** → **"동의항목"** 탭 클릭
2. **"카카오계정(이메일)"** 항목 찾기
3. 해당 행의 **"설정"** 버튼 클릭
4. 다음 설정:
   - **"활성화"**: ON
   - **"동의 화면 노출"**: ON (사용자에게 동의 요청)
   - **"필수 동의"** 또는 **"선택 동의"** 선택
     - **필수 동의**: 모든 사용자에게 동의 요청 (권장하지 않음)
     - **선택 동의**: 사용자가 선택적으로 동의 가능 (권장)
5. **"저장"** 클릭
6. 페이지 새로고침 후 상태 확인

---

## 8. 환경 변수 설정

백엔드 프로젝트의 `.env` 파일에 다음 값들을 설정하세요:

```env
# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your_rest_api_key_here
KAKAO_CLIENT_SECRET=your_client_secret_here
KAKAO_CALLBACK_URL=http://localhost:3001/auth/kakao/callback

# 프론트엔드 URL (로그인 후 리다이렉트)
FRONTEND_URL=http://localhost:3001
```

### 값 확인 방법

1. **KAKAO_CLIENT_ID**: 앱 키 섹션의 "REST API 키"
2. **KAKAO_CLIENT_SECRET**: 보안 탭의 "클라이언트 시크릿" → **"카카오 로그인"** 행의 코드
   - ⚠️ **"비즈니스 인증"이 아닌 "카카오 로그인"의 코드를 사용하세요!**
3. **KAKAO_CALLBACK_URL**: 등록한 Redirect URI와 정확히 일치해야 함
4. **FRONTEND_URL**: 프론트엔드가 실행되는 URL

---

## 9. 테스트

### 9.1 서버 재시작

환경 변수를 변경한 후 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run start:dev
```

### 9.2 로그인 테스트

1. 브라우저에서 다음 URL 접속:

   ```
   http://localhost:3001/auth/kakao
   ```

2. 예상 동작:
   - 카카오 로그인 페이지로 리다이렉트
   - 로그인 후 콜백 URL로 리다이렉트
   - Access Token이 포함된 URL로 최종 리다이렉트

3. 성공 시:
   - `http://localhost:3001/auth/callback?token=YOUR_ACCESS_TOKEN` 형태로 리다이렉트됨

### 9.3 오류 해결

#### 오류: "redirect_uri_mismatch"

**원인:** Redirect URI가 등록되지 않았거나 일치하지 않음

**해결:**

1. 카카오 개발자 콘솔에서 Redirect URI 확인
2. `.env` 파일의 `KAKAO_CALLBACK_URL` 확인
3. 정확히 일치하는지 확인 (대소문자, 슬래시 포함)
4. URI 등록 후 몇 분 기다린 후 다시 시도

#### 오류: "App Administrator Setting Error (KOE006)"

**원인:** Redirect URI가 등록되지 않음

**해결:**

1. "일반" 탭에서 Redirect URI 등록 확인
2. "고급" 탭이 아닌 "일반" 탭인지 확인
3. URI가 정확히 입력되었는지 확인

#### 오류: "Invalid client"

**원인:** Client ID 또는 Client Secret이 잘못됨

**해결:**

1. `.env` 파일의 `KAKAO_CLIENT_ID` 확인
2. `.env` 파일의 `KAKAO_CLIENT_SECRET` 확인
3. 값에 공백이나 따옴표가 없는지 확인

#### 오류: "CORS policy"

**원인:** 프론트엔드 URL이 CORS 설정과 일치하지 않음

**해결:**

1. `.env` 파일의 `FRONTEND_URL` 확인
2. `main.ts`의 CORS 설정 확인
3. 프론트엔드가 실행 중인지 확인

---

## 프로덕션 배포 시 주의사항

### 1. Redirect URI 추가

프로덕션 도메인에 맞는 Redirect URI를 추가로 등록:

```
https://yourdomain.com/auth/kakao/callback
```

### 2. 환경 변수 업데이트

프로덕션 환경의 `.env` 파일:

```env
KAKAO_CLIENT_ID=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret
KAKAO_CALLBACK_URL=https://yourdomain.com/auth/kakao/callback
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. HTTPS 필수

프로덕션에서는 반드시 HTTPS를 사용해야 합니다:

- 카카오 OAuth는 프로덕션에서 HTTP를 허용하지 않습니다
- SSL 인증서 설정 필요

### 4. 보안 설정

- Client Secret은 절대 공개 저장소에 커밋하지 마세요
- 환경 변수는 안전하게 관리하세요
- `.env` 파일은 `.gitignore`에 포함되어 있는지 확인하세요

---

## 추가 리소스

- [카카오 개발자 문서](https://developers.kakao.com/docs)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [카카오 로그인 동의항목](https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite)

---

## 체크리스트

설정 완료 후 다음 항목들을 확인하세요:

- [ ] 카카오 개발자 계정 생성 완료
- [ ] 애플리케이션 생성 완료
- [ ] REST API 키 확인 및 복사
- [ ] 카카오 로그인 활성화
- [ ] Redirect URI 등록 (일반 탭)
- [ ] Client Secret 생성 및 복사
- [ ] 동의항목 설정 (닉네임 필수)
- [ ] `.env` 파일에 모든 값 설정
- [ ] 서버 재시작
- [ ] 브라우저에서 로그인 테스트 성공

---

이 가이드를 따라하면 카카오 OAuth 설정을 완료할 수 있습니다. 문제가 발생하면 "오류 해결" 섹션을 참고하세요.
