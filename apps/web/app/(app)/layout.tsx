'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-emotion-lightgray">
      {/* 사이드바 (데스크톱: 고정, 모바일: 드로어) */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 메인 콘텐츠 영역 */}
      <div
        className={cn(
          'transition-all duration-300',
          'pl-0',
          sidebarOpen ? 'lg:pl-[240px]' : 'lg:pl-[72px]',
        )}
      >
        {/* 상단 헤더 */}
        <Header
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* 페이지 콘텐츠 */}
        <main className="p-4 md:p-6 lg:p-8" style={{ viewTransitionName: 'page-content' }}>
          {children}
        </main>
      </div>

      {/* Toast 알림 */}
      <Toaster />
    </div>
  );
}
