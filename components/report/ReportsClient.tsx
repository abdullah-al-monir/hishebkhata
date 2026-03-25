'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { reportApi } from '@/lib/api';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import type { Payroll, Transaction } from '@/types';

export default function ReportsClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [startDate, setStartDate] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`);
  const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);

  const { data: attReport, isLoading: attLoading } = useSWR(
    ['report-attendance', startDate, endDate],
    () => reportApi.getAttendance({ startDate, endDate }).then((r) => r.data.data)
  );
  const { data: payReport, isLoading: payLoading } = useSWR(
    ['report-payroll', month, year],
    () => reportApi.getPayroll({ month: String(month), year: String(year) }).then((r) => r.data.data)
  );
  const { data: finReport, isLoading: finLoading } = useSWR(
    ['report-finance', startDate, endDate],
    () => reportApi.getFinance({ startDate, endDate }).then((r) => r.data.data)
  );

  const DateRangeFilter = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground shrink-0">From:</Label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto h-8 text-sm" />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground shrink-0">To:</Label>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto h-8 text-sm" />
      </div>
    </div>
  );

  const MonthYearFilter = () => (
    <div className="flex items-center gap-2">
      <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
        <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>{getMonthName(i + 1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
        <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {[2023, 2024, 2025, 2026].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Detailed analytics & summaries</p>
      </div>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="attendance" className="gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1.5 text-xs">
            <FileText className="w-3.5 h-3.5" />Payroll
          </TabsTrigger>
          <TabsTrigger value="finance" className="gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />Finance
          </TabsTrigger>
        </TabsList>

        {/* ── ATTENDANCE ── */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <DateRangeFilter />
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead className="hidden sm:table-cell">Leave</TableHead>
                  <TableHead className="hidden sm:table-cell">Half Day</TableHead>
                  <TableHead className="hidden md:table-cell">Overtime</TableHead>
                  <TableHead className="hidden md:table-cell">Avg Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : attReport?.length ? (
                  attReport.map((row: Record<string, unknown>, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{(row.employee as { name: string })?.name}</p>
                          <p className="text-xs text-muted-foreground">{(row.employee as { designation?: string })?.designation ?? '—'}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-0 text-xs" variant="outline">{row.present as number}</Badge></TableCell>
                      <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-0 text-xs" variant="outline">{row.absent as number}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{row.leave as number}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{row.halfDay as number}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{((row.totalOvertimeHours as number) ?? 0).toFixed(1)}h</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{((row.avgWorkingHours as number) ?? 0).toFixed(1)}h</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-sm text-muted-foreground">No attendance data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── PAYROLL ── */}
        <TabsContent value="payroll" className="space-y-4 mt-4">
          <MonthYearFilter />
          {/* Summary cards */}
          {payReport?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Gross', val: payReport.summary.totalGross },
                { label: 'Total Net', val: payReport.summary.totalNet },
                { label: 'Total Tax', val: payReport.summary.totalTax },
                { label: 'Deductions', val: payReport.summary.totalDeductions },
              ].map(({ label, val }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-base font-bold mt-0.5">{formatCurrency(val ?? 0)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead className="hidden sm:table-cell">Overtime</TableHead>
                  <TableHead className="hidden md:table-cell">Deductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : payReport?.payrolls?.length ? (
                  payReport.payrolls.map((p: Payroll) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{(p.employee as { name: string })?.name}</p>
                      </TableCell>
                      <TableCell className="text-sm">{formatCurrency(p.baseSalary)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-orange-600">{formatCurrency(p.overtimePay)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-red-500">-{formatCurrency(p.deductions + p.tax)}</TableCell>
                      <TableCell><span className="text-sm font-semibold text-green-600">{formatCurrency(p.netSalary)}</span></TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs ${p.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'}`}
                          variant="outline"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">No payroll data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── FINANCE ── */}
        <TabsContent value="finance" className="space-y-4 mt-4">
          <DateRangeFilter />
          {finReport?.summary && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Income', val: finReport.summary.totalIncome, cls: 'text-green-600' },
                { label: 'Total Expense', val: finReport.summary.totalExpense, cls: 'text-red-500' },
                { label: 'Net Profit', val: finReport.summary.netProfit, cls: (finReport.summary.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-500' },
              ].map(({ label, val, cls }) => (
                <Card key={label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-base font-bold mt-0.5 ${cls}`}>{formatCurrency(val ?? 0)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : finReport?.transactions?.length ? (
                  finReport.transactions.map((tx: Transaction) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs ${tx.type === 'INCOME' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}
                          variant="outline"
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.transactionDate)}</TableCell>
                      <TableCell className="text-sm">{tx.description ?? '—'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{tx.category?.name ?? tx.source?.name ?? '—'}</TableCell>
                      <TableCell>
                        <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">No finance data</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}