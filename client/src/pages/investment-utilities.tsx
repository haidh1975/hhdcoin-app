import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Download, Send, Bell, Calendar, FileText, CreditCard } from "lucide-react";

export default function InvestmentUtilities() {
  const { t } = useLanguage();

  const utilities = [
    {
      icon: History,
      title: t('utilities.history'),
      description: t('utilities.history')
    },
    {
      icon: Download,
      title: t('utilities.pdf_contract'),
      description: t('utilities.pdf_contract')
    },
    {
      icon: Send,
      title: t('utilities.withdrawal'),
      description: t('utilities.withdrawal')
    },
    {
      icon: Bell,
      title: t('utilities.notifications'),
      description: t('utilities.notifications')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="bg-gradient-to-br from-blue-600 via-green-600 to-blue-700 text-white py-20" data-testid="section-utilities-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-utilities-title">
            {t('utilities.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Quản lý đầu tư hiệu quả với các tiện ích thông minh được tối ưu hóa cho nhà đầu tư Bitcoin
          </p>
        </div>
      </section>

      <section className="py-16" data-testid="section-utilities-content">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {utilities.map((utility, index) => {
              const Icon = utility.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-utility-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-bitcoin" />
                      <span className="text-lg">{utility.title.split(':')[0]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {utility.description.includes(':') ? utility.description.split(': ')[1] : utility.description}
                    </p>
                    <Button className="w-full bg-bitcoin hover:bg-bitcoin-light" data-testid={`button-utility-${index}`}>
                      {index === 0 && 'Xem lịch sử'}
                      {index === 1 && 'Tải hợp đồng'}
                      {index === 2 && 'Gửi yêu cầu'}
                      {index === 3 && 'Quản lý thông báo'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16" data-testid="section-utilities-demo">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-demo-title">
              Demo Interface
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-bitcoin" />
                    <span className="font-medium">Đầu tư gần nhất</span>
                  </div>
                  <span className="text-green-600 font-semibold">15/12/2024</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-bitcoin" />
                    <span className="font-medium">Hợp đồng</span>
                  </div>
                  <span className="text-blue-600 font-semibold">Tải PDF</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-bitcoin" />
                    <span className="font-medium">Trạng thái</span>
                  </div>
                  <span className="text-green-600 font-semibold">Hoạt động</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}