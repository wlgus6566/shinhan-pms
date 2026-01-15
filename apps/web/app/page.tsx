'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="min-h-screen bg-shinhan-blue flex items-center justify-center text-white">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-shinhan-blue flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-shinhan-gold/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-none">
        <CardHeader className="space-y-4 pt-10">
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.png"
              alt="logo"
              width={176}
              height={31.5}
              className="w-auto h-auto"
            />
          </div>
          <div className="space-y-1 text-center">
            <CardDescription className="text-slate-500">
              신한카드 PMS 통합 관리 시스템
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-slate-50 rounded-b-xl border-t px-8 py-6">
          <div className="text-sm text-center text-slate-600">
            계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              className="text-shinhan-blue font-semibold hover:underline"
            >
              회원가입
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-8 text-white/60 text-xs z-10 font-light">
        © 2024 Shinhan Card PMS. All rights reserved.
      </p>
    </div>
  );
}
