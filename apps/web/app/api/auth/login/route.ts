import { NextRequest, NextResponse } from 'next/server';
import { mockMembers } from '@/lib/data/mockData';

// Mock users with passwords for authentication
const mockUsers = [
  {
    id: 0,
    email: 'admin@emotion.co.kr',
    password: '2motion!',
    name: '시스템 관리자',
    department: 'DEVELOPMENT',
    role: 'PM',
  },
  {
    id: 1,
    email: 'kim@emotion.co.kr',
    password: 'password123',
    name: '김철수',
    department: 'DEVELOPMENT',
    role: 'PM', // System role
  },
  {
    id: 2,
    email: 'lee@emotion.co.kr',
    password: 'password123',
    name: '이영희',
    department: 'PLANNING',
    role: 'PL',
  },
  {
    id: 3,
    email: 'park@emotion.co.kr',
    password: 'password123',
    name: '박민수',
    department: 'DESIGN',
    role: 'PA',
  },
  {
    id: 4,
    email: 'jung@emotion.co.kr',
    password: 'password123',
    name: '정수진',
    department: 'DEVELOPMENT',
    role: 'PA',
  },
  {
    id: 5,
    email: 'choi@emotion.co.kr',
    password: 'password123',
    name: '최동욱',
    department: 'OPERATION',
    role: 'PA',
  },
  {
    id: 6,
    email: 'kang@emotion.co.kr',
    password: 'password123',
    name: '강미영',
    department: 'PLANNING',
    role: 'PA',
  },
  {
    id: 7,
    email: 'yoon@emotion.co.kr',
    password: 'password123',
    name: '윤서준',
    department: 'DESIGN',
    role: 'PA',
  },
  {
    id: 8,
    email: 'lim@emotion.co.kr',
    password: 'password123',
    name: '임지훈',
    department: 'DEVELOPMENT',
    role: 'PA',
  },
];

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 },
      );
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 },
      );
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 },
      );
    }

    // Generate mock token
    const accessToken = `mock-token-${user.id}-${Date.now()}`;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      accessToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
