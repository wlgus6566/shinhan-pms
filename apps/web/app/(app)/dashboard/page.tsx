'use client';

import Link from 'next/link';
import { memo, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCountUp } from '@/hooks/useCountUp';
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
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { useDashboardStats, useDashboardTimeline } from '@/lib/api/dashboard';
import { useMyProjects } from '@/lib/api/projects';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  POSITION_LABELS,
  DEPARTMENT_LABELS,
  type Position,
  type Department,
} from '@repo/schema';

// Hoist static data outside component (rendering-hoist-jsx)
const colorClassesMap = {
  blue: {
    bar: 'from-blue-400 via-blue-500 to-cyan-400',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    cardBg: 'from-blue-50/50 to-transparent',
  },
  emerald: {
    bar: 'from-emerald-400 via-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-500',
    cardBg: 'from-emerald-50/50 to-transparent',
  },
  amber: {
    bar: 'from-amber-400 via-amber-500 to-orange-400',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
    cardBg: 'from-amber-50/50 to-transparent',
  },
  rose: {
    bar: 'from-rose-400 via-rose-500 to-pink-400',
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-500',
    cardBg: 'from-rose-50/50 to-transparent',
  },
  sky: {
    bar: 'from-sky-400 via-sky-500 to-cyan-400',
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-500',
    cardBg: 'from-sky-50/50 to-transparent',
  },
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
  icon: Icon,
  color = 'blue',
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'sky';
  isLoading?: boolean;
}) {
  const colorClass = colorClassesMap[color];

  // 숫자 부분만 추출하여 카운트업 적용
  const numericValue = typeof value === 'number'
    ? value
    : parseFloat(value) || 0;
  const suffix = typeof value === 'string' ? value.replace(/[\d.]/g, '') : '';
  const animatedValue = useCountUp(isLoading ? 0 : numericValue);

  const displayValue = suffix
    ? `${animatedValue % 1 === 0 ? animatedValue : animatedValue.toFixed(1)}${suffix}`
    : animatedValue;

  return (
    <div className={`relative bg-gradient-to-br ${colorClass.cardBg} bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200`}>
      {/* Left gradient bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colorClass.bar}`}
      />
      <div className="pl-5 pr-4 py-8">
        <div className="flex items-center gap-3">
          {/* Icon in circle */}
          <div
            className={`w-10 h-10 rounded-full ${colorClass.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`h-5 w-5 ${colorClass.iconText}`} />
          </div>
          {/* Value and label */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-900 leading-none tabular-nums">
                  {displayValue}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate">{label}</p>
              </>
            )}
          </div>
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
      <Card className="border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200 h-full">
        <CardHeader>
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

const scheduleTypeLabels: Record<string, string> = {
  MEETING: '회의',
  SCRUM: '스크럼',
  VACATION: '휴가',
  HALF_DAY: '반차',
  OTHER: '기타',
};

const scheduleTypeColors: Record<string, string> = {
  MEETING: 'bg-blue-500',
  SCRUM: 'bg-emerald-500',
  VACATION: 'bg-amber-500',
  HALF_DAY: 'bg-rose-500',
  OTHER: 'bg-slate-500',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { timeline, isLoading: timelineLoading } = useDashboardTimeline();
  const { projects } = useMyProjects();

  // PM 프로젝트 조회 및 필터링
  const pmProjects = useMemo(
    () => projects?.filter((p) => p.myRole === 'PM') || [],
    [projects],
  );

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
    <div className="space-y-8 page-animate">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
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
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4 xl:gap-6">
        <Card className="p-6 border-slate-100 shadow-sm flex flex-col align-center justify-center">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 mb-3 border-2 border-slate-200">
              {user?.profileImage && (
                <AvatarImage src={user.profileImage} alt={user.name} />
              )}
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                {user?.name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg text-slate-900">
              {user?.name || '사용자'}{' '}
              {user?.position
                ? POSITION_LABELS[user.position as Position]
                : '리더'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user?.department
                ? DEPARTMENT_LABELS[user.department as Department]
                : '-'}
            </p>
          </div>

          {/* Today Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium mb-1">오늘 만료 예정</p>
              <p className="text-4xl font-bold tracking-tight">
                {stats?.today?.tasksDue || 0}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium mb-1">오늘의 일정</p>
              <p className="text-4xl font-bold tracking-tight">
                {stats?.today?.schedules || 0}
              </p>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          {/* Stats Grid */}
          <section>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
              <StatsCard
                label="진행중 프로젝트"
                value={stats?.projects.active ?? 0}
                icon={FolderKanban}
                color="blue"
                isLoading={statsLoading}
              />
              <StatsCard
                label="내 업무 (진행중)"
                value={stats?.myTasks.inProgress ?? 0}
                icon={Clock}
                color="emerald"
                isLoading={statsLoading}
              />
              <StatsCard
                label="이번 주 작업시간"
                value={`${stats?.thisWeekWorkHours.toFixed(1) ?? 0}h`}
                icon={CheckCircle2}
                color="amber"
                isLoading={statsLoading}
              />
              <StatsCard
                label="중요 업무"
                value={stats?.myTasks.high ?? 0}
                icon={AlertCircle}
                color="rose"
                isLoading={statsLoading}
              />
            </div>
          </section>
          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              바로가기
            </h2>
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {pmProjects.length > 0 ? (
                <>
                  {pmProjects.slice(0, 3).map((project) => (
                    <QuickActionCard
                      key={project.id}
                      title={project.name + ' 업무 관리'}
                      description="팀 업무일지를 확인하고 관리합니다"
                      href={`/projects/${project.id}?tab=team-logs`}
                      icon={FileText}
                      color="emerald"
                    />
                  ))}
                </>
              ) : (
                <QuickActionCard
                  title="업무일지 작성"
                  description="오늘의 업무 내용을 기록합니다"
                  href="/work-logs"
                  icon={ClipboardList}
                  color="emerald"
                />
              )}
              <QuickActionCard
                title="프로젝트 관리"
                description="진행 중인 프로젝트를 확인하고 관리합니다"
                href="/projects"
                icon={FolderKanban}
                color="blue"
              />
              <QuickActionCard
                title="일정 확인"
                description="팀 캘린더와 일정을 확인합니다"
                href="/schedule"
                icon={Calendar}
                color="amber"
              />
            </div>
          </section>
        </div>
      </div>

      {/* Recent Activity & Upcoming Schedules */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">팀 활동</CardTitle>
            <CardDescription>최근 업무일지 및 업무 생성 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : timeline?.recentActivities &&
              timeline.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {timeline.recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {activity.type === 'worklog' ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ClipboardList className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        <span className="font-medium">
                          {activity.user.name}
                        </span>
                        <span className="text-slate-500">
                          {' '}
                          - {activity.title}
                        </span>
                      </p>
                      {activity.project && (
                        <p className="text-xs text-slate-400 truncate">
                          {activity.project.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                최근 활동이 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Schedules */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              다가오는 일정
            </CardTitle>
            <CardDescription>예정된 일정과 마일스톤입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : timeline?.upcomingSchedules &&
              timeline.upcomingSchedules.length > 0 ? (
              <div className="space-y-3">
                {timeline.upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className={`w-1.5 h-8 rounded-full ${
                        scheduleTypeColors[schedule.scheduleType] ||
                        'bg-slate-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {schedule.title || '제목 없음'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {scheduleTypeLabels[schedule.scheduleType] ||
                          schedule.scheduleType}
                        {' · '}
                        {new Date(schedule.startDate).toLocaleDateString(
                          'ko-KR',
                          {
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </p>
                    </div>
                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">
                예정된 일정이 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
