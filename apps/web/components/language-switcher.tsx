"use client"

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { locales, type Locale } from '@/i18n';
import { cn } from '@/lib/utils';

const localeNames: Record<Locale, string> = {
  en: 'English'
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // Add new locale
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-card-border hover:border-accent/40 transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4 text-muted" />
        <span className="text-sm font-medium text-foreground">{localeNames[locale]}</span>
      </button>
      <div className="absolute top-full mt-2 right-0 bg-card border border-card-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={cn(
              "w-full text-left px-4 py-2 text-sm transition-colors",
              loc === locale
                ? "bg-accent/10 text-accent font-medium"
                : "text-muted hover:bg-background/50 hover:text-foreground"
            )}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    </div>
  );
}

