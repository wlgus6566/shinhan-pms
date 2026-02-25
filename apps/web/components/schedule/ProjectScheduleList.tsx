'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleDialog } from './ScheduleDialog';
import { SelectedDateScheduleList } from './SelectedDateScheduleList';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { Schedule, TeamScope } from '@/types/schedule';
import { TEAM_SCOPE_LABELS, TEAM_SCOPE_FILTER_COLORS } from '@/types/schedule';
import { getProjectSchedules } from '@/lib/api/schedules';
import { useProjectMembers } from '@/lib/api/projectMembers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectScheduleListProps {
  projectId: string;
}

type DialogState =
  | { open: false }
  | { open: true; mode: 'create'; defaultDate?: Date }
  | { open: true; mode: 'view' | 'edit'; schedule: Schedule };

export function ProjectScheduleList({ projectId }: ProjectScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [loading, setLoading] = useState(true);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Filter state
  const [selectedTeams, setSelectedTeams] = useState<TeamScope[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // Fetch project members using SWR hook
  const { members: projectMembers = [] } = useProjectMembers(projectId);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const data = await getProjectSchedules(projectId, startDate, endDate);
        setSchedules(data);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [projectId, currentMonth]);

  // Calculate available team scopes based on project members
  const availableTeamScopes = useMemo(() => {
    const workAreas = new Set(projectMembers.map((m) => m.workArea));
    const scopes: TeamScope[] = [];

    // Always show ALL if there are any members
    if (projectMembers.length > 0) {
      scopes.push('ALL');
    }

    // Map WorkArea to TeamScope
    if (workAreas.has('PLANNING')) scopes.push('PLANNING');
    if (workAreas.has('DESIGN')) scopes.push('DESIGN');
    if (workAreas.has('FRONTEND')) scopes.push('FRONTEND');
    if (workAreas.has('BACKEND')) scopes.push('BACKEND');

    return scopes;
  }, [projectMembers]);

  // 필터링된 일정 목록
  const filteredSchedules = useMemo(() => {
    let result = [...schedules];

    // 1. Filter by team scope
    if (selectedTeams.length > 0) {
      result = result.filter(
        (schedule) =>
          schedule.teamScope &&
          selectedTeams.includes(schedule.teamScope as any),
      );
    }

    // 2. Filter by member (참여자 또는 생성자 기준)
    if (selectedMember !== 'all') {
      result = result.filter(
        (schedule) =>
          schedule.createdBy === selectedMember ||
          schedule.participants.some((p) => p.id === selectedMember),
      );
    }

    // 3. Sort by start date (ascending - earliest first)
    result.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return result;
  }, [schedules, selectedTeams, selectedMember]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // 모바일에서는 bottom sheet 열기
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setBottomSheetOpen(true);
    }
    // 클릭한 날짜로 일정 추가 다이얼로그 열기
    // setDialogState({ open: true, mode: 'create', defaultDate: date });
  };

  const handleMonthChange = (date: Date) => {
    const newMonth = startOfMonth(date);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth); // Sync selected date to first day of new month
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setDialogState({ open: true, mode: 'view', schedule });
  };

  const handleCreateNew = () => {
    setDialogState({ open: true, mode: 'create' });
  };

  const handleSuccess = async () => {
    // Reload calendar data
    const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    const data = await getProjectSchedules(projectId, startDate, endDate);
    setSchedules(data);
  };

  const toggleTeamFilter = (team: TeamScope) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team],
    );
  };



  return (
    <div className="relative">
      {/* Two-column layout: Sidebar (filters + selected date list) and Calendar */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {loading ? (
          <div className="text-center py-12 w-full">
            <p className="text-muted-foreground">로드 중...</p>
          </div>
        ) : (
          <>
            {/* Left Sidebar - 데스크톱에서만 표시 */}
            <div className="hidden lg:flex flex-col gap-6 w-[30%]">
              {/* Team Filter */}
              {availableTeamScopes.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <div className="space-y-2">
                    {availableTeamScopes.map((teamScope) => (
                      <label
                        key={teamScope}
                        className="flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(teamScope)}
                            onChange={() => toggleTeamFilter(teamScope)}
                            className="rounded border-slate-300 text-emotion-primary focus:ring-emotion-primary"
                          />
                          <span className="text-sm text-slate-700">
                            {TEAM_SCOPE_LABELS[teamScope]}
                          </span>
                        </div>
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: TEAM_SCOPE_FILTER_COLORS[
                              teamScope
                            ] as string,
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Filter */}
              {projectMembers.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="멤버 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 멤버</SelectItem>
                      {projectMembers.map((pm) => (
                        <SelectItem key={pm.memberId} value={pm.memberId}>
                          {pm.member?.name ?? '알 수 없음'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Selected Date Schedule List */}
              <SelectedDateScheduleList
                schedules={filteredSchedules}
                selectedDate={selectedDate}
                onScheduleClick={handleScheduleClick}
              />
            </div>

            {/* Calendar */}
            <div className="flex-1">
              <ScheduleCalendar
                schedules={filteredSchedules}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
                onScheduleClick={handleScheduleClick}
              />
            </div>

            {/* 모바일 Bottom Sheet (스와이프 다운으로 닫기 지원) */}
            <Drawer open={bottomSheetOpen} onOpenChange={setBottomSheetOpen}>
              <DrawerContent className="max-h-[70vh] px-4 pb-6 pt-0 lg:hidden">
                <DrawerHeader className="py-4 sticky top-0 bg-background z-10">
                  <div className="mx-auto w-12 h-1.5 rounded-full bg-slate-300 mb-2" />
                  <DrawerTitle className="text-left text-base">
                    일정 목록
                  </DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto max-h-[calc(70vh-80px)] space-y-4 px-0">
                  {/* Schedule List */}
                  <SelectedDateScheduleList
                    schedules={filteredSchedules}
                    selectedDate={selectedDate}
                    onScheduleClick={(schedule) => {
                      setBottomSheetOpen(false);
                      handleScheduleClick(schedule);
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </>
        )}
      </div>

      {/* 일정 모달 (상세/생성/수정 통합) */}
      <ScheduleDialog
        open={dialogState.open}
        onOpenChange={(open) => !open && setDialogState({ open: false })}
        mode={dialogState.open ? dialogState.mode : 'create'}
        schedule={
          dialogState.open && 'schedule' in dialogState
            ? dialogState.schedule
            : null
        }
        projectId={projectId}
        onSuccess={handleSuccess}
        defaultDate={
          dialogState.open && 'defaultDate' in dialogState
            ? dialogState.defaultDate
            : undefined
        }
      />

      {/* Floating Action Button - Portal to body to escape transform context */}
      {typeof document !== 'undefined' &&
        createPortal(
          <Button
            onClick={handleCreateNew}
            className="gradient-primary border-none fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            size="icon"
          >
            <PenLine className="h-6 w-6" />
          </Button>,
          document.body,
        )}
    </div>
  );
}
