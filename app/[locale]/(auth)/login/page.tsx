// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useLocale, useTranslations } from 'next-intl';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Eye, EyeOff, Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { authApi } from '@/lib/api';

// const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   rememberMe: z.boolean().optional(),
// });

// type LoginForm = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const router = useRouter();
//   const locale = useLocale();
//   const t = useTranslations('auth');

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginForm>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: { email: '', password: '', rememberMe: false },
//   });

//   const onSubmit = async (data: LoginForm) => {
//     try {
//       const res = await authApi.post('/auth/login', {
//         email: data.email,
//         password: data.password,
//       });
//       localStorage.setItem('accessToken', res.data.data.accessToken);
//       toast.success(t('loginSuccess'));
//       router.push(`/${locale}/dashboard`);
//     } catch (err: unknown) {
//       const msg =
//         (err as { response?: { data?: { message?: string } } })?.response?.data
//           ?.message ?? t('loginError');
//       toast.error(msg);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950 px-4">
//       {/* Background decoration */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-100 dark:bg-green-900/20 blur-3xl opacity-60" />
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-100 dark:bg-emerald-900/20 blur-3xl opacity-60" />
//       </div>

//       <div className="relative w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-green-200 dark:shadow-green-900">
//             হ
//           </div>
//           <h1 className="text-2xl font-bold text-green-600">হিসাব খাতা</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             আপনার ব্যবসার হিসাব, সহজ ও নির্ভরযোগ্য
//           </p>
//         </div>

//         <Card className="shadow-xl border-border/50">
//           <CardHeader className="space-y-1 pb-4">
//             <CardTitle className="text-xl">{t('loginTitle')}</CardTitle>
//             <CardDescription>{t('loginSubtitle')}</CardDescription>
//           </CardHeader>

//           <CardContent>
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               {/* Email */}
//               <div className="space-y-1.5">
//                 <Label htmlFor="email">{t('email')}</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@company.com"
//                   autoComplete="email"
//                   {...register('email')}
//                   className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
//                 />
//                 {errors.email && (
//                   <p className="text-xs text-red-500">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Password */}
//               <div className="space-y-1.5">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password">{t('password')}</Label>
//                   <Link
//                     href={`/${locale}/forgot-password`}
//                     className="text-xs text-green-600 hover:text-green-700 hover:underline"
//                   >
//                     {t('forgotPassword')}
//                   </Link>
//                 </div>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     autoComplete="current-password"
//                     {...register('password')}
//                     className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-xs text-red-500">{errors.password.message}</p>
//                 )}
//               </div>

//               {/* Remember Me */}
//               <div className="flex items-center gap-2">
//                 <Checkbox id="rememberMe" {...register('rememberMe')} />
//                 <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
//                   {t('rememberMe')}
//                 </Label>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-green-600 hover:bg-green-700 text-white"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('loggingIn')}</>
//                 ) : (
//                   t('login')
//                 )}
//               </Button>
//             </form>
//           </CardContent>

//           <CardFooter className="justify-center pt-0">
//             <p className="text-sm text-muted-foreground">
//               {t('noAccount')}{' '}
//               <Link
//                 href={`/${locale}/register`}
//                 className="text-green-600 font-medium hover:underline"
//               >
//                 {t('register')}
//               </Link>
//             </p>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// }


import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage() {
  return <LoginForm />;
}