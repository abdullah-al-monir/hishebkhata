'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Play, Download, CheckCircle, Loader2, FileText, DollarSign, TrendingUp, Users } from 'lucide-react';
import { payrollApi } from '@/lib/api';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Schema: Payroll has totalPaid (not netSalary/grossSalary), no tax field
// grossSalary = baseSalary + overtimePay + bonus
// netSalary   = totalPaid

interface PayrollRow {
  id:           string;
  month:        number;
  year:         number;
  presentDays:  number;
  absentDays:   number;
  leaveDays:    number;
  overtimeHours: number;
  baseSalary:   number | string;
  overtimePay:  number | string;
  bonus:        number | string;
  deductions:   number | string;
  totalPaid:    number | string;   // net salary in our schema
  status:       string;
  employee?:    { name: string; designation?: string; department?: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-muted text-muted-foreground',
  PROCESSED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  PAID:      'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const n = (v: number | string | undefined | null) => Number(v ?? 0);

export default function PayrollClient() {
  const t  = useTranslations('payroll');
  const tc = useTranslations('common');
  const now = new Date();
  const [page, setPage]                   = useState(1);
  const [month, setMonth]                 = useState(now.getMonth() + 1);
  const [year, setYear]                   = useState(now.getFullYear());
  const [generating, setGenerating]       = useState(false);
  const [confirmGenerate, setConfirmGenerate] = useState(false);

  const { data: summaryData, mutate: mutateSummary } = useSWR(
    ['payroll-summary', month, year],
    () => payrollApi.getSummary(month, year).then((r) => r.data.data)
  );
  const { data: listData, isLoading, mutate } = useSWR(
    ['payrolls', page, month, year],
    () => payrollApi.getAll({ page, limit: 10, month, year }).then((r) => r.data)
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await payrollApi.generate({ month, year });
      toast.success(`Payroll generated for ${getMonthName(month)} ${year}`);
      mutate();
      mutateSummary();
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to generate payroll',
      );
    } finally {
      setGenerating(false);
      setConfirmGenerate(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await payrollApi.updateStatus(id, { status: 'PAID', paymentDate: new Date().toISOString().split('T')[0] });
      toast.success('Marked as paid');
      mutate();
      mutateSummary();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const res = await payrollApi.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `payslip_${name}_${month}_${year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download payslip');
    }
  };

  const summary  = summaryData?.summary;
  const payrolls = (listData?.data ?? []) as PayrollRow[];
  const total    = listData?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  const summaryCards = [
    {
      title: 'Employees',
      value: summary?.totalEmployees ?? 0,
      icon: Users, iconCls: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30',
      format: false,
    },
    {
      title: t('grossSalary'),
      value: n(summary?.totalGross),
      icon: TrendingUp, iconCls: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30',
      format: true,
    },
    {
      title: t('netSalary'),
      value: n(summary?.totalNet ?? summary?.totalPaid),
      icon: DollarSign, iconCls: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30',
      format: true,
    },
    {
      title: 'Paid / Pending',
      value: summary ? `${summary.paid} / ${summary.pending}` : '—',
      icon: FileText, iconCls: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30',
      format: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{getMonthName(month)} {year}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{getMonthName(i + 1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setConfirmGenerate(true)}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {t('generatePayroll')}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ title, value, icon: Icon, iconCls, bg, format }) => (
          <Card key={title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
                  <p className="text-xl font-bold mt-1 leading-none">
                    {isLoading
                      ? <Skeleton className="h-6 w-16 mt-1" />
                      : format && typeof value === 'number'
                        ? formatCurrency(value)
                        : value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`${iconCls}`} style={{ width: 18, height: 18 }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="hidden sm:table-cell">{t('presentDays')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('absentDays')}</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead className="hidden md:table-cell">Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : payrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No payroll for {getMonthName(month)} {year}</p>
                  <p className="text-xs mt-1">Click &ldquo;Generate Payroll&rdquo; to create</p>
                </TableCell>
              </TableRow>
            ) : payrolls.map((p) => {
              // Calculate gross = baseSalary + overtimePay + bonus
              const gross = n(p.baseSalary) + n(p.overtimePay) + n(p.bonus);
              const net   = n(p.totalPaid);   // schema field
              const deduct = n(p.deductions);

              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{p.employee?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{p.employee?.designation ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-green-600 font-medium">{p.presentDays}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-red-500 font-medium">{p.absentDays}</span>
                  </TableCell>
                  <TableCell className="text-sm">{formatCurrency(gross)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-red-500">
                    -{formatCurrency(deduct)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(net)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_STYLES[p.status] ?? ''} border-0 text-xs`} variant="outline">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost" size="icon" className="w-7 h-7"
                        onClick={() => handleDownload(p.id, p.employee?.name ?? 'employee')}
                        title="Download payslip"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      {p.status !== 'PAID' && (
                        <Button
                          variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-green-600"
                          onClick={() => handleMarkPaid(p.id)}
                          title="Mark as paid"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirm generate */}
      <AlertDialog open={confirmGenerate} onOpenChange={setConfirmGenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Payroll</AlertDialogTitle>
            <AlertDialogDescription>
              Generate payroll for all active employees for{' '}
              <strong>{getMonthName(month)} {year}</strong>?
              Salaries will be calculated based on attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerate} className="bg-green-600 hover:bg-green-700">
              {generating && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}