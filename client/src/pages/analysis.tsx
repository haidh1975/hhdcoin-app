import Navigation from "@/components/navigation";
import MarketAnalysis from "@/components/market-analysis";
import BitcoinChart from "@/components/bitcoin-chart";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

export default function Analysis() {
  const { t } = useLanguage();

  const analysisFeatures = [
    {
      icon: BarChart3,
      title: "Biểu đồ đầu tư",
      description: t('analytics.investment_chart')
    },
    {
      icon: PieChart,
      title: "Biểu đồ thị phần",
      description: t('analytics.market_share')
    },
    {
      icon: TrendingUp,
      title: "Phân tích lãi suất",
      description: t('analytics.interest_rate')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-green-600 via-blue-600 to-green-700 text-white py-20" data-testid="section-analysis-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-analysis-title">
            {t('analytics.title')}
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Phân tích toàn diện với AI để đưa ra quyết định đầu tư thông minh và hiệu quả nhất
          </p>
        </div>
      </section>

      {/* Analysis Features Section */}
      <section className="py-16" data-testid="section-analysis-features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
            Các tính năng phân tích
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {analysisFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-3">
                      <Icon className="h-12 w-12 text-bitcoin" />
                      <span className="text-xl">{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bitcoin Chart Section */}
      <BitcoinChart />
      
      {/* Market Analysis Section */}
      <MarketAnalysis />
      
      <Footer />
    </div>
  );
}