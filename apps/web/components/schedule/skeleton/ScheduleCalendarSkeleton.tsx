'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ScheduleCalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-full" />
          ))}
        </div>

        {/* Calendar days */}
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <Skeleton key={dayIndex} className="h-20 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
