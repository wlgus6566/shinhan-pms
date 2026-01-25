'use client';

import { useState } from 'react';
import { addWeeks, subWeeks, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportWeeklyReport } from '@/lib/api/workLogs';
import {
  getWeekMonday,
  getWeekSunday,
  getWeekOfMonth,
  formatWeekDisplay,
} from '@/lib/utils/week';

interface WeeklyReportExportButtonProps {
  projectId: string;
  defaultDate?: Date;
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
    <div className="space-y-2">
      {success && (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>주간 업무일지가 다운로드되었습니다.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
        <span className="text-sm font-medium min-w-[280px] text-center">
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
        <Button
          onClick={handleExport}
          disabled={isExporting}
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
              주간보고 다운로드
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
