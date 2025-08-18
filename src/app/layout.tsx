import "./globals.css";
import type { Metadata } from "next";
import { instrumentSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/custom/Header";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: "IPEC Energy Kazakhstan",
  description: "Integrated Petroleum Engineering Company",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${instrumentSans.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
