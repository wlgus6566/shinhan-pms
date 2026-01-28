'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SchedulePageSkeleton() {
  return (
    <div className="mx-auto">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-9 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[350px]" />
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1">
            <Skeleton className="h-7 w-[120px]" />
            <Skeleton className="h-7 w-[120px]" />
            <Skeleton className="h-7 w-[120px]" />
          </div>

          {/* Calendar skeleton */}
          <div className="flex gap-6">
            {/* Left Sidebar skeleton */}
            <div className="flex flex-col gap-6 w-[30%]">
              {/* Team filter skeleton */}
              <div className="bg-white rounded-lg border p-4">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 p-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                      <Skeleton className="w-3 h-3 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected date schedule list skeleton */}
              <div className="bg-white rounded-lg border p-4">
                <Skeleton className="h-6 w-[120px] mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Calendar skeleton */}
            <div className="flex-1">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
