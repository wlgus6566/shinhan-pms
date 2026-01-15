'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, UserCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-shinhan-lightgray">
      <header className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-shinhan-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg italic">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-shinhan-blue tracking-tight">SHINHAN CARD <span className="font-light text-slate-500 ml-1">PMS</span></h1>
            </div>
          </Link>
          <div className="flex gap-3">
            {user && (
              <>
                <Button variant="outline" size="sm" asChild className="border-blue-200 hover:bg-blue-50">
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4 text-shinhan-blue" />
                    {user.name} ({user.role})
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-shinhan-blue">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">업무 현황 대시보드</h2>
          <p className="text-slate-500">신한카드 운영 및 고도화 업무를 체계적으로 관리합니다.</p>
        </section>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-xl transition-all border-none shadow-md overflow-hidden group">
            <div className="h-2 bg-shinhan-blue group-hover:h-3 transition-all"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <LayoutDashboard className="h-6 w-6 text-shinhan-blue" />
                </div>
                프로젝트 관리
              </CardTitle>
              <CardDescription className="text-slate-500 mt-2">
                진행 중인 프로젝트를 확인하고 새로운 업무를 등록합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-shinhan-blue hover:bg-shinhan-darkblue shadow-lg shadow-blue-200" asChild>
                <Link href="/projects">이동하기</Link>
              </Button>
            </CardContent>
          </Card>

          {(user?.role === 'PM' || user?.role === 'PL') && (
            <Card className="hover:shadow-xl transition-all border-none shadow-md overflow-hidden group">
              <div className="h-2 bg-shinhan-gold group-hover:h-3 transition-all"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <div className="p-2 bg-yellow-50 rounded-lg mr-3">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  사용자 관리
                </CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                  팀원의 등급과 파트 권한을 설정하고 상태를 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full border-shinhan-blue text-shinhan-blue hover:bg-blue-50" variant="outline" asChild>
                  <Link href="/admin/users">관리하기</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
