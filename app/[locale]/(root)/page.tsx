import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Clock, FileText, TrendingUp, Shield,
  Smartphone, Check, ChevronRight, Star,
  BarChart3, ArrowRight, Zap, Globe, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const FEATURE_KEYS = ['qr', 'overtime', 'payslip', 'finance', 'secure', 'mobile'];
const FEATURE_ICONS = { qr: Clock, overtime: TrendingUp, payslip: FileText, finance: BarChart3, secure: Shield, mobile: Smartphone };

const STAT_KEYS = [
  { key: 'businesses', value: '500+',  icon: Users },
  { key: 'employees',  value: '10k+',  icon: Clock },
  { key: 'payroll',    value: '৳2Cr+', icon: Zap   },
  { key: 'uptime',     value: '99.9%', icon: Globe },
];

const TESTIMONIAL_KEYS = ['t1', 't2', 't3'];

const PLANS = [
  { key: 'free',       price: '৳0',     employees: '10',        popular: false },
  { key: 'basic',      price: '৳999',   employees: '50',        popular: true  },
  { key: 'pro',        price: '৳2,499', employees: '200',       popular: false },
  { key: 'enterprise', price: '৳4,999', employees: 'Unlimited', popular: false },
];

const PRICING_FEATURE_KEYS = ['attendance', 'payroll', 'payslip', 'reports'];

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-300/10 rounded-full blur-2xl" />
          <div className="absolute top-10 right-10 w-80 h-80 bg-green-200/20 dark:bg-green-800/10 rounded-full blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="outline" className="mb-6 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 px-4 py-1.5 text-sm gap-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            {t('badge')}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            <span className="text-green-600">হিসাব খাতা</span>
            <br />
            <span className="text-3xl md:text-5xl text-gray-600 dark:text-gray-300 font-semibold">
              {t('heroTitle')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('heroDesc')}{' '}
            <strong className="text-gray-900 dark:text-white">{t('heroDescBold')}</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 text-base gap-2 shadow-lg shadow-green-200 dark:shadow-green-900"
              asChild
            >
              <Link href="/register">
                {t('ctaPrimary')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold px-8 text-base gap-2 border-2" asChild>
              <Link href="/login">
                {t('ctaSecondary')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">{t('ctaNote')}</p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STAT_KEYS.map(({ key, value, icon: Icon }) => (
              <div
                key={key}
                className="text-center p-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 backdrop-blur shadow-sm"
              >
                <Icon className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t(`stats.${key}`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950">
              {t('featuresBadge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{t('featuresSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key as keyof typeof FEATURE_ICONS];
              return (
                <div
                  key={key}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 hover:shadow-lg hover:shadow-green-50 dark:hover:shadow-green-950 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {t(`features.${key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950">
              {t('testimonialsBadge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('testimonialsTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIAL_KEYS.map((key) => (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  "{t(`testimonials.${key}.text`)}"
                </p>
                <Separator className="mb-4" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t(`testimonials.${key}.name`)}
                </p>
                <p className="text-xs text-gray-500">{t(`testimonials.${key}.role`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950">
              {t('pricingBadge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricingTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  plan.popular
                    ? 'border-green-500 bg-white dark:bg-gray-900 shadow-xl shadow-green-100 dark:shadow-green-950 scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-200 dark:hover:border-green-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {t('pricingPopular')}
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 capitalize">
                  {plan.key.charAt(0).toUpperCase() + plan.key.slice(1)}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 mb-1">{t('pricingPerMonth')}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  {t('pricingEmployees', { count: plan.employees })}
                </p>
                <ul className="space-y-2.5 mb-6">
                  {PRICING_FEATURE_KEYS.map((fKey) => (
                    <li key={fKey} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {t(`pricingFeatures.${fKey}`)}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">{t('pricingGetStarted')}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-green-600 dark:bg-green-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('ctaBannerTitle')}
          </h2>
          <p className="text-green-100 text-lg mb-8">{t('ctaBannerDesc')}</p>
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8 text-base gap-2 shadow-lg"
            asChild
          >
            <Link href="/register">
              {t('ctaBannerBtn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}