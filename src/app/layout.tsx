import "./globals.css";
import { instrumentSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { getUserLocale } from "@/i18n/utils";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getUserLocale();

  return (
    <html lang={locale}>
      <body
        className={`${instrumentSans.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
