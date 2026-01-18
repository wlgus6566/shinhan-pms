'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { AvailableMember, ProjectRole } from '@/types/project';

const addMemberSchema = z.object({
  memberId: z.coerce.number().min(1, '팀원을 선택하세요'),
  role: z.enum(['PM', 'PL', 'PA'] as const),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface AddMemberDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddMemberDialog({ projectId, open, onOpenChange, onSuccess }: AddMemberDialogProps) {
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      memberId: 0,
      role: 'PA',
    },
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      getAvailableMembers(projectId)
        .then(setAvailableMembers)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [open, projectId]);

  async function onSubmit(values: AddMemberFormValues) {
    setSubmitting(true);
    setError(null);
    
    try {
      await addProjectMember(projectId, values);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀원 추가</DialogTitle>
          <DialogDescription>
            프로젝트에 새로운 팀원을 추가합니다
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
                  <FormItem>
                    <FormLabel>팀원 선택 *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="팀원을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableMembers.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            추가 가능한 팀원이 없습니다
                          </div>
                        ) : (
                          availableMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name} ({member.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로젝트 역할 *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PM" id="role-pm" />
                          <Label htmlFor="role-pm" className="font-normal cursor-pointer">
                            PM (Project Manager) - 프로젝트 전체 관리 권한
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PL" id="role-pl" />
                          <Label htmlFor="role-pl" className="font-normal cursor-pointer">
                            PL (Project Leader) - 프로젝트 수정 및 팀원 관리 권한
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PA" id="role-pa" />
                          <Label htmlFor="role-pa" className="font-normal cursor-pointer">
                            PA (Project Assistant) - 프로젝트 조회 권한
                          </Label>
                        </div>
                      </RadioGroup>
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
