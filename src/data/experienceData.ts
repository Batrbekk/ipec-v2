export interface ExperienceCardData {
  id: number;
  title: string;
  slug: string[];
  description: string;
  img?: string;
}

export const getExperienceCards = (t: (key: string) => string): ExperienceCardData[] => [
  {
    id: 1,
    title: t("experience.projects.kalamkas.title"),
    slug: ["oil-service", "valuation-spe-prms"],
    description: t("experience.projects.kalamkas.description"),
    img: "/image/experience/3.png"
  },
  {
    id: 2,
    title: t("experience.projects.karazhanbas.title"),
    slug: ["management"],
    description: t("experience.projects.karazhanbas.description"),
    img: "/image/experience/7.png"
  },
  {
    id: 3,
    title: t("experience.projects.kamenistoe.title"),
    slug: ["management"],
    description: t("experience.projects.kamenistoe.description"),
    img: "/image/experience/8.png"
  },
  {
    id: 4,
    title: t("experience.projects.vagonservice.title"),
    slug: ["automation"],
    description: t("experience.projects.vagonservice.description"),
    img: "/image/experience/4.jpeg"
  },
  {
    id: 5,
    title: t("experience.projects.kazmortransflot.title"),
    slug: ["automation"],
    description: t("experience.projects.kazmortransflot.description"),
    img: "/image/experience/5.jpeg"
  },
  {
    id: 6,
    title: t("experience.projects.urikhtau.title"),
    slug: ["oil-service"],
    description: t("experience.projects.urikhtau.description"),
    img: "/image/experience/6.jpg"
  },
  {
    id: 7,
    title: t("experience.projects.shevchenko.title"),
    slug: ["m-a", "due-diligence", "bisuness-valuation"],
    description: t("experience.projects.shevchenko.description"),
    img: "/image/experience/1.webp"
  }
];


