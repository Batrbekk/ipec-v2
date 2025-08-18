export interface ExperienceCardData {
  id: number;
  title: string;
  slug: string[];
  description: string;
}

export const experienceCards: ExperienceCardData[] = [
  {
    id: 1,
    title: "Месторождение Шевченко",
    slug: ["m-a", "due-diligence"],
    description: "Комплексная проверка и разработка ТЭО никель-кобальтового месторождения. Финансовый, налоговый, юридический и технический due diligence. Совместная разработка ТЭО с Wardell Armstrong International, Bateman, Oriel Resources"
  },
  {
    id: 2,
    title: "ТЭО нефтегазового проекта «Култук»",
    slug: ["oil-service"],
    description: "Полномасштабное ТЭО нефтегазового проекта «Култук» для Министерства финансов Азербайджана"
  },
  {
    id: 3,
    title: "Месторождения Каламкас и Жетибай",
    slug: ["oil-service"],
    description: "Оценка запасов по SPE PRMS на 15 месторождениях, включая Каламкас и Жетибай"
  },
  {
    id: 4,
    title: "АО «Вагонсервис»",
    slug: ["automation"],
    description: "Система управления складскими запасами для АО «Вагонсервис»"
  },
  {
    id: 5,
    title: "ТОО «НМСК «Казмортрансфлот»",
    slug: ["automation"],
    description: "Система грузоперевозок для ТОО «НМСК «Казмортрансфлот»"
  },
  {
    id: 6,
    title: "ТЭО месторождения Урихтау",
    slug: ["oil-service"],
    description: "Разработка полномасштабного ТЭО месторождения Урихтау в соответствии с СН РК 1.02-04-2022"
  },
  {
    id: 7,
    title: "Северный Каражанбас и Каменистое",
    slug: ["management"],
    description: "Комплексное управление нефтяными операторами на месторождениях Северный Каражанбас и Каменистое"
  }
];
