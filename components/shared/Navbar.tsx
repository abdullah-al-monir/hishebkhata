'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Menu, X, BarChart3, Users, Clock,
  DollarSign, LayoutDashboard, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  { href: '/dashboard',  labelKey: 'nav.dashboard',  icon: LayoutDashboard },
  { href: '/employees',  labelKey: 'nav.employees',  icon: Users           },
  { href: '/attendance', labelKey: 'nav.attendance', icon: Clock           },
  { href: '/payroll',    labelKey: 'nav.payroll',    icon: DollarSign      },
  { href: '/reports',    labelKey: 'nav.reports',    icon: BarChart3       },
];

interface NavbarProps {
  user?: { name: string; email: string; avatar?: string; role?: string } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const pathname = usePathname();
  const locale   = useLocale();
  const t        = useTranslations();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string) => pathname.includes(href);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-border/60'
          : 'bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-green-700 transition-colors">
              হ
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-bold text-gray-900 dark:text-white text-sm">হিসাব খাতা</div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wide">HISHAB KHATA</div>
            </div>
          </Link>

          {/* ── Desktop Nav (authenticated) ── */}
          {user && (
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
                <Link
                  key={href}
                  href={`/${locale}${href}`}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive(href)
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <>
                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                      <Avatar className="h-8 w-8 ring-2 ring-green-100 dark:ring-green-900">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-green-600 text-white font-semibold text-xs">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">{user.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-none truncate max-w-24">{user.email}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      {user.role && (
                        <span className="mt-1.5 inline-block text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                          {user.role}
                        </span>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/profile`} className="cursor-pointer">{t('nav.profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/settings`} className="cursor-pointer">{t('nav.settings')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer"
                    >
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile toggle */}
                <Button variant="ghost" size="icon" className="md:hidden ml-1" onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </>
            ) : (
              /* Public CTA buttons */
              <div className="flex items-center gap-2 ml-1">
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href={`/${locale}/login`}>{t('nav.login')}</Link>
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm" asChild>
                  <Link href={`/${locale}/register`}>{t('nav.register')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && user && (
          <div className="md:hidden border-t border-border py-3 space-y-0.5 pb-4">
            {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {t(labelKey)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}