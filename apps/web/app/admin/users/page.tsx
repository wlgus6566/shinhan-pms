'use client';

import { UserListTable } from '@/components/admin/UserListTable';

export default function UsersAdminPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">팀원 정보를 확인하고 관리할 수 있습니다 (PM/PL 전용)</p>
      </div>
      <UserListTable />
    </div>
  );
}
