'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useUsers } from '@/lib/hooks/useUsers';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TablePagination,
  TableLoading,
  TableError,
  TableEmpty,
} from '@/components/common/table';
import { Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '슈퍼 관리자',
  PM: '프로젝트 관리자',
  MEMBER: '일반',
};

const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  SUPER_ADMIN: 'default',
  PM: 'secondary',
  MEMBER: 'outline',
};

export function UserListTable() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // SWR로 데이터 패칭
  const params = useMemo(() => {
    const p: any = {};
    if (search) p.search = search;
    if (role !== 'ALL') p.role = role;
    return p;
  }, [search, role]);

  const { users, isLoading, error } = useUsers(params);
  const userList = users || [];

  // Pagination
  const { totalPages, paginatedUsers } = useMemo(() => {
    const total = Math.ceil(userList.length / itemsPerPage);
    const paginated = userList.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    return { totalPages: total, paginatedUsers: paginated };
  }, [userList, currentPage, itemsPerPage]);


  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="이름 또는 이메일 검색..."
              className="pl-10 w-[280px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="권한 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 권한</SelectItem>
              <SelectItem value="SUPER_ADMIN">슈퍼 관리자</SelectItem>
              <SelectItem value="PM">프로젝트 관리자</SelectItem>
              <SelectItem value="MEMBER">일반</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-slate-500">
          총{' '}
          <span className="font-semibold text-slate-900">{userList.length}</span>명
          멤버
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  이름
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>본부</TableHead>
              <TableHead>권한</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={7} message="멤버를 불러오는 중..." />
            ) : error ? (
              <TableError
                colSpan={7}
                message={error.message || '멤버 목록을 불러오는데 실패했습니다'}
                onRetry={() => {
                  setSearch('');
                  setRole('ALL');
                }}
              />
            ) : paginatedUsers.length === 0 ? (
              <TableEmpty colSpan={7} message="멤버가 없습니다" />
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <Link
                      href={`/users/${user.id}`}
                      className="flex items-center gap-3 group/link"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-semibold text-slate-900 group-hover/link:text-blue-600 transition-colors">
                        {user.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {user.department}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariants[user.role]}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                      {user.isActive ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/users/${user.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && userList.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
