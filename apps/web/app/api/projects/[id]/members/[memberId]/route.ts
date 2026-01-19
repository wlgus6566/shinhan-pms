import { NextRequest, NextResponse } from 'next/server';
import { mockProjectMembers, mockProjects } from '@/lib/data/mockData';

// PATCH /api/projects/:id/members/:memberId - Update a project member's role
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const params = await context.params;
    const projectId = parseInt(params.id);
    const memberId = parseInt(params.memberId);

    const project = mockProjects.find(
      (p) => p.id === projectId && !p.isDeleted,
    );
    if (!project) {
      return NextResponse.json(
        { message: '프로젝트를 찾을 수 없습니다' },
        { status: 404 },
      );
    }

    const memberIndex = mockProjectMembers.findIndex(
      (pm) => pm.projectId === projectId && pm.memberId === memberId,
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { message: '프로젝트 팀원을 찾을 수 없습니다' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { message: '역할을 입력해주세요' },
        { status: 400 },
      );
    }

    // Update role
    mockProjectMembers[memberIndex] = {
      ...mockProjectMembers[memberIndex],
      role,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockProjectMembers[memberIndex]);
  } catch (error) {
    return NextResponse.json(
      { message: '역할 변경 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/:id/members/:memberId - Remove a member from a project
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  const params = await context.params;
  const projectId = parseInt(params.id);
  const memberId = parseInt(params.memberId);

  const project = mockProjects.find((p) => p.id === projectId && !p.isDeleted);
  if (!project) {
    return NextResponse.json(
      { message: '프로젝트를 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  const memberIndex = mockProjectMembers.findIndex(
    (pm) => pm.projectId === projectId && pm.memberId === memberId,
  );

  if (memberIndex === -1) {
    return NextResponse.json(
      { message: '프로젝트 팀원을 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  // Check if trying to remove creator
  if (memberId === project.creatorId) {
    return NextResponse.json(
      { message: '프로젝트 생성자는 제거할 수 없습니다' },
      { status: 403 },
    );
  }

  // Remove member
  mockProjectMembers.splice(memberIndex, 1);

  return NextResponse.json(null, { status: 204 });
}
