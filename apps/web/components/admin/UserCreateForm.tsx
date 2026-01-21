'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserCreateFormSchema,
  type UserCreateFormInput,
} from '@repo/schema';
import { createUser } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect } from '@/components/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Loader2, Upload, User } from 'lucide-react';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS, POSITION_OPTIONS } from '@/lib/constants/roles';

export function UserCreateForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const form = useForm<UserCreateFormInput>({
    resolver: zodResolver(UserCreateFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      position: 'TEAM_MEMBER',
      role: 'MEMBER',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기는 5MB 이하여야 합니다');
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: UserCreateFormInput) {
    setIsSaving(true);
    setError(null);

    try {
      // TODO: 실제로는 이미지를 서버에 업로드하고 URL을 받아와야 함
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
        position: values.position,
        role: values.role,
        profileImage: profileImage || undefined,
      };

      await createUser(userData);
      router.push('/users');
    } catch (err: any) {
      setError(err.message || '멤버 등록 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 프로필 사진 */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            {profileImage ? (
              <AvatarImage src={profileImage} alt="프로필" />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {profileImage ? '사진 변경' : '사진 업로드'}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF (최대 5MB)
          </p>
        </div>

        {/* 이름 */}
        <FormInput
          control={form.control}
          name="name"
          label="이름 *"
          placeholder="이름을 입력하세요"
        />

        {/* 이메일 */}
        <FormInput
          control={form.control}
          name="email"
          label="이메일 *"
          type="email"
          placeholder="email@emotion.co.kr"
        />

        {/* 비밀번호 */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="password"
            label="비밀번호 *"
            type="password"
            placeholder="••••••••"
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            label="비밀번호 확인 *"
            type="password"
            placeholder="••••••••"
          />
        </div>

        {/* 본부 */}
        <FormSelect
          control={form.control}
          name="department"
          label="본부 *"
          placeholder="본부를 선택하세요"
          options={DEPARTMENT_OPTIONS}
        />

        {/* 직책 */}
        <FormSelect
          control={form.control}
          name="position"
          label="직책 *"
          placeholder="직책을 선택하세요"
          options={POSITION_OPTIONS}
        />

        {/* 관리자 유형 */}
        <FormSelect
          control={form.control}
          name="role"
          label="관리자 유형 *"
          placeholder="권한을 선택하세요"
          options={ROLE_OPTIONS}
          description="슈퍼 관리자는 전체 권한, 프로젝트 관리자는 프로젝트 관리 권한, 일반은 업무일지 작성 권한을 가집니다"
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            등록
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
