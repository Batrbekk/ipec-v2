interface ExperienceItem {
  id: number;
  title: string;
}

interface ExperienceTabProps {
  experience: ExperienceItem;
  isActive: boolean;
  onClick: () => void;
}

export default function ExperienceTab({ experience, isActive, onClick }: ExperienceTabProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer transition-all duration-300 border-t-[4px] flex items-center justify-start
        ${isActive 
          ? 'border-t-ipec-blue' 
          : 'border-t-light-grey'
        }
      `}
    >
      <h4 className={`mt-4 ${isActive ? 'text-ipec-blue' : 'text-ipec-grey'} w-[80%] text-base`}>
        {experience.title}
      </h4>
    </div>
  );
}
