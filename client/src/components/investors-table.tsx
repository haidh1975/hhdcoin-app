import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, TrendingDown, DollarSign, UserPlus, ExternalLink, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInvestorSchema, type Investor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { SiFacebook } from "react-icons/si";

export default function InvestorsTable() {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: investors, isLoading } = useQuery<Investor[]>({
    queryKey: ["/api/investors"],
  });

  const addInvestorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertInvestorSchema>) => {
      return await apiRequest("/api/investors", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investors"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Nhà đầu tư mới đã được thêm vào hệ thống!",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm nhà đầu tư",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertInvestorSchema>>({
    resolver: zodResolver(insertInvestorSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      facebookUrl: "",
      zaloPhone: "",
      investmentAmount: "",
      bitcoinCode: "",
      status: "active",
    },
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

  const onSubmit = async (values: z.infer<typeof insertInvestorSchema>) => {
    addInvestorMutation.mutate(values);
  };

  const generateBitcoinCode = () => {
    const prefix = "BTC";
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    return `${prefix}${randomNum}`;
  };

  return (
    <div data-testid="investors-table">
      {/* Header with Add Investor Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-dark-slate">Danh sách nhà đầu tư</h2>
          <p className="text-gray-600">Quản lý thông tin các nhà đầu tư Bitcoin</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-bitcoin text-white hover:bg-bitcoin-light"
              data-testid="button-add-investor"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Thêm nhà đầu tư
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm nhà đầu tư mới</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} data-testid="input-investor-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} data-testid="input-investor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại *</FormLabel>
                        <FormControl>
                          <Input placeholder="0987654321" {...field} data-testid="input-investor-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="investmentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền đầu tư (VNĐ) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000000" {...field} data-testid="input-investment-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-dark-slate">Thông tin liên hệ mạng xã hội</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <SiFacebook className="mr-2 h-4 w-4 text-blue-600" />
                            Facebook URL
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://facebook.com/username" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-facebook-url" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zaloPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                            Zalo (Số điện thoại)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0987654321" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-zalo-phone" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="bitcoinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Bitcoin *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="BTC123456" 
                            {...field} 
                            data-testid="input-bitcoin-code" 
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => field.onChange(generateBitcoinCode())}
                            data-testid="button-generate-code"
                          >
                            Tạo mã
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-investor"
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-bitcoin text-white"
                    disabled={addInvestorMutation.isPending}
                    data-testid="button-submit-investor"
                  >
                    {addInvestorMutation.isPending ? "Đang thêm..." : "Thêm nhà đầu tư"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
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
                    <TableHead>Liên hệ</TableHead>
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
                      <TableCell data-testid={`text-contact-${investor.id}`}>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm">{investor.phone}</div>
                          <div className="flex gap-2">
                            {investor.facebookUrl && (
                              <a 
                                href={investor.facebookUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="Facebook"
                              >
                                <SiFacebook className="h-4 w-4" />
                              </a>
                            )}
                            {investor.zaloPhone && (
                              <a 
                                href={`https://zalo.me/${investor.zaloPhone}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                                title="Zalo"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
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