import { NextRequest, NextResponse } from 'next/server';

// Mock users (same as login)
const mockUsers = [
  {
    id: 1,
    email: 'kim@shinhan.com',
    name: '김철수',
    department: 'DEVELOPMENT',
    role: 'PM',
  },
  {
    id: 2,
    email: 'lee@shinhan.com',
    name: '이영희',
    department: 'PLANNING',
    role: 'PL',
  },
  {
    id: 3,
    email: 'park@shinhan.com',
    name: '박민수',
    department: 'DESIGN',
    role: 'PA',
  },
  {
    id: 4,
    email: 'jung@shinhan.com',
    name: '정수진',
    department: 'DEVELOPMENT',
    role: 'PA',
  },
  {
    id: 5,
    email: 'choi@shinhan.com',
    name: '최동욱',
    department: 'OPERATION',
    role: 'PA',
  },
  {
    id: 6,
    email: 'kang@shinhan.com',
    name: '강미영',
    department: 'PLANNING',
    role: 'PA',
  },
  {
    id: 7,
    email: 'yoon@shinhan.com',
    name: '윤서준',
    department: 'DESIGN',
    role: 'PA',
  },
  {
    id: 8,
    email: 'lim@shinhan.com',
    name: '임지훈',
    department: 'DEVELOPMENT',
    role: 'PA',
  },
];

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Extract user ID from mock token (format: mock-token-{userId}-{timestamp})
    const userId = parseInt(token.split('-')[2]);
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: '사용자 정보 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/me - Update current user
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const userId = parseInt(token.split('-')[2]);
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, department } = body;

    // Update user data
    if (name) user.name = name;
    if (department) user.department = department;

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: '사용자 정보 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
