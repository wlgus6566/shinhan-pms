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

| Breakpoint  | Width          | Layout Strategy                                                                                                                                                                                      |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile**  | < 768px        | Single column. Sidebar hidden (drawer via hamburger). Header simplified. Content full-width with `p-4`. Tables become card lists or horizontally scrollable. Calendar sidebar stacks above calendar. |
| **Tablet**  | 768px - 1023px | Single column with wider content. Sidebar still drawer. Content `p-6`. Tables show key columns. Calendar sidebar stacks above calendar.                                                              |
| **Desktop** | 1024px+        | Current layout restored. Fixed sidebar visible. Content with `pl-[240px]`/`pl-[72px]` offset. Full table columns. Side-by-side calendar layouts. `p-8` content padding.                              |

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
- Change `overflow-x: auto` to `overflow-x: hidden`
- **NOTE**: `overflow-x: hidden` is a **safety net** to prevent accidental horizontal scroll caused by stray elements during the responsive migration. It is NOT a primary fix -- each component must be individually fixed to not overflow. This global rule catches edge cases that slip through.

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

### Task 1.3: Add viewport export (Next.js App Router separate export)

**File**: `apps/web/app/layout.tsx`

The current file at `apps/web/app/layout.tsx` has only a `metadata` export with `title` and `description`. In Next.js App Router (14+), viewport configuration must be a **separate named export** using the `Viewport` type. Do NOT put viewport inside the `metadata` object.

**Add** the following export ABOVE the existing `metadata` export:

```tsx
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};
```

**IMPORTANT - Do NOT include `maximum-scale=1`**: Setting `maximumScale: 1` prevents pinch-to-zoom, which is a WCAG 2.1 SC 1.4.4 violation (Resize Text). If iOS auto-zoom on text inputs is a concern, the correct fix is to ensure all `<input>` and `<textarea>` elements use `font-size >= 16px`, which prevents Safari's auto-zoom behavior without disabling accessibility. (This is already handled by shadcn/ui default input styles which use `text-sm` = 14px, so we may need to verify and bump input font sizes to 16px on mobile -- see Task 5.4.)

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
- [ ] `overflow-x: hidden` on body as a safety net (documented as such, not primary fix)
- [ ] Page renders at 360px width without horizontal scrollbar (content may overlap/break - that is expected and will be fixed in later phases)
- [ ] Desktop layout at 1440px is unchanged
- [ ] Viewport is a separate `export const viewport: Viewport` (NOT inside metadata)
- [ ] No `maximum-scale` restriction (pinch-to-zoom remains enabled)

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

#### Problem Analysis

The Sidebar has ~15 places where content is conditionally rendered based on `sidebarOpen`:

- **Line 84**: `{sidebarOpen && (<div className="flex flex-col">` -- Logo text "Emotion PMS"
- **Line 122**: `{sidebarOpen && (<span className="text-sm...` -- Menu item labels (first 2 items)
- **Lines 158-175**: `{sidebarOpen && (<>...<ChevronDown/>...</>)}` -- "업무 관리" label + chevron
- **Line 179**: `{sidebarOpen && isTaskMenuOpen && (<div...` -- Task submenu project list
- **Lines 239, 257, 289**: `{sidebarOpen && (<span...` -- Menu item labels (remaining items, admin items)
- **Lines 304-313**: `{sidebarOpen && (<div...` -- Stats card
- **Lines 317, 329, 344**: `{sidebarOpen && ...` -- User profile name, department, logout button layout

The mobile drawer must show ALL labels/content (equivalent to `sidebarOpen = true`), but `sidebarOpen` is a desktop state that could be `false` when the user has collapsed the sidebar. Simply extracting a `navigationContent` variable will NOT work because the conditional rendering depends on `sidebarOpen`.

#### Solution: Option A -- `renderNavigation(isExpanded: boolean)` function

Create a render function that accepts a boolean parameter to control whether labels are visible, decoupling mobile visibility from the desktop `sidebarOpen` state.

**Concrete implementation**:

```tsx
import { Sheet, SheetContent } from '@/components/ui/sheet';

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
  const pathname = usePathname(); // Already imported at line 4, already used at line 44
  const { user, logout } = useAuth();
  const { projects: myProjects } = useMyProjects();
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(
    pathname?.startsWith('/tasks') || false,
  );

  const isActive = useCallback(
    (href: string) => pathname === href || pathname?.startsWith(`${href}/`),
    [pathname],
  );
  const toggleTaskMenu = useCallback(() => {
    setIsTaskMenuOpen((prev) => !prev);
  }, []);
  const isTasksActive = pathname?.startsWith('/tasks');

  // Close mobile menu on route change
  // (usePathname is already imported and used -- reuse existing import)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Callback for mobile link clicks (close drawer)
  const handleMobileLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, [setMobileMenuOpen]);

  /**
   * Render the full navigation content.
   * @param isExpanded - true = show labels (mobile drawer always, desktop when sidebarOpen)
   *                     false = icon-only (desktop when collapsed)
   * @param onLinkClick - optional callback to fire when a nav link is clicked
   */
  const renderNavigation = (isExpanded: boolean, onLinkClick?: () => void) => (
    <>
      {/* Logo Area */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-white/5',
          isExpanded ? 'justify-start px-6' : 'justify-center px-0',
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden"
          onClick={onLinkClick}
        >
          <div className="w-8 h-8 gradient-primary rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white font-bold text-base">E</span>
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-tight">
                Emotion PMS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {/* First 2 menu items */}
          {menuItems.slice(0, 2).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  active
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    active
                      ? 'text-blue-400'
                      : 'text-slate-500 group-hover:text-white',
                  )}
                />
                {isExpanded && (
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      active && 'font-semibold',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Task management dropdown -- uses isExpanded instead of sidebarOpen */}
          <div>
            <button
              onClick={toggleTaskMenu}
              className={cn(/* ... same classes ... */)}
            >
              {/* ... indicator ... */}
              <ClipboardList className={cn(/* ... same ... */)} />
              {isExpanded && (
                <>
                  <span
                    className={cn(
                      'text-sm font-medium truncate flex-1 text-left',
                      isTasksActive && 'font-semibold',
                    )}
                  >
                    업무 관리
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isTaskMenuOpen && 'rotate-180',
                    )}
                  />
                </>
              )}
            </button>
            {isExpanded && isTaskMenuOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                {myProjects && myProjects.length > 0 ? (
                  myProjects.map((project) => {
                    const projectActive = pathname === `/tasks/${project.id}`;
                    return (
                      <Link
                        key={project.id}
                        href={`/tasks/${project.id}`}
                        onClick={onLinkClick}
                        className={cn(/* ... same ... */)}
                      >
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full flex-shrink-0',
                            projectActive ? 'bg-blue-400' : 'bg-slate-600',
                          )}
                        />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-xs text-slate-600">
                    참여 중인 프로젝트가 없습니다
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Remaining menu items */}
          {menuItems.slice(2).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(/* ... same ... */)}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={cn(/* ... same ... */)} />
                {isExpanded && (
                  <span
                    className={cn(
                      'text-sm font-medium truncate',
                      active && 'font-semibold',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'PM') && (
          <div className="mt-6 pt-6 border-t border-white/5">
            {isExpanded && (
              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                관리자
              </p>
            )}
            {adminMenuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(/* ... same ... */)}
                >
                  {/* ... same icon + label pattern using isExpanded ... */}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Stats Card */}
      {isExpanded && (
        <div className="mx-3 mb-4 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl border border-blue-500/10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            진행중인 내 프로젝트
          </p>
          <p className="text-2xl font-bold text-white">
            {myProjects?.length || 0}
          </p>
        </div>
      )}

      {/* User Profile */}
      <div
        className={cn('border-t border-white/5', isExpanded ? 'p-2' : 'p-3')}
      >
        {user && (
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl transition-colors',
              isExpanded && 'hover:bg-white/5',
            )}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            {isExpanded && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {DEPARTMENT_LABELS[user.department as Department] ||
                    user.department}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className={cn(/* ... same ... */)}
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#1e1f2e] transition-all duration-300 z-50 flex flex-col',
          'hidden lg:flex', // Hide on mobile, show on desktop
          sidebarOpen ? 'w-[240px]' : 'w-[72px]',
        )}
      >
        {renderNavigation(sidebarOpen)}

        {/* Collapse Toggle - desktop only */}
        <button
          onClick={() => setSidebarOpen((prev: boolean) => !prev)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1e1f2e] border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-lg"
          aria-label={sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Mobile Drawer - always renders labels (isExpanded = true) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-[#1e1f2e] border-none lg:hidden"
        >
          {renderNavigation(true, handleMobileLinkClick)}
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Key design decisions**:

- `renderNavigation(isExpanded, onLinkClick?)` replaces every `sidebarOpen` conditional with `isExpanded`
- Desktop sidebar calls `renderNavigation(sidebarOpen)` -- respects collapse state
- Mobile drawer calls `renderNavigation(true, handleMobileLinkClick)` -- always shows labels, closes on click
- The `onLinkClick` callback is passed to all `<Link>` and navigation elements to close the drawer
- Collapse toggle button is rendered OUTSIDE `renderNavigation` (desktop only)
- No separate mobile component needed; one render function serves both contexts

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

      <Breadcrumb>{/* ...existing breadcrumb... */}</Breadcrumb>
    </header>
  );
}
```

- Import `Menu` from lucide-react
- Change `px-8` to `px-4 md:px-6 lg:px-8`

### Task 2.4: Close mobile menu on route change

**File**: `apps/web/components/layout/Sidebar.tsx`
**Changes**:

- `usePathname()` is **already imported** (line 4: `import { usePathname } from 'next/navigation'`) and **already used** (line 44: `const pathname = usePathname()`). Reuse the existing `pathname` variable.
- Add `useEffect` import (add to existing `useState, useCallback` import at line 22)
- Add effect to close mobile drawer when pathname changes:

```tsx
// Add useEffect to existing import at line 22:
import { useState, useCallback, useEffect } from 'react';

// Add inside component body:
useEffect(() => {
  setMobileMenuOpen(false);
}, [pathname, setMobileMenuOpen]);
```

Note: This is already included in the `renderNavigation` approach above (Task 2.2). Listed here explicitly for clarity.

### Acceptance Criteria (Phase 2)

- [ ] At < 1024px (lg): Sidebar is hidden, hamburger icon visible in header
- [ ] Tapping hamburger opens a slide-in drawer from the left with full navigation
- [ ] Mobile drawer ALWAYS shows labels regardless of desktop `sidebarOpen` state
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
  <div>
    <h1>Title</h1>
    <p>Subtitle</p>
  </div>
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

### Task 3.2: Make page title text responsive (per-page audit)

**Audit results from actual codebase** -- each page's `<h1>` current state and required action:

**Pages with `text-3xl` (need responsive change to `text-2xl lg:text-3xl`)**:
| Page | File | Line | Current |
|------|------|------|---------|
| Projects | `apps/web/app/(app)/projects/page.tsx` | 17 | `text-3xl font-bold tracking-tight` |
| Analytics | `apps/web/app/(app)/analytics/page.tsx` | 88 | `text-3xl font-bold` |
| Users | `apps/web/app/(app)/users/page.tsx` | 18 | `text-3xl font-bold tracking-tight` |
| Schedule (2 h1s) | `apps/web/app/(app)/schedule/page.tsx` | 46, 73 | `text-3xl font-bold tracking-tight` |
| Project Detail | `apps/web/app/(app)/projects/[id]/page.tsx` | 91 | `text-3xl font-bold tracking-tight` |
| New User | `apps/web/app/(app)/users/new/page.tsx` | 46 | `text-3xl font-bold tracking-tight` |
| User Detail | `apps/web/app/(app)/users/[id]/page.tsx` | 35 | `text-3xl font-bold tracking-tight` |
| Profile | `apps/web/app/(app)/dashboard/profile/page.tsx` | 12 | `text-3xl font-bold tracking-tight` |
| Work Logs | `apps/web/app/(app)/work-logs/page.tsx` | 268 | `text-3xl font-bold` |

**Action for all above**: Change `text-3xl` to `text-2xl lg:text-3xl`

**Pages with `text-2xl` (leave as-is)**:
| Page | File | Line | Current | Action |
|------|------|------|---------|--------|
| Dashboard | `apps/web/app/(app)/dashboard/page.tsx` | 223 | `text-2xl font-bold` | Leave as-is (already appropriately sized) |
| Design System | `apps/web/app/(app)/dashboard/design-system/page.tsx` | 50 | `text-2xl font-bold` | Leave as-is (internal tool page) |

**Pages with other sizes**:
| Page | File | Line | Current | Action |
|------|------|------|---------|--------|
| Login | `apps/web/app/page.tsx` | 51 | `text-lg` (h1) | Leave as-is (login card, small title) |

### Task 3.3: Make Tabs overflow-scrollable on mobile

Multiple pages use `<TabsList>` with many tabs that can overflow on mobile.
**File**: `apps/web/app/globals.css`
**Add** a global style for TabsList horizontal scroll:

```css
/* Responsive tabs - horizontal scroll on mobile */
[role='tablist'] {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
[role='tablist']::-webkit-scrollbar {
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
- [ ] Title text is `text-2xl lg:text-3xl` on pages that had `text-3xl`; pages already at `text-2xl` are left unchanged
- [ ] Dashboard h1 remains `text-2xl` (not changed)
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

**Current state** (verified from source):

- Line 58: Search input has `w-[280px]` (fixed width, will overflow on mobile)
- Lines 78-79: Status/difficulty sections use `<div className="flex gap-4">` with `<div className="w-[50%]">` for status and unsized div for difficulty

**Changes**:

```tsx
// Search input (line 58):
// BEFORE
<Input ... className="pl-9 w-[280px]" />

// AFTER
<Input ... className="pl-9 w-full sm:w-[280px]" />

// Filter columns container (line 78):
// BEFORE
<div className="flex gap-4">
  <div className="w-[50%]">

// AFTER
<div className="flex flex-col sm:flex-row gap-4">
  <div className="w-full sm:w-[50%]">
```

- Search input full-width on mobile
- Status/difficulty filter sections stack vertically on mobile, side-by-side on sm+
- `w-[50%]` becomes `w-full sm:w-[50%]`

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
- [ ] Task filters: `w-[50%]` becomes `w-full sm:w-[50%]`, search input full-width on mobile
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

export function ResponsiveTable({
  children,
  minWidth = '600px',
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
```

Use this wrapper in ProjectListTable, UserListTable, TaskTable to enable horizontal scrolling on mobile.

**Also update the barrel file** `apps/web/components/common/table/index.ts` to export the new component:

```tsx
// Current exports:
export { TablePagination } from './TablePagination';
export { TableLoading } from './TableLoading';
export { TableError } from './TableError';
export { TableEmpty } from './TableEmpty';

// Add:
export { ResponsiveTable } from './ResponsiveTable';
```

### Task 5.3: Dialog/Sheet responsive sizing (verified from source)

**Files**: `apps/web/components/ui/dialog.tsx`, `apps/web/components/ui/base-dialog.tsx`

**Actual DialogContent default styles** (verified from `dialog.tsx` line 37-39):

```
'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] ...'
'flex flex-col max-h-[80vh] md:max-h-[80vh] max-w-[min(700px,calc(100%-2.5rem))] min-w-[320px] overflow-y-auto'
```

The DialogContent has TWO `max-w-` classes: `max-w-lg` (from shadcn default on line 38) AND `max-w-[min(700px,calc(100%-2.5rem))]` (custom override on line 39). The custom one wins because it appears later. This means:

- On desktop: max-width is 700px
- On mobile: max-width is `calc(100% - 2.5rem)` = viewport width minus 40px (20px margin each side)
- min-width is 320px

This is already responsive-friendly for mobile viewports >= 360px (360 - 40 = 320px effective width).

**BaseDialog size overrides** (verified from `base-dialog.tsx` lines 39-41):

- `size === 'sm'`: `sm:max-w-[500px]` -- on mobile (<640px), falls through to DialogContent default (calc-based)
- `size === 'md'`: `sm:max-w-[600px]` -- on mobile (<640px), falls through to DialogContent default
- `size === 'lg'`: `max-w-2xl` (672px) -- applies at all breakpoints

**Action needed**: The `size === 'lg'` variant uses `max-w-2xl` without a `sm:` prefix, which means on mobile it tries to be 672px wide. This could overflow on small screens. Fix:

```tsx
// BEFORE (base-dialog.tsx line 41)
size === 'lg' && 'max-w-2xl',

// AFTER
size === 'lg' && 'sm:max-w-2xl',
```

This makes the `lg` size also fall through to the responsive DialogContent default on mobile.

**Dialog form content with grid-cols-2** (verified from source):

- `AddTaskDialog.tsx` lines 197, 247: `grid grid-cols-2 gap-4`
- `EditTaskDialog.tsx` lines 203, 229, 279: `grid grid-cols-2 gap-4`

These 2-column grids inside dialogs will be too cramped on mobile (dialog width ~320px / 2 = 160px per column). Fix:

```tsx
// BEFORE (in AddTaskDialog, EditTaskDialog)
<div className="grid grid-cols-2 gap-4">

// AFTER
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

**Files to update**:

- `apps/web/components/task/AddTaskDialog.tsx` (lines 197, 247)
- `apps/web/components/task/EditTaskDialog.tsx` (lines 203, 229, 279)

**WorkLogDialog.tsx**: Has a `w-[100px]` element at line 402. Verify this is a small label/indicator that won't cause overflow. If it's inside a flex container it should be fine.

### Task 5.4: Form components responsive + iOS zoom prevention

**File**: `apps/web/components/form/` directory
**Changes**: Verify FormInput, FormSelect, FormTextarea etc. use `w-full` by default. If any have fixed widths, change to responsive.

**iOS zoom prevention** (related to Task 1.3 -- no `maximum-scale`):
Add to `apps/web/app/globals.css`:

```css
/* Prevent iOS Safari auto-zoom on input focus (minimum 16px) */
@media (max-width: 767px) {
  input,
  select,
  textarea {
    font-size: 16px !important;
  }
}
```

This ensures all form inputs have >= 16px font-size on mobile, preventing Safari's auto-zoom without needing `maximum-scale=1`.

### Task 5.5: ProductivityStats -- VERIFY ONLY (already responsive)

**File**: `apps/web/components/analytics/ProductivityStats.tsx`

**Verified from source** (line 15 and line 59):

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

This component is **already responsive**: 1 column on mobile, 2 on md, 4 on lg. **No changes needed.** Simply verify it renders correctly at 360px during testing.

### Task 5.6: WorkLogCalendar touch interactions

**File**: `apps/web/components/work-log/WorkLogCalendar.tsx`
**Changes**: Ensure calendar date cells and events have adequate touch targets (min 44px). The FullCalendar library handles most touch interactions, but verify click handlers work on touch devices.

### Task 5.7: TeamWorkLogFilters -- VERIFY ONLY (already responsive)

**File**: `apps/web/components/work-log/TeamWorkLogFilters.tsx`

**Verified from source** (line 87):

```tsx
<div className="flex flex-col md:flex-row gap-4">
```

The first row of filters **already uses `flex-col md:flex-row`**. The select triggers also already use `w-full md:w-48` (lines 90, 109).

**However**, the second row (line 133) also uses `flex flex-col md:flex-row gap-4` which is good, BUT the children use fixed percentage widths:

- Line 135: `<div className="w-[60%]">` (status filters)
- Line 163: `<div className="w-[30%]">` (difficulty filters)

These percentages need responsive treatment:

```tsx
// BEFORE (line 135)
<div className="w-[60%]">

// AFTER
<div className="w-full md:w-[60%]">

// BEFORE (line 163)
<div className="w-[30%]">

// AFTER
<div className="w-full md:w-[30%]">
```

On mobile (flex-col), `w-[60%]` would make the status filter section only 60% of full width, wasting space. Change to `w-full` on mobile.

### Task 5.8: Toaster positioning for mobile

**File**: `apps/web/components/ui/toaster.tsx`

**Current** (line 8): `position="top-right"`

On a 360px mobile viewport, toasts positioned at top-right may be too wide or partially clipped. The Sonner library supports responsive positioning.

**Change**:

```tsx
// BEFORE
<Sonner
  position="top-right"
  duration={3000}

// AFTER
<Sonner
  position="top-center"
  duration={3000}
  className="!right-0 sm:!right-auto"
  toastOptions={{
    classNames: {
      toast:
        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg w-full sm:w-auto',
```

Alternatively, a simpler approach that works well: change to `position="top-center"` on all viewports. This is actually more natural UX on mobile and still looks good on desktop.

```tsx
<Sonner
  position="top-center"
  duration={3000}
```

Decision: Use `top-center` globally. It is simpler and works well on both mobile and desktop.

### Task 5.9: TablePagination responsive

**File**: `apps/web/components/common/table/TablePagination.tsx`

**Current** (line 66): `<div className="flex items-center justify-center px-4 py-4 border-t border-slate-100">`

The PaginationContent renders: Previous button + up to 7 page number links + ellipsis + Next button. At 360px wide, this can total ~9 items at ~36px each = ~324px, which is tight but possible.

**Potential overflow scenario**: When `totalPages > 7`, the pagination shows: [이전] [1] [...] [4] [5] [6] [...] [10] [다음] = 9 items. The "이전" and "다음" text labels (PaginationPrevious, PaginationNext) take extra space.

**Changes**:

```tsx
// BEFORE (line 66)
<div className="flex items-center justify-center px-4 py-4 border-t border-slate-100">

// AFTER
<div className="flex items-center justify-center px-2 sm:px-4 py-4 border-t border-slate-100">
```

Additionally, hide the "이전"/"다음" text labels on very small screens, showing only the chevron icons:

```tsx
// PaginationPrevious children (line 71-79):
<PaginationPrevious
  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
  className={cn(
    currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
    'gap-1 px-2 sm:px-2.5'
  )}
>
  <span className="hidden sm:inline">이전</span>
</PaginationPrevious>

// PaginationNext children (line 99-109):
<PaginationNext
  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
  className={cn(
    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer',
    'gap-1 px-2 sm:px-2.5'
  )}
>
  <span className="hidden sm:inline">다음</span>
</PaginationNext>
```

### Task 5.10: Dialog form content responsive (AddTaskDialog, EditTaskDialog)

**File**: `apps/web/components/task/AddTaskDialog.tsx`
**File**: `apps/web/components/task/EditTaskDialog.tsx`

(Detailed in Task 5.3 above. Listed here as a separate task for execution tracking.)

All `grid grid-cols-2 gap-4` instances inside these dialogs need `grid-cols-1 sm:grid-cols-2`:

- `AddTaskDialog.tsx` lines 197, 247
- `EditTaskDialog.tsx` lines 203, 229, 279

### Acceptance Criteria (Phase 5)

- [ ] Calendar renders cleanly on 360px without overflow
- [ ] Calendar day cells and events are readable on mobile
- [ ] All data tables have horizontal scroll wrapper on mobile
- [ ] ResponsiveTable is exported from `common/table/index.ts` barrel file
- [ ] All dialogs/sheets render within viewport on mobile (BaseDialog lg variant fixed)
- [ ] Dialog form grids stack to single column on mobile (<640px)
- [ ] All form fields are full-width on mobile
- [ ] Input font-size is >= 16px on mobile (prevents iOS auto-zoom)
- [ ] Toaster uses `top-center` positioning (works on 360px mobile)
- [ ] TablePagination fits within 360px width (text labels hidden on small screens)
- [ ] TeamWorkLogFilters percentage widths become full-width on mobile
- [ ] ProductivityStats verified as already responsive (no changes)
- [ ] Touch targets are minimum 44px on interactive elements

---

## Commit Strategy

| Commit | Scope           | Description                                                                            |
| ------ | --------------- | -------------------------------------------------------------------------------------- |
| 1      | Phase 1         | Remove desktop barriers (min-width), add viewport export, add responsive utilities     |
| 2      | Phase 2         | Mobile navigation: sidebar drawer with renderNavigation pattern + hamburger menu       |
| 3      | Phase 3         | Layout components: responsive headers, per-page title audit, tabs                      |
| 4      | Phase 4.1-4.4   | Responsive pages: login, dashboard, profile, design-system                             |
| 5      | Phase 4.5-4.8   | Responsive pages: projects (list, new, detail, edit)                                   |
| 6      | Phase 4.9       | Responsive pages: task management (kanban, table, filters with w-[50%] fix)            |
| 7      | Phase 4.10-4.11 | Responsive pages: work-logs, schedule (calendar layouts)                               |
| 8      | Phase 4.12-4.15 | Responsive pages: analytics, users                                                     |
| 9      | Phase 5         | Component fixes: calendar, tables, dialogs, toaster, pagination, iOS zoom, barrel file |

---

## Risk Assessment

| Risk                             | Likelihood | Impact | Mitigation                                                                                                                                         |
| -------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop layout regression        | Medium     | High   | Test at 1440px after every phase. The only class removals are min-width constraints; all other changes add responsive prefixed classes.            |
| Sidebar drawer z-index conflicts | Low        | Medium | shadcn Sheet uses z-50 by default. The existing sidebar also uses z-50. Verify no overlap.                                                         |
| FullCalendar overflow on mobile  | High       | Medium | Calendar is complex with absolute positioning. Add `overflow-hidden` on calendar container and test thoroughly. Reduce day cell heights on mobile. |
| Kanban drag-and-drop on touch    | Low        | Low    | The KanbanBoard already uses `TouchSensor` from dnd-kit with appropriate `delay` and `tolerance`. Should work on mobile.                           |
| Table readability on mobile      | Medium     | Medium | Use horizontal scroll with min-width rather than hiding too many columns. Users can scroll to see all data.                                        |
| View transitions on mobile       | Low        | Low    | CSS view transitions are progressive enhancement. They work or gracefully degrade.                                                                 |
| iOS input zoom                   | Medium     | Low    | Addressed by setting `font-size: 16px` on inputs on mobile in globals.css, instead of `maximum-scale=1` which violates WCAG.                       |

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

4. **No Horizontal Scroll**: At each breakpoint, verify no horizontal scrollbar appears on the body/page level. Note: `overflow-x: hidden` on body is a safety net, but each component should be individually verified.

5. **Desktop Regression**: After all changes, verify the 1440px desktop layout matches the current production layout exactly.

6. **Toast Notification**: Verify toast appears centered and readable on 360px mobile.

7. **Pagination**: Verify TablePagination fits within 360px without overflow, with prev/next text hidden on small screens.

8. **Dialogs**: Open every dialog (AddTask, EditTask, WorkLog, Schedule, AddMember, TeamWorkLogDetail) on 360px and verify form fields are single-column and content doesn't overflow.

### Automated Verification

- Run `pnpm --filter web build` to verify no build errors
- Run `pnpm --filter web lint` to verify no lint errors
- Optionally: Playwright viewport tests at 360px, 768px, 1440px for key pages

---

## File Change Summary

### Files Modified (estimated ~30 files)

| File                                                   | Phase | Type of Change                                                         |
| ------------------------------------------------------ | ----- | ---------------------------------------------------------------------- |
| `apps/web/app/globals.css`                             | 1, 5  | Remove min-width, add utilities, calendar responsive, iOS input zoom   |
| `apps/web/app/(app)/layout.tsx`                        | 1, 2  | Remove min-w, add mobile state, responsive padding                     |
| `apps/web/app/layout.tsx`                              | 1     | Add separate `viewport` export (NOT inside metadata)                   |
| `apps/web/components/layout/Sidebar.tsx`               | 2     | renderNavigation(isExpanded) pattern, Sheet drawer, route-change close |
| `apps/web/components/layout/Header.tsx`                | 2     | Hamburger button, responsive padding                                   |
| `apps/web/app/page.tsx`                                | 4     | Login responsive padding                                               |
| `apps/web/app/(app)/dashboard/page.tsx`                | 3, 4  | Header, grids responsive                                               |
| `apps/web/app/(app)/dashboard/profile/page.tsx`        | 4     | Minor responsive tweaks                                                |
| `apps/web/app/(app)/projects/page.tsx`                 | 3     | Header responsive                                                      |
| `apps/web/components/project/ProjectListTable.tsx`     | 4     | Filters, table responsive                                              |
| `apps/web/app/(app)/projects/new/page.tsx`             | 4     | Container responsive                                                   |
| `apps/web/app/(app)/projects/[id]/page.tsx`            | 4     | Container responsive                                                   |
| `apps/web/app/(app)/projects/[id]/edit/page.tsx`       | 4     | Container responsive                                                   |
| `apps/web/components/project/ProjectForm.tsx`          | 4     | Form grid responsive                                                   |
| `apps/web/app/(app)/tasks/[projectId]/page.tsx`        | 4     | Minor responsive                                                       |
| `apps/web/components/task/TaskList.tsx`                | 4     | View toggle responsive                                                 |
| `apps/web/components/task/TaskFilters.tsx`             | 4     | Search w-full, w-[50%] to w-full sm:w-[50%]                            |
| `apps/web/components/task/KanbanBoard.tsx`             | 4     | Scroll snap, margins                                                   |
| `apps/web/components/task/KanbanColumn.tsx`            | 4     | Column width responsive                                                |
| `apps/web/components/task/AddTaskDialog.tsx`           | 5     | grid-cols-1 sm:grid-cols-2 (lines 197, 247)                            |
| `apps/web/components/task/EditTaskDialog.tsx`          | 5     | grid-cols-1 sm:grid-cols-2 (lines 203, 229, 279)                       |
| `apps/web/app/(app)/work-logs/page.tsx`                | 4     | Sidebar/calendar stack                                                 |
| `apps/web/components/work-log/TeamWorkLogFilters.tsx`  | 5     | w-[60%]/w-[30%] to w-full md:w-[60%]/w-full md:w-[30%]                 |
| `apps/web/components/schedule/ProjectScheduleList.tsx` | 4     | Sidebar/calendar stack                                                 |
| `apps/web/app/(app)/analytics/page.tsx`                | 4     | Header, chart grids                                                    |
| `apps/web/app/(app)/users/page.tsx`                    | 3     | Header responsive                                                      |
| `apps/web/components/admin/UserListTable.tsx`          | 4     | Filters, table responsive                                              |
| `apps/web/app/(app)/users/[id]/page.tsx`               | 4     | Minor responsive                                                       |
| `apps/web/components/ui/base-dialog.tsx`               | 5     | lg size: `max-w-2xl` to `sm:max-w-2xl`                                 |
| `apps/web/components/ui/toaster.tsx`                   | 5     | position `top-right` to `top-center`                                   |
| `apps/web/components/common/table/TablePagination.tsx` | 5     | Responsive padding, hide prev/next text on mobile                      |
| `apps/web/components/common/table/index.ts`            | 5     | Add ResponsiveTable export                                             |

### Files Created (1 file)

| File                                                   | Phase | Purpose                                       |
| ------------------------------------------------------ | ----- | --------------------------------------------- |
| `apps/web/components/common/table/ResponsiveTable.tsx` | 5     | Reusable horizontal scroll wrapper for tables |

---

## Success Criteria

1. **Zero Horizontal Scroll**: No page shows horizontal scrollbar at any viewport width >= 360px
2. **Mobile Navigation**: Hamburger menu + drawer works smoothly on all mobile viewports
3. **Content Readability**: All text, cards, tables, and charts are readable on 360px viewport
4. **Touch Usability**: All interactive elements have >= 44px touch targets on mobile
5. **Desktop Preservation**: 1440px desktop layout is pixel-identical to current production
6. **Build Success**: `pnpm --filter web build` passes without errors
7. **No Feature Loss**: All features remain accessible on all viewports (may be reorganized but not removed)
8. **Accessibility**: Pinch-to-zoom remains enabled (no maximum-scale restriction)
9. **iOS Compatibility**: No input auto-zoom on iOS Safari (font-size >= 16px on mobile inputs)
10. **Toast Visibility**: Toast notifications visible and readable on 360px mobile
11. **Pagination Usability**: Page navigation controls fit within 360px viewport
