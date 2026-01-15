-- =============================================
-- 프로젝트 관리 DDL/DML
-- =============================================

-- 1. 테이블 생성
-- =============================================

-- 1.1 projects 테이블
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP,
    
    -- 제약조건
    CONSTRAINT chk_projects_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_projects_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'SUSPENDED')),
    CONSTRAINT chk_projects_name_length CHECK (LENGTH(project_name) BETWEEN 2 AND 100)
);

-- 2. 코멘트 추가
-- =============================================

COMMENT ON TABLE projects IS '프로젝트 정보';

COMMENT ON COLUMN projects.id IS '프로젝트 ID';
COMMENT ON COLUMN projects.project_name IS '프로젝트명 (2-100자, 중복 불가)';
COMMENT ON COLUMN projects.description IS '프로젝트 설명 (최대 1000자, 애플리케이션 레벨 제한)';
COMMENT ON COLUMN projects.start_date IS '프로젝트 시작일 (선택)';
COMMENT ON COLUMN projects.end_date IS '프로젝트 종료일 (선택, 시작일 이후여야 함)';
COMMENT ON COLUMN projects.status IS '프로젝트 상태 (ACTIVE: 진행중, COMPLETED: 완료, SUSPENDED: 중단)';
COMMENT ON COLUMN projects.is_active IS '활성 여부 (soft delete용, FALSE일 경우 삭제된 것으로 간주)';
COMMENT ON COLUMN projects.created_by IS '생성자 ID (향후 users 테이블 FK)';
COMMENT ON COLUMN projects.created_at IS '생성일시 (UTC)';
COMMENT ON COLUMN projects.updated_by IS '수정자 ID (향후 users 테이블 FK)';
COMMENT ON COLUMN projects.updated_at IS '수정일시 (UTC)';

-- 3. 인덱스 생성
-- =============================================

-- 프로젝트명 검색용 (UNIQUE 인덱스는 자동 생성되므로 생략)
CREATE INDEX idx_projects_name ON projects(project_name);

-- 상태별 필터링용
CREATE INDEX idx_projects_status ON projects(status);

-- 기간별 조회용
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- 생성일 정렬용
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- 활성 프로젝트 조회용
CREATE INDEX idx_projects_is_active ON projects(is_active);

-- 복합 인덱스: 활성 + 상태 (자주 함께 사용되는 조건)
CREATE INDEX idx_projects_active_status ON projects(is_active, status);

-- 4. 초기 데이터 (DML) - 개발 환경용
-- =============================================

-- 샘플 프로젝트 1: 진행중
INSERT INTO projects (
    project_name,
    description,
    start_date,
    end_date,
    status,
    created_by
) VALUES (
    '신한카드 PMS',
    '프로젝트 관리 시스템 개발. AI 에이전트 기반 워크플로우를 적용한 신한카드 운영 및 고도화 업무 관리 시스템입니다.',
    '2024-01-01',
    '2024-12-31',
    'ACTIVE',
    1
);

-- 샘플 프로젝트 2: 진행중
INSERT INTO projects (
    project_name,
    description,
    start_date,
    end_date,
    status,
    created_by
) VALUES (
    '모바일 앱 리뉴얼',
    '신한카드 모바일 앱 UI/UX 개선 프로젝트. 사용자 경험 향상을 위한 전면 리뉴얼 작업입니다.',
    '2024-03-01',
    '2024-08-31',
    'ACTIVE',
    1
);

-- 샘플 프로젝트 3: 완료
INSERT INTO projects (
    project_name,
    description,
    start_date,
    end_date,
    status,
    created_by
) VALUES (
    '레거시 시스템 마이그레이션',
    '구 시스템에서 새로운 플랫폼으로 마이그레이션. 데이터 이관 및 서비스 안정화 작업 완료.',
    '2023-06-01',
    '2023-12-31',
    'COMPLETED',
    1
);

-- 5. 유용한 쿼리 (참고용)
-- =============================================

-- 5.1 활성 프로젝트 목록 조회 (최신순)
-- SELECT * FROM projects 
-- WHERE is_active = TRUE 
-- ORDER BY created_at DESC;

-- 5.2 진행중인 프로젝트만 조회
-- SELECT * FROM projects 
-- WHERE is_active = TRUE 
--   AND status = 'ACTIVE'
-- ORDER BY created_at DESC;

-- 5.3 프로젝트명 검색
-- SELECT * FROM projects 
-- WHERE is_active = TRUE 
--   AND project_name LIKE '%PMS%'
-- ORDER BY created_at DESC;

-- 5.4 특정 기간 내 프로젝트 조회
-- SELECT * FROM projects 
-- WHERE is_active = TRUE 
--   AND start_date >= '2024-01-01'
--   AND (end_date IS NULL OR end_date <= '2024-12-31')
-- ORDER BY start_date;

-- 5.5 프로젝트 통계
-- SELECT 
--     status,
--     COUNT(*) as count
-- FROM projects 
-- WHERE is_active = TRUE
-- GROUP BY status;

-- 6. 테이블 삭제 (롤백용)
-- =============================================

-- DROP INDEX IF EXISTS idx_projects_active_status;
-- DROP INDEX IF EXISTS idx_projects_is_active;
-- DROP INDEX IF EXISTS idx_projects_created_at;
-- DROP INDEX IF EXISTS idx_projects_dates;
-- DROP INDEX IF EXISTS idx_projects_status;
-- DROP INDEX IF EXISTS idx_projects_name;
-- DROP TABLE IF EXISTS projects CASCADE;
