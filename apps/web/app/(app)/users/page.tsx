'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserListTable } from '@/components/admin/UserListTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function UsersAdminPage() {
  const { user } = useAuth();
  console.log(user);
  const canCreateUser = user?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            멤버 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            팀원 정보를 확인하고 권한을 관리할 수 있습니다
          </p>
        </div>
        {canCreateUser && (
          <Button asChild>
            <Link href="/dashboard/admin/users/new">
              <Plus className="h-4 w-4 mr-2" />새 멤버 등록
            </Link>
          </Button>
        )}
      </div>
      <UserListTable />
    </div>
  );
}
