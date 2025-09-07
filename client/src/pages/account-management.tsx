import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, BarChart3, Wallet, Settings, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function AccountManagement() {
  const { t } = useLanguage();

  const investmentData = [
    {
      id: "INV001",
      amount: "50,000,000 VND",
      date: "15/12/2024",
      duration: "6 tháng",
      rate: "8.5%",
      status: "Hoạt động",
      currentValue: "54,250,000 VND",
      profit: "+4,250,000 VND"
    },
    {
      id: "INV002",
      amount: "30,000,000 VND",
      date: "01/11/2024",
      duration: "12 tháng",
      rate: "9.2%",
      status: "Hoạt động",
      currentValue: "32,760,000 VND",
      profit: "+2,760,000 VND"
    }
  ];

  const totalInvestment = "80,000,000 VND";
  const totalCurrentValue = "87,010,000 VND";
  const totalProfit = "+7,010,000 VND";

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white py-20" data-testid="section-account-hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="text-account-title">
            {t('account.title')}
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Theo dõi và quản lý toàn bộ hoạt động đầu tư Bitcoin của bạn một cách dễ dàng
          </p>
        </div>
      </section>

      <section className="py-16" data-testid="section-account-overview">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-overview-title">
              Tổng quan tài khoản
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center" data-testid="card-total-investment">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Wallet className="h-6 w-6 text-bitcoin" />
                    Tổng đầu tư
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{totalInvestment}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center" data-testid="card-current-value">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Giá trị hiện tại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{totalCurrentValue}</p>
                </CardContent>
              </Card>
              
              <Card className="text-center" data-testid="card-total-profit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    Tổng lãi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{totalProfit}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16" data-testid="section-investment-history">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-history-title">
              Lịch sử đầu tư
            </h2>
            
            <div className="space-y-6">
              {investmentData.map((investment, index) => (
                <Card key={investment.id} className="hover:shadow-lg transition-shadow" data-testid={`card-investment-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-bitcoin" />
                        <span>Hợp đồng {investment.id}</span>
                      </div>
                      <Badge variant={investment.status === 'Hoạt động' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Số tiền đầu tư</p>
                        <p className="font-semibold text-lg">{investment.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
                        <p className="font-semibold">{investment.date}</p>
                        <p className="text-sm text-gray-500">{investment.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Lãi suất</p>
                        <p className="font-semibold text-bitcoin">{investment.rate}/năm</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Giá trị hiện tại</p>
                        <p className="font-semibold text-lg text-green-600">{investment.currentValue}</p>
                        <p className="text-sm text-green-600">{investment.profit}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button size="sm" variant="outline" data-testid={`button-download-${index}`}>
                        Tải hợp đồng
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-details-${index}`}>
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" data-testid="section-account-actions">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8" data-testid="text-actions-title">
              Thao tác tài khoản
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-bitcoin hover:bg-bitcoin-light px-8 py-3 text-lg" data-testid="button-new-investment">
                <BarChart3 className="mr-2 h-5 w-5" />
                Đầu tư mới
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg" data-testid="button-withdrawal">
                <Wallet className="mr-2 h-5 w-5" />
                Yêu cầu rút vốn
              </Button>
              <Button variant="outline" className="px-8 py-3 text-lg" data-testid="button-settings">
                <Settings className="mr-2 h-5 w-5" />
                Cài đặt tài khoản
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}