import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import InvestmentCalculator from "@/components/investment-calculator";
import BitcoinChart from "@/components/bitcoin-chart";
import InvestmentSection from "@/components/investment-section";
import FeaturesSection from "@/components/features-section";
import NewsAnalysis from "@/components/news-analysis";
import MarketAnalysis from "@/components/market-analysis";
import CommunitySection from "@/components/community-section";
import ContactSupport from "@/components/contact-support";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <InvestmentCalculator />
      <BitcoinChart />
      <InvestmentSection />
      <FeaturesSection />
      <NewsAnalysis />
      <MarketAnalysis />
      <CommunitySection />
      <ContactSupport />
      <Footer />
    </div>
  );
}
