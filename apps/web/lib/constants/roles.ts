// 관리자 유형
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PM: 'PM',
  MEMBER: 'MEMBER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: '슈퍼 관리자',
  PM: '프로젝트 관리자',
  MEMBER: '일반',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: '전체 권한 (멤버 등록, 프로젝트 등록)',
  PM: '프로젝트 등록/수정/삭제, 프로젝트 멤버 관리',
  MEMBER: '업무일지 작성',
};

// 본부
export const DEPARTMENTS = {
  PLANNING: '경영전략본부',
  DESIGN_1: '기획본부1',
  DEVELOPMENT_1: '개발본부1',
  DIGITAL_1: '디지인본부1',
  BUSINESS_1: '사업부본1',
  PLANNING_2: '기획본부2',
  DEVELOPMENT_2: '개발본부2',
  DIGITAL_2: '디지인본부2',
  SERVICE: '서비스운영본부',
  PLATFORM: '플랫폼운영본부',
  PLATFORM_STRATEGY: '플랫폼전략실',
  MARKETING: '마케팅전략실',
  XC: 'XC본부',
} as const;

export type Department = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];

export const DEPARTMENT_OPTIONS = Object.entries(DEPARTMENTS).map(
  ([key, label]) => ({
    value: label,
    label,
  }),
);

export const ROLE_OPTIONS = Object.entries(ROLES).map(([key, value]) => ({
  value,
  label: ROLE_LABELS[value as Role],
}));

// 직책
export const POSITIONS = {
  DIVISION_HEAD: 'DIVISION_HEAD', // 부문장
  GENERAL_MANAGER: 'GENERAL_MANAGER', // 본부장
  PRINCIPAL_LEADER: 'PRINCIPAL_LEADER', // 책임리더
  SENIOR_LEADER: 'SENIOR_LEADER', // 선임리더
  LEADER: 'LEADER', // 리더
  TEAM_MEMBER: 'TEAM_MEMBER', // 팀원
} as const;

export type Position = (typeof POSITIONS)[keyof typeof POSITIONS];

export const POSITION_LABELS: Record<Position, string> = {
  DIVISION_HEAD: '부문장',
  GENERAL_MANAGER: '본부장',
  PRINCIPAL_LEADER: '책임리더',
  SENIOR_LEADER: '선임리더',
  LEADER: '리더',
  TEAM_MEMBER: '팀원',
};

export const POSITION_OPTIONS = Object.entries(POSITIONS).map(([key, value]) => ({
  value,
  label: POSITION_LABELS[value as Position],
}));
