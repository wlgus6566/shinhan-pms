'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ScheduleSidebarSkeleton() {
  return (
    <div className="hidden lg:flex flex-col gap-6 w-[30%]">
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
  );
}
