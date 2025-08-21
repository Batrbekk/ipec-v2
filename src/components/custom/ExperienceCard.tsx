import { useTranslations } from "next-intl";
import Image from "next/image";

interface ExperienceCardProps {
  title: string;
  slug: string[];
  description: string;
  img?: string;
}

const getSlugTranslationKey = (slug: string): string => {
  const slugMap: Record<string, string> = {
    "all": "all",
    "management": "management",
    "oil-service": "oilService",
    "m-a": "maDeals",
    "due-diligence": "dueDiligence",
    "automation": "automation",
    "new-technologies": "newTechnologies"
  };
  return `experience.categories.${slugMap[slug] || slug}`;
};

export default function ExperienceCard({ title, slug, description, img }: ExperienceCardProps) {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border border-ipec-blue">
      {img ? (
        <div className="relative w-full lg:w-[400px] h-[200px] lg:flex-shrink-0">
          <Image src={img} alt={title} fill className="object-cover" priority />
        </div>
      ) : (
        <div className="w-full lg:w-[400px] h-[200px] lg:flex-shrink-0 bg-light-grey" />
      )}
      <div className="flex flex-col gap-y-6">
        <div className="flex gap-x-6 gap-y-2 flex-wrap">
          {slug.map((item) => (
            <div key={item} className="text-ipec-blue text-sm border-b border-ipec-blue p-1">
              {t(getSlugTranslationKey(item))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-y-2">
          <h4 className="text-ipec-blue text-2xl">{title}</h4>
          <p className="text-black text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}