'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';

const menuItems = [
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: FolderKanban, label: '프로젝트 관리', href: '/projects' },
  { icon: ClipboardList, label: '업무 관리', href: '/tasks' },
  { icon: CalendarIcon, label: '일정 관리', href: '/calendar' },
  { icon: BarChart3, label: '현황 관리', href: '/status' },
  { icon: Palette, label: '디자인 시스템', href: '/dashboard/design-system' },
];

const adminMenuItems = [
  { icon: Users, label: '회원 관리', href: '/admin/users' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col',
        isCollapsed ? 'w-[80px]' : 'w-[240px]'
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-shinhan-blue rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-lg italic">S</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-shinhan-blue tracking-tight whitespace-nowrap">
              SHINHAN <span className="text-slate-400 font-light">PMS</span>
            </span>
          )}
        </Link>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all group',
              isActive(item.href)
                ? 'bg-blue-50 text-shinhan-blue font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-shinhan-blue'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive(item.href) ? 'text-shinhan-blue' : 'text-slate-400 group-hover:text-shinhan-blue')} />
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Admin Menu Section */}
        {(user?.role === 'PM' || user?.role === 'PL') && (
          <div className="pt-6">
            {!isCollapsed && <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Admin</p>}
            {adminMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-all group',
                  isActive(item.href)
                    ? 'bg-yellow-50 text-orange-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive(item.href) ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500')} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Profile Area */}
      <div className="p-4 border-t border-slate-100">
        <div className={cn(
          'bg-slate-50 rounded-2xl transition-all',
          isCollapsed ? 'p-2' : 'p-3'
        )}>
          {user && (
            <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-shinhan-blue font-bold text-xs flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.department} / {user.role}</p>
                </div>
              )}
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-slate-400 hover:text-destructive hover:bg-destructive/5 h-8"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          )}
          {isCollapsed && (
             <Button
             variant="ghost"
             size="sm"
             className="w-full mt-2 text-slate-400 hover:text-destructive"
             onClick={logout}
           >
             <LogOut className="h-4 w-4" />
           </Button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-shinhan-blue shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
