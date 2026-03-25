'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { key: 'employees', href: '/dashboard/employees', icon: Users, badge: null },
  { key: 'attendance', href: '/dashboard/attendance', icon: Clock, badge: null },
  { key: 'payroll', href: '/dashboard/payroll', icon: DollarSign, badge: null },
  { key: 'finance', href: '/dashboard/finance', icon: TrendingUp, badge: null },
  { key: 'reports', href: '/dashboard/reports', icon: BarChart3, badge: null },
];

const BOTTOM_ITEMS = [
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    const localePath = pathname.replace(`/${locale}`, '');
    if (href === '/dashboard') return localePath === '/dashboard' || localePath === '/dashboard/';
    return localePath.startsWith(href);
  };

  const NavItem = ({
    href,
    icon: Icon,
    labelKey,
    badge,
  }: {
    href: string;
    icon: React.ElementType;
    labelKey: string;
    badge?: string | null;
  }) => {
    const active = isActive(href);
    const fullHref = `/${locale}${href}`;

    const content = (
      <Link
        href={fullHref}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative',
          active
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-muted-foreground hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/40 dark:hover:text-green-400',
          collapsed && 'justify-center px-2.5'
        )}
      >
        <Icon
          className={cn(
            'shrink-0 transition-transform duration-150 group-hover:scale-110',
            collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5',
            active ? 'w-4.5 h-4.5' : ''
          )}
          style={{ width: collapsed ? 20 : 18, height: collapsed ? 20 : 18 }}
        />
        {!collapsed && (
          <span className="truncate">{t(labelKey as Parameters<typeof t>[0])}</span>
        )}
        {!collapsed && badge && (
          <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
            {badge}
          </Badge>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {t(labelKey as Parameters<typeof t>[0])}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-screen bg-background border-r border-border/60 transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-[60px]' : 'w-[220px]'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-[60px] border-b border-border/60 px-4',
            collapsed ? 'justify-center px-2' : 'justify-between'
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                হ
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-green-600 truncate leading-none">হিসাব খাতা</p>
                {user?.org?.name && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">
                    {user.org.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center text-white text-xs font-bold cursor-default">
                  হ
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">হিসাব খাতা</TooltipContent>
            </Tooltip>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(false)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Org badge */}
        {!collapsed && user?.org && (
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
              <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate">{user.org.type}</span>
            </div>
          </div>
        )}

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-none">
          {NAV_ITEMS.map(({ key, href, icon, badge }) => (
            <NavItem key={key} href={href} icon={icon} labelKey={key} badge={badge} />
          ))}
        </nav>

        <Separator />

        {/* Bottom Nav */}
        <div className="px-2 py-1.5 space-y-0.5">
          {BOTTOM_ITEMS.map(({ key, href, icon }) => (
            <NavItem key={key} href={href} icon={icon} labelKey={key} />
          ))}
        </div>

        <Separator />

        {/* User Footer */}
        <div className={cn('p-2', collapsed && 'flex flex-col items-center')}>
          {!collapsed ? (
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-[11px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-semibold">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 shrink-0 text-muted-foreground hover:text-red-500"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-muted-foreground hover:text-red-500"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}