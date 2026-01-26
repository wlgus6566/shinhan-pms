'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
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
    return (
      <div className="min-h-screen bg-[#1e1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1f2e] flex">
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-lg tracking-tight">
                Emotion PMS
              </h1>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white">
            <CardHeader className="space-y-3 pt-8 pb-2">
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                로그인
              </h2>
              <CardDescription className="text-slate-500 text-center">
                계정에 로그인하여 대시보드에 접속하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-4">
              <LoginForm />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400">또는</span>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  테스트 계정
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">
                    <span className="text-slate-400">이메일:</span>{' '}
                    admin@emotion.co.kr <br />
                    kim@emotion.co.kr <br />
                    lee@emotion.co.kr <br />
                    park@emotion.co.kr <br />
                    choi@emotion.co.kr <br />
                    jung@emotion.co.kr <br />
                    yoon@emotion.co.kr <br />
                    lim@emotion.co.kr <br />
                  </p>
                  <p className="text-slate-600">
                    <span className="text-slate-400">비밀번호:</span>{' '}
                    password123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
