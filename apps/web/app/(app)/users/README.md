# 멤버 관리 페이지

## 개요

멤버(사용자) 관리 페이지는 슈퍼 관리자와 프로젝트 관리자가 팀원을 등록하고 권한을 관리할 수 있는 기능을 제공합니다.

## 역할(Role) 체계

### 1. 슈퍼 관리자 (SUPER_ADMIN)
- **권한**: 전체 권한
- **가능 작업**:
  - 멤버 등록, 수정, 비활성화
  - 프로젝트 등록, 수정, 삭제
  - 프로젝트 멤버 관리
  - 업무일지 작성

### 2. 프로젝트 관리자 (PM)
- **권한**: 프로젝트 관리 권한
- **가능 작업**:
  - 멤버 등록, 수정, 비활성화
  - 프로젝트 등록, 수정, 삭제
  - 프로젝트 멤버 추가, 수정, 삭제
  - 업무일지 작성

### 3. 일반 (MEMBER)
- **권한**: 기본 권한
- **가능 작업**:
  - 업무일지 작성만 가능

## 페이지 구조

### 1. 멤버 목록 (/users)
- 전체 멤버 목록 조회
- 검색 기능 (이름, 이메일)
- 필터 기능 (권한별)
- 멤버 상세 보기
- 새 멤버 등록 버튼 (SUPER_ADMIN, PM만 표시)

### 2. 멤버 등록 (/users/new)
멤버 등록 시 입력 필드:

1. **프로필 사진** (선택)
   - 파일 형식: JPG, PNG, GIF
   - 최대 크기: 5MB
   - 미리보기 기능 제공

2. **이름** (필수)
   - 최소 2자, 최대 50자

3. **이메일** (필수)
   - 이메일 형식 검증
   - 중복 체크

4. **비밀번호** (필수)
   - 최소 8자
   - 영문 대/소문자, 숫자, 특수문자 포함 필수

5. **비밀번호 확인** (필수)
   - 비밀번호 일치 검증

6. **본부** (필수)
   - 경영전략본부
   - 기획본부1/2
   - 개발본부1/2
   - 디지인본부1/2
   - 사업부본1
   - 서비스운영본부
   - 플랫폼운영본부
   - 플랫폼전략실
   - 마케팅전략실
   - XC본부

7. **관리자 유형** (필수)
   - 슈퍼 관리자: 전체 권한
   - 프로젝트 관리자: 프로젝트 관리 권한
   - 일반: 업무일지 작성만 가능

### 3. 멤버 상세/수정 (/users/[id])
- 기본 정보 조회 (이름, 이메일)
- 본부 변경
- 권한 변경
- 계정 활성화/비활성화
- 계정 비활성화 (삭제)

## API 엔드포인트

### 멤버 생성
```
POST /api/users
Authorization: Bearer {token}
Roles: SUPER_ADMIN, PM

Body:
{
  "name": "홍길동",
  "email": "hong@emotion.co.kr",
  "password": "Password123!",
  "profileImage": "data:image/...", // optional
  "department": "개발본부1",
  "role": "MEMBER"
}
```

### 멤버 목록 조회
```
GET /api/users?search={검색어}&role={권한}
Authorization: Bearer {token}
Roles: SUPER_ADMIN, PM
```

### 멤버 상세 조회
```
GET /api/users/{id}
Authorization: Bearer {token}
Roles: SUPER_ADMIN, PM
```

### 멤버 수정
```
PATCH /api/users/{id}
Authorization: Bearer {token}
Roles: SUPER_ADMIN

Body:
{
  "department": "기획본부1",
  "role": "PM",
  "isActive": true
}
```

### 멤버 비활성화
```
DELETE /api/users/{id}
Authorization: Bearer {token}
Roles: SUPER_ADMIN
```

## 테스트 계정

### 슈퍼 관리자
- 이메일: admin@emotion.co.kr
- 비밀번호: 2motion!
- 역할: SUPER_ADMIN

### 프로젝트 관리자
- 이메일: kim@emotion.co.kr
- 비밀번호: password123
- 역할: PM

### 일반 사용자
- 이메일: lee@emotion.co.kr
- 비밀번호: password123
- 역할: MEMBER

## 주의사항

1. **프로필 사진**: 현재 Base64 인코딩으로 저장됩니다. 프로덕션 환경에서는 별도의 파일 스토리지(S3 등)를 사용하는 것을 권장합니다.

2. **권한 체크**: 프론트엔드와 백엔드 모두에서 권한을 체크합니다. 프론트엔드는 UI 표시용이며, 실제 보안은 백엔드에서 처리합니다.

3. **본인 계정**: 사용자는 본인의 권한을 변경하거나 본인 계정을 비활성화할 수 없습니다.
