import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap, Star, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import type { InvestmentPackage } from "@shared/schema";

export default function InvestmentPackages() {
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const { data: packages = [], isLoading } = useQuery<InvestmentPackage[]>({
    queryKey: ["/api/investment-packages"],
  });

  const packageIcons = {
    basic: Shield,
    intermediate: TrendingUp,
    premium: Zap,
    elite: Star,
  };

  const packageColors = {
    basic: "border-blue-200 bg-blue-50",
    intermediate: "border-green-200 bg-green-50", 
    premium: "border-purple-200 bg-purple-50",
    elite: "border-yellow-200 bg-yellow-50",
  };

  const badgeColors = {
    basic: "bg-blue-100 text-blue-800",
    intermediate: "bg-green-100 text-green-800",
    premium: "bg-purple-100 text-purple-800", 
    elite: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-investment-packages">
      <Navigation />
      <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-packages-title">
            Gói Đầu Tư Bitcoin
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-packages-description">
            Chọn gói đầu tư phù hợp với mục tiêu tài chính của bạn. Tất cả gói đều được hỗ trợ bởi AI và phân tích chuyên sâu.
          </p>
        </div>

        {/* Investment Calculator Section */}
        <div className="bg-white rounded-lg p-8 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-dark-slate mb-6 text-center">
            Máy Tính Lợi Nhuận Đầu Tư
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-bitcoin mb-2">15-25%</div>
              <div className="text-gray-600">Lợi nhuận năm trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-bitcoin mb-2">24/7</div>
              <div className="text-gray-600">Giám sát AI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-bitcoin mb-2">98%</div>
              <div className="text-gray-600">Độ chính xác dự đoán</div>
            </div>
          </div>
        </div>

        {/* Investment Packages Grid */}
        {isLoading ? (
          <div className="text-center py-12" data-testid="loading-packages">
            <div className="text-gray-500">Đang tải gói đầu tư...</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-12">
            {packages.map((pkg) => {
              const IconComponent = packageIcons[pkg.id as keyof typeof packageIcons] || Shield;
              const isSelected = selectedPackage === pkg.id;
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    isSelected ? 'ring-2 ring-bitcoin shadow-xl' : ''
                  } ${packageColors[pkg.id as keyof typeof packageColors] || 'border-gray-200'}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                  data-testid={`package-card-${pkg.id}`}
                >
                  {pkg.recommended && (
                    <div className="absolute top-0 right-0 bg-bitcoin text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Đề xuất
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-bitcoin to-bitcoin-light rounded-full flex items-center justify-center text-white">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl" data-testid={`text-package-name-${pkg.id}`}>
                            {pkg.name}
                          </CardTitle>
                          <Badge className={`mt-1 ${badgeColors[pkg.id as keyof typeof badgeColors]}`}>
                            {pkg.id.charAt(0).toUpperCase() + pkg.id.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-dark-slate" data-testid={`text-rate-${pkg.id}`}>
                          {pkg.minRate}% - {pkg.maxRate}%
                        </div>
                        <div className="text-sm text-gray-500">Lợi nhuận/năm</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 leading-relaxed" data-testid={`text-description-${pkg.id}`}>
                      {pkg.id === 'basic' ? 'Gói đầu tư phù hợp cho người mới bắt đầu với rủi ro thấp' :
                       pkg.id === 'intermediate' ? 'Gói đầu tư trung bình với lợi nhuận ổn định' :
                       pkg.id === 'premium' ? 'Gói đầu tư cao cấp với tiềm năng lợi nhuận cao' :
                       'Gói đầu tư VIP dành cho nhà đầu tư chuyên nghiệp'}
                    </CardDescription>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Số tiền tối thiểu:</span>
                        <span className="font-semibold" data-testid={`text-min-amount-${pkg.id}`}>
                          {pkg.minInvestment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Mức độ rủi ro:</span>
                        <Badge variant={pkg.id === 'basic' ? 'secondary' : pkg.id === 'intermediate' ? 'default' : 'destructive'}>
                          {pkg.id === 'basic' ? 'Thấp' : pkg.id === 'intermediate' ? 'Trung bình' : 'Cao'}
                        </Badge>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-bitcoin to-bitcoin-light hover:from-bitcoin-light hover:to-bitcoin text-white"
                      data-testid={`button-select-${pkg.id}`}
                    >
                      Chọn Gói Này
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Risk Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-amber-600 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Lưu Ý Quan Trọng</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Đầu tư cryptocurrency có rủi ro cao. Giá trị đầu tư có thể tăng hoặc giảm. 
                Bạn nên cân nhắc kỹ lưỡng và chỉ đầu tư số tiền mà bạn có thể chấp nhận mất. 
                Tham khảo ý kiến chuyên gia tài chính trước khi đưa ra quyết định đầu tư.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-dark-slate mb-4">
            Cần Tư Vấn Thêm?
          </h3>
          <p className="text-gray-600 mb-6">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn chọn gói đầu tư phù hợp nhất.
          </p>
          <Button variant="outline" size="lg">
            Liên Hệ Tư Vấn
          </Button>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}