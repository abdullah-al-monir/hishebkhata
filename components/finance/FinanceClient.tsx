'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { financeApi } from '@/lib/api';
import type { Transaction, ExpenseCategory, IncomeSource } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const PIE_COLORS = ['#16a34a', '#2563eb', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308'];

export default function FinanceClient() {
  const t  = useTranslations('finance');
  const tc = useTranslations('common');
  const [page, setPage]               = useState(1);
  const [showModal, setShowModal]     = useState(false);
  const [editTx, setEditTx]           = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { data: summaryData } = useSWR('finance-summary', () =>
    financeApi.getSummary().then((r) => r.data.data)
  );
  const { data: trendData } = useSWR('finance-trend', () =>
    financeApi.getTrend(6).then((r) => r.data.data)
  );
  const { data: breakdownData } = useSWR('finance-breakdown-expense', () =>
    financeApi.getBreakdown({ type: 'EXPENSE' }).then((r) => r.data.data)
  );
  const { data: listData, isLoading, mutate } = useSWR(
    ['transactions', page, typeFilter],
    () => financeApi.getTransactions({ page, limit: 10, type: typeFilter || undefined }).then((r) => r.data)
  );
  const { data: categories } = useSWR('expense-categories', () =>
    financeApi.getCategories().then((r) => r.data.data as ExpenseCategory[])
  );
  const { data: sources } = useSWR('income-sources', () =>
    financeApi.getSources().then((r) => r.data.data as IncomeSource[])
  );

  const { register, handleSubmit, setValue, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0] },
  });
  const txType = watch('type');

  const openCreate = () => {
    setEditTx(null);
    reset({ type: 'EXPENSE', transactionDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditTx(tx);
    reset({ ...tx, transactionDate: tx.transactionDate.split('T')[0] });
    setShowModal(true);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (editTx) {
        await financeApi.updateTransaction(editTx.id, data);
        toast.success('Transaction updated');
      } else {
        await financeApi.createTransaction(data);
        toast.success('Transaction added');
      }
      setShowModal(false);
      mutate();
    } catch {
      toast.error('Failed to save transaction');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await financeApi.deleteTransaction(deleteTarget.id);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      mutate();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const transactions: Transaction[] = listData?.data ?? [];
  const total      = listData?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track income & expenses</p>
        </div>
        <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="w-4 h-4" />{t('addTransaction')}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: t('income'),    value: summaryData?.totalIncome  ?? 0, icon: TrendingUp,   cls: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { title: t('expense'),   value: summaryData?.totalExpense ?? 0, icon: TrendingDown, cls: 'text-red-500',   bg: 'bg-red-50 dark:bg-red-950/30'     },
          { title: t('netProfit'), value: summaryData?.netProfit    ?? 0, icon: DollarSign,   cls: (summaryData?.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-500', bg: 'bg-muted/50' },
        ].map(({ title, value, icon: Icon, cls, bg }) => (
          <Card key={title}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-5 h-5 ${cls}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
                <p className="text-lg font-bold mt-0.5 leading-none">{formatCurrency(value as number)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('monthlyTrend')}</CardTitle>
            <CardDescription className="text-xs">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income"  fill="#16a34a" name="Income"  radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Expense {t('breakdown')}</CardTitle>
            <CardDescription className="text-xs">By category</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {breakdownData?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={breakdownData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                    {(breakdownData as unknown[]).map((_: unknown, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">{tc('noData')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>{tc('date')}</TableHead>
              <TableHead>{tc('description')}</TableHead>
              <TableHead className="hidden md:table-cell">Category / Source</TableHead>
              <TableHead>{tc('amount')}</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}</TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No transactions found</TableCell>
              </TableRow>
            ) : transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <Badge variant="outline" className={`border-0 text-xs ${
                    tx.type === 'INCOME'
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(tx.transactionDate)}</TableCell>
                <TableCell className="text-sm">{tx.description ?? '—'}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {/* ← Fixed: expenseCategory / incomeSource not category / source */}
                  {(tx as unknown as { expenseCategory?: { name: string }; incomeSource?: { name: string } }).expenseCategory?.name
                  ?? (tx as unknown as { expenseCategory?: { name: string }; incomeSource?: { name: string } }).incomeSource?.name
                  ?? '—'}
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(tx)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteTarget(tx)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTx ? 'Edit Transaction' : t('addTransaction')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('transactionType')}</Label>
              <Select defaultValue={editTx?.type ?? 'EXPENSE'} onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{tc('amount')} (৳)</Label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>{tc('date')}</Label>
                <Input type="date" {...register('transactionDate')} />
              </div>
            </div>

            {/* Show categories for EXPENSE, sources for INCOME */}
            {txType === 'EXPENSE' ? (
              <div className="space-y-1.5">
                <Label>Expense Category</Label>
                <Select
                  defaultValue={editTx?.categoryId ?? 'none'}
                  onValueChange={(v) => setValue('categoryId', v === 'none' ? '' : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Income Source</Label>
                <Select
                  defaultValue={editTx?.sourceId ?? 'none'}
                  onValueChange={(v) => setValue('sourceId', v === 'none' ? '' : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sources?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>{tc('description')}</Label>
              <Input {...register('description')} placeholder="Optional description" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('reference')}</Label>
              <Input {...register('reference')} placeholder="Invoice #, Receipt #..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{tc('cancel')}</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                {tc('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this {deleteTarget?.type?.toLowerCase()} of {deleteTarget ? formatCurrency(Number(deleteTarget.amount)) : ''}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}