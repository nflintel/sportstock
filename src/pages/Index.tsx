import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlayerCardsCarousel from "@/components/PlayerCardsCarousel";
import HowItWorks from "@/components/HowItWorks";
import BuyLowSellHigh from "@/components/BuyLowSellHigh";
import FeaturesGrid from "@/components/FeaturesGrid";
import ReferralCTA from "@/components/ReferralCTA";
import Testimonials from "@/components/Testimonials";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PlayerCardsCarousel />
      <HowItWorks />
      <BuyLowSellHigh />
      <FeaturesGrid />
      <ReferralCTA />
      <Testimonials />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
