"use client";

import { useState } from "react";
import ExperienceCard from "./ExperienceCard";
import ExperienceCarousel from "./ExperienceCarousel";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { experienceCards } from "../../data/experienceData";

export default function ExperienceSection() {
  const [activeSlug, setActiveSlug] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(3);

  // Фильтрация карточек по активному slug
  const filteredCards = activeSlug === "all" 
    ? experienceCards 
    : experienceCards.filter(card => card.slug.includes(activeSlug));

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
    <section className="py-30 px-4 md:px-8 lg:px-0 container mx-auto flex flex-col gap-y-16">
      <div className="flex flex-col gap-y-6">
        <h3 className="text-ipec-blue text-2xl md:text-4xl font-bold">
          Наш опыт
        </h3>
        <p className="text-ipec-grey max-w-[780px]">
          IPEC Energy Kazakhstan объединяет в себе экспертизу в управлении активами, разработке ТЭО, независимой оценке запасов, автоматизации бизнес-процессов и сопровождении сделок. Мы работаем на всех этапах жизненного цикла проектов – от стратегического планирования и технического проектирования до внедрения решений и достижения операционной эффективности.
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
            />
          ))}
        </div>
        
        {hasMoreCards && (
          <Button 
            onClick={handleShowMore}
            className="bg-ipec-blue hover:bg-hover-ipec-blue text-white !px-6 py-3 rounded-none flex items-center justify-between gap-x-2 text-lg font-medium h-auto w-full lg:max-w-[238px] mx-auto"
          >
            Показать больше
            <ArrowRight className="!w-6 !h-6" />
          </Button>
        )}
      </div>
    </section>
  );
}