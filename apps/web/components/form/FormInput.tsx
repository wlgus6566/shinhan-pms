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
              type={type === "number" ? "text" : type}
              inputMode={type === "number" ? "decimal" : undefined}
              placeholder={placeholder}
              className={cn("", label && "mt-2", className)}
              value={type === "number" ? (field.value === undefined ? "" : String(field.value)) : field.value}
              onChange={(e) => {
                if (type === "number") {
                  const value = e.target.value;

                  // 빈 값
                  if (value === "") {
                    field.onChange(undefined);
                    return;
                  }

                  // 마이너스 기호만 있거나 마이너스로 시작하면 무시
                  if (value === "-" || value.startsWith("-")) {
                    return;
                  }

                  const numericValue = parseFloat(value);
                  if (!isNaN(numericValue)) {
                    field.onChange(numericValue);
                  }
                } else if (format === "number") {
                  const value = e.target.value;
                  const numericValue = value.replace(/[^0-9]/g, "");
                  field.onChange(numericValue);
                } else {
                  field.onChange(e);
                }
              }}
              onBlur={() => {
                field.onBlur();
                // min={0}인 경우 음수 값 추가 검증
                if (type === "number" && props.min === 0 && field.value && field.value < 0) {
                  field.onChange(undefined);
                }
              }}
              {...(type !== "number" ? props : Object.fromEntries(
                Object.entries(props).filter(([key]) => !["min", "max", "step"].includes(key))
              ))}
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
