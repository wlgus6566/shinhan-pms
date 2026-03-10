'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useProjectUnitPrices,
  useUnitPriceHistory,
  saveProjectUnitPrices,
} from '@/lib/api/projectUnitPrices';
import { GRADE_LABELS, type Grade } from '@repo/schema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ProjectUnitPriceTableProps {
  projectId: string;
}

const GRADES: Grade[] = ['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER'];

function generateYearMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  // 12개월 전부터 12개월 후까지
  for (let i = -12; i <= 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    options.push({ value, label });
  }
  return options;
}

function formatNumber(value: number | string): string {
  const num =
    typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('ko-KR');
}

function parseNumber(value: string): number {
  const num = parseInt(value.replace(/,/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

const yearMonthOptions = generateYearMonthOptions();

export function ProjectUnitPriceTable({
  projectId,
}: ProjectUnitPriceTableProps) {
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'PM';

  const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedYearMonth, setSelectedYearMonth] = useState(currentYearMonth);

  const { unitPrices, isLoading, mutate } = useProjectUnitPrices(
    projectId,
    selectedYearMonth,
  );
  const { history, isLoading: isHistoryLoading, mutate: mutateHistory } = useUnitPriceHistory(projectId);

  const [editData, setEditData] = useState<
    Record<string, { unitPrice: string; notes: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // unitPrices가 변경되면 editData 초기화
  useEffect(() => {
    if (!unitPrices) return;
    const newEditData: Record<string, { unitPrice: string; notes: string }> =
      {};
    GRADES.forEach((grade) => {
      const found = unitPrices.find((up) => up.grade === grade);
      newEditData[grade] = {
        unitPrice: found ? formatNumber(found.unitPrice) : '',
        notes: found?.notes || '',
      };
    });
    setEditData(newEditData);
  }, [unitPrices]);

  const handlePriceChange = useCallback((grade: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setEditData((prev) => ({
      ...prev,
      [grade]: {
        unitPrice: numericValue ? formatNumber(parseInt(numericValue, 10)) : '',
        notes: prev[grade]?.notes ?? '',
      },
    }));
  }, []);

  const handleNotesChange = useCallback((grade: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [grade]: {
        unitPrice: prev[grade]?.unitPrice ?? '',
        notes: value,
      },
    }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const items = GRADES.map((grade) => ({
        grade,
        unitPrice: parseNumber(editData[grade]?.unitPrice || '0'),
        notes: editData[grade]?.notes || null,
      })).filter((item) => item.unitPrice > 0);

      if (items.length === 0) return;

      await saveProjectUnitPrices(projectId, {
        yearMonth: selectedYearMonth,
        items,
      });
      mutate();
      mutateHistory();
    } catch {
      // interceptor에서 toast 자동 표시
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">단가 관리</h3>
          <p className="text-sm text-muted-foreground">등급별 월 단가 설정</p>
        </div>
      </div>

      {/* 년월 선택기 */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium whitespace-nowrap">
          기준 년월:
        </span>
        <Select value={selectedYearMonth} onValueChange={setSelectedYearMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearMonthOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">등급</TableHead>
                <TableHead className="w-[160px]">코드</TableHead>
                <TableHead className="w-[200px]">단가 (원/MD)</TableHead>
                <TableHead>비고</TableHead>
                <TableHead className="w-[140px]">최종 수정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GRADES.map((grade) => {
                const found = unitPrices?.find((up) => up.grade === grade);
                return (
                  <TableRow key={grade}>
                    <TableCell className="font-medium">
                      {GRADE_LABELS[grade]}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {grade}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData[grade]?.unitPrice || ''}
                        onChange={(e) =>
                          handlePriceChange(grade, e.target.value)
                        }
                        disabled={!canEdit}
                        className="w-[160px] text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData[grade]?.notes || ''}
                        onChange={(e) =>
                          handleNotesChange(grade, e.target.value)
                        }
                        disabled={!canEdit}
                        placeholder="비고"
                        maxLength={200}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {found?.updatedAt
                        ? new Date(found.updatedAt).toLocaleDateString('ko-KR')
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 안내 박스 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300 text-sm mb-1">
              단가 관리 안내
            </p>
            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
              <li>단가는 년월별로 관리됩니다. (월별 변경 가능)</li>
              <li>
                단가 수정 후 반드시 &quot;저장&quot; 버튼을 클릭해야 반영됩니다.
              </li>
              <li>
                월간보고서의 비용 산정은 해당 월의 단가를 기준으로 계산됩니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      )}

      {/* 단가 변경 이력 */}
      <div className="rounded-lg border p-4 space-y-4">
        <h4 className="font-semibold">단가 변경 이력 (최근 6개월)</h4>
        {isHistoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            변경 이력이 없습니다.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">년월</TableHead>
                  <TableHead>특급</TableHead>
                  <TableHead>고급</TableHead>
                  <TableHead>중급</TableHead>
                  <TableHead>초급</TableHead>
                  <TableHead>수정자</TableHead>
                  <TableHead className="w-[140px]">수정일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row, idx) => (
                  <TableRow key={`${row.yearMonth}-${row.createdAt}-${idx}`}>
                    <TableCell className="font-medium">
                      {row.yearMonth}
                    </TableCell>
                    <TableCell>
                      {row.EXPERT != null ? row.EXPERT.toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell>
                      {row.ADVANCED != null ? row.ADVANCED.toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell>
                      {row.INTERMEDIATE != null ? row.INTERMEDIATE.toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell>
                      {row.BEGINNER != null ? row.BEGINNER.toLocaleString('ko-KR') : '-'}
                    </TableCell>
                    <TableCell>{row.updatedByName ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString('ko-KR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
