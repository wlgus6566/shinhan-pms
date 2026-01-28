'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useMyProjects } from '@/lib/api/projects';
import {
  useMyProductivity,
  useWorkAreaDistribution,
  usePartTaskCount,
  usePartWorkHours,
  useTaskStatusCount,
} from '@/lib/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonthPicker } from '@/components/ui/month-picker';
import { ProductivityStats } from '@/components/analytics/ProductivityStats';
import { WorkAreaDistributionChart } from '@/components/analytics/WorkAreaDistributionChart';
import { PartTaskCountChart } from '@/components/analytics/PartTaskCountChart';
import { PartWorkHoursChart } from '@/components/analytics/PartWorkHoursChart';
import { TaskStatusCountChart } from '@/components/analytics/TaskStatusCountChart';
import type { PartTaskCount, PartWorkHours } from '@repo/schema';

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM'),
  );
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();

  // 내 프로젝트 목록 조회
  const { projects, isLoading: projectsLoading } = useMyProjects();

  // 선택된 프로젝트의 통계 조회
  const { productivity, isLoading: productivityLoading } = useMyProductivity(
    selectedProjectId,
    selectedMonth,
  );

  const { distribution, isLoading: distributionLoading } =
    useWorkAreaDistribution(selectedProjectId, selectedMonth);

  const { data: partTaskCountData, isLoading: taskCountLoading } =
    usePartTaskCount(selectedProjectId, selectedMonth);

  const { data: partWorkHoursData, isLoading: workHoursLoading } =
    usePartWorkHours(selectedProjectId, selectedMonth);

  const { data: taskStatusCountData, isLoading: statusCountLoading } =
    useTaskStatusCount(selectedProjectId, selectedMonth);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // 첫 번째 프로젝트 자동 선택
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]?.id);
    }
  }, [projects, selectedProjectId]);

  if (projectsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">
            프로젝트 목록을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">프로젝트가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">프로젝트 리포트</h1>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <Tabs value={selectedProjectId} onValueChange={handleProjectChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {projects.map((project) => (
            <TabsTrigger key={project.id} value={project.id}>
              {project.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {projects.map((project) => (
          <TabsContent
            key={project.id}
            value={project.id}
            className="space-y-6"
          >
            {/* 통계 카드 */}
            <ProductivityStats
              stats={productivity || undefined}
              isLoading={productivityLoading}
            />

            <div className="flex flex-col gap-10">
              {/* 상태별 진행 건수 & 분야별 작업 시간 분포 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 상태별 진행 건수 */}
                <Card>
                  <CardHeader>
                    <CardTitle>상태별 진행 건수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaskStatusCountChart
                      data={taskStatusCountData?.statusCounts || []}
                      isLoading={statusCountLoading}
                    />
                  </CardContent>
                </Card>

                {/* 분야별 작업 시간 분포 */}
                <Card>
                  <CardHeader>
                    <CardTitle>분야별 작업 시간 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WorkAreaDistributionChart
                      data={distribution}
                      isLoading={distributionLoading}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 파트별 담당 업무 건수 */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  파트별 담당 업무 건수
                </h2>
                {taskCountLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    로딩 중...
                  </div>
                ) : partTaskCountData?.parts &&
                  partTaskCountData.parts.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {partTaskCountData.parts.map((part: PartTaskCount) => (
                      <PartTaskCountChart key={part.workArea} part={part} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      데이터가 없습니다
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 파트별 일일 평균 근무 시간 */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  파트별 일일 평균 근무 시간
                </h2>
                {workHoursLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    로딩 중...
                  </div>
                ) : partWorkHoursData?.parts &&
                  partWorkHoursData.parts.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {partWorkHoursData.parts.map((part: PartWorkHours) => (
                      <PartWorkHoursChart key={part.workArea} part={part} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      데이터가 없습니다
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
