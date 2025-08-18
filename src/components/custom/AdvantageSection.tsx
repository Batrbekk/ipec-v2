'use client'

import { museoModerno } from "@/lib/fonts";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { useTranslations } from "next-intl";

export default function AdvantageSection() {
  const t = useTranslations();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseInside, setIsMouseInside] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollToSection } = useScrollToSection(); 

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseEnter = () => setIsMouseInside(true);
    const handleMouseLeave = () => setIsMouseInside(false);

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      section.addEventListener('mouseenter', handleMouseEnter);
      section.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        section.removeEventListener('mousemove', handleMouseMove);
        section.removeEventListener('mouseenter', handleMouseEnter);
        section.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <section
      id="advantages"
      ref={sectionRef}
      className="bg-ipec-blue lg:h-[1010px] relative overflow-hidden" 
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        cursor: 'none'
      }}
    >
      <div className="py-30 px-4 md:px-8 lg:px-0 container mx-auto relative h-full flex flex-col gap-y-16">
        <div className="flex flex-col gap-y-6">
          <h3 className="text-white md:text-5xl text-4xl font-bold">
            {t("advantages.title")}
          </h3>
          <p className="text-white text-lg max-w-[612px]">
            {t("advantages.description")}
          </p>
        </div>
        <div className="flex flex-col gap-y-12 px-16">
          <div className="flex flex-col gap-y-6 lg:absolute top-[165px] right-0">
            <div className="relative">
              <h5 className="text-4xl font-bold text-white">{t("advantages.expertise.title")}</h5>
              <h4 
                className={`${museoModerno.className} text-8xl text-white absolute -left-14 -top-6`}
                style={{
                  WebkitTextStroke: '2px white',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                1
              </h4>
            </div>
            <p className="text-xl text-white max-w-[326px]">
              {t("advantages.expertise.description")}
            </p>
          </div>
          <div className="flex flex-col gap-y-6 lg:absolute top-[460px] left-[164px]">
            <div className="relative">
              <h5 className="text-4xl font-bold text-white">{t("advantages.licenses.title")}</h5>
              <h4 
                className={`${museoModerno.className} text-8xl text-white absolute -left-14 -top-6`}
                style={{
                  WebkitTextStroke: '2px white',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                2
              </h4>
            </div>
            <p className="text-xl text-white max-w-[326px]">
              {t("advantages.licenses.description")}
            </p>
          </div>
          <div className="flex flex-col gap-y-6 lg:absolute top-[520px] right-[104px]">
            <div className="relative">
              <h5 className="text-4xl font-bold text-white">{t("advantages.support.title")}</h5>
              <h4 
                className={`${museoModerno.className} text-8xl text-white absolute -left-14 -top-6`}
                style={{
                  WebkitTextStroke: '2px white',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                3
              </h4>
            </div>
            <p className="text-xl text-white max-w-[326px]">
              {t("advantages.support.description")}
            </p>
          </div>
          <div className="flex flex-col gap-y-6 lg:absolute bottom-[168px] left-[62px]">
            <div className="relative">
              <h5 className="text-4xl font-bold text-white">{t("advantages.flexibility.title")}</h5>
              <h4 
                className={`${museoModerno.className} text-8xl text-white absolute -left-16 -top-6`}
                style={{
                  WebkitTextStroke: '2px white',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                4
              </h4>
            </div>
            <p className="text-xl text-white max-w-[326px]">
              {t("advantages.flexibility.description")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4 lg:absolute bottom-[116px] right-[124px]">
          <Button 
            className="bg-white hover:bg-hover-ipec-blue text-ipec-blue hover:text-white md:max-w-xs rounded-none flex items-center justify-between !px-6 !py-3.5 h-fit text-lg"
            onClick={() => scrollToSection('contact')}
          >
            {t("advantages.contactButton")}
            <ArrowRight className="!w-6 !h-6" />
          </Button>
          <p className="text-white">
            {t("advantages.contactDescription").split('.')[0]}. <br /> {t("advantages.contactDescription").split('.')[1]?.trim()}.
          </p>
        </div>
      </div>
      
      {/* Кастомный курсор */}
      {isMouseInside && (
        <div
          className="absolute pointer-events-none z-50 rounded-full"
          style={{
            left: mousePosition.x - 24,
            top: mousePosition.y - 24,
            width: '64px',
            height: '64px',
            backgroundColor: '#FF9C23', // Комплементарный к ipec-blue для получения правильной инверсии
            mixBlendMode: 'difference'
          }}
        />
      )}
    </section>
  );
}