'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/auth.store';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { LogOut, User, Settings } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'dashboard',
  employees: 'employees',
  attendance: 'attendance',
  payroll: 'payroll',
  finance: 'finance',
  reports: 'reports',
  settings: 'settings',
};

// Mock notifications — in production, fetch from API
const MOCK_NOTIFICATIONS = [
  { id: '1', title: '3 leave requests pending', time: '5m ago', type: 'warning' },
  { id: '2', title: 'Payroll generated for June', time: '1h ago', type: 'success' },
  { id: '3', title: '2 employees clocked in late', time: '2h ago', type: 'info' },
];

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Build breadcrumbs from path
  const segments = pathname
    .replace(`/${locale}`, '')
    .split('/')
    .filter(Boolean);

  const breadcrumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg,
    href: `/${locale}/${segments.slice(0, i + 1).join('/')}`,
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="h-[60px] border-b border-border/60 bg-background flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            {crumb.isLast ? (
              <span className="font-semibold text-foreground capitalize truncate">
                {t(crumb.label as Parameters<typeof t>[0])}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground capitalize truncate transition-colors"
              >
                {t(crumb.label as Parameters<typeof t>[0])}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative w-8 h-8">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-red-500 hover:bg-red-500 border-0">
                {MOCK_NOTIFICATIONS.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">Notifications</p>
              <Button variant="ghost" className="text-xs h-auto p-0 text-green-600 hover:text-green-700">
                Mark all read
              </Button>
            </div>
            <div className="divide-y divide-border">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    n.type === 'warning' ? 'bg-yellow-500' :
                    n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground leading-snug">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-border">
              <Button variant="ghost" className="w-full text-xs text-muted-foreground h-7">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-8 px-2 rounded-lg">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-semibold">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <Badge variant="outline" className="text-[10px] w-fit mt-1 text-green-600 border-green-200 dark:border-green-800">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/settings`} className="flex items-center gap-2 cursor-pointer">
                <User className="w-3.5 h-3.5" />
                <span className="text-sm">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${locale}/dashboard/settings`} className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-3.5 h-3.5" />
                <span className="text-sm">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              <span className="text-sm">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}