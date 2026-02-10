'use client';

import { useAuth } from '@/context/AuthContext';
import { ProjectListTable } from '@/components/project/ProjectListTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ProjectsPage() {
  const { user } = useAuth();
  const canCreateProject = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';

  return (
    <div className="page-animate">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            프로젝트 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            프로젝트를 관리하고 팀원을 배정할 수 있습니다
          </p>
        </div>
        {canCreateProject && (
          <Button
            asChild
            className="gradient-primary border-none max-md:hidden md:inline-flex"
          >
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />새 프로젝트 등록
            </Link>
          </Button>
        )}
      </div>
      <ProjectListTable />

      {/* Mobile FAB */}
      {canCreateProject &&
        createPortal(
          <Button
            asChild
            className="max-md:inline-flex md:hidden gradient-primary border-none fixed bottom-8 right-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow z-50"
            size="default"
          >
            <Link href="/projects/new">
              <Plus className="h-6 w-6" /> 새 프로젝트 등록
            </Link>
          </Button>,
          document.body,
        )}
    </div>
  );
}
