'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import type { ProductivityStats } from '@repo/schema';

interface ProductivityStatsProps {
  stats?: ProductivityStats;
  isLoading: boolean;
}

export function ProductivityStats({ stats, isLoading }: ProductivityStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse h-20 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Clock,
      label: '총 작업 시간',
      value: `${stats.totalWorkHours.toFixed(1)}h`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: CheckCircle,
      label: '완료한 업무',
      value: `${stats.completedTasks}건`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: '평균 진행률',
      value: `${stats.averageProgress.toFixed(0)}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: AlertCircle,
      label: '이슈 발생',
      value: `${stats.issueCount}건`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${item.bgColor} ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
