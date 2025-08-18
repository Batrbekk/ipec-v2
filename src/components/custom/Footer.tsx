'use client';

import Link from "next/link";
import ContactForm from "./ContactForm";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useScrollToSection } from "@/hooks/useScrollToSection";

export default function Footer() {
  const tNav = useTranslations('navigation');
  const t = useTranslations();
  const { scrollToSection } = useScrollToSection();
  
  const navLinks = [
		{ href: "/#services", label: tNav('services'), id: 'services' },
		{ href: "/#about", label: tNav('about'), id: 'about' },
		{ href: "/#experience", label: tNav('experience'), id: 'experience' },
		{ href: "/#advantages", label: tNav('advantages'), id: 'advantages' },
		{ href: "/#team", label: tNav('team'), id: 'team' },
	];

  return (
    <footer id="contact" className="bg-ipec-blue pt-30 pb-8" 
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
    }}>
      <div className="container mx-auto flex flex-col gap-y-8 px-4 md:px-8 lg:px-0">
        <div className="w-full flex flex-col lg:flex-row lg:items-start gap-y-8"> 
          <div className="w-full lg:w-1/2 flex flex-col gap-y-6">
            <h3 className="text-white text-2xl font-bold">
              {t("footer.contactUs")}
            </h3>
            <h2 className="text-white text-4xl font-bold w-full md:w-2/3 lg:w-full">
              {t("footer.futureTitle")}
            </h2>
            <p className="text-white text-xl">
              {t("footer.description")}
            </p>
          </div>
          <ContactForm />
        </div>
        <Link href="/" className="max-w-[360px]">
          <Image src="/image/white-logo.svg" alt="IPEC Energy Kazakhstan" width={360} height={38} />
        </Link>
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between pb-8 border-b border-white gap-y-8">
          <div className="flex flex-col md:flex-row items-start gap-y-8 gap-x-8">
            <div className="flex flex-col gap-y-3 w-[250px]">
              <h6 className="text-white text-2xl font-bold">{t("footer.contacts")}</h6>
              <Link href="tel:+77073214177" className="text-white text-lg">
                +7-(707)-321-41-77
              </Link>
              <Link href="mailto:info@ipec-energy.com" className="text-white text-lg">
                info@ipec-energy.com
              </Link>
            </div>
            <div className="flex flex-col gap-y-3 w-[250px]">
              <h6 className="text-white text-2xl font-bold">{t("footer.address")}</h6>
              <Link href="https://yandex.kz/maps/ru/-/CHhIyUZ1" target="_blank" className="text-white text-lg">
                {t("footer.addressText")}
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:justify-end gap-x-3 md:w-full">
            {navLinks.map((link) => (
              <button 
                key={link.href} 
                onClick={() => scrollToSection(link.id)}
                className="text-white text-base hover:underline text-left md:text-center cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end">
          <p className="text-white text-base text-center md:text-left">
            {t("footer.copyright").split('.')[0]}. <br className="block md:hidden" /> {t("footer.copyright").split('.')[1]?.trim()}.
          </p>
        </div>
      </div>
    </footer>
  )
}