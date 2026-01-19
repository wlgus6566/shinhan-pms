# 회원 관리 테이블 명세서

## 1. 개요

### 1.1 목적

이 스키마는 PMS 시스템의 사용자 인증, 권한 관리, 프로필 정보를 저장하고 관리합니다.

### 1.2 테이블 목록

| 테이블명 | 설명                  | 비고                    |
| -------- | --------------------- | ----------------------- |
| users    | 사용자 기본 정보      | 인증 및 프로필 정보     |

---

## 2. 테이블 상세

### 2.1 users

**설명**: 사용자 기본 정보 및 인증 정보

**컬럼**

| 컬럼명           | 타입         | 제약                    | 기본값            | 설명                                         |
| ---------------- | ------------ | ----------------------- | ----------------- | -------------------------------------------- |
| id               | BIGSERIAL    | PK                      |                   | 사용자 ID                                    |
| email            | VARCHAR(255) | NOT NULL, UNIQUE        |                   | 이메일 (로그인 ID)                           |
| password_hash    | VARCHAR(255) | NOT NULL                |                   | 비밀번호 해시 (bcrypt)                       |
| name             | VARCHAR(50)  | NOT NULL                |                   | 이름                                         |
| department       | VARCHAR(20)  | NOT NULL                |                   | 파트 (PLANNING/DESIGN/PUBLISHING/DEVELOPMENT) |
| role             | VARCHAR(20)  | NOT NULL                | 'MEMBER'          | 등급 (PM/PL/PA/MEMBER)                       |
| last_login_at    | TIMESTAMP    | NULL                    |                   | 마지막 로그인 시간                           |
| is_active        | BOOLEAN      | NOT NULL                | TRUE              | 활성 여부 (soft delete)                      |
| created_by       | BIGINT       | NOT NULL                |                   | 생성자 ID (자가 가입 시 본인 ID)             |
| created_at       | TIMESTAMP    | NOT NULL                | CURRENT_TIMESTAMP | 생성일시                                     |
| updated_by       | BIGINT       | NULL                    |                   | 수정자 ID                                    |
| updated_at       | TIMESTAMP    | NULL                    |                   | 수정일시                                     |

**인덱스**

| 인덱스명                | 컬럼       | 타입   | 목적                     |
| ----------------------- | ---------- | ------ | ------------------------ |
| idx_users_email         | email      | B-tree | 로그인 조회 (UNIQUE)     |
| idx_users_department    | department | B-tree | 파트별 필터링            |
| idx_users_role          | role       | B-tree | 등급별 필터링            |
| idx_users_is_active     | is_active  | B-tree | 활성 사용자 조회         |

**제약조건**

- `UNIQUE (email)` - 이메일 중복 불가
- `CHECK (department IN ('PLANNING', 'DESIGN', 'PUBLISHING', 'DEVELOPMENT'))` - 파트 제한
- `CHECK (role IN ('PM', 'PL', 'PA', 'MEMBER'))` - 등급 제한
- `CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 50)` - 이름 길이 제한

**비즈니스 규칙**

1. 이메일은 가입 후 변경 불가
2. 비밀번호는 bcrypt로 해시하여 저장 (cost factor 10)
3. 비활성화된 사용자는 로그인 불가하지만 데이터는 유지
4. 자가 가입 시 `created_by`는 본인 ID (트리거 또는 애플리케이션에서 처리)
5. PM 등급은 시스템에 최소 1명 이상 존재해야 함

---

## 3. 관계도 (ERD)

```
users (1) --- (N) projects (created_by)
users (1) --- (N) tasks (assigned_to)
users (1) --- (N) issues (created_by)
users (1) --- (N) project_members (user_id)
```

**설명**:
- 사용자는 여러 프로젝트를 생성할 수 있음
- 사용자는 여러 작업에 할당될 수 있음
- 사용자는 여러 이슈를 생성할 수 있음
- 사용자는 여러 프로젝트의 멤버가 될 수 있음

---

## 4. 초기 데이터

### 4.1 파트 코드 (Department)

| 코드        | 명칭     | 설명          |
| ----------- | -------- | ------------- |
| PLANNING    | 기획     | 기획 파트     |
| DESIGN      | 디자인   | 디자인 파트   |
| PUBLISHING  | 퍼블리싱 | 퍼블리싱 파트 |
| DEVELOPMENT | 개발     | 개발 파트     |

### 4.2 등급 코드 (Role)

| 코드   | 명칭 | 설명                           | 권한                                         |
| ------ | ---- | ------------------------------ | -------------------------------------------- |
| PM     | PM   | 프로젝트 관리자                | 전체 권한 (사용자 관리, 프로젝트 관리 등)    |
| PL     | PL   | 프로젝트 리더                  | 조회 권한 (사용자 목록 조회 가능)            |
| PA     | PA   | 프로젝트 어시스턴트            | 일반 권한                                    |
| MEMBER | 팀원 | 일반 팀원                      | 일반 권한                                    |

### 4.3 초기 사용자 (선택)

```sql
-- 시스템 관리자 계정 (초기 설정용)
-- 비밀번호: Admin1234!
INSERT INTO users (
    email, 
    password_hash, 
    name, 
    department, 
    role, 
    created_by, 
    created_at
) VALUES (
    'admin@emotion.co.kr',
    '$2b$10$YourBcryptHashHere', -- bcrypt hash of 'Admin1234!'
    '시스템 관리자',
    'DEVELOPMENT',
    'PM',
    1, -- 자기 자신
    CURRENT_TIMESTAMP
);
```

---

## 5. 보안 고려사항

### 5.1 비밀번호 보안
- bcrypt 해시 사용 (cost factor 10)
- 평문 비밀번호 저장 금지
- 비밀번호 정책: 최소 8자, 영문+숫자+특수문자

### 5.2 인증 토큰
- JWT 토큰 사용 (Access Token + Refresh Token)
- Access Token 만료: 1시간
- Refresh Token 만료: 7일
- 토큰은 데이터베이스에 저장하지 않음 (stateless)

### 5.3 개인정보 보호
- 이메일은 UNIQUE 제약으로 중복 방지
- 비활성화된 계정도 데이터 유지 (GDPR 고려 시 별도 처리)

---

## 6. 성능 최적화

### 6.1 인덱스 전략
- `email` 컬럼: UNIQUE 인덱스 (로그인 조회 최적화)
- `department`, `role`, `is_active`: 필터링용 인덱스
- 복합 인덱스는 필요 시 추가 (예: `department + is_active`)

### 6.2 쿼리 최적화
- 로그인 조회: `WHERE email = ? AND is_active = TRUE`
- 사용자 목록: `WHERE is_active = TRUE AND department = ?`
- 페이지네이션: `LIMIT ? OFFSET ?`

---

## 7. 마이그레이션 전략

### 7.1 초기 마이그레이션
1. `users` 테이블 생성
2. 인덱스 생성
3. 초기 관리자 계정 생성

### 7.2 향후 확장 고려사항
- `refresh_tokens` 테이블 추가 (토큰 관리가 필요한 경우)
- `user_sessions` 테이블 추가 (세션 관리가 필요한 경우)
- `user_login_history` 테이블 추가 (로그인 이력 추적)
- `user_permissions` 테이블 추가 (세밀한 권한 관리)

---

## 8. 제약사항 및 주의사항

1. **이메일 변경 불가**: 이메일은 로그인 ID이므로 변경 불가 (변경 필요 시 새 계정 생성)
2. **소프트 삭제**: `is_active = FALSE`로 비활성화, 실제 데이터는 유지
3. **PM 최소 1명**: 시스템에 PM 등급 사용자가 최소 1명 이상 존재해야 함
4. **본인 등급 변경 불가**: 사용자는 본인의 등급을 변경할 수 없음 (PM만 가능)
5. **비밀번호 해시**: 애플리케이션 레벨에서 bcrypt 처리 필수

---

## 9. 테스트 데이터

```sql
-- 테스트용 사용자 (개발 환경)
-- 비밀번호: Test1234!

INSERT INTO users (email, password_hash, name, department, role, created_by) VALUES
('pm@test.com', '$2b$10$TestHashHere', 'PM 테스트', 'DEVELOPMENT', 'PM', 1),
('pl@test.com', '$2b$10$TestHashHere', 'PL 테스트', 'PLANNING', 'PL', 1),
('pa@test.com', '$2b$10$TestHashHere', 'PA 테스트', 'DESIGN', 'PA', 1),
('member@test.com', '$2b$10$TestHashHere', '팀원 테스트', 'PUBLISHING', 'MEMBER', 1);
```

---

## 10. 변경 이력

| 버전 | 날짜       | 작성자 | 변경 내용      |
| ---- | ---------- | ------ | -------------- |
| 1.0  | 2024-01-15 | System | 초기 스키마 작성 |
