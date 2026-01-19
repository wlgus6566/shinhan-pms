'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectForm } from '@/components/project/ProjectForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';

  useEffect(() => {
    if (user && !canCreate) {
      router.push('/projects');
    }
  }, [user, canCreate, router]);

  if (!canCreate) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로젝트 목록으로
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 프로젝트 등록</CardTitle>
          <CardDescription>새로운 프로젝트를 등록하면 자동으로 PM으로 배정됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
