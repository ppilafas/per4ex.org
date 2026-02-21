import { getRequestConfig } from 'next-intl/server';

export const locales = ['en'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  return {
    locale: 'en',
    messages: (await import('./messages/en.json')).default
  };
});

