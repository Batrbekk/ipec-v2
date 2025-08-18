"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import ExperienceCard from "./ExperienceTab";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

interface ExperienceCarouselProps {
  onTabChange: (slug: string) => void;
}

export default function ExperienceCarousel({ onTabChange }: ExperienceCarouselProps) {
  const t = useTranslations();
  const [activeExperienceId, setActiveExperienceId] = useState<number>(1);
  const [api, setApi] = useState<CarouselApi>();

  const initialExperiences = useMemo(() => [
    {
      id: 1,
      slug: ["all"],
      title: t("experience.categories.all")
    },
    {
      id: 2,
      slug: ["management"],
      title: t("experience.categories.management")
    },
    {
      id: 3,
      slug: ["oil-service"],
      title: t("experience.categories.oilService")
    },
    {
      id: 4,
      slug: ["m-a"],
      title: t("experience.categories.maDeals")
    },  
    {
      id: 5,
      slug: ["due-diligence"],
      title: t("experience.categories.dueDiligence")
    },
    {
      id: 6,
      slug: ["automation"],
      title: t("experience.categories.automation")
    },
    {
      id: 7,
      slug: ["new-technologies"],
      title: t("experience.categories.newTechnologies")
    }
  ], [t]);

  const [experiences, setExperiences] = useState(initialExperiences);

  // Синхронизируем experiences с initialExperiences при изменении переводов
  useEffect(() => {
    setExperiences(initialExperiences);
  }, [initialExperiences]);



  // Синхронизация карусели с изменением состояния
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      
      // Обновляем активный опыт на основе текущего слайда
      const currentExperience = experiences[selectedIndex];
      if (currentExperience) {
        setActiveExperienceId(currentExperience.id);
        
        // Находим соответствующий таб в initialExperiences и вызываем onTabChange
        const correspondingTab = initialExperiences.find(exp => exp.id === currentExperience.id);
        if (correspondingTab) {
          onTabChange(correspondingTab.slug[0]); // Используем первый slug из массива
        }
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, experiences, onTabChange, initialExperiences]);

  const handleExperienceClick = (experienceId: number) => {
    setActiveExperienceId(experienceId);
    
    // Найти выбранный таб и получить его slug
    const selectedExperience = initialExperiences.find(exp => exp.id === experienceId);
    if (selectedExperience) {
      onTabChange(selectedExperience.slug[0]); // Используем первый slug из массива
    }
    
    // Перестановка только для планшетной и мобильной версии (не для десктопа)
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint
    
    if (!isDesktop) {
      const clickedIndex = initialExperiences.findIndex(exp => exp.id === experienceId);
      if (clickedIndex !== -1) {
        const reorderedExperiences = [
          initialExperiences[clickedIndex], // выбранная карточка первой
          ...initialExperiences.slice(clickedIndex + 1), // карточки после выбранной
          ...initialExperiences.slice(0, clickedIndex) // карточки до выбранной
        ];
        setExperiences(reorderedExperiences);
        
        // Переходим к первому слайду после перестановки
        setTimeout(() => {
          api?.scrollTo(0);
        }, 0);
      }
    }
  };

  return (
    <div className="w-full flex flex-col relative overflow-x-hidden">
      <Carousel
        setApi={setApi}
        className="w-full z-10"
        opts={{
          align: "start",
          slidesToScroll: 1,
          loop: true
        }}
      >
        <CarouselContent className="-ml-0">
          {experiences.map((experience) => (
            <CarouselItem 
              key={experience.id} 
              className="basis-[200px] lg:basis-[14.28%] pl-0"
            >
              <ExperienceCard
                experience={experience}
                isActive={experience.id === activeExperienceId}
                onClick={() => handleExperienceClick(experience.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
