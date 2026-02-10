'use client';

import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMyProjects } from '@/lib/api/projects';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  FileText,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { DEPARTMENT_LABELS, type Department } from '@repo/schema';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const menuItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: FolderKanban, label: '프로젝트 관리', href: '/projects' },
  // "업무" 메뉴는 확장 드롭다운으로 별도 처리
  { icon: FileText, label: '업무일지', href: '/work-logs' },
  { icon: CalendarIcon, label: '일정 관리', href: '/schedule' },
  { icon: BarChart3, label: '프로젝트 리포트', href: '/analytics' },
  // { icon: Palette, label: '디자인', href: '/dashboard/design-system' },
];

const adminMenuItems = [{ icon: Users, label: '멤버 관리', href: '/users' }];

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
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { projects: myProjects } = useMyProjects();
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(
    pathname?.startsWith('/tasks') || false,
  );

  // Memoize isActive check to avoid recreating on every render
  const isActive = useCallback(
    (href: string) => pathname === href || pathname?.startsWith(`${href}/`),
    [pathname],
  );

  const toggleTaskMenu = useCallback(() => {
    setIsTaskMenuOpen((prev) => !prev);
  }, []);

  const isTasksActive = pathname?.startsWith('/tasks');

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

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
    <TooltipProvider>
    <div className="flex flex-col h-full">
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
          {/* 일반 메뉴 아이템 - 프로젝트까지 */}
          {menuItems.slice(0, 2).map((item) => {
            const active = isActive(item.href);
            const linkEl = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  active
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-white hover:bg-white/5',
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
                      'text-sm font-medium truncate animate-[fadeIn_0.2s_ease-out]',
                      active && 'font-semibold',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
            if (!isExpanded) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}

          {/* 업무 관리 드롭다운 메뉴 */}
          <div>
            <button
              onClick={toggleTaskMenu}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isTasksActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              {isTasksActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
              )}
              <ClipboardList
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-colors',
                  isTasksActive
                    ? 'text-blue-400'
                    : 'text-slate-500 group-hover:text-white',
                )}
              />
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

            {/* 하위 프로젝트 목록 */}
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
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          projectActive
                            ? 'bg-blue-500/10 text-blue-400 font-medium'
                            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300',
                        )}
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

          {/* 나머지 메뉴 아이템 */}
          {menuItems.slice(2).map((item) => {
            const active = isActive(item.href);
            const linkEl = (
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
                      'text-sm font-medium truncate animate-[fadeIn_0.2s_ease-out]',
                      active && 'font-semibold',
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
            if (!isExpanded) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
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
              const linkEl = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                    active
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-r-full" />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      active
                        ? 'text-amber-400'
                        : 'text-slate-500 group-hover:text-white',
                    )}
                  />
                  {isExpanded && (
                    <span
                      className={cn(
                        'text-sm font-medium truncate animate-[fadeIn_0.2s_ease-out]',
                        active && 'font-semibold',
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
              if (!isExpanded) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return linkEl;
            })}
          </div>
        )}
      </nav>

      {/* Stats Card - CRM Style */}
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
              className={cn(
                'p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors',
                isExpanded && 'w-full flex justify-center mt-2',
              )}
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#1e1f2e] transition-all duration-300 z-50 flex flex-col',
          'hidden lg:flex',
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
          className="w-full max-w-full p-0 bg-[#1e1f2e] border-none [&>button]:text-white [&>button]:hover:text-white/80"
        >
          <SheetTitle className="sr-only">네비게이션 메뉴</SheetTitle>
          {renderNavigation(true, handleMobileLinkClick)}
        </SheetContent>
      </Sheet>
    </>
  );
}
