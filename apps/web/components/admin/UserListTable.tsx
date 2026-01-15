'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUsers } from '@/lib/api/users';
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

const roleLabels: Record<string, string> = {
  PM: 'PM',
  PL: 'PL',
  PA: 'PA',
  MEMBER: '팀원',
};

const departmentLabels: Record<string, string> = {
  PLANNING: '기획',
  DESIGN: '디자인',
  PUBLISHING: '퍼블리싱',
  DEVELOPMENT: '개발',
};

export function UserListTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [role, setRole] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (department !== 'ALL') params.department = department;
      if (role !== 'ALL') params.role = role;
      
      const result = await getUsers(params);
      setUsers(result.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, department, role]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-width-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름 또는 이메일 검색"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="파트 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 파트</SelectItem>
            <SelectItem value="PLANNING">기획</SelectItem>
            <SelectItem value="DESIGN">디자인</SelectItem>
            <SelectItem value="PUBLISHING">퍼블리싱</SelectItem>
            <SelectItem value="DEVELOPMENT">개발</SelectItem>
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="등급 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 등급</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
            <SelectItem value="PL">PL</SelectItem>
            <SelectItem value="PA">PA</SelectItem>
            <SelectItem value="MEMBER">팀원</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>파트</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  사용자가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{departmentLabels[user.department] || user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'PM' ? 'default' : 'secondary'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                      {user.isActive ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>상세</Link>
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
