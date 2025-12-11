import { getPageMetadata } from "@/lib/seo";
import AdvantagesSection from "@/components/AdvantagesSection";
import FaqSection from "@/components/FaqSection";
import FooterSection from "@/components/FooterSection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import ParticipationSection from "@/components/ParticipationSection";
import ProgramSection from "@/components/ProgramSection";
import ResultsSection from "@/components/ResultsSection";
import SaleBanner from "@/components/SaleBanner";
import StatsSection from "@/components/StatsSection";
import WhoIsForSection from "@/components/WhoIsForSection";

export async function generateMetadata() {
  const meta = await getPageMetadata({ slug: "home" });
  const images = meta.ogImage ? [{ url: meta.ogImage }] : undefined;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: images ? { images } : undefined,
  };
}

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <MarqueeBanner />
      <StatsSection />
      <ProgramSection />
      <WhoIsForSection />
      <ResultsSection />
      <AdvantagesSection />
      <ParticipationSection />
      <FaqSection />
      <FooterSection />
      <SaleBanner />
    </>
  );
}
