'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function ProjectDetailSkeleton() {
  return (
    <div className="max-w-7xl">
      {/* Back button skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-[140px]" />
      </div>

      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-[300px]" />
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <Skeleton className="h-7 w-[100px] mr-1" />
          <Skeleton className="h-7 w-[100px] mr-1" />
          <Skeleton className="h-7 w-[120px]" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Project info fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Edit button */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
