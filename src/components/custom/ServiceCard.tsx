"use client";

interface Service {
  id: number;
  title: string;
  services: string[];
  image: string;
}

interface ServiceCardProps {
  service: Service;
  isActive: boolean;
  onClick: () => void;
}

export default function ServiceCard({ service, isActive, onClick }: ServiceCardProps) {
  return (
    <div 
      className={`w-[350px] flex-shrink-0 cursor-pointer transition-all duration-300 border-t-[4px] ${
        isActive ? 'border-ipec-blue' : 'border-light-grey'
      }`}
      onClick={onClick}
    >
      <h6 className={`text-2xl w-2/3 pt-4 pb-6 transition-colors duration-300 ${
        isActive ? 'text-ipec-blue' : 'text-gray-600'
      }`}>
        {service.title}
      </h6>
      {isActive && (
        <div className="absolute top-[112px] max-w-[350px] w-full bg-ipec-blue z-50 p-4 text-white flex flex-col gap-y-3">
          {service.services.map((serviceItem, index) => (
            <p key={index} className="">
              {serviceItem}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
