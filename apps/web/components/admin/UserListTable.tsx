'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUsers } from '@/lib/api/users';
import { useUrlQueryParams } from '@/hooks/useUrlQueryParams';
import { useSearchButton } from '@/hooks/useSearchButton';
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
import { Search, MoreHorizontal } from 'lucide-react';
import {
  ROLE_LABELS,
  ROLE_VARIANTS,
} from '@/lib/constants/roles';
import {
  DEPARTMENT_LABELS,
  type Department,
} from '@repo/schema';

export function UserListTable() {
  const { params, setParam, setParams } = useUrlQueryParams({
    defaults: {
      role: 'ALL',
      isActive: 'true',
      pageNum: 1,
    },
  });

  const search = (params.search as string) || '';
  const role = (params.role as string) || 'ALL';
  const isActive = (params.isActive as string) || 'true';
  const currentPage = (params.pageNum as number) || 1;

  const { searchInput, setSearchInput, handleSearch, handleKeyDown } =
    useSearchButton(params, setParams);

  // SWR로 데이터 패칭 (서버 사이드 페이지네이션)
  const apiParams = useMemo(() => {
    const p: any = {
      pageNum: currentPage,
    };
    if (search) p.search = search;
    if (role !== 'ALL') p.role = role;
    if (isActive !== 'ALL') p.isActive = isActive === 'true';
    return p;
  }, [search, role, isActive, currentPage]);

  const { users, pagination, isLoading, error } = useUsers(apiParams);
  const userList = users || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="이름 또는 이메일 검색..."
              className="pl-10 w-full sm:w-[280px]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Select
            value={role}
            onValueChange={(value) => {
              setParams({ role: value, pageNum: 1 });
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="권한 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 권한</SelectItem>
              <SelectItem value="SUPER_ADMIN">슈퍼 관리자</SelectItem>
              <SelectItem value="PM">프로젝트 관리자</SelectItem>
              <SelectItem value="MEMBER">일반</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={isActive}
            onValueChange={(value) => {
              setParams({ isActive: value, pageNum: 1 });
            }}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="true">활성화</SelectItem>
              <SelectItem value="false">비활성화</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            className="sm:w-auto"
          >
            <Search className="h-4 w-4 mr-1" />
            검색
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          총{' '}
          <span className="font-semibold text-slate-900">
            {pagination?.totalCount ?? 0}
          </span>
          명 멤버
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
              <TableLoading colSpan={6} message="멤버를 불러오는 중..." />
            ) : error ? (
              <TableError
                colSpan={6}
                message={error.message || '멤버 목록을 불러오는데 실패했습니다'}
                onRetry={() => {
                  setParams({ search: undefined, role: 'ALL', pageNum: 1 });
                  setSearchInput('');
                }}
              />
            ) : userList.length === 0 ? (
              <TableEmpty colSpan={6} message="멤버가 없습니다" />
            ) : (
              userList.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="whitespace-nowrap">
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
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-600">{user.email}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-slate-700">
                      {DEPARTMENT_LABELS[user.department as Department] || user.department}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        ROLE_VARIANTS[
                          user.role as keyof typeof ROLE_VARIANTS
                        ] || 'outline'
                      }
                    >
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ||
                        user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
        {!isLoading && userList.length > 0 && pagination && (
          <TablePagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={(page) => setParam('pageNum', page)}
          />
        )}
      </div>
    </div>
  );
}
