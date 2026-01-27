/**
 * 공통 Response 타입 정의
 * Frontend-Backend 간 타입 계약 (BigInt → JSON → string 변환 반영)
 */

// ============================================
// 기본 사용자 정보 (중첩 객체용)
// ============================================

export interface UserBasicInfo {
  id: string;
  name: string;
  email: string;
}

export interface UserDetailInfo extends UserBasicInfo {
  department: string;
  position?: string;
  role: string;
}

// ============================================
// 프로젝트/업무 기본 정보 (중첩 객체용)
// ============================================

export interface ProjectBasicInfo {
  id: string;
  projectName: string;
}

export interface TaskBasicInfo {
  id: string;
  taskName: string;
  projectId: string;
  status?: string;
  difficulty?: string;
}
