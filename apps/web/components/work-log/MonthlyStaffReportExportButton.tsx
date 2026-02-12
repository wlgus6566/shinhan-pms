'use client';

import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportMonthlyStaffReport } from '@/lib/api/workLogs';

interface MonthlyStaffReportExportButtonProps {
  projectId: string;
  projectName: string;
  defaultDate?: Date;
}

export function MonthlyStaffReportExportButton({
  projectId,
  projectName,
  defaultDate = new Date(),
}: MonthlyStaffReportExportButtonProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const displayText = format(selectedDate, 'yyyy년 M월', { locale: ko });

  const handlePrevMonth = () => {
    setSelectedDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => addMonths(prev, 1));
  };

  const handleExport = async () => {
    setError(null);

    try {
      setIsExporting(true);
      await exportMonthlyStaffReport(projectId, year, month, projectName);
    } catch (err) {
      console.error('Export error:', err);
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
          onClick={handlePrevMonth}
          disabled={isExporting}
          aria-label="이전 월"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium text-center whitespace-nowrap w-[90px]">
          {displayText}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleNextMonth}
          disabled={isExporting}
          aria-label="다음 월"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="default"
        className="whitespace-nowrap text-xs h-9 w-full sm:w-auto"
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
            {month}월 월간보고 다운로드
          </>
        )}
      </Button>
      {error && (
        <span className="text-xs text-destructive self-center">
          {error}
        </span>
      )}
    </div>
  );
}
