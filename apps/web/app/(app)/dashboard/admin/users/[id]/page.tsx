'use client';

import { useParams, useRouter } from 'next/navigation';
import { UserEditForm } from '@/components/admin/UserEditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function UserEditPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" className="mb-6 -ml-2 text-slate-500 hover:text-emotion-primary" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">사용자 상세 설정</h1>
        <p className="text-muted-foreground mt-1">사용자의 파트, 등급 및 활성화 상태를 관리합니다</p>
      </div>

      <Card className="rounded-2xl border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold">사용자 정보 수정</CardTitle>
          <CardDescription>시스템 접근 권한 및 소속 정보를 변경합니다</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <UserEditForm userId={id as string} />
        </CardContent>
      </Card>
    </div>
  );
}
