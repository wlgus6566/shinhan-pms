'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormCheckboxProps {
  control: any;
  name: string;
  label?: string;
  className?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  wrapClassName?: string;
  [key: string]: any;
}

const FormCheckbox = ({
  control,
  name,
  label,
  className,
  errorMessage = true,
  description = '',
  disabled = false,
  wrapClassName,
  ...props
}: FormCheckboxProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0 items-center h-5',
            wrapClassName,
          )}
        >
          <FormControl>
            <Checkbox
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
              className={cn(className)}
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && <FormLabel>{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            {errorMessage && fieldState.error && <FormMessage />}
          </div>
        </FormItem>
      )}
    />
  );
};

export default FormCheckbox;
