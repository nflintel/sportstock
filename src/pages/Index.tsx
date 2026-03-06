import LiveTicker from "@/components/LiveTicker";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SEOHead from "@/components/SEOHead";
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
    <main className="min-h-screen bg-background">
      <SEOHead />
      <LiveTicker />
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
    </main>
  );
};

export default Index;
