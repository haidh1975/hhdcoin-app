import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import MarketAnalysis from "@/components/market-analysis";
import BitcoinChart from "@/components/bitcoin-chart";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Brain, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Activity,
  MessageSquare,
  Lightbulb,
  RefreshCw
} from "lucide-react";

// AI Analysis interfaces
interface MarketAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  sentiment: string;
  recommendation: string;
  confidenceScore: number;
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priceTarget: {
    short_term: number;
    medium_term: number;
  };
  support: number;
  resistance: number;
  rsi: number;
  analysisType: string;
  timestamp: string;
}

interface TradingRecommendation {
  action: 'buy' | 'sell' | 'hold';
  reasoning: string;
  confidence: number;
  timeframe: string;
  riskAssessment: string;
  bitcoinPrice: number;
  change24h: number;
  riskProfile: string;
  timestamp: string;
}

interface SentimentAnalysis {
  rating: number;
  confidence: number;
  summary: string;
  timestamp: string;
}

export default function Analysis() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newsText, setNewsText] = useState("");
  const [sentimentResult, setSentimentResult] = useState<SentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Fetch AI-powered market analysis
  const { data: aiMarketAnalysis, isLoading: isLoadingAnalysis, refetch: refetchAnalysis } = useQuery<MarketAnalysis>({
    queryKey: ["/api/market-analysis"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch trading recommendations with risk profile parameter
  const { data: tradingRecommendation, isLoading: isLoadingRecommendation, refetch: refetchRecommendation } = useQuery<TradingRecommendation>({
    queryKey: ["/api/trading-recommendations", riskProfile],
    queryFn: async () => {
      const response = await fetch(`/api/trading-recommendations?risk=${riskProfile}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hhdcoin_token')}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error('Failed to fetch trading recommendations');
      }
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const handleSentimentAnalysis = async () => {
    if (!newsText.trim()) {
      toast({
        title: t('analysis.toast.error_title'),
        description: t('analysis.toast.no_text'),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/sentiment-analysis", { text: newsText });
      const data = await response.json();
      setSentimentResult(data);
      
      toast({
        title: t('analysis.toast.analysis_complete'),
        description: `${t('analysis.sentiment_summary')} ${data.rating}/5 ★ ${t('analysis.confidence').toLowerCase()} ${Math.round(data.confidence * 100)}%`,
      });
    } catch (error) {
      toast({
        title: t('analysis.toast.analysis_error'),
        description: t('analysis.toast.analysis_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800'; 
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const analysisFeatures = [
    {
      icon: BarChart3,
      title: t('analysis.investment_chart'),
      description: t('analytics.investment_chart')
    },
    {
      icon: PieChart,
      title: t('analysis.market_share'),
      description: t('analytics.market_share')
    },
    {
      icon: TrendingUp,
      title: t('analysis.interest_rate_analysis'),
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
            {t('analysis.title')}
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            {t('analysis.description')}
          </p>
        </div>
      </section>

      {/* Analysis Features Section */}
      <section className="py-16" data-testid="section-analysis-features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-features-title">
            {t('analysis.features_title')}
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
      
      {/* AI Insights Section */}
      <section className="py-16 bg-gray-50" data-testid="section-ai-insights">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* AI Insights Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                  {t('analysis.ai_insights')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {t('analysis.ai_description')}
                </p>
              </div>
              <Button
                onClick={() => {
                  refetchAnalysis();
                  if (isAuthenticated) refetchRecommendation();
                }}
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-refresh-ai"
              >
                <RefreshCw className="h-4 w-4" />
                {t('analysis.refresh')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Market Analysis */}
              <Card data-testid="card-market-analysis">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('analysis.market_analysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAnalysis ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">{t('analysis.analyzing')}</span>
                    </div>
                  ) : aiMarketAnalysis ? (
                    <div className="space-y-4">
                      {/* Trend and Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(aiMarketAnalysis.trend)}
                          <span className="font-semibold capitalize">{aiMarketAnalysis.trend}</span>
                        </div>
                        <Badge variant="secondary" data-testid="badge-confidence">
                          {t('analysis.confidence')} {Math.round(aiMarketAnalysis.confidenceScore * 100)}%
                        </Badge>
                      </div>

                      {/* Risk Level */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{t('analysis.risk_level')}</span>
                        <Badge className={getRiskColor(aiMarketAnalysis.riskLevel)} data-testid="badge-risk-level">
                          {aiMarketAnalysis.riskLevel}
                        </Badge>
                      </div>

                      {/* Price Targets */}
                      {aiMarketAnalysis.priceTarget && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{t('analysis.price_targets')}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">{t('analysis.short_term')}</p>
                              <p className="font-semibold">${aiMarketAnalysis.priceTarget.short_term?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">{t('analysis.medium_term')}</p>
                              <p className="font-semibold">${aiMarketAnalysis.priceTarget.medium_term?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Key Factors */}
                      <div>
                        <p className="font-medium mb-2">{t('analysis.key_factors')}</p>
                        <ul className="space-y-1">
                          {aiMarketAnalysis.keyFactors?.map((factor, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{t('analysis.ai_recommendation')}</span>
                        </div>
                        <p className="text-sm">{aiMarketAnalysis.recommendation}</p>
                      </div>

                      <div className="text-xs text-gray-500 mt-4">
                        {t('analysis.analysis_type')} {aiMarketAnalysis.analysisType} | 
                        {t('analysis.updated')} {new Date(aiMarketAnalysis.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">{t('analysis.error_no_data')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Trading Recommendations */}
              <Card data-testid="card-trading-recommendations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('analysis.trading_recommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">{t('analysis.login_required')}</p>
                    </div>
                  ) : isLoadingRecommendation ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">{t('analysis.creating_recommendations')}</span>
                    </div>
                  ) : tradingRecommendation ? (
                    <div className="space-y-4">
                      {/* Risk Profile Selection */}
                      <div>
                        <p className="font-medium mb-2">{t('analysis.risk_profile')}</p>
                        <div className="flex gap-2">
                          {(['conservative', 'moderate', 'aggressive'] as const).map((profile) => (
                            <Button
                              key={profile}
                              variant={riskProfile === profile ? "default" : "outline"}
                              size="sm"
                              onClick={() => setRiskProfile(profile)}
                              data-testid={`button-risk-${profile}`}
                            >
                              {profile === 'conservative' ? t('analysis.conservative') : 
                               profile === 'moderate' ? t('analysis.moderate') : t('analysis.aggressive')}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Action Recommendation */}
                      <div className="flex items-center justify-between">
                        <Badge className={getActionColor(tradingRecommendation.action)} data-testid="badge-action">
                          {tradingRecommendation.action === 'buy' ? t('analysis.buy') :
                           tradingRecommendation.action === 'sell' ? t('analysis.sell') : t('analysis.hold')}
                        </Badge>
                        <Badge variant="secondary">
                          {t('analysis.confidence')} {Math.round(tradingRecommendation.confidence * 100)}%
                        </Badge>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="font-medium mb-2">{t('analysis.reasoning')}</p>
                        <p className="text-sm">{tradingRecommendation.reasoning}</p>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('analysis.timeframe')}</span>
                          <span>{tradingRecommendation.timeframe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('analysis.bitcoin_price')}</span>
                          <span>${tradingRecommendation.bitcoinPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('analysis.change_24h')}</span>
                          <span className={tradingRecommendation.change24h > 0 ? 'text-green-600' : 'text-red-600'}>
                            {tradingRecommendation.change24h > 0 ? '+' : ''}{tradingRecommendation.change24h?.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{t('analysis.risk_assessment')}</span>
                        </div>
                        <p className="text-sm">{tradingRecommendation.riskAssessment}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">{t('analysis.error_no_recommendations')}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Analysis */}
            <Card data-testid="card-sentiment-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('analysis.sentiment_analysis')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">{t('analysis.sentiment_login_required')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="news-text" className="block text-sm font-medium mb-2">
                        {t('analysis.news_input_label')}
                      </label>
                      <Textarea
                        id="news-text"
                        placeholder={t('analysis.news_placeholder')}
                        value={newsText}
                        onChange={(e) => setNewsText(e.target.value)}
                        rows={4}
                        data-testid="textarea-news"
                      />
                    </div>

                    <Button
                      onClick={handleSentimentAnalysis}
                      disabled={isAnalyzing || !newsText.trim()}
                      className="w-full"
                      data-testid="button-analyze-sentiment"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          {t('analysis.analyzing_sentiment')}
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          {t('analysis.analyze_sentiment')}
                        </>
                      )}
                    </Button>

                    {sentimentResult && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{t('analysis.sentiment_results')}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{'⭐'.repeat(sentimentResult.rating)}</span>
                            <Badge variant="secondary">
                              {Math.round(sentimentResult.confidence * 100)}% {t('analysis.confidence').toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>{t('analysis.sentiment_summary')}</strong> {sentimentResult.summary}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('analysis.analyzed_at')} {new Date(sentimentResult.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Analysis Section */}
      <MarketAnalysis />
      
      <Footer />
    </div>
  );
}