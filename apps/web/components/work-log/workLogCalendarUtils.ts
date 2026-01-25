import type { EventInput } from '@fullcalendar/core';
import type { WorkLog } from '@/types/work-log';

// 미리 정의된 색상 팔레트 (브랜딩 가이드 기반)
const colorPalette = [
  { bg: '#DBEAFE', text: '#1E40AF' }, // blue
  { bg: '#E9D5FF', text: '#6B21A8' }, // purple
  { bg: '#FCE7F3', text: '#BE185D' }, // pink
  { bg: '#D1FAE5', text: '#047857' }, // green
  { bg: '#FEF3C7', text: '#B45309' }, // amber
  { bg: '#CFFAFE', text: '#0E7490' }, // cyan
  { bg: '#FED7AA', text: '#C2410C' }, // orange
  { bg: '#E0E7FF', text: '#4338CA' }, // indigo
];

/**
 * ID를 기반으로 일관된 색상을 생성
 */
function getColorById(id: string | null): { bg: string; text: string } {
  if (!id) {
    return colorPalette[0]!;
  }

  // ID를 해시하여 색상 인덱스 생성
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;

  return colorPalette[index]!;
}

export type ColorBy = 'task' | 'user';

/**
 * WorkLog를 FullCalendar EventInput 형식으로 변환
 * @param colorBy - 'task': 업무별 색상 (내 업무일지), 'user': 작성자별 색상 (팀 업무일지)
 */
export function transformWorkLogToEvent(
  workLog: WorkLog,
  colorBy: ColorBy = 'task',
): EventInput {
  const colorId = colorBy === 'user' ? workLog.userId : workLog.taskId;
  const { bg, text } = getColorById(colorId);

  return {
    id: workLog.id,
    title: workLog.task?.taskName || '업무일지',
    start: workLog.workDate,
    end: workLog.workDate,
    allDay: true,
    backgroundColor: bg,
    borderColor: 'transparent',
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
 * @param colorBy - 'task': 업무별 색상 (내 업무일지), 'user': 작성자별 색상 (팀 업무일지)
 */
export function transformWorkLogsToEvents(
  workLogs: WorkLog[],
  colorBy: ColorBy = 'task',
): EventInput[] {
  return workLogs.map((log) => transformWorkLogToEvent(log, colorBy));
}
