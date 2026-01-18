# Form 컴포넌트 사용 가이드

재사용 가능한 Form 컴포넌트 모음입니다. React Hook Form과 함께 사용하도록 설계되었습니다.

## 설치된 컴포넌트

- `FormInput` - 텍스트 입력
- `FormTextarea` - 여러 줄 텍스트 입력
- `FormSelect` - 드롭다운 선택
- `FormCheckbox` - 체크박스
- `FormRadioGroup` - 라디오 버튼 그룹
- `FormSwitch` - 토글 스위치

## 사용 예시

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormSwitch,
} from "@/components/form";

const formSchema = z.object({
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 형식을 입력해주세요"),
  phone: z.string(),
  description: z.string().optional(),
  role: z.string(),
  status: z.string(),
  terms: z.boolean(),
  notifications: z.boolean(),
});

export function ExampleForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      role: "",
      status: "active",
      terms: false,
      notifications: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* FormInput - 일반 텍스트 입력 */}
        <FormInput
          control={form.control}
          name="name"
          label="이름"
          placeholder="홍길동"
        />

        {/* FormInput - 이메일 */}
        <FormInput
          control={form.control}
          name="email"
          label="이메일"
          type="email"
          placeholder="name@example.com"
        />

        {/* FormInput - 숫자만 입력 */}
        <FormInput
          control={form.control}
          name="phone"
          label="전화번호"
          placeholder="01012345678"
          format="number"
          description="숫자만 입력해주세요"
        />

        {/* FormTextarea - 여러 줄 텍스트 */}
        <FormTextarea
          control={form.control}
          name="description"
          label="설명"
          placeholder="내용을 입력하세요"
          rows={5}
        />

        {/* FormSelect - 드롭다운 */}
        <FormSelect
          control={form.control}
          name="role"
          label="역할"
          placeholder="역할을 선택하세요"
          options={[
            { value: "admin", label: "관리자" },
            { value: "user", label: "사용자" },
            { value: "guest", label: "게스트" },
          ]}
        />

        {/* FormRadioGroup - 라디오 버튼 */}
        <FormRadioGroup
          control={form.control}
          name="status"
          label="상태"
          options={[
            { value: "active", label: "활성" },
            { value: "inactive", label: "비활성" },
            { value: "pending", label: "대기" },
          ]}
        />

        {/* FormCheckbox - 체크박스 */}
        <FormCheckbox
          control={form.control}
          name="terms"
          label="약관에 동의합니다"
          description="서비스 이용약관 및 개인정보처리방침에 동의합니다"
        />

        {/* FormSwitch - 토글 스위치 */}
        <FormSwitch
          control={form.control}
          name="notifications"
          label="알림 받기"
          description="중요한 업데이트와 알림을 받습니다"
        />

        <Button type="submit">제출</Button>
      </form>
    </Form>
  );
}
```

## 공통 Props

모든 Form 컴포넌트는 다음 공통 props를 지원합니다:

- `control` (required): React Hook Form의 control 객체
- `name` (required): 필드 이름
- `label`: 레이블 텍스트
- `className`: 입력 요소의 className
- `wrapClassName`: FormItem wrapper의 className
- `errorMessage`: 에러 메시지 표시 여부 (기본값: true)
- `description`: 도움말 텍스트
- `disabled`: 비활성화 여부

## 컴포넌트별 추가 Props

### FormInput
- `type`: input type (text, email, password 등)
- `placeholder`: placeholder 텍스트
- `format`: "number" 입력 시 숫자만 허용

### FormTextarea
- `placeholder`: placeholder 텍스트
- `rows`: 표시할 줄 수 (기본값: 4)

### FormSelect
- `placeholder`: placeholder 텍스트 (기본값: "선택해주세요")
- `options`: 선택 옵션 배열 `{ value: string, label: string }[]`

### FormRadioGroup
- `options`: 라디오 옵션 배열 `{ value: string, label: string }[]`

### FormCheckbox
- label과 description이 체크박스 오른쪽에 표시됩니다

### FormSwitch
- label과 description이 스위치 왼쪽에 표시되며, border와 padding이 적용됩니다
