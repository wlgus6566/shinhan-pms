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
    if (!loading && user && !user.requirePasswordChange) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  // requirePasswordChange가 true인 경우 로그인 페이지에 머물러서 알럿을 표시
  if (user && !user.requirePasswordChange) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-[#1e1f2e] relative overflow-hidden flex-col justify-between p-10">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 -left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Emotion PMS
          </span>
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            이모션의
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              프로젝트 관리 시스템
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            팀 업무 관리, 일정 추적, 리포트 분석까지.
            <br />
            프로젝트의 모든 것을 한 곳에서 관리하세요.
          </p>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-slate-600">
          &copy; 2026 Emotion Inc. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">E</span>
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
                로그인하여 프로젝트 및 업무 관리를 시작하세요
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
