import type { ProjectStatus, ProjectType, WorkArea, ProjectRole } from '@/types/project';

// 프로젝트 상태 라벨 (ProjectStatus: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED')
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: '진행중',
  COMPLETED: '완료',
  SUSPENDED: '중단',
} as const;

// 프로젝트 상태 배지 배리언트
export const PROJECT_STATUS_VARIANTS: Record<
  ProjectStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  ACTIVE: 'default',
  COMPLETED: 'outline',
  SUSPENDED: 'destructive',
} as const;

// 프로젝트 상태 배지 상세 스타일
export const PROJECT_STATUS_BADGE_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: '진행중',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  COMPLETED: {
    label: '완료',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  SUSPENDED: {
    label: '중단',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
} as const;

// 프로젝트 타입 라벨
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  BUILD: '구축',
  OPERATION: '운영',
} as const;

// 프로젝트 역할 배리언트 (PM, PL, PA - 프로젝트 내 역할)
export const PROJECT_ROLE_VARIANTS: Record<ProjectRole, 'default' | 'secondary' | 'outline'> = {
  PM: 'default',
  PL: 'secondary',
  PA: 'outline',
} as const;

// 프로젝트 역할 라벨
export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  PM: 'PM (Project Manager)',
  PL: 'PL (Project Leader)',
  PA: 'PA (Project Assistant)',
} as const;

// 프로젝트 역할 옵션
export const PROJECT_ROLE_OPTIONS = Object.entries(PROJECT_ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// 작업 영역 라벨 (WorkArea enum용)
export const WORK_AREA_LABELS_STRICT: Record<WorkArea, string> = {
  PROJECT_MANAGEMENT: '프로젝트 관리',
  PLANNING: '기획',
  DESIGN: '디자인',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
} as const;

// 작업 영역 옵션
export const WORK_AREA_OPTIONS = Object.entries(WORK_AREA_LABELS_STRICT).map(([value, label]) => ({
  value,
  label: `${label} (${value.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')})`,
}));

// 작업 영역 라벨 (필터링용 - 'all' 포함)
export const WORK_AREA_LABELS: Record<string, string> = {
  all: '전체',
  PROJECT_MANAGEMENT: 'PM',
  PLANNING: '기획',
  DESIGN: '디자인',
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  OPERATION: '운영',
} as const;
