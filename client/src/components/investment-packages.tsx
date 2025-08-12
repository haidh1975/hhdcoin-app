import { useQuery } from "@tanstack/react-query";
import { Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InvestmentPackage } from "@shared/schema";

export default function InvestmentPackages() {
  const { data: packages = [], isLoading } = useQuery<InvestmentPackage[]>({
    queryKey: ["/api/investment-packages"],
  });

  const scrollToContact = () => {
    const section = document.getElementById("contact");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8" data-testid="investment-packages-loading">
        <div className="text-lg">Đang tải gói đầu tư...</div>
      </div>
    );
  }

  return (
    <div data-testid="investment-packages">
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages?.map((pkg: InvestmentPackage, index: number) => (
            <Card 
              key={pkg.id} 
              className={`relative shadow-lg hover:shadow-xl transition-shadow ${
                (pkg.recommended === 1) ? 'transform scale-105 border-2 border-bitcoin' : ''
              }`}
              data-testid={`card-package-${pkg.id}`}
            >
              {(pkg.recommended === 1) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-bitcoin px-4 py-2 rounded-full text-sm font-bold border-2 border-bitcoin">
                  <Star className="inline mr-1 h-4 w-4" />
                  PHỔ BIẾN NHẤT
                </div>
              )}
              
              <CardContent className={`p-8 text-center ${
                (pkg.recommended === 1) ? 'bg-gradient-to-br from-bitcoin to-bitcoin-light' : 'bg-white'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${(pkg.recommended === 1) ? 'text-black' : 'text-dark-slate'}`} data-testid={`text-package-name-${pkg.id}`}>
                    {pkg.name}
                  </h3>
                  <div className={`text-4xl font-bold mb-2 ${(pkg.recommended === 1) ? 'text-black' : 'text-bitcoin'}`} data-testid={`text-package-rate-${pkg.id}`}>
                    {pkg.minRate}-{pkg.maxRate}%
                  </div>
                  <div className={`${(pkg.recommended === 1) ? 'text-black opacity-80' : 'text-gray-600'}`}>
                    Lợi nhuận/năm
                  </div>
                </div>
                
                <div className="space-y-4 mb-8 text-left">
                  {pkg.features.map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center" data-testid={`feature-${pkg.id}-${featureIndex}`}>
                      <Check className={`mr-3 h-5 w-5 ${(pkg.recommended === 1) ? 'text-black' : 'text-green-500'}`} />
                      <span className={(pkg.recommended === 1) ? 'text-black' : 'text-gray-700'}>{feature}</span>
                    </div>
                  ))}
                  
                  {/* Add disabled feature for basic package */}
                  {pkg.id === 'basic' && (
                    <div className="flex items-center" data-testid={`feature-disabled-${pkg.id}`}>
                      <X className="mr-3 h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Dự báo AI</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={scrollToContact}
                  variant={(pkg.recommended === 1) ? "secondary" : "outline"}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    (pkg.recommended === 1)
                      ? 'bg-black text-yellow-400 hover:bg-gray-800' 
                      : 'border-2 border-bitcoin text-bitcoin hover:bg-bitcoin hover:text-white'
                  }`}
                  data-testid={`button-select-package-${pkg.id}`}
                >
                  Chọn gói này
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
