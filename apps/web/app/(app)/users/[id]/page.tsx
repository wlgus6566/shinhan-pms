'use client';

import { useParams, useRouter } from 'next/navigation';
import { UserForm } from '@/components/admin/UserForm';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function UserEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const canEdit = user?.role === 'SUPER_ADMIN';

  return (
    <div className="max-w-4xl page-animate">
      <Button
        variant="ghost"
        className="mb-6 -ml-2 text-slate-500 hover:text-blue-600"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {canEdit ? '멤버 상세 설정' : '멤버 정보'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {canEdit
            ? '멤버의 본부, 권한 및 활성화 상태를 관리합니다'
            : '멤버의 기본 정보 및 권한을 확인합니다'}
        </p>
      </div>

      <Card className="rounded-2xl border-none shadow-md p-4 overflow-hidden">
        <UserForm mode="edit" userId={id as string} />
      </Card>
    </div>
  );
}
