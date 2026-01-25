import type { EventInput } from '@fullcalendar/core';
import type { WorkLog } from '@/types/work-log';

/**
 * 사용자 ID를 기반으로 일관된 색상을 생성
 */
function getUserColor(userId: string): { bg: string; border: string; text: string } {
  // 미리 정의된 색상 팔레트 (브랜딩 가이드 기반)
  const colorPalette = [
    { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' }, // blue
    { bg: '#E9D5FF', border: '#8B5CF6', text: '#6B21A8' }, // purple
    { bg: '#FCE7F3', border: '#EC4899', text: '#BE185D' }, // pink
    { bg: '#D1FAE5', border: '#10B981', text: '#047857' }, // green
    { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' }, // amber
    { bg: '#DBEAFE', border: '#06B6D4', text: '#0E7490' }, // cyan
    { bg: '#FED7AA', border: '#F97316', text: '#C2410C' }, // orange
    { bg: '#E0E7FF', border: '#6366F1', text: '#4338CA' }, // indigo
  ];

  // 사용자 ID를 해시하여 색상 인덱스 생성
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;

  return colorPalette[index]!;
}

/**
 * WorkLog를 FullCalendar EventInput 형식으로 변환
 */
export function transformWorkLogToEvent(workLog: WorkLog): EventInput {
  const { bg, border, text } = getUserColor(workLog.userId);

  return {
    id: workLog.id,
    title: workLog.task?.taskName || '업무일지',
    start: workLog.workDate,
    end: workLog.workDate,
    allDay: true,
    backgroundColor: bg,
    borderColor: border,
    textColor: text,
    extendedProps: {
      workLog,
      progress: workLog.progress,
      content: workLog.content,
    },
  };
}

/**
 * WorkLog 배열을 FullCalendar EventInput 배열로 변환
 */
export function transformWorkLogsToEvents(workLogs: WorkLog[]): EventInput[] {
  return workLogs.map(transformWorkLogToEvent);
}
