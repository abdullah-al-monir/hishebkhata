'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Loader2, Building2, Sliders, Users, CreditCard, Check } from 'lucide-react';
import { orgApi, subscriptionApi } from '@/lib/api';
import type { Organization, Subscription } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsClient() {
  const t = useTranslations('settings');

  const { data: org, mutate: mutateOrg } = useSWR('org', () =>
    orgApi.get().then((r) => r.data.data as Organization)
  );
  const { data: sub } = useSWR('subscription', () =>
    subscriptionApi.get().then((r) => r.data.data as Subscription)
  );
  const { data: usersData } = useSWR('org-users', () =>
    orgApi.getUsers().then((r) => r.data.data)
  );

  const { register: regOrg, handleSubmit: subOrg, formState: { isSubmitting: savingOrg } } = useForm({
    values: org ? {
      name: org.name, phone: org.phone ?? '', address: org.address ?? '',
      timezone: org.timezone, currency: org.currency,
      workingDaysPerWeek: org.workingDaysPerWeek, workHoursPerDay: org.workHoursPerDay,
      overtimeRateMultiplier: org.overtimeRateMultiplier,
    } : undefined,
  });

  const { register: regFeat, handleSubmit: subFeat, watch: watchFeat, setValue: setFeatVal, formState: { isSubmitting: savingFeat } } = useForm({
    values: org?.settings,
  });

  const onSaveOrg = async (data: Record<string, unknown>) => {
    try {
      await orgApi.update(data);
      toast.success('Organization settings saved');
      mutateOrg();
    } catch { toast.error('Failed to save'); }
  };

  const onSaveFeat = async (data: Record<string, unknown>) => {
    try {
      await orgApi.updateSettings(data);
      toast.success('Feature settings saved');
      mutateOrg();
    } catch { toast.error('Failed to save'); }
  };

  const featureToggles = [
    { name: 'enableQRCode', label: t('enableQRCode'), desc: 'Allow QR code based attendance' },
    { name: 'enableBiometric', label: t('enableBiometric'), desc: 'Enable biometric device integration' },
    { name: 'enableOvertime', label: t('enableOvertime'), desc: 'Track and pay overtime hours' },
    { name: 'enableLeave', label: t('enableLeave'), desc: 'Allow employees to request leave' },
    { name: 'enablePayroll', label: 'Enable Payroll', desc: 'Auto-generate monthly payroll' },
    { name: 'enableFinance', label: 'Enable Finance', desc: 'Track income and expenses' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your organization preferences</p>
      </div>

      <Tabs defaultValue="org">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="org" className="gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" />{t('orgSettings')}</TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5 text-xs"><Sliders className="w-3.5 h-3.5" />{t('features')}</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />{t('team')}</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs"><CreditCard className="w-3.5 h-3.5" />{t('billing')}</TabsTrigger>
        </TabsList>

        {/* ── ORG SETTINGS ── */}
        <TabsContent value="org" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('orgSettings')}</CardTitle>
              <CardDescription className="text-xs">Basic organization info and work configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={subOrg(onSaveOrg)} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Organization Name</Label>
                    <Input {...regOrg('name')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input {...regOrg('phone')} placeholder="+880..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Input {...regOrg('timezone')} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Address</Label>
                    <Input {...regOrg('address')} placeholder="Dhaka, Bangladesh" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input {...regOrg('currency')} />
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Work Configuration</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('workingDays')} / week</Label>
                    <Input type="number" min="5" max="7" {...regOrg('workingDaysPerWeek', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('workHours')} / day</Label>
                    <Input type="number" step="0.5" {...regOrg('workHoursPerDay', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t('overtimeRate')} (×)</Label>
                    <Input type="number" step="0.1" {...regOrg('overtimeRateMultiplier', { valueAsNumber: true })} />
                  </div>
                </div>
                <Button type="submit" disabled={savingOrg} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  {savingOrg && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEATURES ── */}
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('features')}</CardTitle>
              <CardDescription className="text-xs">Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={subFeat(onSaveFeat)} className="space-y-1">
                {featureToggles.map(({ name, label, desc }) => (
                  <div key={name} className="flex items-center justify-between py-3.5 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Switch
                      checked={!!watchFeat(name as never)}
                      onCheckedChange={(v) => setFeatVal(name as never, v as never)}
                    />
                  </div>
                ))}
                <div className="pt-4">
                  <Button type="submit" disabled={savingFeat} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    {savingFeat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TEAM ── */}
        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('team')}</CardTitle>
              <CardDescription className="text-xs">Manage users who have access to this organization</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border/50">
                {usersData?.map((user: { id: string; name: string; email: string; role: string; isActive: boolean }) => (
                  <div key={user.id} className="flex items-center justify-between py-4 first:pt-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-semibold">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:border-green-800">{user.role}</Badge>
                      <Badge variant={user.isActive ? 'default' : 'secondary'} className={`text-xs ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 hover:bg-green-100 border-0' : ''}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                )) ?? (
                  <p className="text-sm text-muted-foreground text-center py-8">No team members found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BILLING ── */}
        <TabsContent value="billing" className="mt-4">
          <div className="space-y-4">
            {sub ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{t('subscription')}</CardTitle>
                    <CardDescription className="text-xs">Your current plan and limits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{sub.plan} Plan</h3>
                          <Badge
                            className={`text-xs border-0 ${
                              sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                              sub.status === 'TRIAL' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                              'bg-red-100 text-red-700'
                            }`}
                            variant="outline"
                          >
                            {sub.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Up to {sub.maxEmployees} employees</p>
                        {sub.trialEndsAt && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Trial ends: {new Date(sub.trialEndsAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          {formatCurrency(sub.pricePerMonth)}
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {[
                        `Up to ${sub.maxEmployees} employees`,
                        'QR code attendance',
                        'Automated payroll',
                        'Finance tracking',
                        'Reports & analytics',
                      ].map((feat) => (
                        <div key={feat} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">
                      To upgrade your plan or manage billing, contact our support team or visit the pricing page.
                    </p>
                    <Button variant="outline" className="mt-3 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/30">
                      View Plans
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No subscription data available
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}