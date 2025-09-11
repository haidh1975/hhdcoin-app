import { useState, useEffect } from "react";
import { Calculator, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

type PackageType = "basic" | "premium" | "vip";

interface CalculationResult {
  investment: number;
  profit: number;
  total: number;
  profitPercent: number;
  riskLevel: "low" | "medium" | "high";
}

export default function InvestmentCalculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState<string>("50000000");
  const [duration, setDuration] = useState<string>("6");
  const [selectedPackage, setSelectedPackage] = useState<PackageType>("premium");
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  const packages = {
    basic: { name: t('calc.package.basic'), rate: 0.065, minRate: 5, maxRate: 8, risk: 'low' as const },
    premium: { name: t('calc.package.premium'), rate: 0.10, minRate: 8, maxRate: 12, risk: 'medium' as const },
    vip: { name: t('calc.package.vip'), rate: 0.15, minRate: 12, maxRate: 18, risk: 'high' as const }
  };

  const calculateInvestment = () => {
    const investmentAmount = parseFloat(amount) || 0;
    const months = parseInt(duration) || 6;
    const pkg = packages[selectedPackage];
    
    const monthlyRate = pkg.rate / 12;
    const profit = investmentAmount * monthlyRate * months;
    const total = investmentAmount + profit;
    const profitPercent = (profit / investmentAmount) * 100;

    setCalculation({
      investment: investmentAmount,
      profit,
      total,
      profitPercent,
      riskLevel: pkg.risk
    });
  };

  useEffect(() => {
    calculateInvestment();
  }, [amount, duration, selectedPackage]);

  const handlePackageSelect = (packageType: PackageType) => {
    setSelectedPackage(packageType);
  };

  const scrollToContact = () => {
    const section = document.getElementById("contact");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="investment" className="py-20 bg-white" data-testid="section-investment-calculator">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-calculator-title">
            {t('calc.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-calculator-description">
            {t('calc.description')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Calculator Form */}
          <div className="bg-gray-50 rounded-2xl p-8" data-testid="form-investment-calculator">
            <h3 className="text-2xl font-bold text-dark-slate mb-6">{t('calc.form.title')}</h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('calc.form.amount')}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={t('calc.form.amount_placeholder')} 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  data-testid="input-investment-amount"
                />
              </div>
              
              <div>
                <Label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('calc.form.duration')}
                </Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger data-testid="select-investment-duration">
                    <SelectValue placeholder={t('calc.form.duration')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 {t('calc.form.duration.months')}</SelectItem>
                    <SelectItem value="6">{t('calc.form.duration.6')}</SelectItem>
                    <SelectItem value="12">{t('calc.form.duration.12')}</SelectItem>
                    <SelectItem value="24">{t('calc.form.duration.24')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">{t('calc.form.package')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(packages).map(([key, pkg]) => (
                    <Button
                      key={key}
                      variant="outline"
                      onClick={() => handlePackageSelect(key as PackageType)}
                      className={`p-3 text-center transition-colors ${
                        selectedPackage === key 
                          ? 'border-bitcoin border-2 bg-bitcoin/10' 
                          : 'border-gray-300 hover:border-bitcoin'
                      }`}
                      data-testid={`button-package-${key}`}
                    >
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className={`text-sm ${selectedPackage === key ? 'text-bitcoin' : 'text-gray-500'}`}>
                          {pkg.minRate}-{pkg.maxRate}%
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200" data-testid="widget-risk-level">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{t('calc.risk.level')}</span>
                  <span className={`text-sm font-medium ${
                    calculation?.riskLevel === 'low' ? 'text-green-600' :
                    calculation?.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`} data-testid="text-risk-level">
                    {calculation?.riskLevel ? t(`calc.risk.${calculation.riskLevel}`) : t('calc.risk.medium')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      calculation?.riskLevel === 'low' ? 'bg-green-500' :
                      calculation?.riskLevel === 'medium' ? 'bg-gradient-to-r from-green-400 to-yellow-500' : 'bg-gradient-to-r from-yellow-500 to-red-500'
                    }`}
                    style={{ 
                      width: calculation?.riskLevel === 'low' ? '33%' : 
                             calculation?.riskLevel === 'medium' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-gradient-to-br from-bitcoin to-bitcoin-light text-white rounded-2xl p-8" data-testid="card-calculation-results">
            <h3 className="text-2xl font-bold mb-6">{t('calc.results.title')}</h3>
            
            <div className="space-y-6">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-sm opacity-90 mb-1">{t('calc.results.investment')}</div>
                <div className="text-3xl font-bold" data-testid="text-total-investment">
                  {calculation ? `${calculation.investment.toLocaleString('vi-VN')} VNĐ` : '50,000,000 VNĐ'}
                </div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-sm opacity-90 mb-1">{t('calc.results.profit')}</div>
                <div className="text-3xl font-bold" data-testid="text-estimated-profit">
                  {calculation ? `+${calculation.profit.toLocaleString('vi-VN')} VNĐ` : '+5,000,000 VNĐ'}
                </div>
                <div className="text-sm opacity-75" data-testid="text-profit-percentage">
                  {calculation ? `(+${calculation.profitPercent.toFixed(1)}% sau ${duration} tháng)` : '(+10% sau 6 tháng)'}
                </div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-sm opacity-90 mb-1">{t('calc.results.total')}</div>
                <div className="text-3xl font-bold" data-testid="text-total-return">
                  {calculation ? `${calculation.total.toLocaleString('vi-VN')} VNĐ` : '55,000,000 VNĐ'}
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{t('calc.ai.prediction_title')}</span>
                  <Calculator className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold" data-testid="text-ai-trend">{t('calc.ai.trend')}</div>
                <div className="text-sm opacity-75" data-testid="text-ai-confidence-investment">{t('calc.ai.confidence')}</div>
              </div>
            </div>
            
            <Button 
              onClick={scrollToContact}
              className="w-full bg-white text-bitcoin font-bold py-4 rounded-lg mt-6 hover:bg-gray-50 transition-colors"
              data-testid="button-start-investment"
            >
              <Rocket className="mr-2 h-5 w-5" />
              {t('calc.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
