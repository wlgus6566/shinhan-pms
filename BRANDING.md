# 이모션 PMS 브랜딩 가이드

## 회사 정보

- 회사명: 이모션 (Emotion)
- 도메인: emotion.co.kr
- 프로젝트: 이모션 PMS (Project Management System)
- 목적: 범용 프로젝트 및 업무 관리 시스템

## 색상 팔레트

### 주요 색상

```typescript
emotion: {
  primary: '#6366F1',      // 인디고 (주색상) - 버튼, 링크, 강조
  secondary: '#8B5CF6',    // 보라 (보조색상) - 아이콘, 배지
  accent: '#EC4899',       // 핑크 (강조색) - CTA, 알림
  lightgray: '#F9FAFB',    // 연한 회색 - 배경
}
```

### 사용 예시

- **Primary (인디고)**: 로고, 주요 버튼, 활성 메뉴, 링크
- **Secondary (보라)**: 아이콘, 배지, 보조 버튼
- **Accent (핑크)**: Call-to-Action, 중요 알림, 강조 요소
- **Light Gray**: 전체 배경, 카드 배경

## 로고

- 심볼: "E" (이모션의 첫 글자)
- 색상: 그라데이션 (primary → secondary)
- 텍스트: "EMOTION PMS"
  - EMOTION: 그라데이션 (primary → secondary)
  - PMS: 회색 (#94A3B8)

## 테스트 계정

모든 계정의 비밀번호는 `password123`입니다.

### PM (Project Manager)

- 이메일: kim@emotion.co.kr
- 권한: 모든 기능 접근 가능

### PL (Project Leader)

- 이메일: lee@emotion.co.kr
- 권한: 프로젝트 수정, 팀원 관리

### PA (Project Assistant)

- park@emotion.co.kr
- jung@emotion.co.kr
- choi@emotion.co.kr
- kang@emotion.co.kr
- yoon@emotion.co.kr
- lim@emotion.co.kr
- 권한: 조회 권한만

## 타이포그래피

- 제목: font-bold
- 본문: font-normal
- 강조: font-semibold
- 보조: font-light

## UI 컴포넌트 스타일

- Border Radius: rounded-lg (8px), rounded-xl (12px)
- 그림자: shadow-sm, shadow-md, shadow-lg
- 간격: space-y-4, gap-4
- 애니메이션: transition-all, duration-300

## 접근성

- 색상 대비: WCAG AA 준수
- 포커스 표시: ring-2, ring-emotion-primary
- 키보드 네비게이션: 모든 인터랙티브 요소

## 반응형

- 최소 너비: 1024px (PC 전용)
- 1024px 미만: 가로 스크롤
