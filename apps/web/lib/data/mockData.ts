import type { Project, ProjectMember, AvailableMember, ProjectStatus, ProjectRole, Department, UserRole } from '@/types/project';

// Mock users/members
export const mockMembers: AvailableMember[] = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@shinhan.com',
    department: 'DEVELOPMENT',
    role: 'USER',
  },
  {
    id: 2,
    name: '이영희',
    email: 'lee@shinhan.com',
    department: 'PLANNING',
    role: 'USER',
  },
  {
    id: 3,
    name: '박민수',
    email: 'park@shinhan.com',
    department: 'DESIGN',
    role: 'USER',
  },
  {
    id: 4,
    name: '정수진',
    email: 'jung@shinhan.com',
    department: 'DEVELOPMENT',
    role: 'USER',
  },
  {
    id: 5,
    name: '최동욱',
    email: 'choi@shinhan.com',
    department: 'OPERATION',
    role: 'USER',
  },
  {
    id: 6,
    name: '강미영',
    email: 'kang@shinhan.com',
    department: 'PLANNING',
    role: 'USER',
  },
  {
    id: 7,
    name: '윤서준',
    email: 'yoon@shinhan.com',
    department: 'DESIGN',
    role: 'USER',
  },
  {
    id: 8,
    name: '임지훈',
    email: 'lim@shinhan.com',
    department: 'DEVELOPMENT',
    role: 'USER',
  },
];

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 1,
    name: '신한카드 모바일 앱 리뉴얼',
    description: '사용자 경험 개선을 위한 모바일 앱 전면 리뉴얼 프로젝트',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-06-30T00:00:00Z',
    status: 'IN_PROGRESS',
    progress: 65,
    creatorId: 1,
    creator: {
      id: 1,
      name: '김철수',
      email: 'kim@shinhan.com',
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-03-20T00:00:00Z',
    isDeleted: false,
  },
  {
    id: 2,
    name: '고객센터 시스템 고도화',
    description: 'AI 챗봇 도입 및 상담 프로세스 자동화',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-07-31T00:00:00Z',
    status: 'IN_PROGRESS',
    progress: 45,
    creatorId: 2,
    creator: {
      id: 2,
      name: '이영희',
      email: 'lee@shinhan.com',
    },
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-03-18T00:00:00Z',
    isDeleted: false,
  },
  {
    id: 3,
    name: '결제 시스템 보안 강화',
    description: '최신 보안 프로토콜 적용 및 취약점 보완',
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    status: 'COMPLETED',
    progress: 100,
    creatorId: 1,
    creator: {
      id: 1,
      name: '김철수',
      email: 'kim@shinhan.com',
    },
    createdAt: '2023-10-20T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    isDeleted: false,
  },
  {
    id: 4,
    name: '멤버십 포인트 플랫폼 구축',
    description: '통합 멤버십 포인트 관리 시스템 개발',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-09-30T00:00:00Z',
    status: 'PENDING',
    progress: 10,
    creatorId: 3,
    creator: {
      id: 3,
      name: '박민수',
      email: 'park@shinhan.com',
    },
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    isDeleted: false,
  },
  {
    id: 5,
    name: '데이터 분석 대시보드 개발',
    description: '실시간 비즈니스 인사이트 제공 대시보드',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-05-31T00:00:00Z',
    status: 'ON_HOLD',
    progress: 30,
    creatorId: 2,
    creator: {
      id: 2,
      name: '이영희',
      email: 'lee@shinhan.com',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
    isDeleted: false,
  },
  {
    id: 6,
    name: '디지털 마케팅 플랫폼',
    description: '맞춤형 마케팅 캠페인 관리 시스템',
    startDate: '2024-02-15T00:00:00Z',
    endDate: '2024-08-15T00:00:00Z',
    status: 'IN_PROGRESS',
    progress: 55,
    creatorId: 4,
    creator: {
      id: 4,
      name: '정수진',
      email: 'jung@shinhan.com',
    },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-03-22T00:00:00Z',
    isDeleted: false,
  },
];

// Mock project members
export const mockProjectMembers: ProjectMember[] = [
  // Project 1 members
  {
    id: 1,
    projectId: 1,
    memberId: 1,
    role: 'PM',
    member: {
      id: 1,
      name: '김철수',
      email: 'kim@shinhan.com',
      department: 'DEVELOPMENT',
      role: 'USER',
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 2,
    projectId: 1,
    memberId: 3,
    role: 'PL',
    member: {
      id: 3,
      name: '박민수',
      email: 'park@shinhan.com',
      department: 'DESIGN',
      role: 'USER',
    },
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 3,
    projectId: 1,
    memberId: 4,
    role: 'PA',
    member: {
      id: 4,
      name: '정수진',
      email: 'jung@shinhan.com',
      department: 'DEVELOPMENT',
      role: 'USER',
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  // Project 2 members
  {
    id: 4,
    projectId: 2,
    memberId: 2,
    role: 'PM',
    member: {
      id: 2,
      name: '이영희',
      email: 'lee@shinhan.com',
      department: 'PLANNING',
      role: 'USER',
    },
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: 5,
    projectId: 2,
    memberId: 5,
    role: 'PL',
    member: {
      id: 5,
      name: '최동욱',
      email: 'choi@shinhan.com',
      department: 'OPERATION',
      role: 'USER',
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  // Project 3 members
  {
    id: 6,
    projectId: 3,
    memberId: 1,
    role: 'PM',
    member: {
      id: 1,
      name: '김철수',
      email: 'kim@shinhan.com',
      department: 'DEVELOPMENT',
      role: 'USER',
    },
    createdAt: '2023-10-20T00:00:00Z',
    updatedAt: '2023-10-20T00:00:00Z',
  },
  {
    id: 7,
    projectId: 3,
    memberId: 8,
    role: 'PA',
    member: {
      id: 8,
      name: '임지훈',
      email: 'lim@shinhan.com',
      department: 'DEVELOPMENT',
      role: 'USER',
    },
    createdAt: '2023-11-05T00:00:00Z',
    updatedAt: '2023-11-05T00:00:00Z',
  },
  // Project 4 members
  {
    id: 8,
    projectId: 4,
    memberId: 3,
    role: 'PM',
    member: {
      id: 3,
      name: '박민수',
      email: 'park@shinhan.com',
      department: 'DESIGN',
      role: 'USER',
    },
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 9,
    projectId: 4,
    memberId: 6,
    role: 'PL',
    member: {
      id: 6,
      name: '강미영',
      email: 'kang@shinhan.com',
      department: 'PLANNING',
      role: 'USER',
    },
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z',
  },
  // Project 6 members
  {
    id: 10,
    projectId: 6,
    memberId: 4,
    role: 'PM',
    member: {
      id: 4,
      name: '정수진',
      email: 'jung@shinhan.com',
      department: 'DEVELOPMENT',
      role: 'USER',
    },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 11,
    projectId: 6,
    memberId: 7,
    role: 'PA',
    member: {
      id: 7,
      name: '윤서준',
      email: 'yoon@shinhan.com',
      department: 'DESIGN',
      role: 'USER',
    },
    createdAt: '2024-02-12T00:00:00Z',
    updatedAt: '2024-02-12T00:00:00Z',
  },
];

// Helper functions for in-memory data management
let nextProjectId = 7;
let nextProjectMemberId = 12;

export function getNextProjectId() {
  return nextProjectId++;
}

export function getNextProjectMemberId() {
  return nextProjectMemberId++;
}
