'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WorkAreaDistributionItem, WorkArea } from '@repo/schema';
import { WORK_AREA_LABELS_STRICT } from '@/lib/constants/project';

interface WorkAreaDistributionChartProps {
  data: WorkAreaDistributionItem[];
  isLoading: boolean;
}

const COLORS: Record<string, string> = {
  PROJECT_MANAGEMENT: '#6366f1',
  PLANNING: '#3b82f6',
  DESIGN: '#10b981',
  FRONTEND: '#f59e0b',
  BACKEND: '#ef4444',
};

export function WorkAreaDistributionChart({ data, isLoading }: WorkAreaDistributionChartProps) {
  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">로딩 중...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">데이터가 없습니다</div>;
  }

  const chartData = data.map((item) => ({
    name: WORK_AREA_LABELS_STRICT[item.workArea as WorkArea] || item.workArea,
    value: item.hours,
    originalKey: item.workArea,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.originalKey] || '#999'} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number | undefined) => value ? [`${value.toFixed(1)}시간`, '작업 시간'] : ['-', '작업 시간']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
