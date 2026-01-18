"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioGroupProps {
  control: any;
  name: string;
  label?: string;
  className?: string;
  errorMessage?: boolean;
  description?: string;
  disabled?: boolean;
  wrapClassName?: string;
  options: RadioOption[];
  [key: string]: any;
}

const FormRadioGroup = ({
  control,
  name,
  label,
  className,
  errorMessage = true,
  description = "",
  disabled = false,
  wrapClassName,
  options = [],
  ...props
}: FormRadioGroupProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapClassName)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className={cn("", label && "mt-2", className)}
              {...props}
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
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

export default FormRadioGroup;
