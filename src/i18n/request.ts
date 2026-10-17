import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';
import type { AbstractIntlMessages } from 'next-intl';
import { getSiteContent } from '@/lib/content/store';

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const explicitLocale = await requestLocale;
  const locale = (explicitLocale || cookieStore.get('locale')?.value) as Locale;
  
  // Validate that the incoming locale is valid
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const content = await getSiteContent();

  return {
    locale: validLocale,
    messages: content.messages[validLocale] as AbstractIntlMessages
  };
});
