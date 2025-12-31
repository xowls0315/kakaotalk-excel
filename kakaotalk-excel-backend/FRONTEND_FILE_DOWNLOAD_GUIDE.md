# 프론트엔드 파일 다운로드 및 작업 관리 가이드

## 📋 목차

1. [작업 목록 조회 (`/jobs`)](#1-작업-목록-조회-jobs)
2. [작업 상세 조회 (`/jobs/{jobId}`)](#2-작업-상세-조회-jobsobjid)
3. [작업 파일 재다운로드 (`/jobs/{jobId}/download`)](#3-작업-파일-재다운로드-jobsobjiddownload)
4. [엑셀 파일 생성 및 즉시 다운로드 (`/convert/excel`)](#4-엑셀-파일-생성-및-즉시-다운로드-convertexcel)
5. [엑셀 파일 저장 위치](#5-엑셀-파일-저장-위치)
6. [프론트엔드 구현 예제](#6-프론트엔드-구현-예제)

---

## 1. 작업 목록 조회 (`/jobs`)

### API 정보

- **엔드포인트**: `GET /jobs`
- **인증**: JWT Bearer Token 필요
- **설명**: 로그인한 사용자가 이전에 생성한 모든 엑셀 변환 작업 목록을 조회합니다.

### 요청 예제

```typescript
// Axios 사용 예제
const response = await axios.get('https://kakaotalk-excel-backend.onrender.com/jobs', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  params: {
    page: 1,      // 페이지 번호 (기본값: 1)
    size: 20,     // 페이지 크기 (기본값: 20)
    status: 'success' // 선택적: 필터링할 상태 (previewed, processing, success, failed, expired)
  }
});

// 응답 예제
{
  "jobs": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "originalFileName": "카카오톡_대화.txt",
      "status": "success",
      "roomName": "친구들과의 대화",
      "totalMessages": 1500,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "finishedAt": "2024-01-15T10:31:00.000Z",
      "hasFile": true,
      "fileExpiresAt": "2024-01-22T10:31:00.000Z"
    },
    // ... 더 많은 작업들
  ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

### 응답 필드 설명

- `id`: 작업 고유 ID (UUID)
- `originalFileName`: 업로드한 원본 파일명
- `status`: 작업 상태 (`previewed`, `processing`, `success`, `failed`, `expired`)
- `roomName`: 채팅방 이름
- `totalMessages`: 총 메시지 개수
- `createdAt`: 작업 생성 시간
- `finishedAt`: 작업 완료 시간
- `hasFile`: 파일 존재 여부 (true/false)
- `fileExpiresAt`: 파일 만료 시간 (기본 7일 후)

---

## 2. 작업 상세 조회 (`/jobs/{jobId}`)

### API 정보

- **엔드포인트**: `GET /jobs/{jobId}`
- **인증**: JWT Bearer Token 필요
- **설명**: 특정 작업의 상세 정보를 조회합니다.

### 요청 예제

```typescript
const jobId = '123e4567-e89b-12d3-a456-426614174000';

const response = await axios.get(
  `https://kakaotalk-excel-backend.onrender.com/jobs/${jobId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

// 응답 예제
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "originalFileName": "카카오톡_대화.txt",
  "status": "success",
  "optionsJson": {
    "includeSystem": false,
    "splitSheetsByDay": true,
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "participants": ["홍길동", "김철수"]
  },
  "roomName": "친구들과의 대화",
  "totalMessages": 1500,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "finishedAt": "2024-01-15T10:31:00.000Z",
  "files": [
    {
      "id": 1,
      "sizeBytes": 524288,
      "expiresAt": "2024-01-22T10:31:00.000Z",
      "createdAt": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

---

## 3. 작업 파일 재다운로드 (`/jobs/{jobId}/download`)

### API 정보

- **엔드포인트**: `GET /jobs/{jobId}/download`
- **인증**: JWT Bearer Token 필요
- **설명**: 이전에 생성한 엑셀 파일을 재다운로드합니다. 파일이 만료되지 않은 경우에만 가능합니다.

### 요청 예제

```typescript
const jobId = '123e4567-e89b-12d3-a456-426614174000';

// 방법 1: Axios로 다운로드 (브라우저에서 자동 다운로드)
const response = await axios.get(
  `https://kakaotalk-excel-backend.onrender.com/jobs/${jobId}/download`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: 'blob', // 중요: blob으로 받아야 파일 다운로드 가능
  },
);

// Blob을 다운로드 링크로 변환하여 다운로드
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', '카카오톡_대화.xlsx'); // 파일명 설정
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```

### 더 간단한 방법 (함수로 구현)

```typescript
async function downloadJobFile(
  jobId: string,
  accessToken: string,
  fileName: string,
) {
  try {
    const response = await axios.get(
      `https://kakaotalk-excel-backend.onrender.com/jobs/${jobId}/download`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'blob',
      },
    );

    // Blob을 다운로드 링크로 변환
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    if (error.response?.status === 410) {
      console.error('파일이 만료되었습니다. 재생성이 필요합니다.');
    } else if (error.response?.status === 404) {
      console.error('작업 또는 파일을 찾을 수 없습니다.');
    } else {
      console.error('다운로드 실패:', error.message);
    }
    return { success: false, error: error.message };
  }
}

// 사용 예제
await downloadJobFile(
  '123e4567-e89b-12d3-a456-426614174000',
  accessToken,
  '카카오톡_대화.xlsx',
);
```

### 에러 처리

- **404**: 작업 또는 파일을 찾을 수 없음
- **410**: 파일이 만료됨 (재생성 필요)
- **401**: 인증 실패 (토큰 만료 또는 잘못된 토큰)

---

## 4. 엑셀 파일 생성 및 즉시 다운로드 (`/convert/excel`)

### API 정보

- **엔드포인트**: `POST /convert/excel`
- **인증**: 선택적 (로그인 사용자는 JWT Bearer Token, 게스트는 쿠키)
- **설명**: 카카오톡 대화 내보내기 파일을 업로드하여 엑셀 파일로 변환하고 즉시 다운로드합니다.

### 요청 예제

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]); // File 객체
formData.append('includeSystem', 'false');
formData.append('splitSheetsByDay', 'true');
formData.append('dateFrom', '2024-01-01');
formData.append('dateTo', '2024-12-31');
formData.append('participants', JSON.stringify(['홍길동', '김철수']));

// 로그인 사용자의 경우
const response = await axios.post(
  'https://kakaotalk-excel-backend.onrender.com/convert/excel',
  formData,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob', // 중요: blob으로 받아야 파일 다운로드 가능
  },
);

// 파일 다운로드
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', fileInput.files[0].name.replace('.txt', '.xlsx'));
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```

### 더 간단한 방법 (함수로 구현)

```typescript
async function convertToExcel(
  file: File,
  options: {
    includeSystem?: boolean;
    splitSheetsByDay?: boolean;
    dateFrom?: string;
    dateTo?: string;
    participants?: string[];
  },
  accessToken?: string,
) {
  const formData = new FormData();
  formData.append('file', file);

  if (options.includeSystem !== undefined) {
    formData.append('includeSystem', String(options.includeSystem));
  }
  if (options.splitSheetsByDay !== undefined) {
    formData.append('splitSheetsByDay', String(options.splitSheetsByDay));
  }
  if (options.dateFrom) {
    formData.append('dateFrom', options.dateFrom);
  }
  if (options.dateTo) {
    formData.append('dateTo', options.dateTo);
  }
  if (options.participants) {
    formData.append('participants', JSON.stringify(options.participants));
  }

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      'https://kakaotalk-excel-backend.onrender.com/convert/excel',
      formData,
      {
        headers,
        responseType: 'blob',
      },
    );

    // 파일 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name.replace('.txt', '.xlsx'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error('엑셀 변환 실패:', error.message);
    return { success: false, error: error.message };
  }
}

// 사용 예제
const fileInput = document.querySelector(
  'input[type="file"]',
) as HTMLInputElement;
if (fileInput.files && fileInput.files[0]) {
  await convertToExcel(
    fileInput.files[0],
    {
      includeSystem: false,
      splitSheetsByDay: true,
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31',
    },
    accessToken, // 로그인 사용자의 경우
  );
}
```

---

## 5. 엑셀 파일 저장 위치

### 📍 프론트엔드에서 "엑셀 생성" 버튼을 누르면?

프론트엔드에서 "엑셀 생성" 버튼을 누르면 `/convert/excel` API가 호출되고, **엑셀 파일은 사용자의 브라우저 기본 다운로드 폴더에 자동으로 저장됩니다.**

### 클라이언트 측 다운로드 위치 (사용자 PC)

**브라우저 기본 다운로드 폴더에 저장됩니다:**

- **Windows Chrome/Edge**: `C:\Users\{사용자명}\Downloads`
- **Windows Firefox**: `C:\Users\{사용자명}\Downloads`
- **Mac Chrome/Safari**: `~/Downloads` (예: `/Users/사용자명/Downloads`)
- **Mac Firefox**: `~/Downloads`
- **Linux**: `~/Downloads` 또는 브라우저 설정에 따라 다름

**예시:**

- 사용자명이 "홍길동"인 경우: `C:\Users\홍길동\Downloads\카카오톡_대화.xlsx`
- 파일명은 원본 파일명에서 `.txt`를 `.xlsx`로 변경한 이름입니다.

**⚠️ 중요:**

- **프론트엔드에서 다운로드 폴더를 직접 지정할 수 없습니다.** 브라우저 보안 정책상 웹 애플리케이션은 사용자의 다운로드 폴더를 변경할 수 없습니다.
- 사용자가 브라우저 설정에서 다운로드 폴더를 변경하면, 그 폴더에 저장됩니다.
- 파일명은 `Content-Disposition` 헤더의 `filename` 속성으로 제어 가능합니다.

### 서버 측 저장 위치 (백엔드 서버)

**서버에도 파일이 저장됩니다 (재다운로드용):**

- **기본 경로**: `./uploads` (프로젝트 루트의 `uploads` 폴더)
- **환경 변수로 변경 가능**: `STORAGE_PATH` 환경 변수 설정
- **파일명 형식**: `{jobId}.xlsx` (예: `123e4567-e89b-12d3-a456-426614174000.xlsx`)
- **용도**: 나중에 `/jobs/{jobId}/download` API로 재다운로드할 때 사용

**예시:**

- 서버 경로: `kakaotalk-excel-backend/uploads/123e4567-e89b-12d3-a456-426614174000.xlsx`
- 이 파일은 로그인 사용자의 경우 7일간 보관됩니다 (기본값, `FILE_EXPIRES_IN_DAYS` 환경 변수로 변경 가능)

### 백엔드 코드 확인

```195:205:kakaotalk-excel/kakaotalk-excel-backend/src/modules/jobs/jobs.service.ts
      const storagePath =
        this.configService.get<string>('app.storagePath') || './uploads';
      const expiresInDays =
        this.configService.get<number>('app.fileExpiresInDays') || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      await fs.mkdir(storagePath, { recursive: true });
      const fileName = `${job.id}.xlsx`;
      const filePath = path.join(storagePath, fileName);
      await fs.writeFile(filePath, buffer);
```

서버는 파일을 `./uploads` 폴더에 저장하고, 클라이언트로는 `Buffer`를 `Content-Disposition: attachment` 헤더와 함께 전송하여 브라우저가 자동으로 다운로드하도록 합니다.

---

## 6. 프론트엔드 구현 예제

### React 컴포넌트 예제

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Job {
  id: string;
  originalFileName: string;
  status: string;
  roomName: string;
  totalMessages: number;
  createdAt: string;
  finishedAt: string;
  hasFile: boolean;
  fileExpiresAt: string;
}

function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );

  // 작업 목록 조회
  const fetchJobs = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await axios.get(
        'https://kakaotalk-excel-backend.onrender.com/jobs',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            page: 1,
            size: 20
          }
        }
      );
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('작업 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 파일 다운로드
  const handleDownload = async (jobId: string, fileName: string) => {
    if (!accessToken) return;

    try {
      const response = await axios.get(
        `https://kakaotalk-excel-backend.onrender.com/jobs/${jobId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          responseType: 'blob'
        }
      );

      // Blob을 다운로드 링크로 변환
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName.replace('.txt', '.xlsx'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.response?.status === 410) {
        alert('파일이 만료되었습니다. 재생성이 필요합니다.');
      } else if (error.response?.status === 404) {
        alert('파일을 찾을 수 없습니다.');
      } else {
        alert('다운로드 실패: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [accessToken]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h2>내 작업 목록</h2>
      <button onClick={fetchJobs}>새로고침</button>

      {jobs.length === 0 ? (
        <p>작업이 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>파일명</th>
              <th>채팅방</th>
              <th>메시지 수</th>
              <th>상태</th>
              <th>생성일</th>
              <th>다운로드</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.originalFileName}</td>
                <td>{job.roomName}</td>
                <td>{job.totalMessages}</td>
                <td>{job.status}</td>
                <td>{new Date(job.createdAt).toLocaleString('ko-KR')}</td>
                <td>
                  {job.hasFile && new Date(job.fileExpiresAt) > new Date() ? (
                    <button
                      onClick={() =>
                        handleDownload(job.id, job.originalFileName)
                      }
                    >
                      다운로드
                    </button>
                  ) : (
                    <span>만료됨</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default JobList;
```

### 파일 업로드 및 변환 컴포넌트

```typescript
import React, { useState } from 'react';
import axios from 'axios';

function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('includeSystem', 'false');
    formData.append('splitSheetsByDay', 'true');

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await axios.post(
        'https://kakaotalk-excel-backend.onrender.com/convert/excel',
        formData,
        {
          headers,
          responseType: 'blob'
        }
      );

      // 파일 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name.replace('.txt', '.xlsx'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('엑셀 파일이 다운로드되었습니다!');
    } catch (error: any) {
      alert('변환 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>카카오톡 파일 변환</h2>
      <input type="file" accept=".txt" onChange={handleFileChange} />
      <button onClick={handleConvert} disabled={!file || loading}>
        {loading ? '변환 중...' : '엑셀로 변환'}
      </button>
    </div>
  );
}

export default FileUpload;
```

---

## 📝 요약

### ✅ 가능한 기능

1. **작업 목록 조회**: `/jobs`로 로그인 사용자의 모든 작업 조회
2. **작업 상세 조회**: `/jobs/{jobId}`로 특정 작업의 상세 정보 조회
3. **파일 재다운로드**: `/jobs/{jobId}/download`로 이전에 생성한 엑셀 파일 재다운로드
4. **즉시 다운로드**: `/convert/excel`로 파일 업로드 후 즉시 엑셀 다운로드

### 📁 파일 저장 위치

- **서버**: `./uploads` 폴더에 `{jobId}.xlsx` 형식으로 저장
- **클라이언트**: 브라우저 기본 다운로드 폴더에 자동 다운로드 (프론트엔드에서 제어 불가)

### 🔑 핵심 포인트

1. **`responseType: 'blob'` 필수**: 파일 다운로드를 위해 Axios 요청 시 반드시 설정
2. **Blob URL 생성**: `window.URL.createObjectURL()`로 다운로드 링크 생성
3. **`<a>` 태그 사용**: 프로그래밍 방식으로 파일 다운로드 트리거
4. **메모리 정리**: `window.URL.revokeObjectURL()`로 메모리 누수 방지

### ⚠️ 주의사항

- 파일은 기본 7일 후 만료됩니다 (`FILE_EXPIRES_IN_DAYS` 환경 변수로 변경 가능)
- 만료된 파일은 재다운로드 불가능하며, 재생성이 필요합니다
- 로그인 사용자의 작업만 `/jobs` API로 조회 가능합니다
