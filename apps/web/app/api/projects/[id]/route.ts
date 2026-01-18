import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/data/mockData';

// GET /api/projects/:id - Get a single project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const projectId = parseInt(params.id);
  
  console.log('🔍 프로젝트 상세 조회:', { projectId, totalProjects: mockProjects.length });
  
  const project = mockProjects.find(p => p.id === projectId && !p.isDeleted);

  if (!project) {
    console.log('❌ 프로젝트를 찾을 수 없음:', projectId);
    return NextResponse.json(
      { message: '프로젝트를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  console.log('✅ 프로젝트 조회 성공:', project.name);
  return NextResponse.json(project);
}

// PATCH /api/projects/:id - Update a project
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = parseInt(params.id);
    const projectIndex = mockProjects.findIndex(p => p.id === projectId && !p.isDeleted);

    if (projectIndex === -1) {
      return NextResponse.json(
        { message: '프로젝트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, startDate, endDate, status, progress } = body;

    // Check unique name if name is being changed
    if (name && name !== mockProjects[projectIndex].name) {
      const existingProject = mockProjects.find(
        p => p.name === name && !p.isDeleted && p.id !== projectId
      );
      if (existingProject) {
        return NextResponse.json(
          { message: '이미 존재하는 프로젝트명입니다' },
          { status: 409 }
        );
      }
    }

    // Date validation
    const newStartDate = startDate || mockProjects[projectIndex].startDate;
    const newEndDate = endDate || mockProjects[projectIndex].endDate;
    if (new Date(newEndDate) < new Date(newStartDate)) {
      return NextResponse.json(
        { message: '종료일은 시작일 이후여야 합니다' },
        { status: 400 }
      );
    }

    // Update project
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(status !== undefined && { status }),
      ...(progress !== undefined && { progress }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockProjects[projectIndex]);
  } catch (error) {
    return NextResponse.json(
      { message: '프로젝트 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/:id - Soft delete a project
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const projectId = parseInt(params.id);
  const projectIndex = mockProjects.findIndex(p => p.id === projectId && !p.isDeleted);

  if (projectIndex === -1) {
    return NextResponse.json(
      { message: '프로젝트를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  // Soft delete
  mockProjects[projectIndex].isDeleted = true;
  mockProjects[projectIndex].updatedAt = new Date().toISOString();

  return NextResponse.json(null, { status: 204 });
}
