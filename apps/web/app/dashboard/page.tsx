'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, UserCircle, LogOut, FolderKanban, ClipboardList, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">업무 현황 대시보드</h2>
        <p className="text-slate-500">신한카드 운영 및 고도화 업무를 체계적으로 관리합니다.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-xl transition-all border-none shadow-md overflow-hidden group rounded-2xl">
          <div className="h-2 bg-shinhan-blue group-hover:h-3 transition-all"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold">
              <div className="p-2 bg-blue-50 rounded-xl mr-3">
                <FolderKanban className="h-6 w-6 text-shinhan-blue" />
              </div>
              프로젝트 관리
            </CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              진행 중인 프로젝트를 확인하고 새로운 업무를 등록합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-shinhan-blue hover:bg-shinhan-darkblue shadow-lg shadow-blue-200 rounded-xl" asChild>
              <Link href="/projects">이동하기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all border-none shadow-md overflow-hidden group rounded-2xl">
          <div className="h-2 bg-emerald-500 group-hover:h-3 transition-all"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold">
              <div className="p-2 bg-emerald-50 rounded-xl mr-3">
                <ClipboardList className="h-6 w-6 text-emerald-500" />
              </div>
              업무 관리
            </CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              나에게 할당된 업무를 확인하고 진행 상태를 업데이트합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 rounded-xl" asChild>
              <Link href="/tasks">이동하기</Link>
            </Button>
          </CardContent>
        </Card>

        {(user?.role === 'PM' || user?.role === 'PL') && (
          <Card className="hover:shadow-xl transition-all border-none shadow-md overflow-hidden group rounded-2xl">
            <div className="h-2 bg-shinhan-gold group-hover:h-3 transition-all"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-yellow-50 rounded-xl mr-3">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                사용자 관리
              </CardTitle>
              <CardDescription className="text-slate-500 mt-2">
                팀원의 등급과 파트 권한을 설정하고 상태를 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full border-shinhan-blue text-shinhan-blue hover:bg-blue-50 rounded-xl" variant="outline" asChild>
                <Link href="/admin/users">관리하기</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
