'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProjectForm } from '@/components/project/ProjectForm';
import { RECOMMENDED_TASK_TYPES } from '@/lib/constants/task-types';
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

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const canCreate = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';

  const initialTaskTypes = useMemo(
    () =>
      RECOMMENDED_TASK_TYPES.map((name) => ({
        name,
      })),
    []
  );

  useEffect(() => {
    if (user && !canCreate) {
      router.push('/projects');
    }
  }, [user, canCreate, router]);

  if (!canCreate) {
    return null;
  }

  return (
    <div className="max-w-7xl page-animate">
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
        </CardHeader>
        <CardContent>
          <ProjectForm mode="create" initialTaskTypes={initialTaskTypes} />
        </CardContent>
      </Card>
    </div>
  );
}
