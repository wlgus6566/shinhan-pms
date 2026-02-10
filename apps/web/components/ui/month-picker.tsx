'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MonthPickerProps {
  value: string; // YYYY-MM format
  onChange: (value: string) => void;
  label?: string;
}

export function MonthPicker({
  value,
  onChange,
  label = '조회 월',
}: MonthPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor="month-picker">{label}</Label>}
      <Input
        id="month-picker"
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
