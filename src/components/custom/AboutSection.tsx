import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export default function AboutSection() {
  return (
    <section 
      className="py-30 px-4 md:px-8 lg:px-[4.5rem] bg-[url('/image/about/1.png')] bg-cover bg-center bg-no-repeat relative"
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col gap-y-6">
        <h3 className="text-ipec-blue text-2xl md:text-4xl font-bold">
          О нас
        </h3>
        <h2 className="text-white text-5xl font-regular">
          IPEC Energy Kazakhstan
        </h2>
        <p className="text-white text-base lg:text-xl font-regular max-w-[780px]">
          Независимая исследовательская и бизнес-аналитическая компания, предоставляющая клиентам достоверные данные и стратегические идеи для более эффективного принятия решений, особенно в нефтегазовой и горнорудной отраслях.
        </p>
        <p className="text-white text-base lg:text-xl font-regular max-w-[780px]">
          IPEC Energy — это «дом знаний», объединяющий экспертов с международным опытом в Halliburton, Schlumberger, инвестиционных банках, а также консалтинговых компаниях «Большой тройки» и «Большой четвёрки». Мы работаем на стыке инженерии, экономики-финансов, юриспруденции и IT, обеспечивая интегрированный подход к решению сложных задач.
        </p>
        <Button className="bg-ipec-blue hover:bg-hover-ipec-blue text-white max-w-full md:max-w-xs rounded-none flex items-center justify-between !px-6 !py-3.5 h-fit text-lg">
          Связаться с нами
          <ArrowRight className="!w-6 !h-6" />
        </Button>
      </div>
    </section>
  );
}