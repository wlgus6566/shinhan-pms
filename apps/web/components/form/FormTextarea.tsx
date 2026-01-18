"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  wrapClassName?: string;
  rows?: number;
  [key: string]: any;
}

const FormTextarea = ({
  control,
  name,
  label,
  placeholder,
  className,
  errorMessage = true,
  description = "",
  disabled = false,
  wrapClassName,
  rows = 4,
  ...props
}: FormTextareaProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapClassName)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              disabled={disabled}
              placeholder={placeholder}
              className={cn("", label && "mt-2", className)}
              rows={rows}
              {...field}
              {...props}
            />
          </FormControl>
          {errorMessage && fieldState.error && <FormMessage className="mt-2" />}
          {description && (
            <FormDescription className="mt-2">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormTextarea;
