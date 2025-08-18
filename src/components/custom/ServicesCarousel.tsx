"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import ServiceCard from "./ServiceCard";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

export default function ServicesCarousel() {
  const t = useTranslations();
  const [activeServiceId, setActiveServiceId] = useState<number>(1);
  const [api, setApi] = useState<CarouselApi>();

  const initialServices = [
    {
      id: 1,
      title: t("services.carousel.assetManagement.title"),
      services: t.raw("services.carousel.assetManagement.services") as string[],
      image: "/image/services/1.png"
    },
    {
      id: 2,
      title: t("services.carousel.oilService.title"),
      services: t.raw("services.carousel.oilService.services") as string[],
      image: "/image/services/2.png"
    },
    {
      id: 3,
      title: t("services.carousel.maDeals.title"),
      services: t.raw("services.carousel.maDeals.services") as string[],
      image: "/image/services/3.png"
    },
    {
      id: 4,
      title: t("services.carousel.dueDiligenceCarousel.title"),
      services: t.raw("services.carousel.dueDiligenceCarousel.services") as string[],
      image: "/image/services/4.png"
    },
    {
      id: 5,
      title: t("services.carousel.automation.title"),
      services: t.raw("services.carousel.automation.services") as string[],
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
