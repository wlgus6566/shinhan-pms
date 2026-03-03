'use client';

import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WORK_AREA_LABELS, type WorkArea } from '@repo/schema';
import type { ProjectMember } from '@/types/project';

const TASK_WORK_AREAS = ['PLANNING', 'DESIGN', 'PUBLISHING', 'FRONTEND', 'BACKEND'] as const;

interface TaskAssigneeTableProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  name: string;
  projectMembers: ProjectMember[];
  maxAssignees?: number;
}

export function TaskAssigneeTable({
  control,
  setValue,
  name,
  projectMembers,
  maxAssignees = 10,
}: TaskAssigneeTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchedAssignees = useWatch({ control, name }) || [];

  const getMembersForWorkArea = (workArea: string, currentIndex: number) => {
    // Get member IDs already selected with the same workArea (excluding current row)
    const selectedMemberIds = new Set(
      watchedAssignees
        .filter((_: any, i: number) => i !== currentIndex && _.workArea === workArea && _.memberId)
        .map((a: any) => a.memberId),
    );
    return projectMembers.filter(
      m => m.workArea === workArea && m.member && !selectedMemberIds.has(m.member.id.toString()),
    );
  };

  const handleAddRow = () => {
    if (fields.length < maxAssignees) {
      append({ workArea: '', memberId: '', startDate: '', endDate: '' });
    }
  };

  const workAreaOptions = TASK_WORK_AREAS
    .filter(wa => projectMembers.some(m => m.workArea === wa))
    .map(wa => ({ value: wa, label: WORK_AREA_LABELS[wa as WorkArea] }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          담당자 (최대 {maxAssignees}명)
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          disabled={fields.length >= maxAssignees}
        >
          <Plus className="h-4 w-4 mr-1" />
          담당자 추가
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground w-[140px]">역할</th>
                <th className="text-left p-3 font-medium text-muted-foreground w-[160px]">담당자</th>
                <th className="text-left p-3 font-medium text-muted-foreground">시작일</th>
                <th className="text-left p-3 font-medium text-muted-foreground">종료일</th>
                <th className="text-center p-3 font-medium text-muted-foreground w-[60px]">액션</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const currentWorkArea = watchedAssignees?.[index]?.workArea || '';
                const availableMembers = getMembersForWorkArea(currentWorkArea, index);

                return (
                  <tr key={field.id} className="border-b last:border-b-0">
                    <td className="p-2">
                      <Controller
                        control={control}
                        name={`${name}.${index}.workArea`}
                        render={({ field: f }) => (
                          <Select
                            value={f.value}
                            onValueChange={(val) => {
                              f.onChange(val);
                              setValue(`${name}.${index}.memberId`, '');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {workAreaOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    <td className="p-2">
                      <Controller
                        control={control}
                        name={`${name}.${index}.memberId`}
                        render={({ field: f }) => (
                          <Select
                            value={f.value}
                            onValueChange={f.onChange}
                            disabled={!currentWorkArea}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={currentWorkArea ? '선택' : '역할 먼저 선택'} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMembers.map(m => (
                                <SelectItem key={m.member!.id} value={m.member!.id.toString()}>
                                  {m.member!.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </td>
                    <td className="p-2">
                      <Controller
                        control={control}
                        name={`${name}.${index}.startDate`}
                        render={({ field: f }) => (
                          <Input
                            type="date"
                            value={f.value || ''}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </td>
                    <td className="p-2">
                      <Controller
                        control={control}
                        name={`${name}.${index}.endDate`}
                        render={({ field: f }) => (
                          <Input
                            type="date"
                            value={f.value || ''}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
