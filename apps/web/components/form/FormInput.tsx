"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  wrapClassName?: string;
  format?: "number" | "text";
  [key: string]: any;
}

const FormInput = ({
  control,
  name,
  label,
  placeholder,
  type,
  className,
  errorMessage = true,
  description = "",
  disabled = false,
  wrapClassName,
  format,
  ...props
}: FormInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapClassName)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              disabled={disabled}
              type={type}
              placeholder={placeholder}
              className={cn("", label && "mt-2", className)}
              {...field}
              onChange={(e) => {
                if (format === "number") {
                  const value = e.target.value;
                  const numericValue = value.replace(/[^0-9]/g, "");
                  field.onChange(numericValue);
                } else {
                  field.onChange(e);
                }
              }}
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

export default FormInput;
