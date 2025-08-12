import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BitcoinData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  priceHistory: Array<{ time: string; price: number }>;
}

interface MarketAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  support: number;
  resistance: number;
  recommendation: string;
  rsi: number;
  sentiment: string;
}

export default function BitcoinChart() {
  const { t } = useLanguage();
  
  // Fetch real Bitcoin data from public APIs
  const { data: bitcoinData, isLoading: bitcoinLoading } = useQuery<BitcoinData>({
    queryKey: ['/api/bitcoin-real-data'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: marketAnalysis, isLoading: analysisLoading } = useQuery<MarketAnalysis>({
    queryKey: ['/api/market-analysis'],
    refetchInterval: 300000, // Update every 5 minutes
  });

  if (bitcoinLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-8" data-testid="bitcoin-chart-loading">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return (
    <section className="py-20 bg-gray-50" data-testid="section-bitcoin-chart">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-chart-title">
            Biểu đồ Bitcoin Thời gian Thực
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-chart-description">
            Dữ liệu giá Bitcoin cập nhật trực tiếp từ các sàn giao dịch hàng đầu thế giới
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Bitcoin Price Card */}
          <Card className="shadow-lg" data-testid="card-bitcoin-price">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="text-bitcoin h-6 w-6" />
                <span>Giá Bitcoin (BTC/USD)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Current Price */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-dark-slate mb-2" data-testid="text-current-price">
                    {bitcoinData ? formatPrice(bitcoinData.price) : '$--,---'}
                  </div>
                  <div className={`flex items-center justify-center space-x-2 text-lg font-semibold ${
                    bitcoinData && bitcoinData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`} data-testid="text-price-change">
                    {bitcoinData && bitcoinData.change24h >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span>
                      {bitcoinData ? `${bitcoinData.change24h >= 0 ? '+' : ''}${bitcoinData.change24h.toFixed(2)}%` : '-%'}
                    </span>
                    <span className="text-gray-500 text-sm">24h</span>
                  </div>
                </div>

                {/* Price Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg" data-testid="stat-high24h">
                    <div className="text-sm text-gray-600 mb-1">Cao nhất 24h</div>
                    <div className="text-lg font-semibold text-dark-slate">
                      {bitcoinData ? formatPrice(bitcoinData.high24h) : '$--,---'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg" data-testid="stat-low24h">
                    <div className="text-sm text-gray-600 mb-1">Thấp nhất 24h</div>
                    <div className="text-lg font-semibold text-dark-slate">
                      {bitcoinData ? formatPrice(bitcoinData.low24h) : '$--,---'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg" data-testid="stat-volume24h">
                    <div className="text-sm text-gray-600 mb-1">Khối lượng 24h</div>
                    <div className="text-lg font-semibold text-dark-slate">
                      {bitcoinData ? formatVolume(bitcoinData.volume24h) : '$--B'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg" data-testid="stat-market-cap">
                    <div className="text-sm text-gray-600 mb-1">Vốn hóa thị trường</div>
                    <div className="text-lg font-semibold text-dark-slate">
                      {bitcoinData ? formatVolume(bitcoinData.marketCap) : '$--B'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis Card */}
          <Card className="shadow-lg" data-testid="card-market-analysis">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="text-green-500 h-6 w-6" />
                <span>Phân tích Thị trường</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {analysisLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Market Trend */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid="market-trend">
                    <span className="text-gray-600">Xu hướng thị trường:</span>
                    <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                      marketAnalysis?.trend === 'bullish' 
                        ? 'bg-green-100 text-green-700' 
                        : marketAnalysis?.trend === 'bearish' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {marketAnalysis?.trend === 'bullish' 
                        ? 'Tăng giá' 
                        : marketAnalysis?.trend === 'bearish' 
                        ? 'Giảm giá' 
                        : 'Trung tính'}
                    </span>
                  </div>

                  {/* Support & Resistance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg" data-testid="support-level">
                      <div className="text-sm text-red-600 mb-1">Hỗ trợ</div>
                      <div className="text-lg font-semibold text-red-700">
                        {marketAnalysis ? formatPrice(marketAnalysis.support) : '$--,---'}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg" data-testid="resistance-level">
                      <div className="text-sm text-green-600 mb-1">Kháng cự</div>
                      <div className="text-lg font-semibold text-green-700">
                        {marketAnalysis ? formatPrice(marketAnalysis.resistance) : '$--,---'}
                      </div>
                    </div>
                  </div>

                  {/* RSI */}
                  <div className="bg-blue-50 p-4 rounded-lg" data-testid="rsi-indicator">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600">RSI (14)</span>
                      <span className="text-lg font-semibold text-blue-700">
                        {marketAnalysis ? `${marketAnalysis.rsi.toFixed(1)}` : '--'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${marketAnalysis ? marketAnalysis.rsi : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-4 bg-bitcoin/10 border border-bitcoin/20 rounded-lg" data-testid="recommendation">
                    <div className="text-sm text-bitcoin font-medium mb-2">Khuyến nghị AI:</div>
                    <div className="text-dark-slate">
                      {marketAnalysis?.recommendation || 'Đang phân tích...'}
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg" data-testid="market-sentiment">
                    <div className="text-sm text-gray-600 mb-1">Tâm lý thị trường</div>
                    <div className="text-lg font-semibold text-dark-slate">
                      {marketAnalysis?.sentiment || 'Đang cập nhật...'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Update Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500" data-testid="text-update-notice">
            Dữ liệu cập nhật mỗi 30 giây từ các sàn giao dịch Bitcoin uy tín thế giới
          </p>
        </div>
      </div>
    </section>
  );
}