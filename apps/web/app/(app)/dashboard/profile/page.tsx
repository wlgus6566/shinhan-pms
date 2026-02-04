'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="max-w-2xl page-animate">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">프로필 설정</h1>
        <p className="text-muted-foreground mt-1">내 정보를 관리하고 보안 설정을 업데이트하세요</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">기본 정보</TabsTrigger>
          <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card className="rounded-2xl border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl font-bold">기본 정보 수정</CardTitle>
              <CardDescription>성함과 소속 파트 정보를 최신으로 유지하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card className="rounded-2xl border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <CardTitle className="text-xl font-bold">비밀번호 업데이트</CardTitle>
              <CardDescription>계정 보안을 위해 안전한 비밀번호를 사용하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
