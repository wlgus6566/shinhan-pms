'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table2, LayoutGrid } from 'lucide-react';

interface ViewToggleProps {
  value: 'table' | 'kanban';
  onValueChange: (value: 'table' | 'kanban') => void;
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange as (value: string) => void}
    >
      <TabsList>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span>칸반 보드</span>
        </TabsTrigger>
        <TabsTrigger value="table" className="flex items-center gap-2">
          <Table2 className="h-4 w-4" />
          <span>테이블 뷰</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
