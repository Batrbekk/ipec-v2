import ServicesCarousel from "./ServicesCarousel";

export default function ServiceSection() {
	return (
		<section className="py-30 container mx-auto flex flex-col gap-y-10 px-4 md:px-8 lg:px-0">
      <div className="flex flex-col gap-y-4 md:gap-y-6">
        <h3 className="text-ipec-blue text-2xl md:text-4xl font-bold">
          Чем мы занимаемся
        </h3>
        <h2 className="text-black text-[32px] md:text-5xl font-regular max-w-[398px] md:max-w-[680px] lg:max-w-[900px]">
          IPEC Energy Kazakhstan - это комплексное решение для вас и вашей компании
        </h2>
        <p className="text-ipec-grey text-base font-regular max-w-[398px] md:max-w-[680px] lg:max-w-[780px]">
          Мы формируем синергетический подход, объединяя инженерную, финансово-экономическую, юридическую и IT-экспертизу, чтобы обеспечивать нашим клиентам полное сопровождение — от идеи до реализации.
        </p>
      </div>
      <ServicesCarousel />
		</section>
	);
}