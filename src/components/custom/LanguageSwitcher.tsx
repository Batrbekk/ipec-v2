'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/utils';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const [, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(async () => {
      await setUserLocale(newLocale);
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-x-2 h-full px-3 text-white hover:bg-hover-ipec-blue cursor-pointer">
          <Globe className="w-6 h-6" />
          <p className="text-base font-bold">{localeNames[locale]}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center" 
        sideOffset={0}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[--radix-dropdown-menu-trigger-width] rounded-none p-0 border-none shadow-md"
      >
        {locales.map((loc) => (
          <div
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="cursor-pointer px-7 py-4 border-b-[0.5px] border-b-ipec-blue last:border-b-0 justify-center text-ipec-blue hover:text-hover-ipec-blue"
          >
            <p className="text-base font-bold">{localeNames[loc]}</p>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
