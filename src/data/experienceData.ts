import type { SiteContent } from "@/lib/content/model";

export interface ExperienceCardData {
  id: number;
  title: string;
  slug: string[];
  description: string;
  img?: string;
}

export const getExperienceCards = (t: (key: string) => string, media: SiteContent["media"]): ExperienceCardData[] => [
  {
    id: 1,
    title: t("experience.projects.kalamkas.title"),
    slug: ["oil-service", "valuation-spe-prms"],
    description: t("experience.projects.kalamkas.description"),
    img: media.projectKalamkas
  },
  {
    id: 2,
    title: t("experience.projects.karazhanbas.title"),
    slug: ["management"],
    description: t("experience.projects.karazhanbas.description"),
    img: media.projectKarazhanbas
  },
  {
    id: 3,
    title: t("experience.projects.kamenistoe.title"),
    slug: ["management"],
    description: t("experience.projects.kamenistoe.description"),
    img: media.projectKamenistoe
  },
  {
    id: 4,
    title: t("experience.projects.vagonservice.title"),
    slug: ["automation"],
    description: t("experience.projects.vagonservice.description"),
    img: media.projectVagonservice
  },
  {
    id: 5,
    title: t("experience.projects.kazmortransflot.title"),
    slug: ["automation"],
    description: t("experience.projects.kazmortransflot.description"),
    img: media.projectKazmortransflot
  },
  {
    id: 6,
    title: t("experience.projects.urikhtau.title"),
    slug: ["oil-service"],
    description: t("experience.projects.urikhtau.description"),
    img: media.projectUrikhtau
  },
  {
    id: 7,
    title: t("experience.projects.shevchenko.title"),
    slug: ["m-a", "due-diligence", "bisuness-valuation"],
    description: t("experience.projects.shevchenko.description"),
    img: media.projectShevchenko
  }
];
