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
import { Card } from '../ui/card';

interface WeeklyReportExportButtonProps {
  projectId: string;
  defaultDate?: Date;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function WeeklyReportExportButton({
  projectId,
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
      await exportWeeklyReport(projectId, startDate, endDate, weekInfo);
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
    <Card className="p-2 flex flex-row gap-2 hover:shadow-none">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevWeek}
          disabled={isExporting}
          aria-label="이전 주"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-[200px] text-center">
          {displayText}
        </span>
        <Button
          variant="outline"
          size="icon"
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
        className="whitespace-nowrap"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            다운로드 중...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            <span
              dangerouslySetInnerHTML={{
                __html: formatWeekDisplayWithWeekNumber(selectedDate),
              }}
            />
            주간보고 엑셀 다운로드
          </>
        )}
      </Button>
    </Card>
  );
}
