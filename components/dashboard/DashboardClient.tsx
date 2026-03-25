'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { dashboardApi } from '@/lib/api';
import { formatCurrency, formatTime } from '@/lib/utils';
import {
  Users, UserCheck, UserX, Clock, AlertCircle,
  FileText, TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import type { DashboardStats } from '@/types';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
  iconClass = 'text-green-600',
  bgClass = 'bg-green-50 dark:bg-green-950/30',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  loading?: boolean;
  iconClass?: string;
  bgClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-20 mt-1.5" />
            ) : (
              <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
            )}
            {subtitle && !loading && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
            {trend && !loading && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {trend.value >= 0
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(trend.value)}% {trend.label}
              </div>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`w-5 h-5 ${iconClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardClient() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  const { data: stats, isLoading: statsLoading } = useSWR(
    'dashboard-stats',
    () => dashboardApi.getStats().then((r) => r.data.data as DashboardStats),
    { refreshInterval: 120000 }
  );

  const { data: trendData } = useSWR(
    'dashboard-trend',
    () => dashboardApi.getAttendanceTrend(7).then((r) => r.data.data),
    { refreshInterval: 300000 }
  );

  const { data: activityData } = useSWR(
    'dashboard-activity',
    () => dashboardApi.getActivity().then((r) => r.data.data),
    { refreshInterval: 60000 }
  );

  const statCards = [
    {
      title: t('totalEmployees'),
      value: stats?.totalEmployees ?? 0,
      icon: Users,
      iconClass: 'text-blue-600',
      bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: t('presentToday'),
      value: stats?.presentToday ?? 0,
      subtitle: stats ? `${stats.attendanceRate}% rate` : undefined,
      icon: UserCheck,
      iconClass: 'text-green-600',
      bgClass: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: t('absentToday'),
      value: stats?.absentToday ?? 0,
      icon: UserX,
      iconClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      title: t('lateArrivals'),
      value: stats?.lateArrivals ?? 0,
      icon: Clock,
      iconClass: 'text-orange-500',
      bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: t('pendingLeaves'),
      value: stats?.pendingLeaves ?? 0,
      icon: AlertCircle,
      iconClass: 'text-yellow-600',
      bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      title: t('monthlyPayroll'),
      value: stats ? formatCurrency(stats.currentMonthPayroll) : '—',
      icon: FileText,
      iconClass: 'text-purple-600',
      bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: t('thisMonthIncome'),
      value: stats ? formatCurrency(stats.thisMonthIncome) : '—',
      icon: TrendingUp,
      iconClass: 'text-teal-600',
      bgClass: 'bg-teal-50 dark:bg-teal-950/30',
    },
    {
      title: t('netProfit'),
      value: stats ? formatCurrency(stats.netProfit) : '—',
      subtitle: stats ? `Expense: ${formatCurrency(stats.thisMonthExpense)}` : undefined,
      icon: DollarSign,
      iconClass: (stats?.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-500',
      bgClass: (stats?.netProfit ?? 0) >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30',
    },
  ];

  const today = new Date().toLocaleDateString('en-BD', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} loading={statsLoading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Attendance trend — wider */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t('attendanceTrend')}</CardTitle>
            <CardDescription className="text-xs">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={trendData ?? []}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="dayLabel" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12, borderRadius: 8,
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="present" stroke="#16a34a" fill="url(#presentGrad)" strokeWidth={2} name="Present" />
                <Area type="monotone" dataKey="absent" stroke="#ef4444" fill="url(#absentGrad)" strokeWidth={2} strokeDasharray="4 4" name="Absent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent check-ins */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">{t('recentCheckIns')}</CardTitle>
            <CardDescription className="text-xs">Today&apos;s activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0 divide-y divide-border/50">
              {activityData?.recentCheckIns?.length ? (
                activityData.recentCheckIns.slice(0, 6).map((item: {
                  id: string; clockIn: string; lateMinutes: number;
                  employee: { name: string };
                }) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-semibold shrink-0">
                        {item.employee?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground leading-none">{item.employee?.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.clockIn ? formatTime(item.clockIn) : '—'}
                        </p>
                      </div>
                    </div>
                    {(item.lateMinutes ?? 0) > 0 && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-orange-600 border-orange-200 dark:border-orange-800">
                        +{item.lateMinutes}m
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">{tc('noData')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{t('recentTransactions')}</CardTitle>
          <CardDescription className="text-xs">Latest financial activity</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {activityData?.recentTransactions?.length ? (
            <div className="divide-y divide-border/50">
              {activityData.recentTransactions.map((tx: {
                id: string; type: string; description?: string;
                transactionDate: string; amount: number;
              }) => (
                <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'INCOME'
                        ? 'bg-green-100 dark:bg-green-950/40'
                        : 'bg-red-100 dark:bg-red-950/30'
                    }`}>
                      {tx.type === 'INCOME'
                        ? <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                        : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none">
                        {tx.description ?? '—'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{tc('noData')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}