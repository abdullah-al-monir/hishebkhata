import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations();
  const year = new Date().getFullYear();

  const LINKS = {
    product: [
      { labelKey: 'footer.features', href: `/${locale}/#features` },
      { labelKey: 'footer.pricing', href: `/${locale}/pricing` },
      { labelKey: 'footer.changelog', href: `/${locale}/changelog` },
    ],
    company: [
      { labelKey: 'footer.about', href: `/${locale}/about` },
      { labelKey: 'footer.contact', href: `/${locale}/contact` },
      { labelKey: 'footer.blog', href: `/${locale}/blog` },
    ],
    legal: [
      { labelKey: 'footer.privacy', href: `/${locale}/privacy` },
      { labelKey: 'footer.terms', href: `/${locale}/terms` },
    ],
  };

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                হ
              </div>
              <span className="font-bold text-green-600">হিসাব খাতা</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-muted-foreground">
              🇧🇩 Made for Bangladesh
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t('footer.product')}</h4>
            <ul className="space-y-2">
              {LINKS.product.map(({ labelKey, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-green-600 transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t('footer.company')}</h4>
            <ul className="space-y-2">
              {LINKS.company.map(({ labelKey, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-green-600 transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              {LINKS.legal.map(({ labelKey, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-green-600 transition-colors">
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {year} হিসাব খাতা. {t('footer.rights')}</p>
          <p className="text-xs">
            হিসাব খাতা — আপনার ব্যবসার হিসাব, সহজ ও নির্ভরযোগ্য
          </p>
        </div>
      </div>
    </footer>
  );
}