'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useProjectMembers,
  removeProjectMember,
} from '@/lib/api/projectMembers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  UserPlus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import type {
  ProjectMember,
  ProjectRole,
  Department,
  WorkArea,
} from '@/types/project';
import { POSITION_LABELS, type Position } from '@/lib/constants/roles';
import {
  WORK_AREA_LABELS_STRICT,
  PROJECT_ROLE_VARIANTS,
} from '@/lib/constants/project';
import { DEPARTMENT_LABELS, GRADE_LABELS, type Grade } from '@repo/schema';

interface ProjectMembersTableProps {
  projectId: string;
  creatorId?: string;
}

export function ProjectMembersTable({
  projectId,
  creatorId,
}: ProjectMembersTableProps) {
  const { user } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null,
  );
  const [isRemoving, setIsRemoving] = useState(false);

  // SWR hook
  const { members, isLoading: loading, mutate } = useProjectMembers(projectId);

  const canManage =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'PM' ||
    members?.find((m) => m.memberId === user?.id && m.role === 'PM');

  const handleRemove = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeProjectMember(projectId, memberToRemove.memberId);
      mutate(); // SWR 캐시 갱신
      setMemberToRemove(null);
    } catch (error: any) {
      // toast는 interceptor에서 자동 표시
    } finally {
      setIsRemoving(false);
    }
  };

  const canRemoveMember = (member: ProjectMember) => {
    // Cannot remove creator
    if (member.memberId === creatorId) return false;
    // Cannot remove self
    if (member.memberId === user?.id) return false;
    // Must have permission to manage
    if (!canManage) return false;
    return true;
  };

  const getRemoveTooltip = (member: ProjectMember) => {
    if (member.memberId === creatorId)
      return '프로젝트 생성자는 제거할 수 없습니다';
    if (member.memberId === user?.id) return '본인은 제거할 수 없습니다';
    if (!canManage) return '권한이 없습니다';
    return '멤버 제거';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">멤버 목록</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPermissions((v) => !v)}
          >
            <Info className="h-4 w-4 mr-1" />
            <span className="text-xs">역할별 권한</span>
            {showPermissions ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </Button>
        </div>
        {canManage && (
          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="gradient-primary border-none"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            멤버 추가
          </Button>
        )}
      </div>

      {showPermissions && (
        <div className="rounded-lg border bg-slate-50 p-4 text-sm">
          <h4 className="font-semibold text-slate-800 mb-3">
            역할별 권한 안내
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-4 font-medium text-slate-600">기능</th>
                  <th className="pb-2 px-3 font-medium text-slate-600 text-center">
                    시스템 관리자
                  </th>
                  <th className="pb-2 px-3 font-medium text-slate-600 text-center">
                    PM
                  </th>
                  <th className="pb-2 px-3 font-medium text-slate-600 text-center">
                    PL
                  </th>
                  <th className="pb-2 px-3 font-medium text-slate-600 text-center">
                    PA
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4">멤버 추가/수정/제거</td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-slate-400">-</td>
                  <td className="py-2 px-3 text-center text-slate-400">-</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4">업무 생성/수정/삭제</td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-4">업무일지 작성</td>
                  <td className="py-2 px-3 text-center text-slate-400">-</td>
                  <td className="py-2 px-3 text-center text-slate-400">-</td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">프로젝트 일정 생성</td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                  <td className="py-2 px-3 text-center text-emerald-600 font-medium">
                    O
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>직책</TableHead>
              <TableHead>본부</TableHead>
              <TableHead>담당 분야</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>투입일</TableHead>
              <TableHead>철수일</TableHead>
              <TableHead>비고</TableHead>
              {canManage && <TableHead className="text-right">작업</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 10 : 9}
                  className="h-24 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : !members || members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 10 : 9}
                  className="h-24 text-center"
                >
                  멤버가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {member.member?.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {member.member?.position
                        ? POSITION_LABELS[member.member.position as Position] ||
                          member.member.position
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {member.member?.department
                        ? DEPARTMENT_LABELS[
                            member.member.department as Department
                          ]
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {member.workArea ? (
                      <Badge variant="secondary">
                        {WORK_AREA_LABELS_STRICT[member.workArea as WorkArea] ||
                          member.workArea}
                      </Badge>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        PROJECT_ROLE_VARIANTS[member.role as ProjectRole]
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {member.grade ? (
                      <Badge variant="outline">
                        {GRADE_LABELS[member.grade as Grade] || member.grade}
                      </Badge>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {member.joinDate || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {member.leaveDate || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-600">
                      {member.notes || '-'}
                    </span>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!canRemoveMember(member)}
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getRemoveTooltip(member)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddMemberDialog
        projectId={projectId}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => mutate()}
      />

      <Dialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>멤버 제거</DialogTitle>
            <DialogDescription>
              정말 {memberToRemove?.member?.name}님을 프로젝트에서
              제거하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
