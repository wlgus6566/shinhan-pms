import { NextRequest, NextResponse } from 'next/server';
import { mockProjects, mockProjectMembers, mockMembers, getNextProjectMemberId } from '@/lib/data/mockData';

// GET /api/projects/:id/members - Get all members of a project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const projectId = parseInt(params.id);
  const project = mockProjects.find(p => p.id === projectId && !p.isDeleted);

  if (!project) {
    return NextResponse.json(
      { message: '프로젝트를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  const members = mockProjectMembers.filter(pm => pm.projectId === projectId);
  return NextResponse.json(members);
}

// POST /api/projects/:id/members - Add a member to a project
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = parseInt(params.id);
    const project = mockProjects.find(p => p.id === projectId && !p.isDeleted);

    if (!project) {
      return NextResponse.json(
        { message: '프로젝트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { memberId, role } = body;

    // Validation
    if (!memberId || !role) {
      return NextResponse.json(
        { message: '필수 필드를 입력해주세요' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = mockMembers.find(m => m.id === memberId);
    if (!member) {
      return NextResponse.json(
        { message: '존재하지 않는 팀원입니다' },
        { status: 404 }
      );
    }

    // Check if member is already in the project
    const existingMember = mockProjectMembers.find(
      pm => pm.projectId === projectId && pm.memberId === memberId
    );
    if (existingMember) {
      return NextResponse.json(
        { message: '이미 프로젝트에 배정된 팀원입니다' },
        { status: 409 }
      );
    }

    // Add member to project
    const newProjectMember = {
      id: getNextProjectMemberId(),
      projectId,
      memberId,
      role,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        department: member.department,
        role: member.role,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProjectMembers.push(newProjectMember);

    return NextResponse.json(newProjectMember, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: '팀원 추가 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
