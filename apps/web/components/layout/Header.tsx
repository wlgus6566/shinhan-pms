'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const pathMap: Record<string, string> = {
  dashboard: '대시보드',
  projects: '프로젝트 관리',
  tasks: '업무 관리',
  'work-logs': '업무일지',
  schedule: '일정 관리',
  users: '멤버 관리',
  analytics: '프로젝트 리포트',
  new: '새 프로젝트',
  edit: '수정',
};

export function Header() {
  const pathname = usePathname();
  const paths = pathname?.split('/').filter(Boolean) || [];

  return (
    <header className="h-16 flex items-center px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-slate-400">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const href = `/${paths.slice(0, index + 1).join('/')}`;
            const label = pathMap[path] || path;

            if (path === 'dashboard') return null;

            return (
              <React.Fragment key={path}>
                <BreadcrumbSeparator className="text-slate-300" />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-bold text-slate-900">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href} className="text-slate-400">
                      {label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

import React from 'react';
