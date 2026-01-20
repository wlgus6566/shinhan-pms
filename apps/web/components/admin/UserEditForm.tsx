'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getUser, updateUser, deactivateUser } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { FormInput, FormSelect } from '@/components/form';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS } from '@/lib/constants/roles';

const userUpdateSchema = z.object({
  department: z.string().min(1, '본부를 입력하세요'),
  role: z.enum(['SUPER_ADMIN', 'PM', 'MEMBER']),
  isActive: z.boolean(),
});

type UserUpdateValues = z.infer<typeof userUpdateSchema>;

export function UserEditForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const form = useForm<UserUpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      department: '',
      role: 'MEMBER',
      isActive: true,
    },
  });

  useEffect(() => {
    getUser(userId)
      .then((user) => {
        setUserData(user);
        form.reset({
          department: user.department,
          role: user.role as 'SUPER_ADMIN' | 'PM' | 'MEMBER',
          isActive: user.isActive,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [userId, form]);

  async function onSubmit(values: UserUpdateValues) {
    setIsSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateUser(userId, values);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeactivate() {
    setIsDeactivating(true);
    try {
      await deactivateUser(userId);
      router.push('/users');
    } catch (err: any) {
      setError(err.message);
      setIsDeactivating(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">이름</p>
          <p className="font-medium">{userData.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">이메일</p>
          <p className="font-medium">{userData.email}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>사용자 정보가 업데이트되었습니다</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <FormSelect
            control={form.control}
            name="department"
            label="본부 *"
            placeholder="본부를 선택하세요"
            options={DEPARTMENT_OPTIONS}
          />

          <FormSelect
            control={form.control}
            name="role"
            label="권한 *"
            placeholder="권한을 선택하세요"
            options={ROLE_OPTIONS}
            description="슈퍼 관리자는 전체 권한, 프로젝트 관리자는 프로젝트 관리 권한, 일반은 업무일지 작성 권한을 가집니다"
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">계정 활성화</FormLabel>
                  <FormDescription>
                    비활성화된 사용자는 로그인할 수 없습니다.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">비활성화</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>사용자 비활성화</DialogTitle>
                  <DialogDescription>
                    정말 이 사용자를 비활성화하시겠습니까? 비활성화된 사용자는 시스템에 접근할 수 없습니다.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>취소</Button>
                  <Button variant="destructive" onClick={onDeactivate} disabled={isDeactivating}>
                    {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    확인
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </Form>
    </div>
  );
}
