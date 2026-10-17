import type { Locale } from "@/i18n/config";

export type { Locale } from "@/i18n/config";

export type MessageTree = {
  [key: string]: string | MessageTree | string[];
};

export const mediaFields = [
  { key: "headerLogo", label: "Логотип в шапке", kind: "image", defaultSrc: "/image/logo.svg" },
  { key: "footerLogo", label: "Логотип в подвале", kind: "image", defaultSrc: "/image/white-logo.svg" },
  { key: "heroVideo", label: "Видео на первом экране", kind: "video", defaultSrc: "/video/ipec2.mp4" },
  { key: "aboutImage", label: "Фон раздела «О нас»", kind: "image", defaultSrc: "/image/about/1.png" },
  { key: "serviceAssetManagement", label: "Услуги: управление активами", kind: "image", defaultSrc: "/image/services/1.png" },
  { key: "serviceOilService", label: "Услуги: инженерные услуги", kind: "image", defaultSrc: "/image/services/2.png" },
  { key: "serviceMaDeals", label: "Услуги: сопровождение сделок", kind: "image", defaultSrc: "/image/services/3.png" },
  { key: "serviceDueDiligence", label: "Услуги: Due Diligence", kind: "image", defaultSrc: "/image/services/4.png" },
  { key: "serviceAutomation", label: "Услуги: автоматизация", kind: "image", defaultSrc: "/image/services/5.png" },
  { key: "projectKalamkas", label: "Проект: оценка запасов в Мангистауской области", kind: "image", defaultSrc: "/image/experience/3.png" },
  { key: "projectKarazhanbas", label: "Проект: Северный Каражанбас", kind: "image", defaultSrc: "/image/experience/7.png" },
  { key: "projectKamenistoe", label: "Проект: Каменистое", kind: "image", defaultSrc: "/image/experience/8.png" },
  { key: "projectVagonservice", label: "Проект: Вагонсервис", kind: "image", defaultSrc: "/image/experience/4.jpeg" },
  { key: "projectKazmortransflot", label: "Проект: Казмортрансфлот", kind: "image", defaultSrc: "/image/experience/5.jpeg" },
  { key: "projectUrikhtau", label: "Проект: ТЭО месторождения в Актюбинской области", kind: "image", defaultSrc: "/image/experience/6.jpg" },
  { key: "projectShevchenko", label: "Проект: никель-кобальтовое месторождение", kind: "image", defaultSrc: "/image/experience/1.webp" },
  { key: "favicon", label: "Иконка сайта", kind: "image", defaultSrc: "/favicon.ico" },
] as const;

export type MediaKey = (typeof mediaFields)[number]["key"];

export type SiteContent = {
  schemaVersion: 1;
  revision: string;
  updatedAt: string | null;
  messages: Record<Locale, MessageTree>;
  media: Record<MediaKey, string>;
  settings: {
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    mapUrl: string;
  };
};
