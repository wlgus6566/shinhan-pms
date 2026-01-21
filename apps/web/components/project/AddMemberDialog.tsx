'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AddProjectMemberSchema,
  type AddProjectMemberInput,
} from '@repo/schema';
import { getAvailableMembers, addProjectMember } from '@/lib/api/projectMembers';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/form/FormSelect';
import type { AvailableMember } from '@/types/project';
import { DEPARTMENTS } from '@/lib/constants/roles';

interface AddMemberDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// English codes to Korean labels mapping if needed
const departmentMap: Record<string, string> = {
  PLANNING: '기획',
  DESIGN: '디자인',
  FRONTEND: '프론트엔드',
  DEVELOPMENT: '개발',
};

// 담당 분야 옵션
const workAreaOptions = [
  { value: 'PROJECT_MANAGEMENT', label: '프로젝트 관리 (Project Management)' },
  { value: 'PLANNING', label: '기획 (Planning)' },
  { value: 'DESIGN', label: '디자인 (Design)' },
  { value: 'FRONTEND', label: '프론트엔드 (Frontend)' },
  { value: 'BACKEND', label: '백엔드 (Backend)' },
];

// 프로젝트 역할 옵션
const projectRoleOptions = [
  { value: 'PM', label: 'PM (Project Manager)' },
  { value: 'PL', label: 'PL (Project Leader)' },
  { value: 'PA', label: 'PA (Project Assistant)' },
];

export function AddMemberDialog({ projectId, open, onOpenChange, onSuccess }: AddMemberDialogProps) {
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm<AddProjectMemberInput>({
    resolver: zodResolver(AddProjectMemberSchema),
    defaultValues: {
      memberId: 0,
      role: 'PA',
      workArea: 'PLANNING',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      form.reset();
      getAvailableMembers(projectId)
        .then((members) => {
          setAvailableMembers(members);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [open, projectId, form]);

  async function onSubmit(values: AddProjectMemberInput) {
    setSubmitting(true);
    setError(null);

    try {
      // 빈 문자열 notes를 undefined로 변환
      const payload = {
        ...values,
        notes: values.notes?.trim() || undefined,
      };
      await addProjectMember(projectId, payload);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const selectedMember = availableMembers.find(
    (member) => member.id === form.watch('memberId')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>멤버 추가</DialogTitle>
          <DialogDescription>
            프로젝트에 새로운 멤버를 추가합니다
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>멤버 선택 *</FormLabel>
                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value && selectedMember ? (
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{selectedMember.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {selectedMember.email}
                                </span>
                              </div>
                            ) : (
                              '멤버를 선택하세요'
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[460px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="이름 또는 이메일로 검색..." />
                          <CommandList>
                            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                            <CommandGroup>
                              {availableMembers.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  추가 가능한 멤버가 없습니다
                                </div>
                              ) : (
                                availableMembers.map((member) => (
                                  <CommandItem
                                    key={member.id}
                                    value={`${member.name} ${member.email}`}
                                    onSelect={() => {
                                      field.onChange(member.id);
                                      setComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === member.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{member.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {member.email} • {departmentMap[member.department] || member.department}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedMember && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">본부</label>
                  <Input
                    value={departmentMap[selectedMember.department] || selectedMember.department}
                    disabled
                    readOnly
                    className="bg-slate-50 cursor-not-allowed"
                  />
                </div>
              )}

              <FormSelect
                control={form.control}
                name="workArea"
                label="담당 분야 *"
                placeholder="담당 분야를 선택하세요"
                options={workAreaOptions}
              />

              <FormSelect
                control={form.control}
                name="role"
                label="프로젝트 역할 *"
                placeholder="프로젝트 역할을 선택하세요"
                options={projectRoleOptions}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비고</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="비고 사항을 입력하세요 (선택)"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || availableMembers.length === 0}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  추가
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
