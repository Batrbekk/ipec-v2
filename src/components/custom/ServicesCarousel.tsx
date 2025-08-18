"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ServiceCard from "./ServiceCard";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

export default function ServicesCarousel() {
  const [activeServiceId, setActiveServiceId] = useState<number>(1);
  const [api, setApi] = useState<CarouselApi>();


  const initialServices = [
    {
      id: 1,
      title: "Управление активами",
      services: [
        "Разработка стратегии развития компаний в нефтегазовой отрасли",
        "Антикризисное управление и реструктуризация",
        "Финансовый и операционный аудит бизнеса",
        "Оптимизация производственной и инвестиционной деятельности",
        "Построение системы KPI и повышения эффективности бизнес-процессов",
        "Полное операционное управление нефтяными активами с целью увеличения рентабельности и стоимости компании"
      ],
      image: "/image/services/1.png"
    },
    {
      id: 2,
      title: "Нефтесервис",
      services: [
        "Разработка технико-экономических обоснований (ТЭО)",
        "Построение и интерпретация 3D геологических моделей",
        "Оценка запасов по международной классификации SPE PRMS",
        "Подбор и проектирование технологических решений и газового оборудования",
        "Экспертиза проектной и технической документации"
      ],
      image: "/image/services/2.png"
    },
    {
      id: 3,
      title: "Сопровождение сделок (M&A)",
      services: [
        "Market sounding – сканирование рынка в поисках потенциальных инвесторов",
        "Комплексная подготовка инвестиционных предложений",
        "Структурирование сделок и сопровождение переговоров",
        "Поддержка в процессе подписания и исполнения SPA/SHA",
        "Анализ рисков и структурная защита интересов клиента"
      ],
      image: "/image/services/3.png"
    },
    {
      id: 4,
      title: "Due Diligence",
      services: [
        "Комплексный анализ (финансовый, налоговый, юридический и технический) due diligence объектов (включая месторождения)",
        "ESG-анализ и проверка соответствия регуляторным требованиям"
      ],
      image: "/image/services/4.png"
    },
    {
      id: 5,
      title: "Автоматизация бизнес-процессов",
      services: [
        "Разработка пользовательских ERP- и WMS-систем под специфику Заказчиков",
        "Автоматизация управленческого и операционного учета",
        "Интеграция с 1С, SAP и другими учетными системами",
        "Внедрение решений для логистики, снабжения и управления запасами"
      ],
      image: "/image/services/5.png"
    }
  ];

  const [services, setServices] = useState(initialServices);

  const activeService = services.find(service => service.id === activeServiceId) || services[0];

  // Синхронизация карусели с изменением состояния
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      
      // Обновляем активный сервис на основе текущего слайда
      const currentService = services[selectedIndex];
      if (currentService) {
        setActiveServiceId(currentService.id);
      }
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, services]);

  const handleServiceClick = (serviceId: number) => {
    setActiveServiceId(serviceId);
    
    // Перестановка: выбранная карточка на первое место, остальные в порядке после неё
    const clickedIndex = initialServices.findIndex(service => service.id === serviceId);
    if (clickedIndex !== -1) {
      const reorderedServices = [
        initialServices[clickedIndex], // выбранная карточка первой
        ...initialServices.slice(clickedIndex + 1), // карточки после выбранной
        ...initialServices.slice(0, clickedIndex) // карточки до выбранной
      ];
      setServices(reorderedServices);
      
      // Переходим к первому слайду после перестановки
      setTimeout(() => {
        api?.scrollTo(0);
      }, 0);
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
        <CarouselContent className="">
          {services.map((service) => (
            <CarouselItem key={service.id} className={`basis-[350px]`}>
              <ServiceCard
                service={service}
                isActive={service.id === activeServiceId}
                onClick={() => handleServiceClick(service.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="w-full h-[567px] relative mt-8">
        <Image 
          src={activeService.image} 
          alt={activeService.title} 
          fill 
          className="object-cover" 
          unoptimized 
        />
      </div>
    </div>
  );
}
