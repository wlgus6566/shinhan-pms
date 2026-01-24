"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface FormCheckboxGroupProps {
  control: any;
  name: string;
  label?: string;
  options: Option[];
  emptyMessage?: string;
  className?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  wrapClassName?: string;
  maxHeight?: string;
}

const FormCheckboxGroup = ({
  control,
  name,
  label,
  options,
  emptyMessage = "항목이 없습니다",
  className,
  errorMessage = true,
  description = "",
  disabled = false,
  wrapClassName,
  maxHeight = "max-h-48",
}: FormCheckboxGroupProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapClassName)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className={cn("space-y-2 overflow-y-auto border rounded-md p-3", maxHeight, className)}>
            {options.length === 0 ? (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const currentValue = field.value || [];
                      if (checked) {
                        field.onChange([...currentValue, option.id]);
                      } else {
                        field.onChange(currentValue.filter((id: string) => id !== option.id));
                      }
                    }}
                    disabled={disabled}
                  />
                  <label className="text-sm cursor-pointer">
                    {option.label}
                    {option.description && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({option.description})
                      </span>
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
          {errorMessage && fieldState.error && <FormMessage className="mt-2" />}
          {description && (
            <FormDescription className="mt-2">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormCheckboxGroup;
