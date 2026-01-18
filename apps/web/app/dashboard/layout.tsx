'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-shinhan-lightgray">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shinhan-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[1024px] bg-shinhan-lightgray">
      {/* 고정 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 (사이드바 너비만큼 왼쪽 여백) */}
      <div className="pl-[240px] transition-all duration-300">
        {/* 상단 헤더 */}
        <Header />

        {/* 페이지 콘텐츠 */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
