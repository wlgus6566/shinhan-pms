'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleCalendarSkeleton } from './skeleton/ScheduleCalendarSkeleton';
import { ScheduleSidebarSkeleton } from './skeleton/ScheduleSidebarSkeleton';
import { ScheduleDialog } from './ScheduleDialog';
import { SelectedDateScheduleList } from './SelectedDateScheduleList';
import type { Schedule, TeamScope } from '@/types/schedule';
import { TEAM_SCOPE_LABELS, TEAM_SCOPE_FILTER_COLORS } from '@/types/schedule';
import type { ProjectMember } from '@/types/project';
import { getProjectSchedules } from '@/lib/api/schedules';
import { getProjectMembers } from '@/lib/api/projectMembers';

interface ProjectScheduleListProps {
  projectId: string;
}

type DialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'view' | 'edit'; schedule: Schedule };

export function ProjectScheduleList({ projectId }: ProjectScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [loading, setLoading] = useState(true);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  // Filter state
  const [selectedTeams, setSelectedTeams] = useState<TeamScope[]>([]);

  // Fetch project members for dynamic team filtering
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const members = await getProjectMembers(projectId);
        setProjectMembers(members);
      } catch (error) {
        console.error('Failed to fetch project members:', error);
      }
    };
    fetchMembers();
  }, [projectId]);

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

    // 2. Sort by start date (ascending - earliest first)
    result.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return result;
  }, [schedules, selectedTeams]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
      <div className="flex gap-6">
        {loading ? (
          <>
            <ScheduleSidebarSkeleton />
            <div className="flex-1">
              <ScheduleCalendarSkeleton />
            </div>
          </>
        ) : (
          <>
            {/* Left Sidebar */}
            <div className="flex flex-col gap-6 w-[30%]">
              {/* Team Filter */}
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

              {/* Selected Date Schedule List */}
              <SelectedDateScheduleList
                schedules={filteredSchedules}
                selectedDate={selectedDate}
                onScheduleClick={handleScheduleClick}
              />
            </div>

            {/* Right Content - Calendar */}
            <div className="flex-1">
              <ScheduleCalendar
                schedules={filteredSchedules}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
                onScheduleClick={handleScheduleClick}
              />
            </div>
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
      />

      {/* Floating Action Button */}
      <Button
        onClick={handleCreateNew}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
