import { useLanguage } from "@/contexts/LanguageContext";
import InvestmentPackages from "./investment-packages";

export default function InvestmentSection() {
  const { t } = useLanguage();

  return (
    <section id="investment" className="py-16 bg-gray-50" data-testid="section-investment">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-investment-title">
            {t('packages.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-investment-description">
            {t('packages.description')}
          </p>
        </div>

        <InvestmentPackages />
      </div>
    </section>
  );
}