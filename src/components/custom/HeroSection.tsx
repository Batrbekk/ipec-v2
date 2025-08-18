import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
	return (
		<section className="relative h-[45rem] bg-ipec-blue overflow-hidden">
			{/* Фоновое видео */}
			<video
				className="absolute top-0 left-0 w-full h-full object-cover"
				autoPlay
				muted
				loop
				playsInline
			>
				<source src="/video/ipec.mp4" type="video/mp4" />
				{/* Fallback для браузеров без поддержки видео */}
				<div className="absolute top-0 left-0 w-full h-full bg-ipec-blue" />
			</video>
			
			{/* Полупрозрачный чёрный оверлей */}
			<div className="absolute top-0 left-0 w-full h-full bg-black/30 z-5" />
			
			<div className="z-10 relative px-4 lg:px-[42px] flex flex-col justify-center h-full gap-y-12 md:gap-y-8 pt-[50%] md:pt-0">
				<h1 className="text-white text-4xl md:text-5xl lg:text-7xl font-regular w-full max-w-[374px] md:max-w-[41rem] lg:max-w-[52rem]">
					IPEC Energy - Integrated Petroleum Engineering
				</h1>
        <Button className="bg-white hover:bg-ipec-blue text-ipec-blue hover:text-white max-w-xs rounded-none flex items-center justify-between !px-6 !py-3.5 h-fit text-lg">
          Связаться с нами
          <ArrowRight className="!w-6 !h-6" />
        </Button>
			</div>
		</section>
	);
}