import { NextRequest, NextResponse } from 'next/server';
import { mockProjects, getNextProjectId } from '@/lib/data/mockData';
import type { ProjectStatus } from '@/types/project';

// GET /api/projects - Get all projects with optional filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const status = searchParams.get('status') as ProjectStatus | null;

  let filteredProjects = mockProjects.filter(p => !p.isDeleted);

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status && status !== 'ALL') {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }

  return NextResponse.json(filteredProjects);
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startDate, endDate, status, progress } = body;

    // Validation
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { message: '필수 필드를 입력해주세요' },
        { status: 400 }
      );
    }

    // Check unique name
    const existingProject = mockProjects.find(p => p.name === name && !p.isDeleted);
    if (existingProject) {
      return NextResponse.json(
        { message: '이미 존재하는 프로젝트명입니다' },
        { status: 409 }
      );
    }

    // Date validation
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { message: '종료일은 시작일 이후여야 합니다' },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = {
      id: getNextProjectId(),
      name,
      description: description || null,
      startDate,
      endDate,
      status: status || 'PENDING',
      progress: progress || 0,
      creatorId: 1, // Mock creator ID
      creator: {
        id: 1,
        name: '김철수',
        email: 'kim@shinhan.com',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };

    mockProjects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: '프로젝트 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
