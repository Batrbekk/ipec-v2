"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { useTranslations } from "next-intl";

export default function AboutSection() {
  const t = useTranslations();
  const { scrollToSection } = useScrollToSection();
  return (
    <section 
      id="about"
      className="py-30 px-4 md:px-8 lg:px-[4.5rem] bg-[url('/image/about/1.png')] bg-cover bg-center bg-no-repeat relative"
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col gap-y-6">
        <h3 className="text-ipec-blue text-2xl md:text-4xl font-bold">
          {t("about.title")}
        </h3>
        <h2 className="text-white text-5xl font-regular">
          {t("about.subtitle")}
        </h2>
        <p className="text-white text-base lg:text-xl font-regular max-w-[780px]">
          {t("about.description1")}
        </p>
        <p className="text-white text-base lg:text-xl font-regular max-w-[780px]">
          {t("about.description2")}
        </p>
        <Button 
          className="bg-ipec-blue hover:bg-hover-ipec-blue text-white max-w-full md:max-w-xs rounded-none flex items-center justify-between !px-6 !py-3.5 h-fit text-lg"
          onClick={() => scrollToSection('contact')}
        >
          {t("about.contactButton")}
          <ArrowRight className="!w-6 !h-6" />
        </Button>
      </div>
    </section>
  );
}