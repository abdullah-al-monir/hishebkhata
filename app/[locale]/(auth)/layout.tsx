import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-green-50/20 to-green-100/30 dark:from-background dark:via-green-950/10 dark:to-green-900/5 flex flex-col">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center text-white text-xs font-bold">
            হ
          </div>
          <span className="font-bold text-green-600 text-sm">হিসাব খাতা</span>
        </Link>
        <p className="text-xs text-muted-foreground">🇧🇩 Made for Bangladesh</p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-7">
            {children}
          </div>
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="py-4 px-6 border-t border-border/40 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} হিসাব খাতা · All rights reserved
        </p>
      </footer>
    </div>
  );
}