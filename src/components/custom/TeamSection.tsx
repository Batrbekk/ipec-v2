import { useTranslations } from "next-intl";
import TeamCard from "./TeamCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function TeamSection() {
  const t = useTranslations();
  const teamCards = [
    {
      name: t("team.members.ernar.name"),
      description: t("team.members.ernar.description"),
      position: t("team.members.ernar.position"),
      image: "team-1"
    },
    {
      name: t("team.members.talgat.name"),
      description: t("team.members.talgat.description"),
      position: t("team.members.talgat.position"),
      image: "team-1"
    },
    {
      name: t("team.members.shaken.name"),
      description: t("team.members.shaken.description"),
      position: t("team.members.shaken.position"),
      image: "team-1"
    },
    {
      name: t("team.members.assel.name"),
      description: t("team.members.assel.description"),
      position: t("team.members.assel.position"),
      image: "team-1"
    },
  ]

  return (
    <section id="team" className="py-30 px-4 md:px-8 lg:px-0 container mx-auto flex flex-col gap-y-6">
      <h3 className="text-ipec-blue text-5xl font-bold">
        {t("team.title")}
      </h3>
      <p className="text-ipec-grey max-w-full md:max-w-xl">{t("team.description")}</p>
      {/* Desktop версия - показываем все карточки */}
      <div className="hidden lg:flex flex-wrap gap-x-4 gap-y-12">
        {teamCards.map((card) => (
          <TeamCard key={card.name} {...card} />
        ))}
      </div>

      {/* Мобильная и планшетная версии - карусель */}
      <div className="lg:hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {teamCards.map((card) => (
              <CarouselItem key={card.name} className="pl-4 basis-auto">
                <TeamCard {...card} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}