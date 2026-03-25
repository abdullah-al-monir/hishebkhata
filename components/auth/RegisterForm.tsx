'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowRight, Check } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name:    z.string().min(2, 'Name must be at least 2 characters'),
  email:   z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((v) => /[A-Z]/.test(v), 'Must contain an uppercase letter')
    .refine((v) => /[0-9]/.test(v), 'Must contain a number'),
  orgName: z.string().min(2, 'Organization name is required'),
  // ← GARMENT not GARMENT_FACTORY — matches actual schema enum
  orgType: z.enum(['RESTAURANT', 'GARMENT', 'SCHOOL', 'MANUFACTURING', 'RETAIL', 'OTHER']),
});

type FormData = z.infer<typeof schema>;

const ORG_TYPES = [
  { value: 'RESTAURANT',   label: '🍽️ Restaurant / Food Business' },
  { value: 'GARMENT',      label: '👗 Garment Factory' },
  { value: 'SCHOOL',       label: '🏫 School / Institution' },
  { value: 'MANUFACTURING',label: '🏭 Manufacturing Unit' },
  { value: 'RETAIL',       label: '🛍️ Retail Shop' },
  { value: 'OTHER',        label: '💼 Other Business' },
] as const;

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8,    label: 'At least 8 characters' },
  { test: (v: string) => /[A-Z]/.test(v),  label: 'One uppercase letter' },
  { test: (v: string) => /[0-9]/.test(v),  label: 'One number' },
];

export default function RegisterForm() {
  const t      = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVal, setPasswordVal]   = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orgType: 'OTHER' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register(data);
      toast.success('Account created! Check your email to verify.');
      router.push(`/${locale}/login`);      // ← correct auth path
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">{t('registerTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('registerSubtitle')}</p>
      </div>

      {/* Free trial badge */}
      <div className="rounded-lg border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/30 px-3.5 py-2.5 flex items-center gap-2">
        <Check className="w-4 h-4 text-green-600 shrink-0" />
        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
          14-day free trial · No credit card required
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('fullName')}</Label>
          <Input
            id="name"
            placeholder="Your full name"
            autoComplete="name"
            {...register('name')}
            className={errors.name ? 'border-red-400' : ''}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              {...register('password', {
                onChange: (e) => setPasswordVal(e.target.value),
              })}
              className={`pr-9 ${errors.password ? 'border-red-400' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Password strength indicators */}
          {passwordVal.length > 0 && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {PASSWORD_RULES.map((rule) => {
                const passing = rule.test(passwordVal);
                return (
                  <div key={rule.label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${passing ? 'bg-green-500' : 'bg-muted'}`}>
                      {passing && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span className={`text-[10px] transition-colors ${passing ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Only show error if no password typed yet */}
          {errors.password && !passwordVal && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Separator />

        {/* Org name */}
        <div className="space-y-1.5">
          <Label htmlFor="orgName">{t('orgName')}</Label>
          <Input
            id="orgName"
            placeholder="Your business name"
            {...register('orgName')}
            className={errors.orgName ? 'border-red-400' : ''}
          />
          {errors.orgName && <p className="text-xs text-red-500">{errors.orgName.message}</p>}
        </div>

        {/* Org type */}
        <div className="space-y-1.5">
          <Label>{t('orgType')}</Label>
          <Select
            defaultValue="OTHER"
            onValueChange={(val) => setValue('orgType', val as FormData['orgType'], { shouldValidate: true })}
          >
            <SelectTrigger className={errors.orgType ? 'border-red-400' : ''}>
              <SelectValue placeholder={t('selectOrgType')} />
            </SelectTrigger>
            <SelectContent>
              {ORG_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.orgType && <p className="text-xs text-red-500">{errors.orgType.message}</p>}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {t('register')} — Free for 14 days
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {t('termsNotice')}{' '}
          <Link href={`/${locale}/terms`} className="underline hover:text-foreground">{t('terms')}</Link>
          {' & '}
          <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">{t('privacy')}</Link>
        </p>
      </form>

      <Separator />

      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link
          href={`/${locale}/login`}
          className="text-green-600 hover:text-green-700 font-semibold transition-colors"
        >
          {t('login')} →
        </Link>
      </p>
    </div>
  );
}