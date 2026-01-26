'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUser, updateUser, deactivateUser, useUser } from '@/lib/api/users';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect, FormSwitch } from '@/components/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle2, Loader2, Upload, User } from 'lucide-react';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS, POSITION_OPTIONS, GRADE_OPTIONS } from '@/lib/constants/roles';

// Create 모드 스키마 (비밀번호 포함)
const userCreateSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(50, '이름은 최대 50자까지 입력할 수 있습니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(
        /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        '비밀번호는 영문 소문자, 숫자, 특수문자를 포함해야 합니다',
      ),
    confirmPassword: z.string(),
    department: z.string().min(1, '본부를 선택하세요'),
    position: z.enum(['DIVISION_HEAD', 'GENERAL_MANAGER', 'PRINCIPAL_LEADER', 'SENIOR_LEADER', 'LEADER', 'TEAM_MEMBER']),
    role: z.enum(['SUPER_ADMIN', 'PM', 'MEMBER']),
    grade: z.enum(['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// Edit 모드 스키마 (비밀번호 제외)
const userEditSchema = z.object({
  department: z.string().min(1, '본부를 선택하세요'),
  position: z.enum(['DIVISION_HEAD', 'GENERAL_MANAGER', 'PRINCIPAL_LEADER', 'SENIOR_LEADER', 'LEADER', 'TEAM_MEMBER']),
  role: z.enum(['SUPER_ADMIN', 'PM', 'MEMBER']),
  grade: z.enum(['EXPERT', 'ADVANCED', 'INTERMEDIATE', 'BEGINNER']),
  isActive: z.boolean(),
});

type UserCreateValues = z.infer<typeof userCreateSchema>;
type UserEditValues = z.infer<typeof userEditSchema>;

interface UserFormProps {
  mode: 'create' | 'edit';
  userId?: string | number;
}

export function UserForm({ mode, userId }: UserFormProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // 권한 검사: SUPER_ADMIN만 수정 가능
  const canEdit = useMemo(
    () => currentUser?.role === 'SUPER_ADMIN',
    [currentUser?.role],
  );

  // Edit 모드일 때만 사용자 데이터 조회
  const { user: userData, isLoading, error: fetchError } = useUser(
    mode === 'edit' ? (userId ?? null) : null
  );

  // 조건부 스키마 적용
  const form = useForm<UserCreateValues | UserEditValues>({
    resolver: zodResolver(mode === 'create' ? userCreateSchema : userEditSchema),
    defaultValues: mode === 'create'
      ? {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          department: '',
          position: 'TEAM_MEMBER',
          role: 'MEMBER',
          grade: 'BEGINNER',
        }
      : {
          department: '',
          position: 'TEAM_MEMBER',
          role: 'MEMBER',
          grade: 'BEGINNER',
          isActive: true,
        },
  });

  // Edit 모드에서 데이터 로딩 후 폼에 설정
  useEffect(() => {
    if (userData && mode === 'edit') {
      form.reset({
        department: userData.department,
        position: userData.position as 'DIVISION_HEAD' | 'GENERAL_MANAGER' | 'PRINCIPAL_LEADER' | 'SENIOR_LEADER' | 'LEADER' | 'TEAM_MEMBER',
        role: userData.role as 'SUPER_ADMIN' | 'PM' | 'MEMBER',
        grade: userData.grade as 'EXPERT' | 'ADVANCED' | 'INTERMEDIATE' | 'BEGINNER',
        isActive: userData.isActive,
      });
      // 프로필 이미지 설정
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, mode]);

  // Fetch 에러 처리
  useEffect(() => {
    if (fetchError) {
      setError(fetchError.message || '사용자 정보를 불러오는데 실패했습니다');
    }
  }, [fetchError]);

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

  async function onSubmit(values: UserCreateValues | UserEditValues) {
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    try {
      if (mode === 'create') {
        // Create 모드
        const createValues = values as UserCreateValues;
        const userData = {
          name: createValues.name,
          email: createValues.email,
          password: createValues.password,
          department: createValues.department,
          position: createValues.position,
          role: createValues.role,
          grade: createValues.grade,
          profileImage: profileImage || undefined,
        };

        await createUser(userData);
        router.push('/users');
      } else {
        // Edit 모드
        if (!userId) {
          throw new Error('사용자 ID가 필요합니다');
        }
        const editValues = values as UserEditValues;
        await updateUser(userId.toString(), editValues);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || '처리 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeactivate() {
    if (!userId) return;

    setIsDeactivating(true);
    try {
      await deactivateUser(userId.toString());
      router.push('/users');
    } catch (err: any) {
      setError(err.message);
      setIsDeactivating(false);
    }
  }

  // Edit 모드 로딩 중
  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Edit 모드에서 데이터 없음
  if (mode === 'edit' && !userData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {mode === 'edit' && !canEdit && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            사용자 정보를 조회할 수 있습니다. 수정은 슈퍼 관리자만 가능합니다.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                사용자 정보가 업데이트되었습니다
              </AlertDescription>
            </Alert>
          )}
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
              disabled={mode === 'edit' && !canEdit}
            />
            {(mode === 'create' || (mode === 'edit' && canEdit)) && (
              <>
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
              </>
            )}
          </div>

          {/* Edit 모드: name, email readonly 표시 */}
          {mode === 'edit' && userData && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm text-muted-foreground">이름</p>
                <p className="font-medium">{userData.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이메일</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>
          )}

          {/* Create 모드: name, email 입력 필드 */}
          {mode === 'create' && (
            <>
              <FormInput
                control={form.control}
                name="name"
                label="이름 *"
                placeholder="이름을 입력하세요"
              />

              <FormInput
                control={form.control}
                name="email"
                label="이메일 *"
                type="email"
                placeholder="email@emotion.co.kr"
              />

              {/* 비밀번호 (Create만) */}
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
            </>
          )}

          {/* 본부 */}
          <FormSelect
            control={form.control}
            name="department"
            label="본부 *"
            placeholder="본부를 선택하세요"
            options={DEPARTMENT_OPTIONS}
            disabled={mode === 'edit' && !canEdit}
          />

          {/* 직책 */}
          <FormSelect
            control={form.control}
            name="position"
            label="직책 *"
            placeholder="직책을 선택하세요"
            options={POSITION_OPTIONS}
            disabled={mode === 'edit' && !canEdit}
          />

          {/* 관리자 유형 */}
          <FormSelect
            control={form.control}
            name="role"
            label="관리자 유형 *"
            placeholder="권한을 선택하세요"
            options={ROLE_OPTIONS}
            description="슈퍼 관리자는 전체 권한, 프로젝트 관리자는 프로젝트 관리 권한, 일반은 업무일지 작성 권한을 가집니다"
            disabled={mode === 'edit' && !canEdit}
          />

          {/* 등급 */}
          <FormSelect
            control={form.control}
            name="grade"
            label="등급 *"
            placeholder="등급을 선택하세요"
            options={GRADE_OPTIONS}
            disabled={mode === 'edit' && !canEdit}
          />

          {/* isActive (Edit 전용) */}
          {mode === 'edit' && canEdit && (
            <FormSwitch
              control={form.control}
              name="isActive"
              label="계정 활성화"
              description="비활성화된 사용자는 로그인할 수 없습니다."
            />
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-4 pt-4">
            {mode === 'create' ? (
              <>
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
              </>
            ) : (
              canEdit && (
                <>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    저장
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">비활성화</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>사용자 비활성화</DialogTitle>
                        <DialogDescription>
                          정말 이 사용자를 비활성화하시겠습니까? 비활성화된 사용자는
                          시스템에 접근할 수 없습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>
                          취소
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={onDeactivate}
                          disabled={isDeactivating}
                        >
                          {isDeactivating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          확인
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
