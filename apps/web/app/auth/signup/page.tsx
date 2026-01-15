'use client';

import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-shinhan-gold/20 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md z-10 shadow-2xl border-none my-8">
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
              새로운 계정을 생성하여 프로젝트 관리를 시작하세요
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <SignupForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-slate-50 rounded-b-xl border-t px-8 py-6">
          <div className="text-sm text-center text-slate-600">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/"
              className="text-shinhan-blue font-semibold hover:underline"
            >
              로그인
            </Link>
          </div>
        </CardFooter>
      </Card>

      <p className="mt-4 mb-8 text-white/60 text-xs z-10 font-light">
        © 2024 Shinhan Card PMS. All rights reserved.
      </p>
    </div>
  );
}
