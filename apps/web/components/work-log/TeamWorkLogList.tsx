'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { WorkLogCalendar } from './WorkLogCalendar';
import type { WorkLog } from '@/types/work-log';
import type { ProjectMember } from '@/types/project';

interface TeamWorkLogListProps {
  projectId: string;
  members: ProjectMember[];
}

export function TeamWorkLogList({ projectId, members }: TeamWorkLogListProps) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [selectedWorkArea, setSelectedWorkArea] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkLogs = async () => {
      setLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const params = new URLSearchParams({
          projectId,
          startDate,
          endDate,
        });

        const response = await fetch(`/api/work-logs?${params}`);
        const data = await response.json();
        setWorkLogs(data);
      } catch (error) {
        console.error('Failed to fetch work logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkLogs();
  }, [projectId, currentMonth]);

  const memberMap = new Map(members.map(m => [m.memberId.toString(), m.member]));
  const workAreaMap = new Map(members.map(m => [m.memberId.toString(), m.workArea]));

  // 담당 분야별 필터링된 업무일지
  const filteredWorkLogs = useMemo(() => {
    if (selectedWorkArea === 'all') {
      return workLogs;
    }
    // 선택한 분야의 멤버 ID들 추출
    const memberIdsInWorkArea = members
      .filter(m => m.workArea === selectedWorkArea)
      .map(m => m.memberId.toString());

    return workLogs.filter(log => memberIdsInWorkArea.includes(log.userId));
  }, [workLogs, selectedWorkArea, members]);

  // 선택한 날짜의 업무일지들
  const selectedDateLogs = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return filteredWorkLogs.filter(log => log.workDate === dateStr);
  }, [selectedDate, filteredWorkLogs]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const logsForDate = filteredWorkLogs.filter(log => log.workDate === dateStr);

    if (logsForDate.length > 0) {
      setDialogOpen(true);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(startOfMonth(date));
  };

  const workAreaLabels: Record<string, string> = {
    all: '전체',
    PLANNING: '기획',
    DESIGN: '디자인',
    FRONTEND: '프론트엔드',
    BACKEND: '백엔드',
    OPERATION: '운영',
    PROJECT_MANAGEMENT: 'PM',
  };

  // 프로젝트에 있는 담당 분야 목록 추출
  const availableWorkAreas = useMemo(() => {
    const areas = new Set(members.map(m => m.workArea));
    return Array.from(areas).sort();
  }, [members]);

  return (
    <div className="space-y-6">
      {/* 담당 분야 필터 */}
      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-xs">
          <label className="text-sm font-medium mb-2 block">담당 분야 선택</label>
          <Select value={selectedWorkArea} onValueChange={setSelectedWorkArea}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {availableWorkAreas.map(area => (
                <SelectItem key={area} value={area}>
                  {workAreaLabels[area] || area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 캘린더 */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로드 중...</p>
        </div>
      ) : (
        <WorkLogCalendar
          workLogs={filteredWorkLogs}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
        />
      )}

      {/* 업무일지 상세 모달 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })} 팀 업무일지
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDateLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                오늘 작성된 업무일지가 없습니다
              </p>
            ) : (
              selectedDateLogs.map(log => (
                <Card key={log.id} className="border-slate-200">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {/* 헤더: 작성자, 작업명 */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {log.user?.name || memberMap.get(log.userId)?.name || '알 수 없음'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({log.user?.email || memberMap.get(log.userId)?.email || ''})
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-800">
                            {log.task?.taskName || '작업명 없음'}
                          </p>
                        </div>
                      </div>

                      {/* 내용 */}
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {log.content}
                        </p>
                      </div>

                      {/* 통계 */}
                      <div className="flex flex-wrap gap-3">
                        {log.workHours !== null && log.workHours !== undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{log.workHours}시간</span>
                          </div>
                        )}

                        {log.progress !== null && log.progress !== undefined && (
                          <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={'h-full rounded-full transition-all bg-primary'}
                              style={{ width: `${log.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {log.progress}% 진행
                          </span>
                        </div>
                        )}

                        {log.issues && (
                          <div className="flex items-center gap-1 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="font-medium">이슈 있음</span>
                          </div>
                        )}
                      </div>

                      {/* 이슈 내용 */}
                      {log.issues && (
                        <div className="bg-orange-50 p-3 rounded border border-orange-200">
                          <p className="text-xs font-medium text-orange-700 mb-1">이슈:</p>
                          <p className="text-xs text-orange-700">{log.issues}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
