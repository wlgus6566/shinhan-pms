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

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  showTime?: boolean;
  timeOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  showTime = true,
  timeOnly = false,
  placeholder = 'Pick a date',
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  );
  const [timeValue, setTimeValue] = React.useState<string>('');

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

  // timeOnly 모드일 때는 시간만 표시
  if (timeOnly) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => {
            const newTime = e.target.value;
            setTimeValue(newTime);

            if (newTime) {
              const [hours, minutes] = newTime.split(':').map(Number);
              // 날짜는 오늘 날짜를 사용하거나 기존 날짜 유지
              const newDate = selectedDate ? new Date(selectedDate) : new Date();
              newDate.setHours(hours || 0, minutes || 0, 0, 0);
              onChange(newDate);
            }
          }}
          disabled={disabled}
          className="w-full"
          placeholder="시간 선택"
        />
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

      {showTime && (
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          disabled={disabled || !selectedDate}
          className="w-full"
        />
      )}
    </div>
  );
}
