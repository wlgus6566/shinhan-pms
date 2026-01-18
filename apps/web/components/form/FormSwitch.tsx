"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface FormSwitchProps {
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

const FormSwitch = ({
  control,
  name,
  label,
  className,
  errorMessage = true,
  description = "",
  disabled = false,
  wrapClassName,
  ...props
}: FormSwitchProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            "flex flex-row items-center justify-between rounded-lg border p-4",
            wrapClassName
          )}
        >
          <div className="space-y-0.5">
            {label && <FormLabel className="text-base">{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
            {errorMessage && fieldState.error && <FormMessage />}
          </div>
          <FormControl>
            <Switch
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
              className={cn(className)}
              {...props}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FormSwitch;
