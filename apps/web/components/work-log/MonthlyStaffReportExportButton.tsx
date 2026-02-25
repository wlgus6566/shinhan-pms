'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { exportMonthlyStaffReport } from '@/lib/api/workLogs';

interface MonthlyStaffReportExportButtonProps {
  projectId: string;
  projectName: string;
  year: number;
  month: number;
}

export function MonthlyStaffReportExportButton({
  projectId,
  projectName,
  year,
  month,
}: MonthlyStaffReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
