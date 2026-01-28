'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { WorkAreaDistributionItem, WorkArea } from '@repo/schema';
import {
  WORK_AREA_LABELS_STRICT,
  WORK_AREA_COLORS,
} from '@/lib/constants/project';

interface WorkAreaDistributionChartProps {
  data: WorkAreaDistributionItem[];
  isLoading: boolean;
}

export function WorkAreaDistributionChart({
  data,
  isLoading,
}: WorkAreaDistributionChartProps) {
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
    name: WORK_AREA_LABELS_STRICT[item.workArea as WorkArea] || item.workArea,
    value: item.hours,
    originalKey: item.workArea,
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
              fill={WORK_AREA_COLORS[entry.originalKey as WorkArea] || '#999'}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined) =>
            value
              ? [`${value.toFixed(1)}시간`, '작업 시간']
              : ['-', '작업 시간']
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
