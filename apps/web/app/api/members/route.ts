import { NextRequest, NextResponse } from 'next/server';
import { mockMembers, mockProjectMembers } from '@/lib/data/mockData';

// GET /api/members - Get available members (optionally exclude members from a project)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const excludeProject = searchParams.get('excludeProject');

  let availableMembers = [...mockMembers];

  // If excludeProject is provided, filter out members already in that project
  if (excludeProject) {
    const projectId = parseInt(excludeProject);
    const projectMemberIds = mockProjectMembers
      .filter(pm => pm.projectId === projectId)
      .map(pm => pm.memberId);

    availableMembers = availableMembers.filter(
      member => !projectMemberIds.includes(member.id)
    );
  }

  return NextResponse.json(availableMembers);
}
