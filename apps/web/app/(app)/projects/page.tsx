'use client';

import { useAuth } from '@/context/AuthContext';
import { ProjectListTable } from '@/components/project/ProjectListTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const canCreateProject = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';

  return (
    <div className="">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            프로젝트 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            프로젝트를 관리하고 팀원을 배정할 수 있습니다
          </p>
        </div>
        {canCreateProject && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />새 프로젝트 등록
            </Link>
          </Button>
        )}
      </div>
      <ProjectListTable />
    </div>
  );
}
