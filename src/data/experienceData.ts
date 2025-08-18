export interface ExperienceCardData {
  id: number;
  title: string;
  slug: string[];
  description: string;
}

export const getExperienceCards = (t: (key: string) => string): ExperienceCardData[] => [
  {
    id: 1,
    title: t("experience.projects.shevchenko.title"),
    slug: ["m-a", "due-diligence"],
    description: t("experience.projects.shevchenko.description")
  },
  {
    id: 2,
    title: t("experience.projects.kultuk.title"),
    slug: ["oil-service"],
    description: t("experience.projects.kultuk.description")
  },
  {
    id: 3,
    title: t("experience.projects.kalamkas.title"),
    slug: ["oil-service"],
    description: t("experience.projects.kalamkas.description")
  },
  {
    id: 4,
    title: t("experience.projects.vagonservice.title"),
    slug: ["automation"],
    description: t("experience.projects.vagonservice.description")
  },
  {
    id: 5,
    title: t("experience.projects.kazmortransflot.title"),
    slug: ["automation"],
    description: t("experience.projects.kazmortransflot.description")
  },
  {
    id: 6,
    title: t("experience.projects.urikhtau.title"),
    slug: ["oil-service"],
    description: t("experience.projects.urikhtau.description")
  },
  {
    id: 7,
    title: t("experience.projects.karazhanbas.title"),
    slug: ["management"],
    description: t("experience.projects.karazhanbas.description")
  }
];


