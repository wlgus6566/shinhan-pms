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

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface OptionGroup {
  key: string;
  label: string;
  options: Option[];
}

interface FormCheckboxGroupProps {
  control: any;
  name: string;
  label?: string;
  options?: Option[]; // 기존 flat 목록 (하위 호환)
  groups?: OptionGroup[]; // 그룹핑된 옵션
  loading?: boolean; // 로딩 상태
  loadingMessage?: string; // 로딩 메시지
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
  options = [],
  groups,
  loading = false,
  loadingMessage = '불러오는 중...',
  emptyMessage = '항목이 없습니다',
  className,
  errorMessage = true,
  description = '',
  disabled = false,
  wrapClassName,
  maxHeight = 'max-h-48',
}: FormCheckboxGroupProps) => {
  // 체크박스 아이템 렌더링 (재사용)
  const renderCheckboxItem = (option: Option, field: any) => (
    <div key={option.id} className="flex items-center space-x-2">
      <Checkbox
        id={option.id}
        checked={field.value?.includes(option.id)}
        onCheckedChange={(checked) => {
          const currentValue = field.value || [];
          if (checked) {
            field.onChange([...currentValue, option.id]);
          } else {
            field.onChange(
              currentValue.filter((id: string) => id !== option.id),
            );
          }
        }}
        disabled={disabled}
      />
      <label className="text-sm cursor-pointer" htmlFor={option.id}>
        {option.label}
        {option.description && (
          <span className="text-xs text-muted-foreground ml-1">
            ({option.description})
          </span>
        )}
      </label>
    </div>
  );

  // 전체 옵션 개수 계산
  const totalOptions = groups
    ? groups.reduce((sum, group) => sum + group.options.length, 0)
    : options.length;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapClassName)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div
            className={cn(
              'space-y-2 overflow-y-auto border rounded-md p-3',
              maxHeight,
              className,
            )}
          >
            {loading ? (
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            ) : totalOptions === 0 ? (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : groups ? (
              // 그룹핑된 옵션 렌더링
              <div className="space-y-4">
                {groups.map((group) => {
                  if (group.options.length === 0) return null;
                  return (
                    <div key={group.key} className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-700 border-b pb-1">
                        {group.label}
                      </h4>
                      <div className="space-y-2 pl-2">
                        {group.options.map((option) =>
                          renderCheckboxItem(option, field),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // 기존 flat 옵션 렌더링
              options.map((option) => renderCheckboxItem(option, field))
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
