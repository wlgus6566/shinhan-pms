# Auth API

Mock 인증 API입니다.

## 테스트 계정

모든 테스트 계정의 비밀번호는 `password123` 이지만, 시스템 관리자 계정은 별도입니다.

### PM (Project Manager)
- 이메일: `kim@emotion.co.kr`
- 이름: 김철수
- 부서: 개발
- 권한: 프로젝트 생성, 수정, 삭제 가능

### PL (Project Leader)
- 이메일: `lee@emotion.co.kr`
- 이름: 이영희
- 부서: 기획
- 권한: 프로젝트 수정 가능

### PA (Project Assistant)
- 이메일: `park@emotion.co.kr` (박민수 - 디자인)
- 이메일: `jung@emotion.co.kr` (정수진 - 개발)
- 이메일: `choi@emotion.co.kr` (최동욱 - 운영)
- 이메일: `kang@emotion.co.kr` (강미영 - 기획)
- 이메일: `yoon@emotion.co.kr` (윤서준 - 디자인)
- 이메일: `lim@emotion.co.kr` (임지훈 - 개발)
- 권한: 프로젝트 조회만 가능

### System Admin
- 이메일: `admin@emotion.co.kr`
- 비밀번호: `2motion!`

## API 엔드포인트

### POST /api/auth/login
로그인

**Request:**
```json
{
  "email": "kim@emotion.co.kr",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "mock-token-1-1234567890",
  "user": {
    "id": 1,
    "email": "kim@emotion.co.kr",
    "name": "김철수",
    "department": "DEVELOPMENT",
    "role": "PM"
  }
}
```

### GET /api/auth/me
현재 로그인한 사용자 정보 조회

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": 1,
  "email": "kim@emotion.co.kr",
  "name": "김철수",
  "department": "DEVELOPMENT",
  "role": "PM"
}
```

### PATCH /api/auth/me
사용자 정보 수정

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "김철수",
  "department": "DEVELOPMENT"
}
```

### PATCH /api/auth/me/password
비밀번호 변경

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```
