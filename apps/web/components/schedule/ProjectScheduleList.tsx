'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleForm } from './ScheduleForm';
import { SelectedDateScheduleList } from './SelectedDateScheduleList';
import type {
  Schedule,
  CreateScheduleRequest,
  TeamScope,
} from '@/types/schedule';
import { TEAM_SCOPE_LABELS, TEAM_SCOPE_FILTER_COLORS } from '@/types/schedule';
import type { ProjectMember } from '@/types/project';
import {
  getProjectSchedules,
  createProjectSchedule,
  updateSchedule,
  deleteSchedule,
} from '@/lib/api/schedules';
import { getProjectMembers } from '@/lib/api/projectMembers';

interface ProjectScheduleListProps {
  projectId: string;
}

export function ProjectScheduleList({ projectId }: ProjectScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
          schedule.teamScope && selectedTeams.includes(schedule.teamScope),
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
    setCurrentMonth(startOfMonth(date));
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingSchedule(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setDetailDialogOpen(false);
    setFormDialogOpen(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteSchedule(scheduleId);
      setSchedules(schedules.filter((s) => s.id !== scheduleId));
      setDetailDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const handleFormSubmit = async (data: CreateScheduleRequest) => {
    setSubmitting(true);
    try {
      if (editingSchedule) {
        // Update
        const updated = await updateSchedule(editingSchedule.id, data);
        setSchedules(schedules.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        // Create
        const created = await createProjectSchedule(projectId, data);
        setSchedules([...schedules, created]);
      }

      setFormDialogOpen(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('일정 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTeamFilter = (team: TeamScope) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team],
    );
  };

  return (
    <div className="relative">
      {/* Two-column layout: Sidebar (filters + selected date list) and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-6">
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
        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">로드 중...</p>
            </div>
          ) : (
            <ScheduleCalendar
              schedules={filteredSchedules}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              onScheduleClick={handleScheduleClick}
            />
          )}
        </div>
      </div>

      {/* 일정 상세 모달 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>일정 상세</DialogTitle>
          </DialogHeader>

          {selectedSchedule && (
            <ScheduleForm
              schedule={selectedSchedule}
              projectId={projectId}
              onSubmit={() => {}}
              onCancel={() => setDetailDialogOpen(false)}
              viewMode={true}
              onEdit={() => handleEdit(selectedSchedule)}
              onDelete={() => handleDelete(selectedSchedule.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 일정 생성/수정 폼 모달 */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? '일정 수정' : '새 일정 추가'}
            </DialogTitle>
          </DialogHeader>

          <ScheduleForm
            schedule={editingSchedule}
            projectId={projectId}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormDialogOpen(false);
              setEditingSchedule(null);
            }}
            isLoading={submitting}
          />
        </DialogContent>
      </Dialog>

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
