import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Investor } from "@shared/schema";

export default function InvestorsTable() {
  const { t } = useLanguage();
  
  const { data: investors, isLoading } = useQuery<Investor[]>({
    queryKey: ["/api/investors"],
  });

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "0 VNĐ";
    const num = parseFloat(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getProfitLossColor = (profitLoss: string | null) => {
    if (!profitLoss) return "text-gray-500";
    const num = parseFloat(profitLoss);
    return num >= 0 ? "text-green-600" : "text-red-600";
  };

  const getProfitLossIcon = (profitLoss: string | null) => {
    if (!profitLoss) return null;
    const num = parseFloat(profitLoss);
    return num >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t('investors.status.active'), variant: "default" as const },
      inactive: { label: t('investors.status.inactive'), variant: "secondary" as const },
      completed: { label: "Hoàn thành", variant: "outline" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="investors-loading">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalInvestors = investors?.length || 0;
  const totalInvestment = investors?.reduce((sum, investor) => 
    sum + parseFloat(investor.investmentAmount || "0"), 0) || 0;
  const totalProfit = investors?.reduce((sum, investor) => 
    sum + parseFloat(investor.profitLoss || "0"), 0) || 0;

  return (
    <div data-testid="investors-table">
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-total-investors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('investors.stats.total')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-investors">{totalInvestors}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-investment">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('investors.stats.investment')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-bitcoin" data-testid="text-total-investment">
                {formatCurrency(totalInvestment.toString())}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-profit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('investors.stats.profit')}</CardTitle>
              {getProfitLossIcon(totalProfit.toString())}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getProfitLossColor(totalProfit.toString())}`} data-testid="text-total-profit">
                {formatCurrency(totalProfit.toString())}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investors Table */}
        <Card data-testid="card-investors-table">
          <CardHeader>
            <CardTitle>{t('investors.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('investors.table.name')}</TableHead>
                    <TableHead>{t('investors.table.email')}</TableHead>
                    <TableHead>{t('investors.table.phone')}</TableHead>
                    <TableHead>{t('investors.table.amount')}</TableHead>
                    <TableHead>{t('investors.table.time')}</TableHead>
                    <TableHead>{t('investors.table.bitcoin')}</TableHead>
                    <TableHead>{t('investors.table.currentValue')}</TableHead>
                    <TableHead>{t('investors.table.profit')}</TableHead>
                    <TableHead>{t('investors.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors?.map((investor) => (
                    <TableRow key={investor.id} data-testid={`row-investor-${investor.id}`}>
                      <TableCell className="font-medium" data-testid={`text-name-${investor.id}`}>
                        {investor.fullName}
                      </TableCell>
                      <TableCell data-testid={`text-email-${investor.id}`}>
                        {investor.email}
                      </TableCell>
                      <TableCell data-testid={`text-phone-${investor.id}`}>
                        {investor.phone}
                      </TableCell>
                      <TableCell className="font-semibold text-bitcoin" data-testid={`text-investment-${investor.id}`}>
                        {formatCurrency(investor.investmentAmount)}
                      </TableCell>
                      <TableCell data-testid={`text-date-${investor.id}`}>
                        {formatDate(investor.investmentDate)}
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`text-bitcoin-code-${investor.id}`}>
                        {investor.bitcoinCode}
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`text-current-value-${investor.id}`}>
                        {formatCurrency(investor.currentValue)}
                      </TableCell>
                      <TableCell data-testid={`text-profit-loss-${investor.id}`}>
                        <div className={`flex items-center gap-1 ${getProfitLossColor(investor.profitLoss)}`}>
                          {getProfitLossIcon(investor.profitLoss)}
                          <span className="font-semibold">
                            {formatCurrency(investor.profitLoss)}
                          </span>
                          {investor.profitLossPercentage && (
                            <span className="text-sm">
                              ({investor.profitLossPercentage}%)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`badge-status-${investor.id}`}>
                        {getStatusBadge(investor.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}