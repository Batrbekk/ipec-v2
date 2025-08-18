import HeroSection from "@/components/custom/HeroSection";
import ServiceSection from "@/components/custom/ServiceSection";
import AboutSection from "@/components/custom/AboutSection";
import ExperienceSection from "@/components/custom/ExperienceSection";
import AdvantageSection from "@/components/custom/AdvantageSection";
import TeamSection from "@/components/custom/TeamSection";

export default function Home() {

  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <ServiceSection />
      <AboutSection />
      <ExperienceSection />
      <AdvantageSection />
      <TeamSection />
    </main>
  );
}