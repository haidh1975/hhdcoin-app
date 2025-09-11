import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import InvestmentCalculator from "@/components/investment-calculator";
import InvestmentSection from "@/components/investment-section";
import FeaturesSection from "@/components/features-section";
import ContactSupport from "@/components/contact-support";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Smartphone, Bot } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  const newsItems = [
    {
      icon: TrendingUp,
      title: t('news.bitcoin_title'),
      content: t('news.bitcoin_surge')
    },
    {
      icon: Bot,
      title: t('news.ai_title'),
      content: t('news.ai_prediction')
    },
    {
      icon: Smartphone,
      title: t('news.mobile_title'),
      content: t('news.mobile_app')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      
      {/* News Section */}
      <section className="py-16 bg-gray-50" data-testid="section-news">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-news-title">
            {t('news.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {newsItems.map((news, index) => {
              const Icon = news.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-news-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-bitcoin" />
                      <span className="text-lg">{news.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {news.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      <InvestmentCalculator />
      <InvestmentSection />
      <FeaturesSection />
      <ContactSupport />
      <Footer />
    </div>
  );
}
