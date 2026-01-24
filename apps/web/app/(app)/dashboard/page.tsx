'use client';

import Link from 'next/link';
import { memo, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FolderKanban,
  ClipboardList,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Hoist static data outside component (rendering-hoist-jsx)
const colorClassesMap = {
  blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
  rose: 'from-rose-500 to-rose-600 shadow-rose-500/25',
  sky: 'from-sky-500 to-sky-600 shadow-sky-500/25',
} as const;

const actionColorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    hover: 'group-hover:bg-blue-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    hover: 'group-hover:bg-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    hover: 'group-hover:bg-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-500',
    hover: 'group-hover:bg-rose-100',
  },
} as const;

// Stats Card Component (memoized for re-render optimization)
const StatsCard = memo(function StatsCard({
  label,
  value,
  trend,
  trendValue,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: React.ElementType;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'sky';
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trendValue}</span>
              <span className="text-slate-400 ml-1">이번 주</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colorClassesMap[color]} shadow-lg`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
});

// Quick Action Card (memoized for re-render optimization)
const QuickActionCard = memo(function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color = 'blue',
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color?: 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const colorClass = actionColorClasses[color];

  return (
    <Link href={href} className="group">
      <Card className="border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.hover} transition-colors`}
            >
              <Icon className={`h-6 w-6 ${colorClass.icon}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {title}
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm mt-0.5">
                {description}
              </CardDescription>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
});

// Hoist static activity data (rendering-hoist-jsx)
const recentActivities = [
  {
    user: '김철수',
    action: '프로젝트 A 업무 완료',
    time: '10분 전',
    avatar: '김',
  },
  { user: '이영희', action: '새 업무 생성', time: '30분 전', avatar: '이' },
  { user: '박민수', action: '댓글 추가', time: '1시간 전', avatar: '박' },
] as const;

const upcomingEvents = [
  { title: '프로젝트 A 킥오프', date: '월', color: 'bg-blue-500' },
  { title: '주간 팀 미팅', date: '화', color: 'bg-emerald-500' },
  { title: '클라이언트 리뷰', date: '목', color: 'bg-amber-500' },
] as const;

export default function DashboardPage() {
  const { user } = useAuth();

  // Memoize formatted date (js-cache-function-results)
  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
    [],
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <section className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            안녕하세요, {user?.name}님
          </h1>
          <p className="text-slate-500 mt-1">오늘의 업무 현황을 확인하세요.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">{formattedDate}</p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        <StatsCard
          label="진행중 프로젝트"
          value="12"
          trend="up"
          trendValue="+3"
          icon={FolderKanban}
          color="blue"
        />
        <StatsCard
          label="완료된 업무"
          value="48"
          trend="up"
          trendValue="+12"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          label="대기중 업무"
          value="8"
          trend="down"
          trendValue="-2"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          label="긴급 이슈"
          value="2"
          icon={AlertCircle}
          color="rose"
        />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">바로가기</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="프로젝트 관리"
            description="진행 중인 프로젝트를 확인하고 관리합니다"
            href="/projects"
            icon={FolderKanban}
            color="blue"
          />
          <QuickActionCard
            title="업무 관리"
            description="할당된 업무를 확인하고 업데이트합니다"
            href="/tasks"
            icon={ClipboardList}
            color="emerald"
          />
          {(user?.role === 'PM' || user?.role === 'PL') && (
            <QuickActionCard
              title="회원 관리"
              description="팀원의 권한과 상태를 관리합니다"
              href="/admin/users"
              icon={Users}
              color="amber"
            />
          )}
        </div>
      </section>

      {/* Recent Activity - Placeholder */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">최근 활동</CardTitle>
            <CardDescription>팀의 최근 활동 내역입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-slate-500">
                        {' '}
                        - {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              이번 주 일정
            </CardTitle>
            <CardDescription>다가오는 마일스톤과 일정입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className={`w-1.5 h-8 rounded-full ${event.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-400">{event.date}요일</p>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
