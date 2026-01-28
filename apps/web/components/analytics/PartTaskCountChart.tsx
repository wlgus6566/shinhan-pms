'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { PartTaskCount, WorkArea } from '@repo/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  WORK_AREA_LABELS_STRICT,
  WORK_AREA_COLORS,
} from '@/lib/constants/project';
interface PartTaskCountChartProps {
  part: PartTaskCount;
}

export function PartTaskCountChart({ part }: PartTaskCountChartProps) {
  const chartData = part.members.map((member) => ({
    name: member.userName,
    taskCount: member.taskCount,
  }));

  const partLabel =
    WORK_AREA_LABELS_STRICT[part.workArea as WorkArea] || part.workArea;
  const partColor = WORK_AREA_COLORS[part.workArea as WorkArea] || '#3b82f6';
  const title = (
    <>
      {partLabel} 파트{' '}
      <span className="text-sm text-muted-foreground">
        ({part.members.length}명 / 인당 평균 {part.averageCount}건)
      </span>
    </>
  );

  if (part.members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number | undefined) =>
                value ? [`${value}건`, '담당 업무'] : ['-', '담당 업무']
              }
            />
            <Bar dataKey="taskCount" fill={partColor} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
