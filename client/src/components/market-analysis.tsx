import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MarketAnalysis() {
  const { t } = useLanguage();
  
  const chartData = {
    change24h: 8.72,
    high24h: 152500,
    low24h: 145800,
    volume: "85.3B"
  };

  const indicators = [
    { name: t('market.rsi'), value: "78.5", trend: "up" },
    { name: t('market.macd'), value: "+2850", trend: "up" },
    { name: t('market.ma_50_200'), value: t('market.super_bull'), trend: "up" },
    { name: t('market.volume'), value: "+185%", trend: "up" }
  ];

  return (
    <section id="analysis" className="py-20 bg-white" data-testid="section-market-analysis">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-analysis-title">
            {t('market.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-analysis-description">
            {t('market.description')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 bg-gray-50" data-testid="card-main-chart">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-dark-slate" data-testid="text-chart-title">
                  {t('market.chart_title')}
                </h3>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-bitcoin text-white" data-testid="button-timeframe-1d">1D</Button>
                  <Button size="sm" variant="outline" className="hover:bg-gray-300" data-testid="button-timeframe-7d">7D</Button>
                  <Button size="sm" variant="outline" className="hover:bg-gray-300" data-testid="button-timeframe-1m">1M</Button>
                  <Button size="sm" variant="outline" className="hover:bg-gray-300" data-testid="button-timeframe-1y">1Y</Button>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="relative h-80 bg-white rounded-lg border border-gray-200 flex items-center justify-center" data-testid="chart-placeholder">
                <div className="text-center">
                  <BarChart3 className="text-bitcoin text-4xl mb-4 mx-auto h-16 w-16" />
                  <p className="text-gray-600" data-testid="text-chart-placeholder">
                    {t('market.bitcoin_surges')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('market.realtime_updates')}
                  </p>
                </div>
              </div>
              
              {/* Chart Controls */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500" data-testid="text-24h-change">
                    +{chartData.change24h}%
                  </div>
                  <div className="text-sm text-gray-600">{t('market.24h_change')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-slate" data-testid="text-24h-high">
                    ${chartData.high24h.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">{t('market.24h_high')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-slate" data-testid="text-24h-low">
                    ${chartData.low24h.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">{t('market.24h_low')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dark-slate" data-testid="text-volume">
                    {chartData.volume}
                  </div>
                  <div className="text-sm text-gray-600">{t('market.24h_volume')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Market Indicators */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-bitcoin to-bitcoin-light text-white" data-testid="card-ai-sentiment">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold mb-4">AI Market Sentiment</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2" data-testid="text-sentiment-score">97%</div>
                  <div className="text-sm opacity-90" data-testid="text-sentiment-label">Extremely Positive</div>
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: "97%" }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200" data-testid="card-fear-greed">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-dark-slate mb-4">Fear & Greed Index</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2" data-testid="text-fear-greed-score">95</div>
                  <div className="text-sm text-gray-600" data-testid="text-fear-greed-label">Extreme Greed</div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200" data-testid="card-indicators">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-dark-slate mb-4">{t('market.technical_indicators')}</h4>
                <div className="space-y-3">
                  {indicators.map((indicator, index) => (
                    <div key={index} className="flex justify-between items-center" data-testid={`indicator-${index}`}>
                      <span className="text-sm" data-testid={`indicator-name-${index}`}>{indicator.name}</span>
                      <div className="flex items-center">
                        <span className={`font-semibold ${
                          indicator.trend === 'up' ? 'text-green-500' : 
                          indicator.trend === 'down' ? 'text-red-500' : 'text-bitcoin'
                        }`} data-testid={`indicator-value-${index}`}>
                          {indicator.value}
                        </span>
                        {indicator.trend === 'up' && <TrendingUp className="ml-1 h-4 w-4 text-green-500" />}
                        {indicator.trend === 'down' && <TrendingDown className="ml-1 h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
