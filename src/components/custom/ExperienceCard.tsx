interface ExperienceCardProps {
  title: string;
  slug: string[];
  description: string;
}

const slugToNameMap: Record<string, string> = {
  "all": "Все работы",
  "management": "Управление активами",
  "oil-service": "Нефтесервис",
  "m-a": "Сопровождение сделок (M&A)",
  "due-diligence": "Due Diligence",
  "automation": "Автоматизация бизнес-процессов",
  "new-technologies": "Разработка новых технологий"
};

export default function ExperienceCard({ title, slug, description }: ExperienceCardProps) {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border border-ipec-blue">
      <div className="w-full lg:w-[400px] h-[200px] lg:flex-shrink-0 bg-light-grey" />
      <div className="flex flex-col gap-y-6">
        <div className="flex gap-x-6 gap-y-2 flex-wrap">
          {slug.map((item) => (
            <div key={item} className="text-ipec-blue text-sm border-b border-ipec-blue p-1">
              {slugToNameMap[item] || item}
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