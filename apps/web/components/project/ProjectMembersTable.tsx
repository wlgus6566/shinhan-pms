'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getProjectMembers, 
  removeProjectMember, 
  updateProjectMemberRole 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loader2, UserPlus, Trash2 } from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import type { ProjectMember, ProjectRole, Department, UserRole } from '@/types/project';

const departmentLabels: Record<Department, string> = {
  PLANNING: '기획',
  DESIGN: '디자인',
  DEVELOPMENT: '개발',
  OPERATION: '운영',
};

const userRoleLabels: Record<UserRole, string> = {
  ADMIN: '관리자',
  USER: '사용자',
};

const projectRoleVariants: Record<ProjectRole, 'default' | 'secondary' | 'outline'> = {
  PM: 'default',
  PL: 'secondary',
  PA: 'outline',
};

interface ProjectMembersTableProps {
  projectId: string;
  creatorId: number;
}

export function ProjectMembersTable({ projectId, creatorId }: ProjectMembersTableProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const canManage = user?.role === 'PM' || members.find(m => m.memberId === user?.id && (m.role === 'PM' || m.role === 'PL'));

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const result = await getProjectMembers(projectId);
      setMembers(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleRoleChange = async (memberId: number, newRole: ProjectRole) => {
    try {
      await updateProjectMemberRole(projectId, memberId, { role: newRole });
      setMembers(members.map(m => 
        m.memberId === memberId ? { ...m, role: newRole } : m
      ));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    
    setIsRemoving(true);
    try {
      await removeProjectMember(projectId, memberToRemove.memberId);
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (error: any) {
      alert(error.message);
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
    if (member.memberId === creatorId) return '프로젝트 생성자는 제거할 수 없습니다';
    if (member.memberId === user?.id) return '본인은 제거할 수 없습니다';
    if (!canManage) return '권한이 없습니다';
    return '팀원 제거';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">팀원 목록</h3>
        {canManage && (
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            팀원 추가
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>파트</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>프로젝트 역할</TableHead>
              {canManage && <TableHead className="text-right">작업</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 6 : 5} className="h-24 text-center">
                  팀원이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.member?.name}</TableCell>
                  <TableCell>{member.member?.email}</TableCell>
                  <TableCell>{member.member?.department ? departmentLabels[member.member.department] : '-'}</TableCell>
                  <TableCell>{member.member?.role ? userRoleLabels[member.member.role] : '-'}</TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select 
                        value={member.role} 
                        onValueChange={(value) => handleRoleChange(member.memberId, value as ProjectRole)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PM">PM</SelectItem>
                          <SelectItem value="PL">PL</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={projectRoleVariants[member.role]}>
                        {member.role}
                      </Badge>
                    )}
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
        onSuccess={fetchMembers}
      />

      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>팀원 제거</DialogTitle>
            <DialogDescription>
              정말 {memberToRemove?.member?.name}님을 프로젝트에서 제거하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>취소</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
