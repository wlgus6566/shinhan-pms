# Responsive Design Work Plan

## Context

### Original Request
모든 페이지가 현재 PC 화면(1440px 고정) 위주로 되어있는데, 모바일에서도 예쁘게 보고 사용할 수 있게 반응형으로 작업하기.

### Architecture Summary
- **Frontend**: Next.js CSR-only App Router, Tailwind CSS, shadcn/ui
- **Layout**: Fixed sidebar (240px/72px collapsible) + sticky header + content area
- **Pages**: 15 pages across 7 feature areas
- **Current State**: Desktop-only with `min-width: 1440px` on body, `min-w-[1280px]` on app shell

### Research Findings
- shadcn/ui components already support responsive patterns (Sheet, Dialog)
- Some responsive Tailwind classes already exist but are inert due to min-width constraints (`md:grid-cols-2`, `lg:grid-cols-4`, `hidden md:table-cell`)
- Default Tailwind breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Sidebar uses fixed positioning with pixel-based widths and content offset via `pl-[240px]`/`pl-[72px]`

---

## Work Objectives

### Core Objective
Transform the entire application from a desktop-only (1440px fixed) layout to a fully responsive design that works seamlessly across mobile (360px+), tablet (768px+), and desktop (1024px+) viewports.

### Deliverables
1. Responsive app shell (sidebar, header, content area)
2. Mobile navigation with drawer/sheet pattern
3. All 15 pages adapted for mobile, tablet, and desktop
4. No visual regressions on desktop (1440px)

### Definition of Done
- All pages render correctly at 360px, 768px, 1024px, and 1440px widths
- No horizontal scroll on any viewport
- Mobile navigation is touch-friendly and accessible
- All interactive elements are minimum 44px touch targets on mobile
- Data tables have a mobile-friendly alternative (card view or horizontal scroll)
- Calendar views remain usable on mobile

---

## Must Have
- Mobile-first navigation (hamburger menu + drawer)
- All 15 pages responsive at all breakpoints
- Touch-friendly interactions (44px minimum tap targets)
- No horizontal overflow at any breakpoint
- Desktop layout preserved exactly as-is at xl (1280px+)

## Must NOT Have
- No new dependencies (use existing shadcn Sheet component for mobile drawer)
- No changes to the API or backend
- No changes to business logic or data flow
- No redesign of existing desktop UI - only responsive adaptation
- No changes to the color system or typography scale
- No removal of existing features (e.g., sidebar collapse on desktop must remain)

---

## Breakpoint Strategy

| Breakpoint | Width | Layout Strategy |
|-----------|-------|-----------------|
| **Mobile** | < 768px | Single column. Sidebar hidden (drawer via hamburger). Header simplified. Content full-width with `p-4`. Tables become card lists or horizontally scrollable. Calendar sidebar stacks above calendar. |
| **Tablet** | 768px - 1023px | Single column with wider content. Sidebar still drawer. Content `p-6`. Tables show key columns. Calendar sidebar stacks above calendar. |
| **Desktop** | 1024px+ | Current layout restored. Fixed sidebar visible. Content with `pl-[240px]`/`pl-[72px]` offset. Full table columns. Side-by-side calendar layouts. `p-8` content padding. |

Key Tailwind breakpoints used:
- Default (mobile-first): < 768px
- `md:` (768px): Tablet adaptations
- `lg:` (1024px): Desktop sidebar appears, full layouts
- `xl:` (1280px): Wide desktop optimizations

---

## Phase 1: Remove Desktop Barriers & Global Responsive Foundation

### Objective
Remove all hard-coded minimum widths and establish responsive meta tags and global styles.

### Task 1.1: Remove body min-width constraint
**File**: `apps/web/app/globals.css`
**Line**: ~153-158
**Change**:
```css
/* BEFORE */
body {
  @apply bg-background text-foreground;
  overflow-x: auto;
  min-width: 1440px;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* AFTER */
body {
  @apply bg-background text-foreground;
  overflow-x: hidden;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
```
- Remove `min-width: 1440px`
- Change `overflow-x: auto` to `overflow-x: hidden` (prevent accidental horizontal scroll)

### Task 1.2: Remove app shell min-width constraint
**File**: `apps/web/app/(app)/layout.tsx`
**Line**: 35
**Change**:
```tsx
// BEFORE
<div className="min-h-screen min-w-[1280px] bg-emotion-lightgray">

// AFTER
<div className="min-h-screen bg-emotion-lightgray">
```
- Remove `min-w-[1280px]` class

### Task 1.3: Verify viewport meta tag
**File**: `apps/web/app/layout.tsx`
**Verify** that the root layout includes proper viewport meta. Next.js App Router should include this by default, but verify:
```tsx
export const metadata = {
  // ...existing metadata
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};
```
If not present via metadata export, ensure it exists.

### Task 1.4: Add responsive utility classes to globals.css
**File**: `apps/web/app/globals.css`
**Add** at the end of `@layer utilities`:
```css
/* Mobile-specific utilities */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* Hide scrollbar but allow scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### Acceptance Criteria (Phase 1)
- [ ] Body no longer has `min-width: 1440px`
- [ ] App shell no longer has `min-w-[1280px]`
- [ ] `overflow-x: hidden` on body prevents horizontal scroll
- [ ] Page renders at 360px width without horizontal scrollbar (content may overlap/break - that is expected and will be fixed in later phases)
- [ ] Desktop layout at 1440px is unchanged
- [ ] Viewport meta tag is correct

---

## Phase 2: Mobile Navigation (Sidebar to Drawer Conversion)

### Objective
Convert the fixed sidebar into a mobile-friendly drawer that opens via a hamburger menu button in the header, while preserving the existing desktop sidebar behavior.

### Task 2.1: Create mobile sidebar state management
**File**: `apps/web/app/(app)/layout.tsx`
**Changes**:
- Add a `mobileMenuOpen` state: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)`
- Pass `mobileMenuOpen` and `setMobileMenuOpen` to both `Sidebar` and `Header`
- Make the content area responsive:

```tsx
// BEFORE
<div
  className={cn(
    'pl-[240px] transition-all duration-300',
    sidebarOpen ? 'pl-[240px]' : 'pl-[72px]',
  )}
>
  <Header />
  <main className="p-8" style={{ viewTransitionName: 'page-content' }}>

// AFTER
<div
  className={cn(
    'transition-all duration-300',
    'lg:pl-[240px]',  // Desktop: offset for sidebar
    !sidebarOpen && 'lg:pl-[72px]',  // Desktop collapsed
    'pl-0',  // Mobile: no offset (sidebar is a drawer)
  )}
>
  <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
  <main className="p-4 md:p-6 lg:p-8" style={{ viewTransitionName: 'page-content' }}>
```

### Task 2.2: Make Sidebar responsive with Sheet (drawer) for mobile
**File**: `apps/web/components/layout/Sidebar.tsx`
**Changes**:
- Import `Sheet`, `SheetContent`, `SheetTrigger` from shadcn
- On mobile (< lg): Render sidebar content inside a `Sheet` component (slide-in drawer from left)
- On desktop (lg+): Keep existing fixed sidebar behavior
- Update props to accept `mobileMenuOpen` and `setMobileMenuOpen`

```tsx
// Updated component structure:
export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // ... existing hooks ...

  // Shared navigation content (extracted to avoid duplication)
  const navigationContent = (
    <>
      {/* Logo Area */}
      {/* ... existing logo ... */}

      {/* Navigation */}
      {/* ... existing nav items (always show labels in mobile drawer) ... */}

      {/* Stats Card */}
      {/* ... existing stats ... */}

      {/* User Profile */}
      {/* ... existing user profile ... */}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#1e1f2e] transition-all duration-300 z-50 flex flex-col',
          'hidden lg:flex',  // ADD: hide on mobile
          sidebarOpen ? 'w-[240px]' : 'w-[72px]',
        )}
      >
        {navigationContent}

        {/* Collapse Toggle - desktop only */}
        <button ... />
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-[#1e1f2e] border-none lg:hidden">
          {navigationContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

Key details:
- Desktop sidebar: Add `hidden lg:flex` to show only on lg+
- Mobile drawer: Use shadcn Sheet with `side="left"`, width 280px, same dark navy background
- In mobile drawer, always show full labels (equivalent to `sidebarOpen = true`)
- Close drawer on navigation link click (call `setMobileMenuOpen(false)` in link onClick)
- Remove the collapse toggle button from mobile drawer (not needed)

### Task 2.3: Add hamburger menu button to Header for mobile
**File**: `apps/web/components/layout/Header.tsx`
**Changes**:
- Accept `mobileMenuOpen` and `setMobileMenuOpen` props
- Add hamburger button visible only on mobile (< lg)
- Adjust header padding for mobile

```tsx
export function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // ...existing...

  return (
    <header className="h-16 flex items-center px-4 md:px-6 lg:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
      {/* Hamburger button - mobile only */}
      <button
        className="lg:hidden mr-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      <Breadcrumb>
        {/* ...existing breadcrumb... */}
      </Breadcrumb>
    </header>
  );
}
```
- Import `Menu` from lucide-react
- Change `px-8` to `px-4 md:px-6 lg:px-8`

### Task 2.4: Close mobile menu on route change
**File**: `apps/web/components/layout/Sidebar.tsx`
**Changes**:
- Use `usePathname()` to detect route changes
- Add `useEffect` to close mobile drawer when pathname changes:
```tsx
const pathname = usePathname();
useEffect(() => {
  setMobileMenuOpen(false);
}, [pathname]);
```

### Acceptance Criteria (Phase 2)
- [ ] At < 1024px (lg): Sidebar is hidden, hamburger icon visible in header
- [ ] Tapping hamburger opens a slide-in drawer from the left with full navigation
- [ ] Drawer closes when a navigation link is tapped
- [ ] Drawer closes when clicking outside (Sheet default behavior)
- [ ] Drawer closes on route change
- [ ] At >= 1024px (lg): Desktop sidebar appears as before with collapse toggle
- [ ] Content area has no left padding on mobile, correct padding on desktop
- [ ] Content padding is `p-4` on mobile, `p-6` on tablet, `p-8` on desktop

---

## Phase 3: Layout Components Responsive Adaptation

### Objective
Make the core layout components (header, content containers) and shared UI components responsive.

### Task 3.1: Make page headers responsive
Many pages use this pattern:
```tsx
<div className="flex items-center justify-between">
  <div><h1>Title</h1><p>Subtitle</p></div>
  <Button>Action</Button>
</div>
```

**Pattern to apply across all pages** (files listed below):
```tsx
// BEFORE
<div className="mb-8 flex justify-between items-start">

// AFTER
<div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
```
- Stack title and button vertically on mobile, side-by-side on sm+
- On mobile, action button should be full-width: add `className="w-full sm:w-auto"` to action buttons

**Files to update**:
- `apps/web/app/(app)/projects/page.tsx` (line 15)
- `apps/web/app/(app)/users/page.tsx` (line 15)
- `apps/web/app/(app)/work-logs/page.tsx` (line 266-273)
- `apps/web/app/(app)/analytics/page.tsx` (line 87-90)
- `apps/web/app/(app)/dashboard/page.tsx` (line 221-231)

### Task 3.2: Make page title text responsive
All `<h1>` titles currently use `text-3xl`. Make responsive:
```tsx
// BEFORE
<h1 className="text-3xl font-bold ...">

// AFTER
<h1 className="text-2xl lg:text-3xl font-bold ...">
```
**Apply to all 15 pages** that have an h1 title.

### Task 3.3: Make Tabs overflow-scrollable on mobile
Multiple pages use `<TabsList>` with many tabs that can overflow on mobile.
**File**: `apps/web/app/globals.css`
**Add** a global style for TabsList horizontal scroll:
```css
/* Responsive tabs - horizontal scroll on mobile */
[role="tablist"] {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
[role="tablist"]::-webkit-scrollbar {
  display: none;
}
```

Alternatively, add `overflow-x-auto scrollbar-hide` class to each `<TabsList>` component. Pages affected:
- `apps/web/app/(app)/work-logs/page.tsx` - project filter tabs
- `apps/web/app/(app)/schedule/page.tsx` - project tabs
- `apps/web/app/(app)/analytics/page.tsx` - project tabs (already has `overflow-x-auto`)
- `apps/web/app/(app)/projects/[id]/page.tsx` - detail tabs
- `apps/web/app/(app)/dashboard/profile/page.tsx` - profile tabs

### Acceptance Criteria (Phase 3)
- [ ] Page headers stack vertically on mobile with action button below title
- [ ] Title text is appropriately sized on mobile (text-2xl) vs desktop (text-3xl)
- [ ] Tabs are horizontally scrollable on mobile without visible scrollbar
- [ ] No horizontal overflow caused by tab lists on any page

---

## Phase 4: Page-by-Page Responsive Work

### Task 4.1: Login Page (`/`)
**File**: `apps/web/app/page.tsx`
**Current**: `flex-1 flex items-center justify-center p-8 bg-slate-50` with `max-w-md`
**Changes**:
- Change `p-8` to `p-4 md:p-8`
- The login page is already largely responsive (centered card, max-w-md). Minor adjustment only.
```tsx
// BEFORE
<div className="flex-1 flex items-center justify-center p-8 bg-slate-50">

// AFTER
<div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-slate-50">
```

### Task 4.2: Dashboard Page (`/dashboard`)
**File**: `apps/web/app/(app)/dashboard/page.tsx`
**Changes**:

1. **Header section** (line 221-231):
```tsx
// BEFORE
<section className="flex items-end justify-between">

// AFTER
<section className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
```

2. **Profile + Stats grid** (line 232):
```tsx
// BEFORE
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

// AFTER
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
```
This already works - single column on mobile, two columns on lg+. Good.

3. **Stats cards grid** (line 279):
```tsx
// BEFORE
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// AFTER (already responsive - keep as-is)
<div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
```
Change: show 2 columns on mobile (stats cards are compact enough), 4 on lg+. Remove md:grid-cols-2 in favor of always grid-cols-2 base.

4. **Quick Actions grid** (line 315):
```tsx
// BEFORE
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// AFTER
<div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

5. **Bottom section grid** (line 358):
```tsx
// Already has lg:grid-cols-2, single column on mobile - keep as-is
```

### Task 4.3: Profile Page (`/dashboard/profile`)
**File**: `apps/web/app/(app)/dashboard/profile/page.tsx`
**Current**: `max-w-2xl` - already constrains width nicely.
**Changes**:
```tsx
// BEFORE
<div className="max-w-2xl page-animate">

// AFTER
<div className="max-w-2xl mx-auto page-animate">
```
This page is already responsive-friendly. Minimal changes needed.

### Task 4.4: Design System Page (`/dashboard/design-system`)
**File**: `apps/web/app/(app)/dashboard/design-system/page.tsx`
**Changes**: This is an internal tool page. Apply basic responsive padding only. Low priority.

### Task 4.5: Projects List Page (`/projects`)
**File**: `apps/web/app/(app)/projects/page.tsx`
**Changes**: Page header (Task 3.1 pattern). The `ProjectListTable` component needs its own responsive treatment (see Task 4.5a).

**Task 4.5a: ProjectListTable responsive**
**File**: `apps/web/components/project/ProjectListTable.tsx`
**Changes**:

1. **Filter bar** (line 89-134):
```tsx
// BEFORE
<div className="flex flex-wrap gap-4 items-center justify-between">
  <div className="flex gap-3 items-center">
    <Input ... className="pl-10 w-[280px]" />
    <Select><SelectTrigger className="w-[140px]">

// AFTER
<div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
    <Input ... className="pl-10 w-full sm:w-[280px]" />
    <div className="flex gap-3">
      <Select><SelectTrigger className="w-full sm:w-[140px]">
```
- Search input full-width on mobile
- Select and search button in a row below search on mobile

2. **Table**: On mobile, hide less-important columns. Add `className="hidden md:table-cell"` to columns like project type, dates, etc. Keep project name and status visible.

3. **Table horizontal scroll wrapper**:
```tsx
// Wrap the Table in a horizontal scroll container on mobile
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <Table className="min-w-[600px] md:min-w-0">
```

### Task 4.6: New Project Page (`/projects/new`)
**File**: `apps/web/app/(app)/projects/new/page.tsx`
**Current**: `max-w-7xl` container with Card wrapping ProjectForm.
**Changes**:
```tsx
// BEFORE
<div className="max-w-7xl page-animate">

// AFTER
<div className="max-w-7xl mx-auto page-animate">
```
The `ProjectForm` component itself needs responsive treatment for its form fields.

**Task 4.6a: ProjectForm responsive**
**File**: `apps/web/components/project/ProjectForm.tsx`
**Changes**:
- Any side-by-side form field groups should stack on mobile:
```tsx
// Pattern for 2-column form rows:
// BEFORE
<div className="grid grid-cols-2 gap-4">

// AFTER
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### Task 4.7: Project Detail Page (`/projects/[id]`)
**File**: `apps/web/app/(app)/projects/[id]/page.tsx`
**Changes**:
```tsx
// BEFORE
<div className="max-w-[1920px] page-animate">

// AFTER
<div className="page-animate">
```
- Tabs and content are already single-column friendly
- `ProjectDetail` component may have side-by-side layouts that need stacking
- `ProjectMembersTable` needs table responsive treatment (same pattern as 4.5a)

### Task 4.8: Edit Project Page (`/projects/[id]/edit`)
**File**: `apps/web/app/(app)/projects/[id]/edit/page.tsx`
**Changes**: Same pattern as Task 4.6 - the page is a Card wrapping ProjectForm. Minimal page-level changes.

### Task 4.9: Task Management Page (`/tasks/[projectId]`)
**File**: `apps/web/app/(app)/tasks/[projectId]/page.tsx`
**Changes**:
- Page header is already single-column friendly
- The main work is in `TaskList` component

**Task 4.9a: TaskList responsive**
**File**: `apps/web/components/task/TaskList.tsx`
**Changes**:
- View toggle (kanban/table) and filters need responsive treatment

**Task 4.9b: TaskFilters responsive**
**File**: `apps/web/components/task/TaskFilters.tsx`
**Changes**:
```tsx
// BEFORE
<Input ... className="pl-9 w-[280px]" />

// AFTER
<Input ... className="pl-9 w-full sm:w-[280px]" />
```
- Search input full-width on mobile
- Filter badges wrap naturally (already uses flex)

**Task 4.9c: KanbanBoard responsive**
**File**: `apps/web/components/task/KanbanBoard.tsx`
**Changes**:
```tsx
// BEFORE
<div className="flex gap-4 overflow-x-auto pb-4">

// AFTER
<div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x snap-mandatory">
```
- Add snap scrolling for mobile kanban
- Negative margin + padding to allow edge-to-edge scroll on mobile

**Task 4.9d: KanbanColumn responsive**
**File**: `apps/web/components/task/KanbanColumn.tsx`
**Changes**:
```tsx
// BEFORE
<div className="flex flex-col min-w-[320px] max-w-[320px]">

// AFTER
<div className="flex flex-col min-w-[280px] max-w-[280px] lg:min-w-[320px] lg:max-w-[320px] snap-start">
```
- Slightly narrower columns on mobile for better scrolling
- Add `snap-start` for snap scroll alignment

**Task 4.9e: TaskTable responsive**
**File**: `apps/web/components/task/TaskTable.tsx`
**Changes**:
- Wrap table in horizontal scroll container
- Hide less-important columns on mobile with `hidden md:table-cell`
- Keep task name and status always visible

### Task 4.10: Work Logs Page (`/work-logs`)
**File**: `apps/web/app/(app)/work-logs/page.tsx`
**Changes** (line 309-332 - the main layout):
```tsx
// BEFORE
<div className="flex gap-6">
  <div className="flex flex-col gap-6 w-[30%]">
    <WorkLogList ... />
    <MyTaskList ... />
  </div>
  <div className="flex-1">
    <WorkLogCalendar ... />
  </div>
</div>

// AFTER
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
  <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[30%] order-2 lg:order-1">
    <WorkLogList ... />
    <MyTaskList ... />
  </div>
  <div className="flex-1 order-1 lg:order-2">
    <WorkLogCalendar ... />
  </div>
</div>
```
- Stack vertically on mobile (calendar first, then sidebar below)
- Side-by-side on lg+ (same as current desktop layout)
- Use `order-` classes to show calendar first on mobile (more important)

### Task 4.11: Schedule Page (`/schedule`)
**File**: `apps/web/app/(app)/schedule/page.tsx`
**Changes**: Page itself is simple (tabs + ProjectScheduleList). Main work is in the component.

**Task 4.11a: ProjectScheduleList responsive**
**File**: `apps/web/components/schedule/ProjectScheduleList.tsx`
**Changes** (line 132-179 - the two-column layout):
```tsx
// BEFORE
<div className="flex gap-6">
  <div className="flex flex-col gap-6 w-[30%]">
    {/* Team Filter + Selected Date List */}
  </div>
  <div className="flex-1">
    <ScheduleCalendar ... />
  </div>
</div>

// AFTER
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
  <div className="flex flex-col gap-4 lg:gap-6 w-full lg:w-[30%] order-2 lg:order-1">
    {/* Team Filter + Selected Date List */}
  </div>
  <div className="flex-1 order-1 lg:order-2">
    <ScheduleCalendar ... />
  </div>
</div>
```
- Same pattern as work-logs: stack on mobile, side-by-side on desktop
- Calendar first on mobile

### Task 4.12: Analytics Page (`/analytics`)
**File**: `apps/web/app/(app)/analytics/page.tsx`
**Changes**:

1. **Page header** (line 87-90):
```tsx
// BEFORE
<div className="flex items-start justify-between">
  <h1 className="text-3xl font-bold">프로젝트 리포트</h1>
  <MonthPicker ... />
</div>

// AFTER
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  <h1 className="text-2xl lg:text-3xl font-bold">프로젝트 리포트</h1>
  <MonthPicker ... />
</div>
```

2. **Chart grids** (line 115, 154, 179):
```tsx
// BEFORE
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// Already responsive - keep as-is

// BEFORE
<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

// AFTER
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```
- Part task count / work hours charts: single column on mobile, 2 on sm, 3 on lg

3. Remove `max-w-[1920px]` from container (line 86):
```tsx
// BEFORE
<div className="max-w-[1920px] space-y-6 page-animate">

// AFTER
<div className="space-y-6 page-animate">
```

### Task 4.13: Users List Page (`/users`)
**File**: `apps/web/app/(app)/users/page.tsx`
**Changes**: Page header (Task 3.1 pattern). Main work in UserListTable.

**Task 4.13a: UserListTable responsive**
**File**: `apps/web/components/admin/UserListTable.tsx`
**Changes**:
- Same pattern as ProjectListTable (4.5a): search full-width on mobile, table with horizontal scroll or hidden columns

### Task 4.14: New User Page (`/users/new`)
**File**: `apps/web/app/(app)/users/new/page.tsx`
**Changes**: Already `max-w-7xl`, card-based form. Apply standard form responsive patterns.

### Task 4.15: User Detail Page (`/users/[id]`)
**File**: `apps/web/app/(app)/users/[id]/page.tsx`
**Changes**: Already `max-w-4xl`, minimal changes needed.

### Acceptance Criteria (Phase 4)
- [ ] Login page: Card centered and readable on 360px
- [ ] Dashboard: Stats cards 2-column on mobile, profile card stacks above stats
- [ ] Projects list: Filters stack on mobile, table scrollable horizontally
- [ ] Project detail: Tabs scrollable, content single-column on mobile
- [ ] Project forms (new/edit): Form fields stack on mobile
- [ ] Task management: Kanban columns scroll horizontally with snap, filters stack
- [ ] Work logs: Calendar above sidebar on mobile, side-by-side on desktop
- [ ] Schedule: Calendar above filters on mobile, side-by-side on desktop
- [ ] Analytics: Charts single-column on mobile, responsive grids on larger screens
- [ ] Users list: Same responsive table pattern as projects list
- [ ] User forms: Form fields stack on mobile
- [ ] Profile: Already responsive with max-w-2xl

---

## Phase 5: Component-Level Responsive Fixes

### Objective
Fix remaining component-level responsive issues in shared/reusable components.

### Task 5.1: FullCalendar responsive styles
**File**: `apps/web/app/globals.css`
**Changes** in the FullCalendar section:
```css
/* Responsive calendar day frame */
@media (max-width: 767px) {
  .fc-daygrid-day-frame {
    height: auto;
    min-height: 60px;
    padding: 4px 2px;
  }

  .fc-col-header-cell-cushion {
    font-size: 10px;
  }

  .fc-daygrid-day-number {
    font-size: 12px;
    width: 24px;
    height: 24px;
  }

  .fc-daygrid-event {
    font-size: 10px;
  }

  .fc-multiday-event .fc-event-main {
    height: 16px;
  }

  .fc-multiday-event .fc-event-title,
  .fc-singleday-event .fc-event-title {
    font-size: 10px;
  }
}
```
- Reduce day cell height on mobile
- Smaller text for day numbers and events
- Prevent calendar from overflowing

### Task 5.2: Table components responsive wrapper
**File**: Create `apps/web/components/common/table/ResponsiveTable.tsx`
```tsx
'use client';

export function ResponsiveTable({ children, minWidth = '600px' }: { children: React.ReactNode; minWidth?: string }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      <div style={{ minWidth }}>
        {children}
      </div>
    </div>
  );
}
```
Use this wrapper in ProjectListTable, UserListTable, TaskTable to enable horizontal scrolling on mobile.

### Task 5.3: Dialog/Sheet responsive sizing
**Files**: Various dialog components
**Changes**: Most shadcn Dialogs already have responsive max-width. Verify that all dialogs using `BaseDialog` render correctly on mobile (should be near full-width with small margin).

The existing BaseDialog pattern `max-w-[min(700px,calc(100%-2.5rem))]` is already responsive-friendly. Verify no override breaks this.

### Task 5.4: Form components responsive
**File**: `apps/web/components/form/` directory
**Changes**: Verify FormInput, FormSelect, FormTextarea etc. use `w-full` by default. If any have fixed widths, change to responsive.

### Task 5.5: ProductivityStats responsive
**File**: `apps/web/components/analytics/ProductivityStats.tsx`
**Changes**: Ensure the stats grid is responsive:
```tsx
// Likely pattern:
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```
Change to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` if needed.

### Task 5.6: WorkLogCalendar touch interactions
**File**: `apps/web/components/work-log/WorkLogCalendar.tsx`
**Changes**: Ensure calendar date cells and events have adequate touch targets (min 44px). The FullCalendar library handles most touch interactions, but verify click handlers work on touch devices.

### Task 5.7: TeamWorkLogFilters responsive
**File**: `apps/web/components/work-log/TeamWorkLogFilters.tsx`
**Changes**: Ensure filter dropdowns stack on mobile:
```tsx
// Standard pattern:
<div className="flex flex-col sm:flex-row flex-wrap gap-3">
```

### Acceptance Criteria (Phase 5)
- [ ] Calendar renders cleanly on 360px without overflow
- [ ] Calendar day cells and events are readable on mobile
- [ ] All data tables have horizontal scroll wrapper on mobile
- [ ] All dialogs/sheets render within viewport on mobile
- [ ] All form fields are full-width on mobile
- [ ] Filter dropdowns stack vertically on mobile
- [ ] Touch targets are minimum 44px on interactive elements

---

## Commit Strategy

| Commit | Scope | Description |
|--------|-------|-------------|
| 1 | Phase 1 | Remove desktop barriers (min-width), add responsive utilities |
| 2 | Phase 2 | Mobile navigation: sidebar drawer + hamburger menu |
| 3 | Phase 3 | Layout components: responsive headers, titles, tabs |
| 4 | Phase 4.1-4.4 | Responsive pages: login, dashboard, profile, design-system |
| 5 | Phase 4.5-4.8 | Responsive pages: projects (list, new, detail, edit) |
| 6 | Phase 4.9 | Responsive pages: task management (kanban, table, filters) |
| 7 | Phase 4.10-4.11 | Responsive pages: work-logs, schedule (calendar layouts) |
| 8 | Phase 4.12-4.15 | Responsive pages: analytics, users |
| 9 | Phase 5 | Component-level fixes: calendar, tables, forms, dialogs |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Desktop layout regression | Medium | High | Test at 1440px after every phase. The only class removals are min-width constraints; all other changes add responsive prefixed classes. |
| Sidebar drawer z-index conflicts | Low | Medium | shadcn Sheet uses z-50 by default. The existing sidebar also uses z-50. Verify no overlap. |
| FullCalendar overflow on mobile | High | Medium | Calendar is complex with absolute positioning. Add `overflow-hidden` on calendar container and test thoroughly. Reduce day cell heights on mobile. |
| Kanban drag-and-drop on touch | Low | Low | The KanbanBoard already uses `TouchSensor` from dnd-kit with appropriate `delay` and `tolerance`. Should work on mobile. |
| Table readability on mobile | Medium | Medium | Use horizontal scroll with min-width rather than hiding too many columns. Users can scroll to see all data. |
| View transitions on mobile | Low | Low | CSS view transitions are progressive enhancement. They work or gracefully degrade. |

---

## Verification Steps

### Manual Testing Checklist
1. **Chrome DevTools Device Mode**: Test every page at these widths:
   - 360px (mobile - Galaxy S series)
   - 390px (mobile - iPhone 14)
   - 768px (tablet - iPad Mini)
   - 1024px (tablet landscape / small desktop)
   - 1280px (desktop)
   - 1440px (desktop - current target)

2. **Navigation Flow**:
   - Open hamburger menu on mobile
   - Navigate to each page
   - Verify drawer closes on navigation
   - Verify breadcrumbs display correctly
   - Verify back buttons work

3. **Interactive Elements**:
   - Tap all buttons and links on mobile
   - Fill out forms on mobile (project form, user form, login)
   - Use date pickers on mobile
   - Drag kanban cards on touch device
   - Scroll tables horizontally on mobile
   - Interact with calendar (select dates, view events)

4. **No Horizontal Scroll**: At each breakpoint, verify no horizontal scrollbar appears on the body/page level.

5. **Desktop Regression**: After all changes, verify the 1440px desktop layout matches the current production layout exactly.

### Automated Verification
- Run `pnpm --filter web build` to verify no build errors
- Run `pnpm --filter web lint` to verify no lint errors
- Optionally: Playwright viewport tests at 360px, 768px, 1440px for key pages

---

## File Change Summary

### Files Modified (estimated ~25 files)

| File | Phase | Type of Change |
|------|-------|----------------|
| `apps/web/app/globals.css` | 1, 5 | Remove min-width, add utilities, calendar responsive |
| `apps/web/app/(app)/layout.tsx` | 1, 2 | Remove min-w, add mobile state, responsive padding |
| `apps/web/app/layout.tsx` | 1 | Verify viewport meta |
| `apps/web/components/layout/Sidebar.tsx` | 2 | Desktop/mobile split, Sheet drawer |
| `apps/web/components/layout/Header.tsx` | 2 | Hamburger button, responsive padding |
| `apps/web/app/page.tsx` | 4 | Login responsive padding |
| `apps/web/app/(app)/dashboard/page.tsx` | 3, 4 | Header, grids responsive |
| `apps/web/app/(app)/dashboard/profile/page.tsx` | 4 | Minor responsive tweaks |
| `apps/web/app/(app)/projects/page.tsx` | 3 | Header responsive |
| `apps/web/components/project/ProjectListTable.tsx` | 4 | Filters, table responsive |
| `apps/web/app/(app)/projects/new/page.tsx` | 4 | Container responsive |
| `apps/web/app/(app)/projects/[id]/page.tsx` | 4 | Container responsive |
| `apps/web/app/(app)/projects/[id]/edit/page.tsx` | 4 | Container responsive |
| `apps/web/components/project/ProjectForm.tsx` | 4 | Form grid responsive |
| `apps/web/app/(app)/tasks/[projectId]/page.tsx` | 4 | Minor responsive |
| `apps/web/components/task/TaskList.tsx` | 4 | View toggle responsive |
| `apps/web/components/task/TaskFilters.tsx` | 4 | Search input responsive |
| `apps/web/components/task/KanbanBoard.tsx` | 4 | Scroll snap, margins |
| `apps/web/components/task/KanbanColumn.tsx` | 4 | Column width responsive |
| `apps/web/app/(app)/work-logs/page.tsx` | 4 | Sidebar/calendar stack |
| `apps/web/components/schedule/ProjectScheduleList.tsx` | 4 | Sidebar/calendar stack |
| `apps/web/app/(app)/analytics/page.tsx` | 4 | Header, chart grids |
| `apps/web/app/(app)/users/page.tsx` | 3 | Header responsive |
| `apps/web/components/admin/UserListTable.tsx` | 4 | Filters, table responsive |
| `apps/web/app/(app)/users/[id]/page.tsx` | 4 | Minor responsive |

### Files Created (1 file)
| File | Phase | Purpose |
|------|-------|---------|
| `apps/web/components/common/table/ResponsiveTable.tsx` | 5 | Reusable horizontal scroll wrapper for tables |

---

## Success Criteria

1. **Zero Horizontal Scroll**: No page shows horizontal scrollbar at any viewport width >= 360px
2. **Mobile Navigation**: Hamburger menu + drawer works smoothly on all mobile viewports
3. **Content Readability**: All text, cards, tables, and charts are readable on 360px viewport
4. **Touch Usability**: All interactive elements have >= 44px touch targets on mobile
5. **Desktop Preservation**: 1440px desktop layout is pixel-identical to current production
6. **Build Success**: `pnpm --filter web build` passes without errors
7. **No Feature Loss**: All features remain accessible on all viewports (may be reorganized but not removed)
