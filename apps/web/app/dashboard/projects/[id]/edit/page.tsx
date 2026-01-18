'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectForm } from '@/components/project/ProjectForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const canEdit = user?.role === 'PM' || user?.role === 'PL';

  useEffect(() => {
    if (user && !canEdit) {
      router.push(`/dashboard/projects/${projectId}`);
    }
  }, [user, canEdit, router, projectId]);

  if (!canEdit) {
    return null;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로젝트 상세로
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>프로젝트 수정</CardTitle>
          <CardDescription>프로젝트 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm projectId={projectId} mode="edit" />
        </CardContent>
      </Card>
    </div>
  );
}
