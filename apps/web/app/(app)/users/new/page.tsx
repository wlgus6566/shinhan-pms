'use client';

import { useRouter } from 'next/navigation';
import { UserCreateForm } from '@/components/admin/UserCreateForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, 
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function UserCreatePage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl">
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
          멤버 등록
        </h1>
        <p className="text-muted-foreground mt-1">
          새로운 팀원을 등록하고 권한을 설정합니다
        </p>
      </div>

      <Card className="rounded-2xl border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold">멤버 정보</CardTitle>
          <CardDescription>
            멤버의 기본 정보와 권한을 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <UserCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
