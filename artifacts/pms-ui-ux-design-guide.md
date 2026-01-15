# PMS UI/UX 디자인 가이드 (shadcn/ui 기반)

> 이 문서는 `shadcn/ui + Tailwind CSS`를 기반으로 한 신한카드 PMS 시스템의 UI 구성 및 디자인 원칙을 정의합니다.
> 컴포넌트는 [shadcn/ui](https://ui.shadcn.com) 라이브러리를 기반으로 재사용성을 고려하여 설계합니다.

---

## 1. 기술 및 디자인 스택

- **UI 라이브러리**: `shadcn/ui`
- **스타일링**: `Tailwind CSS`
- **기반 컴포넌트**: `Radix UI`
- **아이콘**: `Lucide-react`
- **폰트**: `Pretendard` 또는 `system-ui`

---

## 2. 전체 레이아웃 구성

┌────────────────────────────────────────────────────┐
│ Header (Breadcrumb / Page Title)                  │
├──────────────┬─────────────────────────────────────┤
│ Sidebar      │ Main Content Area                   │
│ (Fixed)      │ (List / Table / Calendar / Detail) │
│              │                                     │
└──────────────┴─────────────────────────────────────┘
- **기준 해상도**: 1440px 이상
- **최소 지원 해상도**: 1280px
- **구조**: 좌측 사이드바 고정, 콘텐츠 영역 스크롤

---

## 3. 사이드바 디자인 가이드

### 3.1 사이드바 기본 스펙
| 항목 | 값 |
| :--- | :--- |
| 너비 | 240px |
| 배경색 | #FFFFFF |
| 구분선 | #E5E5E5 |
| 고정 여부 | Fixed |
| 스크롤 | 내부 스크롤 |

### 3.2 사이드바 구성
- [ Logo 영역 ]
- [ 메뉴 리스트 ]
  - 대시보드
  - 프로젝트 관리
  - 업무 관리
  - 일정 관리
  - 현황 관리
  - 회원 관리 (관리자 전용)
- [ 사용자 프로필 카드 ]
  - 사용자명 / 소속 / 로그아웃

---

## 4. 주요 컴포넌트 정의

### 4.1 버튼 (<Button>)
| 상태 | Tailwind Class |
| :--- | :--- |
| 기본 | `variant="default"` → bg-primary text-white |
| 서브 | `variant="secondary"` → border border-input |
| 위험 | `variant="destructive"` → bg-destructive text-white |
| 비활성화 | `disabled` → opacity-50 pointer-events-none |

### 4.2 카드 (<Card>)
- **Radius**: `rounded-2xl` (1rem)
- **Shadow**: `shadow-sm` 또는 `shadow-md`
- **내부 여백**: `p-6`

### 4.3 테이블 (<Table>)
- **헤더**: `bg-muted/50 text-muted-foreground text-sm font-medium`
- **행 Hover**: `hover:bg-muted transition-colors`
- **셀 정렬**: 왼쪽 정렬 / 날짜는 가운데

---

## 5. 색상 시스템 (Tailwind 기반 Token 사용)
| 이름 | Tailwind Token | HEX (신한 브랜드 적용) |
| :--- | :--- | :--- |
| Primary | `bg-primary` | #0046FF (Shinhan Blue) |
| Secondary | `bg-secondary` | #FFD200 (Shinhan Gold) |
| Background | `bg-background` | #F4F7FF (Shinhan Light Gray) |
| Border | `border-input` | #E5E5E5 |
| Text | `text-foreground` | #333333 |
| Muted | `text-muted` | #888888 |
| Destructive | `bg-destructive` | #FF4D4F |

---

## 6. 타이포그래피 시스템
| 컴포넌트 | Tailwind Class | 사용 위치 |
| :--- | :--- | :--- |
| Title | `text-2xl font-bold` | 페이지 타이틀 |
| Section Title | `text-xl font-semibold` | 섹션 제목 |
| Body | `text-base` | 기본 텍스트 |
| Label | `text-sm text-muted-foreground` | 필드 라벨 등 |
| Caption | `text-xs text-muted` | 날짜, 설명 등 |

---

## 7. 인터랙션 및 애니메이션
- **페이지 전환**: fade/slide 150ms
- **버튼/폼**: `transition-colors duration-150 ease-in-out`
- **접근성**: WAI-ARIA 준수 (Radix UI 기반)
