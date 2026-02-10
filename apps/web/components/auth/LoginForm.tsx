'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@repo/schema';
import { login as loginApi } from '@/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from '@/components/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { z } from 'zod';

type LoginValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChangeAlert, setShowPasswordChangeAlert] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // 디버그: showPasswordChangeAlert 변경 감지
  useEffect(() => {
    console.log('showPasswordChangeAlert changed:', showPasswordChangeAlert);
  }, [showPasswordChangeAlert]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'kim@emotion.co.kr',
      password: 'password123',
    },
  });

  // Use useCallback for stable callback reference
  const onSubmit = useCallback(
    async (values: LoginValues) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loginApi(values);
        // 비밀번호 변경이 필요한 경우
        if (result.user.requirePasswordChange) {
          login(result.accessToken, result.user as any);
          setShowPasswordChangeAlert(true);
          return;
        }

        login(result.accessToken, result.user as any);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.message || '로그인 중 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    },
    [login, router],
  );

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    // 비밀번호 변경 후 로그아웃 및 로그인 페이지로 이동
    logout();
    router.push('/');
  };

  return (
    <>
      <div className="grid gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {showPasswordChangeAlert && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="flex items-center justify-between">
                    <span>보안을 위해 비밀번호를 변경해주세요.</span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowPasswordChangeAlert(false);
                        setShowChangePassword(true);
                      }}
                      className="ml-4"
                    >
                      지금 변경하기
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <FormInput
              control={form.control}
              name="email"
              label="이메일"
              placeholder="name@emotion.co.kr"
            />
            <FormInput
              control={form.control}
              name="password"
              label="비밀번호"
              type="password"
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full gradient-primary border-none text-white h-11 text-sm font-semibold rounded-xl" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              로그인
            </Button>
          </form>
        </Form>
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        onSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
}
