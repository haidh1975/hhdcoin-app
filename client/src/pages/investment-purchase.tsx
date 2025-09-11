import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { 
  Bitcoin, 
  TrendingUp, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowLeft,
  CreditCard,
  DollarSign 
} from "lucide-react";

interface InvestmentPackage {
  id: string;
  name: string;
  minInvestment: string;
  minRate: string;
  maxRate: string;
  features: string[];
  recommended: number;
}

function InvestmentPurchase() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get packages data
  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["/api/investment-packages"],
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { packageId: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        packageId: data.packageId,
        amount: data.amount,
        currency: "vnd"
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.clientSecret) {
        // Redirect to checkout page with payment intent
        setLocation(`/checkout?payment_intent=${data.clientSecret}&package_id=${selectedPackage}&amount=${investmentAmount}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi thanh toán",
        description: error.message || "Không thể tạo thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const selectedPackageData = (packages as InvestmentPackage[]).find((pkg: InvestmentPackage) => pkg.id === selectedPackage);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseInt(amount));
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục đầu tư.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!selectedPackage) {
      toast({
        title: "Chưa chọn gói",
        description: "Vui lòng chọn gói đầu tư.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(investmentAmount.replace(/\D/g, ''));
    if (!amount || amount <= 0) {
      toast({
        title: "Số tiền không hợp lệ",
        description: "Vui lòng nhập số tiền đầu tư hợp lệ.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPackageData && amount < parseInt(selectedPackageData.minInvestment)) {
      toast({
        title: "Số tiền quá thấp",
        description: `Số tiền đầu tư tối thiểu cho gói này là ${formatCurrency(selectedPackageData.minInvestment)}.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    createPaymentMutation.mutate({ packageId: selectedPackage, amount });
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters and format
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = new Intl.NumberFormat('vi-VN').format(parseInt(numericValue) || 0);
    setInvestmentAmount(formattedValue === '0' ? '' : formattedValue);
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
                  Yêu cầu đăng nhập
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Vui lòng đăng nhập để tiếp tục đầu tư.
                </p>
                <Button onClick={() => setLocation("/login")} className="w-full" data-testid="button-login">
                  Đăng nhập
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
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/investment-packages")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại gói đầu tư
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Đầu tư Bitcoin
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Chọn gói đầu tư và bắt đầu hành trình đầu tư của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Package Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="title-package-selection">
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                    Chọn gói đầu tư
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {packagesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    (packages as InvestmentPackage[]).map((pkg: InvestmentPackage) => (
                      <Card 
                        key={pkg.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedPackage === pkg.id 
                            ? 'ring-2 ring-orange-500 shadow-lg' 
                            : ''
                        } ${pkg.recommended ? 'border-orange-300 dark:border-orange-600' : ''}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                        data-testid={`card-package-${pkg.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            {pkg.recommended === 1 && (
                              <Badge variant="default" className="bg-orange-500 text-white">
                                Khuyến nghị
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Đầu tư tối thiểu:</span>
                              <span className="font-medium">{formatCurrency(pkg.minInvestment)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Lợi nhuận:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {pkg.minRate}% - {pkg.maxRate}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-1">
                            {pkg.features.slice(0, 2).map((feature: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature.replace(/^[^:]*:\s*/, '')}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Investment Amount */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="title-investment-amount">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Số tiền đầu tư
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Số tiền (VNĐ)</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="Nhập số tiền đầu tư"
                      value={investmentAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="text-lg"
                      data-testid="input-investment-amount"
                    />
                    {selectedPackageData && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tối thiểu: {formatCurrency(selectedPackageData.minInvestment)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Purchase Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="title-purchase-summary">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    Tóm tắt đầu tư
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPackageData ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{selectedPackageData.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Lợi nhuận dự kiến:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {selectedPackageData.minRate}% - {selectedPackageData.maxRate}%
                            </span>
                          </div>
                          {investmentAmount && (
                            <div className="flex justify-between">
                              <span>Số tiền đầu tư:</span>
                              <span className="font-medium">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(parseInt(investmentAmount.replace(/\D/g, '')) || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h4 className="font-medium">Đặc quyền gói:</h4>
                        <ul className="space-y-1 text-sm">
                          {selectedPackageData.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Separator />

                      <Button 
                        onClick={handlePurchase}
                        disabled={!selectedPackage || !investmentAmount || isProcessing}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        data-testid="button-purchase"
                      >
                        {isProcessing ? "Đang xử lý..." : "Thanh toán ngay"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Bitcoin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Vui lòng chọn gói đầu tư</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Lợi ích khi đầu tư
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span>Bảo mật an toàn với công nghệ blockchain</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>AI phân tích thị trường thời gian thực</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      <span>Hỗ trợ khách hàng 24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentPurchase;