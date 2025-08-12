import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import InvestmentCalculator from "@/components/investment-calculator";
import InvestmentSection from "@/components/investment-section";
import FeaturesSection from "@/components/features-section";
import ContactSupport from "@/components/contact-support";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <InvestmentCalculator />
      <InvestmentSection />
      <FeaturesSection />
      <ContactSupport />
      <Footer />
    </div>
  );
}
