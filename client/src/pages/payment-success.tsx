import { useEffect, useState } from "react";
import { useSearch, useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Bitcoin, ArrowRight, Download, Home } from "lucide-react";
import Navigation from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function PaymentSuccess() {
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const search = useSearch();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Parse URL parameters from Stripe redirect
  const searchParams = new URLSearchParams(search);
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentStatus = searchParams.get('redirect_status');

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }

    // In a real app, you might fetch payment details from your backend
    // For now, we'll simulate payment details
    if (paymentIntentId && paymentStatus === 'succeeded') {
      setPaymentDetails({
        id: paymentIntentId,
        amount: 50000000, // This would come from your backend
        packageName: "Gói Cao cấp", // This would come from your backend
        currency: "VND",
        status: "completed",
        date: new Date().toISOString()
      });
    }
  }, [user, paymentIntentId, paymentStatus, setLocation]);

  if (!user) {
    return null;
  }

  if (!paymentDetails || paymentStatus !== 'succeeded') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">✗</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Thanh toán không thành công
              </h1>
              <p className="text-gray-600 mb-6">
                Có vẻ như thanh toán của bạn gặp sự cố. Vui lòng thử lại.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setLocation('/investment-packages')}
                  variant="outline"
                >
                  Thử lại
                </Button>
                <Button onClick={() => setLocation('/dashboard')}>
                  Về Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-dark-slate mb-2">
              Thanh toán thành công! 🎉
            </h1>
            <p className="text-gray-600 text-lg">
              Chúc mừng bạn đã bắt đầu hành trình đầu tư Bitcoin cùng HHDcoin
            </p>
          </div>

          {/* Payment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bitcoin className="mr-2 h-5 w-5 text-bitcoin" />
                Chi tiết thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Gói đầu tư</p>
                  <p className="font-semibold">{paymentDetails.packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số tiền</p>
                  <p className="font-semibold text-bitcoin">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(paymentDetails.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã giao dịch</p>
                  <p className="font-mono text-sm text-gray-800">
                    {paymentDetails.id.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <Badge className="bg-green-100 text-green-800">
                    Thành công
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Thời gian thanh toán</p>
                <p className="text-sm">
                  {new Date(paymentDetails.date).toLocaleString('vi-VN')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bước tiếp theo</CardTitle>
              <CardDescription>
                Những gì sẽ xảy ra sau khi bạn thanh toán thành công
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-bitcoin rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Xác nhận đầu tư</p>
                  <p className="text-sm text-gray-600">
                    Chúng tôi sẽ xử lý khoản đầu tư của bạn trong vòng 24 giờ
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-bitcoin rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Gửi thông báo email</p>
                  <p className="text-sm text-gray-600">
                    Bạn sẽ nhận được email xác nhận và hướng dẫn chi tiết
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-bitcoin rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Theo dõi đầu tư</p>
                  <p className="text-sm text-gray-600">
                    Truy cập dashboard để theo dõi hiệu suất đầu tư của bạn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-bitcoin hover:bg-bitcoin/90" data-testid="button-go-dashboard">
                <Home className="mr-2 h-4 w-4" />
                Về Dashboard
              </Button>
            </Link>
            
            <Link href="/investment-packages" className="flex-1">
              <Button variant="outline" className="w-full" data-testid="button-view-packages">
                <ArrowRight className="mr-2 h-4 w-4" />
                Xem thêm gói khác
              </Button>
            </Link>
          </div>

          {/* Support Contact */}
          <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Có câu hỏi về khoản đầu tư của bạn?{" "}
              <Link href="/contact">
                <a className="text-bitcoin hover:text-bitcoin/80 font-medium">
                  Liên hệ với chúng tôi
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}