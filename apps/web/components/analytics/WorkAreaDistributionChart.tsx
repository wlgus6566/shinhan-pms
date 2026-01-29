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
      <PieChart
        style={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont',
        }}
      >
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={({ percent }) =>
            percent && percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
          }
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={WORK_AREA_COLORS[entry.originalKey as WorkArea] || '#999'}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 12,
          }}
          labelStyle={{
            color: '#334155',
            fontWeight: 600,
          }}
          itemStyle={{
            color: '#475569',
          }}
          formatter={(value: number | undefined) =>
            value
              ? [`${value.toFixed(1)}시간`, '작업 시간']
              : ['-', '작업 시간']
          }
        />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ color: '#475569', fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
