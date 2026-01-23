import type { EventInput } from '@fullcalendar/core';
import type { WorkLog } from '@/types/work-log';

/**
 * WorkLog를 FullCalendar EventInput 형식으로 변환
 */
export function transformWorkLogToEvent(workLog: WorkLog): EventInput {
  return {
    id: workLog.id,
    title: workLog.task?.taskName || '업무일지',
    start: workLog.workDate,
    end: workLog.workDate,
    allDay: true,
    backgroundColor: '#DBEAFE', // blue-100
    borderColor: '#3B82F6', // blue-500
    textColor: '#1E40AF', // blue-700
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
