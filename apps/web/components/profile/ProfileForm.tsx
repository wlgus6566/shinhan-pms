'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMe, updateMe } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect } from '@/components/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { DEPARTMENT_OPTIONS, type Department } from '@repo/schema';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').max(50),
  department: z.custom<Department>(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      department: 'DEVELOPMENT_1' as Department,
    },
  });

  useEffect(() => {
    getMe()
      .then((user) => {
        form.reset({
          name: user.name,
          department: user.department,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [form]);

  async function onSubmit(values: ProfileValues) {
    setIsSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const updatedUser = await updateMe(values);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>프로필이 성공적으로 업데이트되었습니다</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormInput
          control={form.control}
          name="name"
          label="이름"
        />
        <FormSelect
          control={form.control}
          name="department"
          label="본부"
          placeholder="본부를 선택하세요"
          options={DEPARTMENT_OPTIONS}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          저장
        </Button>
      </form>
    </Form>
  );
}
