import Navigation from "@/components/navigation";
import InvestorsTable from "@/components/investors-table";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Investors() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section for Investors Page */}
      <section className="py-20 bg-gradient-to-r from-bitcoin to-bitcoin-light text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6" data-testid="text-investors-hero-title">
            {t('investors.title')}
          </h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90" data-testid="text-investors-hero-description">
            {t('investors.description')}
          </p>
        </div>
      </section>

      {/* Investors Table Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <InvestorsTable />
        </div>
      </section>

      <Footer />
    </div>
  );
}