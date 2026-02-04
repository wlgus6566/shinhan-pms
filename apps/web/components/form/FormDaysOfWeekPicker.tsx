'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DayOfWeek } from '@repo/schema';
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_ORDER } from '@repo/schema';

interface FormDaysOfWeekPickerProps {
  control: any;
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const FormDaysOfWeekPicker = ({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: FormDaysOfWeekPickerProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="flex gap-2 flex-wrap">
              {DAY_OF_WEEK_ORDER.map((day) => {
                const isSelected = field.value?.includes(day);
                return (
                  <Button
                    key={day}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={disabled}
                    className={cn(
                      'w-12 h-10 font-medium transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground',
                      day === 'SAT' && isSelected && 'bg-blue-600 hover:bg-blue-700',
                      day === 'SUN' && isSelected && 'bg-red-600 hover:bg-red-700',
                    )}
                    onClick={() => {
                      const currentValue = field.value || [];
                      if (isSelected) {
                        field.onChange(
                          currentValue.filter((d: DayOfWeek) => d !== day),
                        );
                      } else {
                        field.onChange([...currentValue, day]);
                      }
                    }}
                  >
                    {DAY_OF_WEEK_LABELS[day]}
                  </Button>
                );
              })}
            </div>
          </FormControl>
          {fieldState.error && <FormMessage className="mt-2" />}
          {description && (
            <FormDescription className="mt-2">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormDaysOfWeekPicker;
