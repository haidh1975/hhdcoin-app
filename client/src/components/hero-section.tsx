import { useQuery } from "@tanstack/react-query";
import { Shield, Bot, Clock, TrendingUp, Play, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface BitcoinData {
  price?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  marketCap?: number;
  priceHistory?: Array<{ time: string; price: number }>;
}

export default function HeroSection() {
  const { t } = useLanguage();
  const { data: bitcoinData, isLoading } = useQuery<BitcoinData>({
    queryKey: ["/api/bitcoin-real-data"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="bg-gradient-to-br from-dark-slate via-gray-800 to-dark-slate text-white py-20" data-testid="section-hero">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-title">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed" data-testid="text-hero-description">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                onClick={() => scrollToSection("investment")}
                className="bg-bitcoin hover:bg-bitcoin-light text-white px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-start-investing"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                {t('hero.cta.invest')}
              </Button>
              <Button 
                variant="outline"
                className="border border-gray-400 text-white hover:bg-white hover:text-dark-slate px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-demo-ai"
              >
                <Play className="mr-2 h-5 w-5" />
                {t('hero.cta.demo')}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center" data-testid="feature-security">
                <Shield className="text-green-400 mr-2 h-5 w-5" />
                <span>{t('hero.feature.security')}</span>
              </div>
              <div className="flex items-center" data-testid="feature-ai">
                <Bot className="text-bitcoin mr-2 h-5 w-5" />
                <span>{t('hero.feature.ai')}</span>
              </div>
              <div className="flex items-center" data-testid="feature-realtime">
                <Clock className="text-blue-400 mr-2 h-5 w-5" />
                <span>{t('hero.feature.realtime')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6" data-testid="card-bitcoin-price">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" data-testid="text-bitcoin-price-title">{t('hero.price.title')}</h3>
              <div className="text-4xl font-bold text-bitcoin mb-2" data-testid="text-bitcoin-price">
                {isLoading ? "Loading..." : `$${bitcoinData?.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "118,930.00"}`}
              </div>
              <div className={`flex items-center justify-center ${
                (bitcoinData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`} data-testid="text-bitcoin-change">
                <TrendingUp className={`mr-1 h-4 w-4 ${(bitcoinData?.change24h || 0) < 0 ? 'transform rotate-180' : ''}`} />
                <span>{isLoading ? "..." : `${(bitcoinData?.change24h || 0) >= 0 ? '+' : ''}${bitcoinData?.change24h?.toFixed(2) || "-2.71"}%`}</span>
                <span className="text-gray-300 ml-2">(24h)</span>
              </div>
            </div>
            
            {/* AI Prediction Widget */}
            <div className="bg-gradient-to-r from-bitcoin/20 to-bitcoin-light/20 rounded-lg p-4 mb-4" data-testid="widget-ai-prediction">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Dự báo AI (7 ngày)</span>
                <Bot className="text-bitcoin h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-bitcoin" data-testid="text-ai-prediction-price">
                $125,000
              </div>
              <div className="text-sm text-gray-300" data-testid="text-ai-confidence">
                Độ tin cậy: 89%
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Cao nhất 24h</div>
                <div className="font-semibold" data-testid="text-bitcoin-high">
                  ${bitcoinData?.high24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "122,138.48"}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Thấp nhất 24h</div>
                <div className="font-semibold" data-testid="text-bitcoin-low">
                  ${bitcoinData?.low24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "115,721.52"}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Khối lượng</div>
                <div className="font-semibold" data-testid="text-bitcoin-volume">
                  ${(bitcoinData?.volume24h ? (bitcoinData.volume24h / 1e9).toFixed(1) + 'B' : '50.2B')}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Market Cap</div>
                <div className="font-semibold" data-testid="text-bitcoin-marketcap">
                  ${(bitcoinData?.marketCap ? (bitcoinData.marketCap / 1e12).toFixed(2) + 'T' : '2.37T')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
