interface TeamCardProps {
  name: string;
  description: string;
  position: string;
  image: string;
}

export default function TeamCard({
  name,
  description,
  position,
  image
}: TeamCardProps) {
  return (
    <div className="flex flex-col gap-y-6 w-[308px]">
      <div id={image} className="bg-light-grey h-[436px] w-full border border-ipec-blue" />
      <div className="flex flex-col gap-y-2">
        <h6 className="text-ipec-blue text-sm">
          {position}
        </h6>
        <h4 className="text-2xl">
          {name}
        </h4>
        <p className="text-sm">
            {description}
        </p>
      </div>
    </div>   
  )
}