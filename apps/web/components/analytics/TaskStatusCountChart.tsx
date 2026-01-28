'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TaskStatusCountItem, TaskStatus } from '@repo/schema';
import { TASK_STATUS_METADATA } from '@repo/schema';

interface TaskStatusCountChartProps {
  data: TaskStatusCountItem[];
  isLoading: boolean;
}

// TaskStatus에 맞는 차트 색상 정의
const TASK_STATUS_CHART_COLORS: Record<TaskStatus, string> = {
  WAITING: '#9CA3AF', // gray
  IN_PROGRESS: '#3B82F6', // blue
  WORK_COMPLETED: '#22C55E', // green
  TESTING: '#A855F7', // purple
  OPEN_WAITING: '#F59E0B', // amber
  OPEN_RESPONDING: '#EF4444', // orange
  COMPLETED: '#16A34A', // emerald
  SUSPENDED: '#6B7280', // red
};

export function TaskStatusCountChart({
  data,
  isLoading,
}: TaskStatusCountChartProps) {
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        데이터가 없습니다
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: TASK_STATUS_METADATA[item.status as TaskStatus]?.label || item.status,
    value: item.count,
    originalKey: item.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${((percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                TASK_STATUS_CHART_COLORS[entry.originalKey as TaskStatus] ||
                '#999'
              }
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) =>
            value ? [`${value}건`, '업무 건수'] : ['-', '업무 건수']
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
