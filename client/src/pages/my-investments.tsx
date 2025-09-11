import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Clock,
  Plus,
  BarChart3,
  Eye
} from "lucide-react";

interface UserInvestment {
  id: string;
  userId: string;
  packageId: string;
  transactionId: string;
  investmentAmount: string;
  currentValue: string | null;
  profitLoss: string | null;
  profitLossPercentage: string | null;
  bitcoinCode: string;
  status: string;
  startDate: string;
  endDate: string | null;
  lastUpdated: string;
  metadata: string | null;
  package: {
    id: string;
    name: string;
    minInvestment: string;
    minRate: string;
    maxRate: string;
    features: string[];
    recommended: number;
  };
}

function MyInvestments() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get user investments
  const { data: investments = [], isLoading, error } = useQuery({
    queryKey: ["/api/user-investments"],
    enabled: !!isAuthenticated,
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('my_investments.status.active')}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t('my_investments.status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('my_investments.status.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTotalInvestment = () => {
    return (investments as UserInvestment[]).reduce((total, inv) => total + parseFloat(inv.investmentAmount || '0'), 0);
  };

  const getTotalCurrentValue = () => {
    return (investments as UserInvestment[]).reduce((total, inv) => total + parseFloat(inv.currentValue || inv.investmentAmount || '0'), 0);
  };

  const getTotalProfit = () => {
    return (investments as UserInvestment[]).reduce((total, inv) => total + parseFloat(inv.profitLoss || '0'), 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {t('my_investments.login_required_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  {t('my_investments.login_required_message')}
                </p>
                <Button onClick={() => setLocation("/login")} className="w-full" data-testid="button-login">
                  {t('my_investments.login_button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="title-my-investments">
                  {t('my_investments.title')}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {t('my_investments.portfolio_overview')}
                </p>
              </div>
              <Button 
                onClick={() => setLocation("/investment-purchase")} 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                data-testid="button-new-investment"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('my_investments.start_investing')}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.total_invested')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-investment">
                      {formatCurrency(getTotalInvestment().toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.current_value')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-current-value">
                      {formatCurrency(getTotalCurrentValue().toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    getTotalProfit() >= 0 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {getTotalProfit() >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.profit_loss')}</p>
                    <p className={`text-2xl font-bold ${
                      getTotalProfit() >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} data-testid="text-profit-loss">
                      {getTotalProfit() >= 0 ? '+' : ''}{formatCurrency(getTotalProfit().toString())}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="title-investments-list">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Danh sách đầu tư ({(investments as UserInvestment[]).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{t('my_investments.loading_error')}</p>
                </div>
              ) : (investments as UserInvestment[]).length === 0 ? (
                <div className="text-center py-12">
                  <Bitcoin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('my_investments.no_investments_title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('my_investments.no_investments_message')}
                  </p>
                  <Button 
                    onClick={() => setLocation("/investment-purchase")}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    data-testid="button-start-investing"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('my_investments.start_investing')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(investments as UserInvestment[]).map((investment) => (
                    <Card key={investment.id} className="border border-gray-200 dark:border-gray-700" data-testid={`card-investment-${investment.id}`}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Investment Info */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {investment.package.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {t('my_investments.bitcoin_code')}: {investment.bitcoinCode}
                                </p>
                              </div>
                              {getStatusBadge(investment.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">{t('my_investments.investment_date')}</p>
                                <p className="font-medium">{formatDate(investment.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">{t('my_investments.expected_profit')}</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                  {investment.package.minRate}% - {investment.package.maxRate}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Financial Info */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.investment_amount')}</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(investment.investmentAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.current_value')}</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(investment.currentValue || investment.investmentAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Performance & Actions */}
                          <div className="flex flex-col justify-between">
                            <div className="space-y-2">
                              {investment.profitLoss && (
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('my_investments.profit_loss')}</p>
                                  <p className={`text-lg font-semibold ${
                                    parseFloat(investment.profitLoss) >= 0 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {parseFloat(investment.profitLoss) >= 0 ? '+' : ''}
                                    {formatCurrency(investment.profitLoss)}
                                  </p>
                                  {investment.profitLossPercentage && (
                                    <p className={`text-sm ${
                                      parseFloat(investment.profitLossPercentage) >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      ({parseFloat(investment.profitLossPercentage) >= 0 ? '+' : ''}
                                      {investment.profitLossPercentage}%)
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setLocation(`/investment-details/${investment.id}`)}
                                data-testid={`button-view-${investment.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('my_investments.details_button')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MyInvestments;