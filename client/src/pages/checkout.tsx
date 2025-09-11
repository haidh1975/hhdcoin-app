import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation, useSearch } from "wouter";
import { Bitcoin, Shield, CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  console.error('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
  // Handle gracefully - show error to user instead of crashing
}
const stripePromise = loadStripe(stripePublicKey);

interface InvestmentPackage {
  id: string;
  name: string;
  minInvestment: string;
  minRate: string;
  maxRate: string;
  features: string[];
  recommended: number;
}

const CheckoutForm = ({ 
  packageData, 
  amount 
}: { 
  packageData: InvestmentPackage;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: "Thanh toán thất bại",
          description: error.message || "Có lỗi xảy ra trong quá trình thanh toán",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi không xác định xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bitcoin className="mr-2 h-5 w-5 text-bitcoin" />
            Chi tiết gói đầu tư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-dark-slate">{packageData.name}</span>
            {packageData.recommended === 1 && (
              <Badge className="bg-bitcoin text-white">Được đề xuất</Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Lợi nhuận dự kiến: {packageData.minRate}% - {packageData.maxRate}%</div>
            <div>• Đầu tư tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(packageData.minInvestment))}</div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Số tiền đầu tư:</span>
              <span className="text-bitcoin">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="mr-2 h-5 w-5" />
            Thông tin thanh toán
          </CardTitle>
          <CardDescription>
            Thanh toán an toàn được bảo vệ bởi Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <PaymentElement />
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Thông tin thanh toán của bạn được mã hóa và bảo mật bởi Stripe.
              Chúng tôi không lưu trữ thông tin thẻ của bạn.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full mt-6 h-12 bg-bitcoin hover:bg-bitcoin/90 text-white font-semibold"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Đang xử lý thanh toán...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận thanh toán {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [packageData, setPackageData] = useState<InvestmentPackage | null>(null);
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const search = useSearch();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Parse URL parameters
  const searchParams = new URLSearchParams(search);
  const packageId = searchParams.get('package');
  const customAmount = searchParams.get('amount');

  const { data: packages } = useQuery<InvestmentPackage[]>({
    queryKey: ["/api/investment-packages"],
  });

  useEffect(() => {
    // Allow checkout without authentication for guest users
    if (!packageId || !packages) {
      return;
    }

    const selectedPackage = packages.find(p => p.id === packageId);
    if (!selectedPackage) {
      toast({
        title: "Gói đầu tư không tồn tại",
        description: "Vui lòng chọn gói đầu tư hợp lệ",
        variant: "destructive",
      });
      setLocation('/investment-packages');
      return;
    }

    const investmentAmount = customAmount 
      ? parseInt(customAmount)
      : parseInt(selectedPackage.minInvestment);

    if (investmentAmount < parseInt(selectedPackage.minInvestment)) {
      toast({
        title: "Số tiền đầu tư không hợp lệ",
        description: `Số tiền tối thiểu cho gói này là ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(selectedPackage.minInvestment))}`,
        variant: "destructive",
      });
      setLocation('/investment-packages');
      return;
    }

    setPackageData(selectedPackage);
    setAmount(investmentAmount);

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      packageId: packageId,
      amount: investmentAmount, // VND amount as-is (zero-decimal currency)
      currency: "vnd"
    })
    .then(async (response) => {
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setIsLoading(false);
    })
    .catch((error) => {
      console.error("Payment intent error:", error);
      toast({
        title: "Lỗi tạo thanh toán",
        description: "Không thể khởi tạo thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
      setLocation('/investment-packages');
    });
  }, [packageId, customAmount, packages, isAuthenticated, setLocation, toast]);

  // Allow both authenticated users and guest checkout

  if (isLoading || !packageData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-bitcoin border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi thanh toán</h1>
            <p className="text-gray-600 mb-6">Không thể khởi tạo thanh toán. Vui lòng thử lại.</p>
            <Button 
              onClick={() => setLocation('/investment-packages')}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
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
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/investment-packages')}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-dark-slate mb-2">
                Thanh toán đầu tư Bitcoin
              </h1>
              <p className="text-gray-600">
                Hoàn tất thanh toán để bắt đầu hành trình đầu tư của bạn
              </p>
            </div>
          </div>

          {/* Make SURE to wrap the form in <Elements> which provides the stripe context. */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm packageData={packageData} amount={amount} />
          </Elements>
        </div>
      </div>
    </div>
  );
}