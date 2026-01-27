/**
 * Users - Response 타입 정의
 */

// ============================================
// User Response
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  position?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Available Member (프로젝트에 추가 가능한 멤버)
// ============================================

export interface AvailableMember {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}
