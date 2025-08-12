import { useQuery } from "@tanstack/react-query";
import { Shield, Bot, Clock, TrendingUp, Play, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BitcoinData {
  price?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume?: string;
  marketCap?: string;
  aiPrediction?: {
    price?: number;
    confidence?: number;
    timeframe?: string;
  };
}

export default function HeroSection() {
  const { data: bitcoinData, isLoading } = useQuery<BitcoinData>({
    queryKey: ["/api/bitcoin-price"],
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
              Đầu tư Bitcoin <span className="text-bitcoin">Thông minh</span> với AI
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed" data-testid="text-hero-description">
              Nền tảng đầu tư Bitcoin hàng đầu Việt Nam với công nghệ AI dự báo, 
              phân tích chuyên sâu và cập nhật real-time 24/7.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                onClick={() => scrollToSection("investment")}
                className="bg-bitcoin hover:bg-bitcoin-light text-white px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-start-investing"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Bắt đầu đầu tư
              </Button>
              <Button 
                variant="outline"
                className="border border-gray-400 text-white hover:bg-white hover:text-dark-slate px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-demo-ai"
              >
                <Play className="mr-2 h-5 w-5" />
                Xem demo AI
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center" data-testid="feature-security">
                <Shield className="text-green-400 mr-2 h-5 w-5" />
                <span>Bảo mật tuyệt đối</span>
              </div>
              <div className="flex items-center" data-testid="feature-ai">
                <Bot className="text-bitcoin mr-2 h-5 w-5" />
                <span>AI dự báo chính xác</span>
              </div>
              <div className="flex items-center" data-testid="feature-realtime">
                <Clock className="text-blue-400 mr-2 h-5 w-5" />
                <span>Cập nhật 24/7</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6" data-testid="card-bitcoin-price">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2" data-testid="text-bitcoin-price-title">Giá Bitcoin hiện tại</h3>
              <div className="text-4xl font-bold text-bitcoin mb-2" data-testid="text-bitcoin-price">
                {isLoading ? "Loading..." : `$${bitcoinData?.price?.toLocaleString() || "43,250.67"}`}
              </div>
              <div className="flex items-center justify-center text-green-400" data-testid="text-bitcoin-change">
                <TrendingUp className="mr-1 h-4 w-4" />
                <span>{isLoading ? "..." : `+${bitcoinData?.change24h || 2.45}%`}</span>
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
                ${bitcoinData?.aiPrediction?.price?.toLocaleString() || "46,800"}
              </div>
              <div className="text-sm text-gray-300" data-testid="text-ai-confidence">
                Độ tin cậy: {bitcoinData?.aiPrediction?.confidence || 87}%
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Cao nhất 24h</div>
                <div className="font-semibold" data-testid="text-bitcoin-high">${bitcoinData?.high24h?.toLocaleString() || "44,120"}</div>
              </div>
              <div>
                <div className="text-gray-400">Thấp nhất 24h</div>
                <div className="font-semibold" data-testid="text-bitcoin-low">${bitcoinData?.low24h?.toLocaleString() || "42,890"}</div>
              </div>
              <div>
                <div className="text-gray-400">Khối lượng</div>
                <div className="font-semibold" data-testid="text-bitcoin-volume">{bitcoinData?.volume || "28.5B"}</div>
              </div>
              <div>
                <div className="text-gray-400">Market Cap</div>
                <div className="font-semibold" data-testid="text-bitcoin-marketcap">{bitcoinData?.marketCap || "847B"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
