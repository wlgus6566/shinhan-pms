# API Fetcher

프로젝트의 API 통신을 위한 fetcher 유틸리티입니다.

## ✅ 마이그레이션 완료

모든 API 파일이 새로운 fetcher로 마이그레이션되었습니다:
- ✅ `projects.ts` - 프로젝트 관리 API
- ✅ `users.ts` - 멤버 관리 API
- ✅ `auth.ts` - 인증 API
- ✅ `projectMembers.ts` - 프로젝트 멤버 관리 API
- ✅ `AuthContext.tsx` - tokenManager 사용
- ⚠️ `client.ts` - Deprecated (레거시 하위호환용)

## 파일 구조

### 1. `fetcher.ts` (기본 버전)
- 단순한 API 클라이언트
- JWT 토큰 관리
- 401 에러 시 자동 로그아웃
- 기본적인 에러 처리

**사용 예시:**
```typescript
import { fetcher } from '@/lib/api/fetcher';

// GET 요청
const users = await fetcher('/api/users');

// POST 요청
const newUser = await fetcher('/api/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
});

// PUT 요청
const updatedUser = await fetcher('/api/users/1', {
  method: 'PUT',
  body: { name: 'Jane' }
});

// DELETE 요청
await fetcher('/api/users/1', {
  method: 'DELETE'
});
```

### 2. `fetcher-advanced.ts` (고급 버전)
- 토큰 갱신 로직 포함 (현재는 미구현)
- 요청 큐잉 (토큰 갱신 중 대기)
- 상세한 에러 코드별 처리
- 중복 요청 방지

**사용 예시:**
```typescript
import { fetcher } from '@/lib/api/fetcher-advanced';

// 기본 사용법은 fetcher.ts와 동일
const data = await fetcher('/api/data');
```

### 3. `client.ts` (레거시)
- 기존 fetch 기반 클라이언트
- 하위 호환성을 위해 유지

## Token Manager

### 메서드

```typescript
// 토큰 저장
tokenManager.setAccessToken('your-token');

// 토큰 조회
const token = tokenManager.getAccessToken();

// 토큰 삭제
tokenManager.clearTokens();
```

## 에러 처리

### 401 Unauthorized
- 자동으로 localStorage 초기화
- 로그인 페이지로 리다이렉트

### 403 Forbidden
- 권한 없음 알림 표시
- 에러 반환

### 500 Server Error
- 콘솔에 에러 로그 출력
- 에러 반환

## Axios Interceptors

### Request Interceptor
- 자동으로 Authorization 헤더 추가
- Bearer 토큰 방식

### Response Interceptor
- 성공 응답: `response.data` 반환
- 에러 응답: 상태 코드별 처리

## 마이그레이션 가이드

### 기존 코드에서 마이그레이션

**Before (client.ts):**
```typescript
import { fetchApi } from '@/lib/api/client';

const data = await fetchApi('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
});
```

**After (fetcher.ts):**
```typescript
import { fetcher } from '@/lib/api/fetcher';

const data = await fetcher('/api/users', {
  method: 'POST',
  body: { name: 'John' }  // JSON.stringify 불필요
});
```

## 권장 사항

1. **새로운 API 호출**: `fetcher.ts` 사용
2. **토큰 갱신 필요**: `fetcher-advanced.ts`로 마이그레이션 후 토큰 갱신 로직 구현
3. **기존 코드**: 점진적으로 `fetcher.ts`로 마이그레이션

## 환경 변수

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

백엔드 API URL을 설정합니다. 설정하지 않으면 빈 문자열이 기본값입니다.
