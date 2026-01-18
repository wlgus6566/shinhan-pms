'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProjects } from '@/lib/api/projects';
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
import { Loader2, Search } from 'lucide-react';
import type { Project, ProjectStatus } from '@/types/project';

const statusLabels: Record<ProjectStatus, string> = {
  PENDING: '대기',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  ON_HOLD: '보류',
};

const statusVariants: Record<ProjectStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'outline',
  ON_HOLD: 'destructive',
};

export function ProjectListTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      console.log('🔄 프로젝트 목록 조회 시작...', { search, status });
      
      try {
        const params: any = {};
        if (search) params.search = search;
        if (status !== 'ALL') params.status = status as ProjectStatus;
        
        console.log('📡 API 호출:', '/api/projects', params);
        const result = await getProjects(params);
        console.log('✅ 프로젝트 목록 조회 성공:', result.length, '개');
        setProjects(result);
      } catch (error: any) {
        console.error('❌ 프로젝트 목록 조회 실패:', error);
        setError(error.message || '프로젝트 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search, status]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="프로젝트명 검색"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 상태</SelectItem>
            <SelectItem value="PENDING">대기</SelectItem>
            <SelectItem value="IN_PROGRESS">진행중</SelectItem>
            <SelectItem value="COMPLETED">완료</SelectItem>
            <SelectItem value="ON_HOLD">보류</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로젝트명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>진행률</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>생성자</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSearch('');
                        setStatus('ALL');
                      }}
                    >
                      다시 시도
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-muted-foreground">프로젝트가 없습니다</p>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {project.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[project.status]}>
                      {statusLabels[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[60px]">
                        <div 
                          className="h-full bg-blue-500 transition-all" 
                          style={{ width: `${project.progress}%` }} 
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[40px]">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
                  </TableCell>
                  <TableCell>{project.creator?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>상세</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
