'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-emotion-lightgray">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emotion-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[1280px] bg-emotion-lightgray">
      {/* 고정 사이드바 */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 메인 콘텐츠 영역 (사이드바 너비만큼 왼쪽 여백) */}
      <div
        className={cn(
          'pl-[240px] transition-all duration-300',
          sidebarOpen ? 'pl-[240px]' : 'pl-[72px]',
        )}
      >
        {/* 상단 헤더 */}
        <Header />

        {/* 페이지 콘텐츠 */}
        <main className="max-w-[1600px] p-8">{children}</main>
      </div>
    </div>
  );
}
