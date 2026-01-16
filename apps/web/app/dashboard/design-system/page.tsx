'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Calendar,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          신한 PMS 디자인 시스템
        </h1>
        <p className="text-sm text-muted-foreground">
          shadcn/ui + Tailwind CSS 기반의 신한카드 PMS 컴포넌트 라이브러리
        </p>
      </div>

      {/* Color System */}
      <Card>
        <CardHeader>
          <CardTitle>색상 시스템</CardTitle>
          <CardDescription>신한 브랜드 색상 및 시스템 색상</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 브랜드 색상 */}
            <div>
              <h3 className="text-sm font-semibold mb-3">브랜드 색상</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-shinhan-blue rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Shinhan Blue</p>
                  <p className="text-xs text-muted-foreground">#0046FF</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-shinhan-darkblue rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Shinhan Dark Blue</p>
                  <p className="text-xs text-muted-foreground">#0035CC</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-shinhan-gold rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Shinhan Gold</p>
                  <p className="text-xs text-muted-foreground">#FFD200</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-shinhan-lightgray rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Shinhan Light Gray</p>
                  <p className="text-xs text-muted-foreground">#F4F7FF</p>
                </div>
              </div>
            </div>

            {/* 시스템 색상 */}
            <div>
              <h3 className="text-sm font-semibold mb-3">시스템 색상</h3>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-primary rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-secondary rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-muted rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-accent rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-destructive rounded-lg shadow-md" />
                  <p className="text-xs font-medium">Destructive</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>타이포그래피</CardTitle>
          <CardDescription>텍스트 스타일 및 계층 구조</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Title - 페이지 타이틀</h1>
            <p className="text-xs text-muted-foreground">text-2xl font-bold</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Section Title - 섹션 제목</h2>
            <p className="text-xs text-muted-foreground">text-xl font-semibold</p>
          </div>
          <div className="space-y-2">
            <p className="text-base">Body - 기본 텍스트</p>
            <p className="text-xs text-muted-foreground">text-base</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Label - 필드 라벨</p>
            <p className="text-xs text-muted-foreground">text-sm text-muted-foreground</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted">Caption - 날짜, 설명</p>
            <p className="text-xs text-muted-foreground">text-xs text-muted</p>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>버튼</CardTitle>
          <CardDescription>다양한 버튼 스타일과 크기</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="variants">
            <TabsList>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="sizes">Sizes</TabsTrigger>
              <TabsTrigger value="with-icons">With Icons</TabsTrigger>
            </TabsList>
            <TabsContent value="variants" className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </TabsContent>
            <TabsContent value="sizes" className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </TabsContent>
            <TabsContent value="with-icons" className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-3">
                <Button>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  대시보드
                </Button>
                <Button variant="secondary">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  프로젝트
                </Button>
                <Button variant="outline">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  업무
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>폼 입력</CardTitle>
          <CardDescription>Input, Select 등 폼 요소</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="input-demo">Input Field</Label>
              <Input id="input-demo" placeholder="입력하세요..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="select-demo">Select Field</Label>
              <Select>
                <SelectTrigger id="select-demo">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">옵션 1</SelectItem>
                  <SelectItem value="option2">옵션 2</SelectItem>
                  <SelectItem value="option3">옵션 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input id="input-disabled" placeholder="비활성화됨" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-error">Input with Error</Label>
              <Input id="input-error" placeholder="오류 상태" className="border-destructive" />
              <p className="text-xs text-destructive">오류 메시지가 여기에 표시됩니다</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>카드</CardTitle>
          <CardDescription>다양한 카드 구성</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Simple Card</CardTitle>
                <CardDescription>기본 카드 스타일</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">카드 콘텐츠가 여기에 들어갑니다.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Card with Badge</CardTitle>
                <CardDescription>뱃지가 있는 카드</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge>진행중</Badge>
                <Badge variant="secondary">완료</Badge>
                <Badge variant="destructive">긴급</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Card with Footer</CardTitle>
                <CardDescription>푸터가 있는 카드</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">액션 버튼이 필요한 카드</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button size="sm" variant="outline">취소</Button>
                <Button size="sm">확인</Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>뱃지</CardTitle>
          <CardDescription>상태 표시 및 태그</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-shinhan-blue">Shinhan Blue</Badge>
            <Badge className="bg-shinhan-gold text-slate-900">Shinhan Gold</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>알림</CardTitle>
          <CardDescription>다양한 알림 스타일</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>정보</AlertTitle>
            <AlertDescription>
              일반적인 정보 메시지가 여기에 표시됩니다.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">성공</AlertTitle>
            <AlertDescription className="text-green-800">
              작업이 성공적으로 완료되었습니다.
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900">경고</AlertTitle>
            <AlertDescription className="text-yellow-800">
              주의가 필요한 상황입니다.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>
              작업을 완료할 수 없습니다. 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>테이블</CardTitle>
          <CardDescription>데이터 테이블 예제</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>프로젝트명</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">진행률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">신한 PMS 시스템 개발</TableCell>
                <TableCell>홍길동</TableCell>
                <TableCell><Badge>진행중</Badge></TableCell>
                <TableCell className="text-right">75%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">카드 앱 리뉴얼</TableCell>
                <TableCell>김철수</TableCell>
                <TableCell><Badge variant="secondary">완료</Badge></TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">인프라 고도화</TableCell>
                <TableCell>이영희</TableCell>
                <TableCell><Badge variant="destructive">지연</Badge></TableCell>
                <TableCell className="text-right">45%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Icons */}
      <Card>
        <CardHeader>
          <CardTitle>아이콘</CardTitle>
          <CardDescription>Lucide React 아이콘 세트</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Dashboard</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FolderKanban className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Projects</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ClipboardList className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Tasks</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Calendar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Analytics</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-shinhan-blue" />
              <span className="text-xs">Users</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
