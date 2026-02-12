'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormDateTimePickerProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  wrapClassName?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  showAllDayCheckbox?: boolean;
  allDayCheckboxName?: string;
  timeOnly?: boolean;
  minTime?: string;
  maxTime?: string;
}

const FormDateTimePicker = ({
  control,
  name,
  label,
  placeholder = 'Pick a date',
  className,
  wrapClassName,
  errorMessage = true,
  description = '',
  disabled = false,
  showAllDayCheckbox = false,
  allDayCheckboxName = 'isAllDay',
  timeOnly = false,
  minTime,
  maxTime,
}: FormDateTimePickerProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isAllDay = showAllDayCheckbox
          ? control._formValues[allDayCheckboxName]
          : false;

        return (
          <FormItem className={cn(wrapClassName)}>
            <div className="flex items-center justify-between">
              {label && <FormLabel>{label}</FormLabel>}

              {showAllDayCheckbox && (
                <FormField
                  control={control}
                  name={allDayCheckboxName}
                  render={({ field: checkboxField }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${name}-all-day`}
                        checked={checkboxField.value}
                        onCheckedChange={checkboxField.onChange}
                        disabled={disabled}
                      />
                      <label
                        htmlFor={`${name}-all-day`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        하루종일
                      </label>
                    </div>
                  )}
                />
              )}
            </div>

            <FormControl>
              <DateTimePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => {
                  if (date) {
                    field.onChange(date.toISOString());
                  } else {
                    field.onChange(undefined);
                  }
                }}
                disabled={disabled}
                showTime={!isAllDay}
                timeOnly={timeOnly}
                placeholder={placeholder}
                className={cn('mt-2', className)}
                minTime={minTime}
                maxTime={maxTime}
              />
            </FormControl>

            {errorMessage && fieldState.error && <FormMessage className="mt-2" />}
            {description && <FormDescription className="mt-2">{description}</FormDescription>}
          </FormItem>
        );
      }}
    />
  );
};

export default FormDateTimePicker;
