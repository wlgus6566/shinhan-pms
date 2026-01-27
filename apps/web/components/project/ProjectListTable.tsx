'use client';

import { useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useProjects } from '@/lib/api/projects';
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
import { Search, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import type { Project, ProjectStatus, ProjectType } from '@/types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VARIANTS,
  PROJECT_TYPE_LABELS,
} from '@/lib/constants/project';

// Format date helper (cache function results)
const formatDateCache = new Map<string, string>();
const formatDate = (dateString: string): string => {
  if (formatDateCache.has(dateString)) {
    return formatDateCache.get(dateString)!;
  }
  const result = new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  formatDateCache.set(dateString, result);
  return result;
};

export function ProjectListTable() {
  // URL 쿼리 파라미터로 필터 상태 관리
  const { params, setParam, setParams } = useUrlQueryParams({
    defaults: {
      status: 'ALL',
      pageNum: 1,
    },
  });

  const search = (params.search as string) || '';
  const status = (params.status as string) || 'ALL';
  const currentPage = (params.pageNum as number) || 1;

  // Search button hook
  const { searchInput, setSearchInput, handleSearch, handleKeyDown } = useSearchButton(
    params,
    setParams
  );

  // SWR로 데이터 패칭 (서버 사이드 페이지네이션)
  const apiParams = useMemo(() => {
    const p: any = {
      pageNum: currentPage,
      // pageSize는 생략 (백엔드 기본값 10 사용)
    };
    if (search) p.search = search;
    if (status !== 'ALL') p.status = status as ProjectStatus;
    return p;
  }, [search, status, currentPage]);

  const { projects, pagination, isLoading, error } = useProjects(apiParams);
  const projectList = projects || [];

  return (
    <div className="space-y-2">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="프로젝트명 검색..."
              className="pl-10 w-[280px]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setParams({ status: value, pageNum: 1 });
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="PENDING">대기</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="default"
            size="default"
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            검색
          </Button>
        </div>
        <p className="text-sm text-slate-500">
          총{' '}
          <span className="font-semibold text-slate-900">
            {pagination?.totalCount ?? 0}
          </span>
          개 프로젝트
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-slate-100">
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  프로젝트명
                </div>
              </TableHead>
              <TableHead>클라이언트</TableHead>
              <TableHead className="text-center">타입</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  기간
                </div>
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={8} message="프로젝트를 불러오는 중..." />
            ) : error ? (
              <TableError
                colSpan={8}
                message={
                  error.message || '프로젝트 목록을 불러오는데 실패했습니다'
                }
                onRetry={() => {
                  setParams({ search: '', status: 'ALL', pageNum: 1 });
                }}
              />
            ) : projectList.length === 0 ? (
              <TableEmpty colSpan={8} message="프로젝트가 없습니다" />
            ) : (
              projectList.map((project) => (
                <TableRow key={project.id} className="group">
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {project.client || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-normal">
                      {PROJECT_TYPE_LABELS[project.projectType as ProjectType] ||
                        project.projectType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        PROJECT_STATUS_VARIANTS[project.status as ProjectStatus] || 'outline'
                      }
                    >
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus] || project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm whitespace-nowrap">
                      <span className="text-slate-600">
                        {project.startDate ? formatDate(project.startDate) : '-'}
                      </span>
                      <span className="text-slate-400 mx-1">~</span>
                      <span className="text-slate-600">
                        {project.endDate ? formatDate(project.endDate) : '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <Link href={`/projects/${project.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && pagination && pagination.pages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={(page) => setParam('pageNum', page)}
        />
      )}
    </div>
  );
}
