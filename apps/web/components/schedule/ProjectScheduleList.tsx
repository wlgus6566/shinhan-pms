'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Users, Plus, Trash2, Pencil } from 'lucide-react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleForm } from './ScheduleForm';
import { SelectedDateScheduleList } from './SelectedDateScheduleList';
import type { Schedule, ScheduleType, CreateScheduleRequest, TeamScope } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_COLORS, PARTICIPANT_STATUS_LABELS, PARTICIPANT_STATUS_COLORS, TEAM_SCOPE_LABELS, TEAM_SCOPE_FILTER_COLORS } from '@/types/schedule';
import type { ProjectMember } from '@/types/project';
import { getProjectSchedules, createProjectSchedule, updateSchedule, deleteSchedule } from '@/lib/api/schedules';
import { getProjectMembers } from '@/lib/api/projectMembers';
import { cn } from '@/lib/utils';

interface ProjectScheduleListProps {
  projectId: string;
}

export function ProjectScheduleList({ projectId }: ProjectScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<ScheduleType[]>([]);
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

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedTeams([]);
  };

  // Calculate available team scopes based on project members
  const availableTeamScopes = useMemo(() => {
    const workAreas = new Set(projectMembers.map(m => m.workArea));
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

    // 1. Filter by schedule type
    if (selectedTypes.length > 0) {
      result = result.filter(schedule => selectedTypes.includes(schedule.scheduleType));
    }

    // 2. Filter by team scope
    if (selectedTeams.length > 0) {
      result = result.filter(schedule =>
        schedule.teamScope && selectedTeams.includes(schedule.teamScope)
      );
    }

    // 3. Sort by start date (ascending - earliest first)
    result.sort((a, b) => a.startDate.localeCompare(b.startDate));

    return result;
  }, [schedules, selectedTypes, selectedTeams]);

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
      setSchedules(schedules.filter(s => s.id !== scheduleId));
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
        setSchedules(schedules.map(s => s.id === updated.id ? updated : s));
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
    setSelectedTeams(prev =>
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
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
            <h3 className="text-sm font-semibold text-slate-700 mb-3">팀별 필터</h3>
            <div className="space-y-2">
              {availableTeamScopes.map(teamScope => (
                <label
                  key={teamScope}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(teamScope)}
                    onChange={() => toggleTeamFilter(teamScope)}
                    className="rounded border-slate-300 text-emotion-primary focus:ring-emotion-primary"
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TEAM_SCOPE_FILTER_COLORS[teamScope] }}
                  />
                  <span className="text-sm text-slate-700">
                    {TEAM_SCOPE_LABELS[teamScope]}
                  </span>
                </label>
              ))}
            </div>
            {selectedTeams.length > 0 && (
              <button
                onClick={resetFilters}
                className="text-sm text-slate-600 hover:text-slate-900 underline mt-3"
              >
                필터 초기화
              </button>
            )}
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
        <DialogContent className="max-w-2xl">
          {selectedSchedule && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-xl">{selectedSchedule.title}</DialogTitle>
                  <Badge className={cn('text-xs', SCHEDULE_TYPE_COLORS[selectedSchedule.scheduleType])}>
                    {SCHEDULE_TYPE_LABELS[selectedSchedule.scheduleType]}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 날짜 및 시간 */}
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {format(parseISO(selectedSchedule.startDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                      {' '}
                      {selectedSchedule.isAllDay ? (
                        <span className="text-slate-500">하루 종일</span>
                      ) : (
                        <>
                          {format(parseISO(selectedSchedule.startDate), 'HH:mm')}
                          {' ~ '}
                          {format(parseISO(selectedSchedule.endDate), 'HH:mm')}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* 장소 */}
                {selectedSchedule.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-700">{selectedSchedule.location}</p>
                  </div>
                )}

                {/* 참가자 */}
                {selectedSchedule.participants && selectedSchedule.participants.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        참가자 ({selectedSchedule.participants.length}명)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSchedule.participants.map(participant => (
                          <div
                            key={participant.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <span className="text-sm font-medium text-slate-700">
                              {participant.name}
                            </span>
                            <Badge className={cn('text-xs', PARTICIPANT_STATUS_COLORS[participant.status])}>
                              {PARTICIPANT_STATUS_LABELS[participant.status]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 설명 */}
                {selectedSchedule.description && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedSchedule.description}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedSchedule.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </Button>
                <Button
                  onClick={() => handleEdit(selectedSchedule)}
                  className="gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </Button>
              </DialogFooter>
            </>
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
