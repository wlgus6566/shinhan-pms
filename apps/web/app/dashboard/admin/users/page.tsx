'use client';

import { UserListTable } from '@/components/admin/UserListTable';

export default function UsersAdminPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">사용자 관리</h1>
        <p className="text-muted-foreground mt-1">팀원 정보를 확인하고 권한을 관리할 수 있습니다 (PM/PL 전용)</p>
      </div>
      <UserListTable />
    </div>
  );
}
