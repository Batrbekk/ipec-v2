import HeroSection from "@/components/custom/HeroSection";
import ServiceSection from "@/components/custom/ServiceSection";
import AboutSection from "@/components/custom/AboutSection";
import ExperienceSection from "@/components/custom/ExperienceSection";

export default function Home() {

  return (
    <main className="">
      <HeroSection />
      <ServiceSection />
      <AboutSection />
      <ExperienceSection />
    </main>
  );
}