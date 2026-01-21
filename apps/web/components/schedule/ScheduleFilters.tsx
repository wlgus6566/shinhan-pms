'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCcw } from 'lucide-react';
import { SCHEDULE_TYPE_LABELS, SCHEDULE_TYPE_COLORS, type ScheduleType } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface ScheduleFiltersProps {
  selectedTypes: ScheduleType[];
  setSelectedTypes: (types: ScheduleType[]) => void;
  resetFilters: () => void;
}

export function ScheduleFilters({
  selectedTypes,
  setSelectedTypes,
  resetFilters,
}: ScheduleFiltersProps) {
  const toggleType = (type: ScheduleType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const hasActiveFilters = selectedTypes.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* 일정 유형 필터 */}
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">일정 유형</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SCHEDULE_TYPE_LABELS) as ScheduleType[]).map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <Badge
                  key={type}
                  className={cn(
                    'cursor-pointer transition-all border-2 flex items-center gap-1.5',
                    SCHEDULE_TYPE_COLORS[type],
                    isSelected && 'opacity-100 font-semibold ring-2 ring-offset-2 ring-slate-400'
                  )}
                  onClick={() => toggleType(type)}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {SCHEDULE_TYPE_LABELS[type]}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 초기화 버튼 */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={resetFilters}
            className="gap-2 whitespace-nowrap"
          >
            <RefreshCcw className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}
