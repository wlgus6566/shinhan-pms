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
    <div className="container py-10 max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">사용자 상세 설정</h1>
        <p className="text-muted-foreground">사용자의 파트, 등급 및 활성화 상태를 관리합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 정보</CardTitle>
          <CardDescription>선택한 사용자의 시스템 권한 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm userId={id as string} />
        </CardContent>
      </Card>
    </div>
  );
}
