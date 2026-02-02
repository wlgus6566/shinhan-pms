'use client';

import { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportMonthlyStaffReport } from '@/lib/api/workLogs';
import { Card } from '../ui/card';

interface MonthlyStaffReportExportButtonProps {
  projectId: string;
  defaultDate?: Date;
}

export function MonthlyStaffReportExportButton({
  projectId,
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
      await exportMonthlyStaffReport(projectId, year, month);
    } catch (err) {
      console.error('Export error:', err);
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
          onClick={handlePrevMonth}
          disabled={isExporting}
          aria-label="이전 월"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium w-[120px] text-center">
          {displayText}
        </span>
        <Button
          variant="outline"
          size="icon"
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
        className="gradient-primary border-none whitespace-nowrap min-w-[225px]"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            다운로드 중...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {month}월 월간보고 엑셀 다운로드
          </>
        )}
      </Button>
      {error && (
        <span className="text-sm text-destructive ml-2 self-center">
          {error}
        </span>
      )}
    </Card>
  );
}
