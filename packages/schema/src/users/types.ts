/**
 * Users - Response 타입 정의
 */

import { z } from 'zod';
import { AuditFieldsSchema } from '../common/types';

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
  requirePasswordChange: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    department: z.string(),
    position: z.string().optional(),
    role: z.string(),
    isActive: z.boolean(),
    requirePasswordChange: z.boolean(),
    lastLoginAt: z.string().optional(),
  })
  .merge(AuditFieldsSchema);

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

export const AvailableMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  department: z.string(),
  role: z.string(),
});
