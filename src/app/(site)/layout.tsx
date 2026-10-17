import type { Metadata } from "next";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import Header from "@/components/custom/Header";
import Footer from "@/components/custom/Footer";
import { ContentProvider } from "@/components/custom/SiteContentProvider";
import { getUserLocale } from "@/i18n/utils";
import { getSiteContent } from "@/lib/content/store";
import type { MessageTree } from "@/lib/content/model";

export async function generateMetadata(): Promise<Metadata> {
  const [content, locale] = await Promise.all([getSiteContent(), getUserLocale()]);
  const meta = content.messages[locale].meta as MessageTree;

  return {
    title: meta.title as string,
    description: meta.description as string,
    icons: { icon: content.media.favicon },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [content, locale] = await Promise.all([getSiteContent(), getUserLocale()]);

  return (
    <NextIntlClientProvider locale={locale} messages={content.messages[locale] as AbstractIntlMessages}>
      <ContentProvider content={content}>
        <Header />
        {children}
        <Footer />
      </ContentProvider>
    </NextIntlClientProvider>
  );
}
