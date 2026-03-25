'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, QrCode, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import type { Shift } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

// ── Schema matches backend validator exactly ───────────────────────────────────
// department = plain string (no FK), no allowances/deductions fields
const schema = z.object({
  name:        z.string().min(2, 'Name too short'),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().optional(),
  designation: z.string().optional(),
  department:  z.string().optional(),   // ← plain string, NOT departmentId
  shiftId:     z.string().optional(),
  joiningDate: z.string().optional(),
  baseSalary:  z.coerce.number().positive('Salary must be positive'),
  bankAccountName:  z.string().optional(),
  bankAccountNo:    z.string().optional(),
  bankName:         z.string().optional(),
  address:          z.string().optional(),
  emergencyContact: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// Employee row shape returned from API
interface EmployeeRow {
  id:           string;
  orgId:        string;
  employeeCode: string;
  name:         string;
  email?:       string | null;
  phone?:       string | null;
  designation?: string | null;
  department?:  string | null;   // plain string
  avatar?:      string | null;
  baseSalary:   number | string;
  joiningDate:  string;
  isActive:     boolean;
  qrCode?:      string | null;
  shiftId?:     string | null;
  shift?:       { id: string; name: string; startTime: string; endTime: string } | null;
}

export default function EmployeesClient() {
  const t  = useTranslations('employees');
  const tc = useTranslations('common');
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeRow | null>(null);
  const [showQR, setShowQR]           = useState<EmployeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);

  const { data, isLoading, mutate } = useSWR(
    ['employees', page, search],
    () => employeeApi.getAll({ page, limit: 10, search }).then((r) => r.data)
  );
  // departments = array of { name: string, count: number } — derived from employee strings
  const { data: departments } = useSWR('departments', () =>
    employeeApi.getDepartments().then((r) => r.data.data as { name: string; count: number }[])
  );
  console.log(departments)
  const { data: shifts } = useSWR('shifts', () =>
    employeeApi.getShifts().then((r) => r.data.data as Shift[])
  );

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditEmployee(null);
    reset({ baseSalary: 0 });
    setShowModal(true);
  };

  const openEdit = (emp: EmployeeRow) => {
    setEditEmployee(emp);
    reset({
      name:        emp.name,
      email:       emp.email        ?? '',
      phone:       emp.phone        ?? '',
      designation: emp.designation  ?? '',
      department:  emp.department   ?? '',   // ← plain string directly
      shiftId:     emp.shiftId      ?? '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      baseSalary:  Number(emp.baseSalary),
    });
    setShowModal(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Clean up empty strings → undefined so they don't fail UUID validation
      const payload = {
        ...data,
        email:      data.email      || undefined,
        shiftId:    data.shiftId    || undefined,
        department: data.department || undefined,
      };
      if (editEmployee) {
        await employeeApi.update(editEmployee.id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeApi.create(payload);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      mutate();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save employee';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await employeeApi.delete(deleteTarget.id);
      toast.success('Employee deactivated');
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error('Failed to deactivate employee');
    }
  };

  const handleRegenerateQR = async (emp: EmployeeRow) => {
    try {
      const res = await employeeApi.regenerateQR(emp.id);
      toast.success('QR code regenerated');
      setShowQR({ ...emp, qrCode: (res.data.data as { qrCode: string }).qrCode });
      mutate();
    } catch {
      toast.error('Failed to regenerate QR');
    }
  };

  const employees = (data?.data ?? []) as EmployeeRow[];
  const total     = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{t('title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total > 0 ? `${total} total employees` : 'Manage your workforce'}
            </p>
          </div>
          <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="w-4 h-4" />{t('addEmployee')}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`${tc('search')} employees...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">{t('employeeCode')}</TableHead>
                <TableHead>{tc('name')}</TableHead>
                <TableHead className="hidden md:table-cell">{tc('department')}</TableHead>
                <TableHead className="hidden lg:table-cell">{tc('shift')}</TableHead>
                <TableHead>{t('baseSalary')}</TableHead>
                <TableHead className="hidden sm:table-cell">{tc('joiningDate')}</TableHead>
                <TableHead>{tc('status')}</TableHead>
                <TableHead className="w-[100px]">{tc('actions')}</TableHead>
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
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No employees found</p>
                  </TableCell>
                </TableRow>
              ) : employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{emp.employeeCode}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-semibold">
                          {emp.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{emp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.designation ?? '—'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {/* department is a plain string */}
                    <span className="text-sm">{emp.department ?? '—'}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">{emp.shift?.name ?? '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{formatCurrency(Number(emp.baseSalary))}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{formatDate(emp.joiningDate)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={emp.isActive ? 'default' : 'secondary'}
                      className={emp.isActive ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 hover:bg-green-100 border-0' : ''}
                    >
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setShowQR(emp)}>
                            <QrCode className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View QR</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(emp)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteTarget(emp)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Deactivate</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

        {/* Add / Edit Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editEmployee ? 'Edit Employee' : t('addEmployee')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input {...register('name')} placeholder="Employee name" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} placeholder="optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...register('phone')} placeholder="optional" />
                </div>
                <div className="space-y-1.5">
                  <Label>{tc('designation')}</Label>
                  <Input {...register('designation')} placeholder="e.g. Manager" />
                </div>
                <div className="space-y-1.5">
                  <Label>{tc('joiningDate')}</Label>
                  <Input type="date" {...register('joiningDate')} />
                </div>

                {/* department = free-text string OR pick from existing */}
                <div className="space-y-1.5">
                  <Label>{tc('department')}</Label>
                  <Select
                    defaultValue={editEmployee?.department ?? ''}
                    onValueChange={(v) => setValue('department', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select or type below" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments?.map((d) => (
                        <SelectItem key={d.name} value={d.name}>{d.name} ({d.count})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    {...register('department')}
                    placeholder="Or type a new department name"
                    className="mt-1.5 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{tc('shift')}</Label>
                  <Select
                    defaultValue={editEmployee?.shiftId ?? ''}
                    onValueChange={(v) => setValue('shiftId', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {shifts?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.startTime}–{s.endTime})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{t('baseSalary')} (৳) *</Label>
                  <Input type="number" {...register('baseSalary')} placeholder="0" />
                  {errors.baseSalary && <p className="text-xs text-red-500">{errors.baseSalary.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{tc('cancel')}</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {tc('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* QR Dialog */}
        <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
          <DialogContent className="max-w-xs text-center">
            <DialogHeader><DialogTitle>QR Code</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              {showQR?.qrCode ? (
                <img src={showQR.qrCode} alt="QR Code" className="w-44 h-44 mx-auto rounded-lg border border-border" />
              ) : (
                <div className="w-44 h-44 mx-auto rounded-lg bg-muted flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{showQR?.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{showQR?.employeeCode}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => showQR && handleRegenerateQR(showQR)} className="text-xs">
                {t('regenerateQR')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Deactivate <strong>{deleteTarget?.name}</strong>? They will no longer be able to clock in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Deactivate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}