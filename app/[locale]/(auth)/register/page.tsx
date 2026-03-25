// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useLocale, useTranslations } from 'next-intl';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Eye, EyeOff, Loader2, Building2, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
// import api from '@/lib/api';

// const registerSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   confirmPassword: z.string(),
//   orgName: z.string().min(2, 'Organization name required'),
//   orgType: z.string().min(1, 'Please select organization type'),
//   orgPhone: z.string().optional(),
//   orgAddress: z.string().optional(),
// }).refine(d => d.password === d.confirmPassword, {
//   message: "Passwords don't match",
//   path: ['confirmPassword'],
// });

// type RegisterForm = z.infer<typeof registerSchema>;

// const ORG_TYPES = [
//   { value: 'RETAIL',       label: 'Retail / Shop'         },
//   { value: 'RESTAURANT',   label: 'Restaurant / Food'     },
//   { value: 'GARMENTS',     label: 'Garments / Textile'    },
//   { value: 'CONSTRUCTION', label: 'Construction'          },
//   { value: 'IT',           label: 'IT / Software'         },
//   { value: 'HEALTHCARE',   label: 'Healthcare'            },
//   { value: 'EDUCATION',    label: 'Education'             },
//   { value: 'OTHER',        label: 'Other'                 },
// ];

// function FieldError({ message }: { message?: string }) {
//   if (!message) return null;
//   return <p className="text-xs text-red-500 mt-1">{message}</p>;
// }

// export default function RegisterPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const router = useRouter();
//   const locale = useLocale();
//   const t = useTranslations('auth');

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterForm>({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (data: RegisterForm) => {
//     try {
//       await api.post('/auth/register', data);
//       toast.success(t('registerSuccess'));
//       router.push(`/${locale}/login?registered=true`);
//     } catch (err: unknown) {
//       const msg =
//         (err as { response?: { data?: { message?: string } } })?.response?.data
//           ?.message ?? t('registerError');
//       toast.error(msg);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950 px-4 py-10">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-50" />
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-100 dark:bg-emerald-900/20 blur-3xl opacity-50" />
//       </div>

//       <div className="relative w-full max-w-lg">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-green-200 dark:shadow-green-900">
//             হ
//           </div>
//           <h1 className="text-2xl font-bold text-green-600">হিসাব খাতা</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             ১৪ দিনের বিনামূল্যে ট্রায়াল — কোনো ক্রেডিট কার্ড নেই
//           </p>
//         </div>

//         <Card className="shadow-xl border-border/50">
//           <CardHeader className="pb-4">
//             <CardTitle className="text-xl">{t('registerTitle')}</CardTitle>
//             <CardDescription>{t('registerSubtitle')}</CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//               {/* Personal Info */}
//               <div className="space-y-1">
//                 <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
//                   <User className="w-4 h-4" />
//                   {t('personalInfo')}
//                 </div>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="name">{t('fullName')}</Label>
//                     <Input id="name" placeholder="John Doe" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
//                     <FieldError message={errors.name?.message} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label htmlFor="email">
//                       <Mail className="w-3.5 h-3.5 inline mr-1" />
//                       {t('email')}
//                     </Label>
//                     <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
//                     <FieldError message={errors.email?.message} />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-1.5">
//                       <Label htmlFor="password">
//                         <Lock className="w-3.5 h-3.5 inline mr-1" />
//                         {t('password')}
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id="password"
//                           type={showPassword ? 'text' : 'password'}
//                           placeholder="••••••••"
//                           {...register('password')}
//                           className={`pr-9 ${errors.password ? 'border-red-500' : ''}`}
//                         />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
//                           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                         </button>
//                       </div>
//                       <FieldError message={errors.password?.message} />
//                     </div>
//                     <div className="space-y-1.5">
//                       <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
//                       <div className="relative">
//                         <Input
//                           id="confirmPassword"
//                           type={showConfirm ? 'text' : 'password'}
//                           placeholder="••••••••"
//                           {...register('confirmPassword')}
//                           className={`pr-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
//                         />
//                         <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
//                           {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                         </button>
//                       </div>
//                       <FieldError message={errors.confirmPassword?.message} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Organization Info */}
//               <div className="space-y-1">
//                 <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
//                   <Building2 className="w-4 h-4" />
//                   {t('orgInfo')}
//                 </div>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="orgName">{t('orgName')}</Label>
//                     <Input id="orgName" placeholder="My Company Ltd." {...register('orgName')} className={errors.orgName ? 'border-red-500' : ''} />
//                     <FieldError message={errors.orgName?.message} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>{t('orgType')}</Label>
//                     <Select onValueChange={(v) => setValue('orgType', v)}>
//                       <SelectTrigger className={errors.orgType ? 'border-red-500' : ''}>
//                         <SelectValue placeholder={t('selectOrgType')} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ORG_TYPES.map(({ value, label }) => (
//                           <SelectItem key={value} value={value}>{label}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FieldError message={errors.orgType?.message} />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-1.5">
//                       <Label htmlFor="orgPhone">
//                         <Phone className="w-3.5 h-3.5 inline mr-1" />
//                         {t('phone')}
//                       </Label>
//                       <Input id="orgPhone" placeholder="+880 1xxx-xxxxxx" {...register('orgPhone')} />
//                     </div>
//                     <div className="space-y-1.5">
//                       <Label htmlFor="orgAddress">
//                         <MapPin className="w-3.5 h-3.5 inline mr-1" />
//                         {t('address')}
//                       </Label>
//                       <Input id="orgAddress" placeholder="Dhaka, Bangladesh" {...register('orgAddress')} />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('registering')}</>
//                 ) : (
//                   t('createAccount')
//                 )}
//               </Button>

//               <p className="text-xs text-center text-muted-foreground">
//                 {t('termsNotice')}{' '}
//                 <Link href={`/${locale}/terms`} className="text-green-600 hover:underline">{t('terms')}</Link>
//                 {' & '}
//                 <Link href={`/${locale}/privacy`} className="text-green-600 hover:underline">{t('privacy')}</Link>
//               </p>
//             </form>
//           </CardContent>

//           <CardFooter className="justify-center pt-0">
//             <p className="text-sm text-muted-foreground">
//               {t('hasAccount')}{' '}
//               <Link href={`/${locale}/login`} className="text-green-600 font-medium hover:underline">
//                 {t('login')}
//               </Link>
//             </p>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }


import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';
;

export const metadata: Metadata = { title: 'Register' };

export default function RegisterPage() {
  return <RegisterForm />;
}