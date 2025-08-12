import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Package, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2,
  BarChart3,
  FileText,
  Shield
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import type { InvestmentPackage, CommunityMember } from "@shared/schema";

const packageSchema = z.object({
  name: z.string().min(1, "Tên gói là bắt buộc"),
  minInvestment: z.string().min(1, "Số tiền đầu tư tối thiểu là bắt buộc"),
  minRate: z.string().min(1, "Lãi suất tối thiểu là bắt buộc"),
  maxRate: z.string().min(1, "Lãi suất tối đa là bắt buộc"),
  features: z.string().min(1, "Tính năng là bắt buộc"),
  recommended: z.string().default("0")
});

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);

  const { data: packages } = useQuery<InvestmentPackage[]>({
    queryKey: ["/api/investment-packages"],
  });

  const { data: communityMembers } = useQuery<CommunityMember[]>({
    queryKey: ["/api/community-members"],
  });

  const packageForm = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      minInvestment: "",
      minRate: "",
      maxRate: "",
      features: "",
      recommended: "0"
    },
  });

  const addPackageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof packageSchema>) => {
      const packageData = {
        ...data,
        features: data.features.split(",").map(f => f.trim()),
        recommended: parseInt(data.recommended)
      };
      return await apiRequest("/api/investment-packages", "POST", packageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investment-packages"] });
      setIsPackageDialogOpen(false);
      packageForm.reset();
      toast({
        title: "Thành công",
        description: "Gói đầu tư mới đã được thêm!",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thêm gói đầu tư",
        variant: "destructive",
      });
    },
  });

  const onSubmitPackage = (values: z.infer<typeof packageSchema>) => {
    addPackageMutation.mutate(values);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-dark-slate" data-testid="text-admin-title">
              Quản lý Website HHDcoin
            </h1>
            <p className="text-gray-600">Cập nhật nội dung và quản lý dữ liệu</p>
          </div>
          <Badge variant="outline" className="bg-bitcoin text-white">
            <Shield className="mr-2 h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gói Đầu Tư
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cộng Đồng
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Thống Kê
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nội Dung
            </TabsTrigger>
          </TabsList>

          {/* Quản lý Gói Đầu Tư */}
          <TabsContent value="packages" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Quản lý Gói Đầu Tư</CardTitle>
                  <p className="text-sm text-gray-600">Thêm, chỉnh sửa và quản lý các gói đầu tư</p>
                </div>
                <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-bitcoin text-white" data-testid="button-add-package">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm Gói Mới
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Thêm Gói Đầu Tư Mới</DialogTitle>
                    </DialogHeader>
                    <Form {...packageForm}>
                      <form onSubmit={packageForm.handleSubmit(onSubmitPackage)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={packageForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên gói *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Gói Premium" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={packageForm.control}
                            name="recommended"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gói đề xuất</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="0">Không</SelectItem>
                                    <SelectItem value="1">Có</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={packageForm.control}
                            name="minInvestment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Đầu tư tối thiểu (VNĐ) *</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="50000000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={packageForm.control}
                            name="minRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lãi suất tối thiểu (%) *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="8.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={packageForm.control}
                            name="maxRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lãi suất tối đa (%) *</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="12.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={packageForm.control}
                          name="features"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tính năng (phân cách bằng dấu phẩy) *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Hỗ trợ 24/7, Báo cáo hàng tuần, Tư vấn chuyên gia"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsPackageDialogOpen(false)}
                          >
                            Hủy
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-bitcoin text-white"
                            disabled={addPackageMutation.isPending}
                          >
                            {addPackageMutation.isPending ? "Đang thêm..." : "Thêm Gói"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages?.map((pkg) => (
                    <Card key={pkg.id} className="relative" data-testid={`card-package-${pkg.id}`}>
                      {pkg.recommended === 1 && (
                        <Badge className="absolute -top-2 -right-2 bg-bitcoin text-white">
                          Đề xuất
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className="text-2xl font-bold text-bitcoin">
                          {formatCurrency(pkg.minInvestment)}+
                        </div>
                        <p className="text-sm text-gray-600">
                          Lãi suất: {pkg.minRate}% - {pkg.maxRate}%
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {pkg.features?.map((feature, index) => (
                            <li key={index} className="text-sm flex items-center">
                              <div className="w-2 h-2 bg-bitcoin rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quản lý Cộng Đồng */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý Thành Viên Cộng Đồng</CardTitle>
                <p className="text-sm text-gray-600">Xem và quản lý thành viên cộng đồng</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityMembers?.map((member) => (
                    <Card key={member.id} data-testid={`card-member-${member.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{member.fullName}</h3>
                          <Badge variant="outline">{member.memberLevel}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{member.occupation}</p>
                        <p className="text-sm mb-2">{member.location}</p>
                        <div className="flex justify-between text-sm">
                          <span>Điểm: {member.points}</span>
                          <span>Cấp độ: {member.experienceLevel}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thống kê */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng Gói Đầu Tư</p>
                      <p className="text-2xl font-bold">{packages?.length || 0}</p>
                    </div>
                    <Package className="h-8 w-8 text-bitcoin" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Thành Viên</p>
                      <p className="text-2xl font-bold">{communityMembers?.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Gói Đề Xuất</p>
                      <p className="text-2xl font-bold">
                        {packages?.filter(p => p.recommended === 1).length || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Thành Viên Vàng+</p>
                      <p className="text-2xl font-bold">
                        {communityMembers?.filter(m => 
                          m.memberLevel === "Gold" || m.memberLevel === "Diamond"
                        ).length || 0}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quản lý Nội dung */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý Nội Dung Website</CardTitle>
                <p className="text-sm text-gray-600">Cập nhật thông tin và nội dung trang web</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Thông Tin Liên Hệ</h3>
                    <p className="text-sm text-gray-600 mb-2">Cập nhật thông tin liên hệ trong footer</p>
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Social Media Links</h3>
                    <p className="text-sm text-gray-600 mb-2">Cập nhật liên kết Facebook, Zalo</p>
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Thông Báo Hệ Thống</h3>
                    <p className="text-sm text-gray-600 mb-2">Thêm thông báo quan trọng</p>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm Thông Báo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}