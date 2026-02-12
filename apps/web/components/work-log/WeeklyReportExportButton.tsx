'use client';

import { useState } from 'react';
import { addWeeks, subWeeks, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportWeeklyReport } from '@/lib/api/workLogs';
import {
  getWeekMonday,
  getWeekSunday,
  getWeekOfMonth,
  formatWeekDisplay,
  formatWeekDisplayWithWeekNumber,
} from '@/lib/utils/week';

interface WeeklyReportExportButtonProps {
  projectId: string;
  projectName: string;
  defaultDate?: Date;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function WeeklyReportExportButton({
  projectId,
  projectName,
  defaultDate = new Date(),
}: WeeklyReportExportButtonProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monday = getWeekMonday(selectedDate);
  const sunday = getWeekSunday(selectedDate);
  const weekInfo = getWeekOfMonth(selectedDate);
  const displayText = formatWeekDisplay(selectedDate);

  const handlePrevWeek = () => {
    setSelectedDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate((prev) => addWeeks(prev, 1));
  };

  const handleExport = async () => {
    setSuccess(false);
    setError(null);

    try {
      setIsExporting(true);
      const startDate = format(monday, 'yyyy-MM-dd');
      const endDate = format(sunday, 'yyyy-MM-dd');
      await exportWeeklyReport(projectId, startDate, endDate, weekInfo, projectName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setError('다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handlePrevWeek}
          disabled={isExporting}
          aria-label="이전 주"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium text-center whitespace-nowrap px-1">
          {displayText}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleNextWeek}
          disabled={isExporting}
          aria-label="다음 주"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="success"
        className="gradient-border whitespace-nowrap text-xs h-9 w-full sm:w-auto"
        size="sm"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            다운로드 중...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span
              dangerouslySetInnerHTML={{
                __html: formatWeekDisplayWithWeekNumber(selectedDate),
              }}
            />
            주간보고 다운로드
          </>
        )}
      </Button>
    </div>
  );
}
