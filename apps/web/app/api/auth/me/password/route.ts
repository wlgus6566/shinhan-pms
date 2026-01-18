import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/auth/me/password - Change password
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '현재 비밀번호와 새 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: '새 비밀번호는 최소 8자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    // Mock implementation - always succeed for demo
    return NextResponse.json({
      message: '비밀번호가 변경되었습니다',
    });
  } catch (error) {
    return NextResponse.json(
      { message: '비밀번호 변경 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
