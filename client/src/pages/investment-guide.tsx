import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, DollarSign, CreditCard, BarChart3, MessageCircle, CheckCircle } from "lucide-react";

export default function InvestmentGuide() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: UserPlus,
      title: "Bước 1: Tạo tài khoản",
      description: t('guide.step1'),
      color: "text-blue-600"
    },
    {
      icon: DollarSign,
      title: "Bước 2: Nạp khoản đầu tư",
      description: t('guide.step2'),
      color: "text-green-600"
    },
    {
      icon: CreditCard,
      title: "Bước 3: Thanh toán & nhận hợp đồng",
      description: t('guide.step3'),
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      title: "Bước 4: Quản lý & theo dõi",
      description: t('guide.step4'),
      color: "text-orange-600"
    },
    {
      icon: MessageCircle,
      title: "Bước 5: Chatbot AI hỗ trợ",
      description: t('guide.step5'),
      color: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 text-white py-20" data-testid="section-guide-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-guide-title">
            {t('guide.title')}
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Hướng dẫn chi tiết từng bước để bắt đầu hành trình đầu tư Bitcoin thông minh với AI
          </p>
        </div>
      </section>

      <section className="py-16" data-testid="section-guide-steps">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-steps-title">
              5 Bước Đầu Tư Với HHDcoin
            </h2>
            
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-step-${index + 1}`}>
                    <div className={`absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-${step.color.split('-')[1]}-400 to-${step.color.split('-')[1]}-600`}></div>
                    <CardHeader className="pl-8">
                      <CardTitle className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-gray-100 ${step.color}`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{step.title}</h3>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-8">
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {step.description}
                      </p>
                      {index < steps.length - 1 && (
                        <div className="mt-6 flex justify-center">
                          <div className="w-px h-8 bg-gray-300"></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16" data-testid="section-guide-cta">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6" data-testid="text-ready-title">
              Sẵn sàng bắt đầu đầu tư?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Theo dõi 5 bước trên để bắt đầu hành trình đầu tư Bitcoin thông minh cùng HHDcoin
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-bitcoin hover:bg-bitcoin-light px-8 py-3 text-lg" data-testid="button-start-now">
                Bắt đầu ngay
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg" data-testid="button-contact-support">
                Liên hệ hỗ trợ
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}