'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { ko } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  showTime?: boolean;
  timeOnly?: boolean;
  placeholder?: string;
  className?: string;
  minTime?: string;
  maxTime?: string;
}

function generateTimeOptions(minTime?: string, maxTime?: string) {
  const options: { value: string; label: string }[] = [];
  const startHour = minTime ? parseInt(minTime.split(':')[0] ?? '0', 10) : 0;
  const startMin = minTime ? parseInt(minTime.split(':')[1] ?? '0', 10) : 0;
  const endHour = maxTime ? parseInt(maxTime.split(':')[0] ?? '23', 10) : 23;
  const endMin = maxTime ? parseInt(maxTime.split(':')[1] ?? '59', 10) : 59;

  for (let h = startHour; h <= endHour; h++) {
    for (const m of [0, 30]) {
      const totalStart = startHour * 60 + startMin;
      const totalEnd = endHour * 60 + endMin;
      const totalCurrent = h * 60 + m;

      if (totalCurrent < totalStart || totalCurrent > totalEnd) continue;

      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;
      const period = h < 12 ? '오전' : '오후';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${period} ${displayH}:${mm}`;
      options.push({ value: timeStr, label });
    }
  }

  return options;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  showTime = true,
  timeOnly = false,
  placeholder = 'Pick a date',
  className,
  minTime,
  maxTime,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  );
  const [timeValue, setTimeValue] = React.useState<string>('');

  const hasTimeConstraint = !!(minTime || maxTime);
  const timeOptions = React.useMemo(
    () => (hasTimeConstraint ? generateTimeOptions(minTime, maxTime) : []),
    [minTime, maxTime, hasTimeConstraint],
  );

  React.useEffect(() => {
    if (value) {
      const hours = String(value.getHours()).padStart(2, '0');
      const minutes = String(value.getMinutes()).padStart(2, '0');
      setTimeValue(`${hours}:${minutes}`);
      setSelectedDate(value);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);

    if (date && showTime && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      onChange(newDate);
    } else if (date) {
      onChange(date);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      onChange(newDate);
    }
  };

  const handleTimeSelect = (newTime: string) => {
    setTimeValue(newTime);

    const [hours, minutes] = newTime.split(':').map(Number);
    const baseDate = selectedDate ?? new Date();
    const newDate = new Date(baseDate);
    newDate.setHours(hours || 0, minutes || 0, 0, 0);

    if (!selectedDate) {
      setSelectedDate(newDate);
    }

    onChange(newDate);
  };

  const renderTimeInput = (isDisabled: boolean) => {
    if (hasTimeConstraint && !isDisabled) {
      return (
        <Select
          value={timeValue}
          onValueChange={handleTimeSelect}
          disabled={isDisabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="시간 선택" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type="time"
        value={timeValue}
        onChange={handleTimeChange}
        disabled={isDisabled}
        className="w-full"
        placeholder="시간 선택"
      />
    );
  };

  // timeOnly 모드일 때는 시간만 표시
  if (timeOnly) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {renderTimeInput(disabled)}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP', { locale: ko })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={disabled}
            locale={ko}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {showTime && renderTimeInput(disabled || !selectedDate)}
    </div>
  );
}
