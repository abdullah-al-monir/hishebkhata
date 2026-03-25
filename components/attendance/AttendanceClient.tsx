'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Plus, Users, UserCheck, UserX, Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import { attendanceApi, employeeApi } from '@/lib/api';
import type { Attendance, Employee } from '@/types';
import { formatTime, formatDate, minutesToHours } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_STYLES: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  LEAVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
  HALF_DAY: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  HOLIDAY: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
};

export default function AttendanceClient() {
  const t = useTranslations('attendance');
  const tc = useTranslations('common');
  const [page, setPage] = useState(1);
  const [showManual, setShowManual] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: todayData, mutate: mutateToday } = useSWR(
    'attendance-today',
    () => attendanceApi.getToday().then((r) => r.data.data),
    { refreshInterval: 30000 }
  );
  const { data: listData, isLoading, mutate } = useSWR(
    ['attendance-list', page, filterDate],
    () => attendanceApi.getAll({ page, limit: 15, date: filterDate }).then((r) => r.data)
  );
  const { data: employees } = useSWR('all-employees', () =>
    employeeApi.getAll({ limit: 200 }).then((r) => r.data.data as Employee[])
  );

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm();

  const handleManualEntry = async (data: Record<string, string>) => {
    try {
      await attendanceApi.manualEntry(data);
      toast.success('Attendance saved');
      setShowManual(false);
      reset();
      mutate();
      mutateToday();
    } catch {
      toast.error('Failed to save attendance');
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    try {
      await attendanceApi.checkIn({ employeeId, method: 'MANUAL' });
      toast.success('Checked in');
      mutateToday();
      mutate();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-in failed');
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    try {
      await attendanceApi.checkOut(employeeId);
      toast.success('Checked out');
      mutateToday();
      mutate();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-out failed');
    }
  };

  const summary = todayData?.summary;
  const attendances: Attendance[] = listData?.data ?? [];
  const total = listData?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 15);

  const summaryCards = [
    { label: 'Total', value: summary?.total ?? 0, icon: Users, cls: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: t('present'), value: summary?.present ?? 0, icon: UserCheck, cls: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: t('absent'), value: summary?.absent ?? 0, icon: UserX, cls: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    { label: t('leave'), value: summary?.onLeave ?? 0, icon: Clock, cls: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
    { label: 'Not Marked', value: summary?.notMarked ?? 0, icon: Clock, cls: 'text-muted-foreground', bg: 'bg-muted/50' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track daily attendance</p>
        </div>
        <Button onClick={() => setShowManual(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="w-4 h-4" />{t('manualEntry')}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {summaryCards.map(({ label, value, icon: Icon, cls, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${cls}`} style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live check-in panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{t('todayAttendance')}</CardTitle>
          <CardDescription className="text-xs">Click IN/OUT to mark attendance</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
            {employees?.slice(0, 40).map((emp) => {
              const record = todayData?.attendance?.find((a: Attendance) => a.employeeId === emp.id);
              return (
                <div key={emp.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-semibold">
                        {emp.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate leading-none">{emp.name}</p>
                      {record?.clockIn && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(record.clockIn)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!record?.clockIn && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30" onClick={() => handleCheckIn(emp.id)}>
                        IN
                      </Button>
                    )}
                    {record?.clockIn && !record?.clockOut && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30" onClick={() => handleCheckOut(emp.id)}>
                        OUT
                      </Button>
                    )}
                    {record?.clockOut && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Done</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date filter + table */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground shrink-0">{tc('date')}:</Label>
        <Input
          type="date"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
          className="w-auto"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tc('employeeName')}</TableHead>
              <TableHead>{tc('date')}</TableHead>
              <TableHead>{tc('status')}</TableHead>
              <TableHead>{t('clockIn')}</TableHead>
              <TableHead>{t('clockOut')}</TableHead>
              <TableHead>{t('workingHours')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('overtime')}</TableHead>
              <TableHead className="hidden md:table-cell">{tc('late')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : attendances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                  No attendance records for this date
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{a.employee?.name}</p>
                      <p className="text-xs text-muted-foreground">{a.employee?.designation ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(a.attendanceDate)}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_STYLES[a.status] ?? ''} border-0 text-xs`} variant="outline">
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{a.clockIn ? formatTime(a.clockIn) : '—'}</TableCell>
                  <TableCell className="text-sm">{a.clockOut ? formatTime(a.clockOut) : '—'}</TableCell>
                  <TableCell className="text-sm">{a.workingMinutes ? minutesToHours(a.workingMinutes) : '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className={a.overtimeMinutes > 0 ? 'text-sm text-orange-600 font-medium' : 'text-sm text-muted-foreground'}>
                      {a.overtimeMinutes > 0 ? minutesToHours(a.overtimeMinutes) : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={a.lateMinutes > 0 ? 'text-sm text-red-500' : 'text-sm text-muted-foreground'}>
                      {a.lateMinutes > 0 ? `${a.lateMinutes}m` : '—'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Manual Entry Dialog */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('manualEntry')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleManualEntry)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select onValueChange={(v) => setValue('employeeId', v)}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.employeeCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{tc('date')}</Label>
                <Input type="date" defaultValue={filterDate} {...register('attendanceDate', { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select defaultValue="PRESENT" onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY', 'HOLIDAY'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('clockIn')}</Label>
                <Input type="datetime-local" {...register('clockIn')} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('clockOut')}</Label>
                <Input type="datetime-local" {...register('clockOut')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Note (optional)</Label>
              <Input {...register('note')} placeholder="Any remarks..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowManual(false)}>{tc('cancel')}</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {tc('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}