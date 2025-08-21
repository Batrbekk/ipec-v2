"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ExperienceCard from "./ExperienceCard";
import ExperienceCarousel from "./ExperienceCarousel";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { getExperienceCards } from "../../data/experienceData";

export default function ExperienceSection() {
  const t = useTranslations();
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(3);
  
  // Используем переводы для данных опыта
  const translatedExperienceCards = getExperienceCards(t);

  // Фильтрация карточек по активному slug
  const filteredCards = activeSlug === "all" 
    ? translatedExperienceCards 
    : translatedExperienceCards.filter(card => card.slug.includes(activeSlug));

  // Видимые карточки с учетом пагинации
  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMoreCards = visibleCount < filteredCards.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, filteredCards.length));
  };

  const handleTabChange = (slug: string) => {
    setActiveSlug(slug);
    setVisibleCount(3); // Сбрасываем пагинацию при смене таба
  };

  return (
    <section id="experience" className="py-30 px-4 md:px-8 lg:px-0 container mx-auto flex flex-col gap-y-16">
      <div className="flex flex-col gap-y-6">
        <h3 className="text-ipec-blue text-5xl font-bold">
          {t("experienceSection.title")}
        </h3>
        <p className="text-ipec-grey max-w-[780px]">
          {t("experienceSection.description")}
        </p>
      </div>
      
      <ExperienceCarousel onTabChange={handleTabChange} />
      
      <div className="flex flex-col gap-y-8">
        <div className="grid grid-cols-1 gap-6">
          {visibleCards.map((card) => (
            <ExperienceCard
              key={card.id}
              title={card.title}
              slug={card.slug}
              description={card.description}
              img={card.img}
            />
          ))}
        </div>
        
        {hasMoreCards && (
          <Button 
            onClick={handleShowMore}
            className="bg-ipec-blue hover:bg-hover-ipec-blue text-white !px-6 py-3 rounded-none flex items-center justify-between gap-x-2 text-lg font-medium h-auto w-full lg:max-w-[238px] mx-auto"
          >
            {t("experienceSection.showMore")}
            <ArrowRight className="!w-6 !h-6" />
          </Button>
        )}
      </div>
    </section>
  );
}