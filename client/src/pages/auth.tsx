import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Users, Shield, Eye, EyeOff, Key } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(3, "Username tối thiểu 3 ký tự"),
  password: z.string().min(6, "Password tối thiểu 6 ký tự"),
  role: z.enum(["admin", "manager", "investor"]),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type AuthUser = {
  id: string;
  username: string;
  role: "admin" | "manager" | "investor";
  fullName: string;
  email?: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
};

export default function AuthManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<AuthUser[]>({
    queryKey: ["/api/users"],
    refetchInterval: 30000,
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      return await apiRequest("/api/users", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Thành công",
        description: "Tài khoản mới đã được tạo!",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo tài khoản",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<AuthUser> }) => {
      return await apiRequest(`/api/users/${data.id}`, "PATCH", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      editForm.reset();
      toast({
        title: "Thành công",
        description: "Tài khoản đã được cập nhật!",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật tài khoản",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/users/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Thành công",
        description: "Tài khoản đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa tài khoản",
        variant: "destructive",
      });
    },
  });

  const addForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "investor",
      fullName: "",
      email: "",
      status: "active",
    },
  });

  const editForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema.omit({ password: true }).extend({
      password: z.string().optional(),
    })),
    defaultValues: {
      username: "",
      password: "",
      role: "investor",
      fullName: "",
      email: "",
      status: "active",
    },
  });

  const onAddSubmit = async (values: z.infer<typeof userSchema>) => {
    addUserMutation.mutate(values);
  };

  const onEditSubmit = async (values: any) => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      updates: values,
    });
  };

  const handleEdit = (user: AuthUser) => {
    setEditingUser(user);
    editForm.reset({
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email || "",
      status: user.status,
    });
  };

  const handleDelete = (user: AuthUser) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.username}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    manager: "bg-purple-100 text-purple-800",
    investor: "bg-blue-100 text-blue-800",
    member: "bg-blue-100 text-blue-800",
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-auth-management">
      <Navigation />
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-dark-slate mb-4 flex items-center" data-testid="text-auth-title">
                <Shield className="mr-3 h-10 w-10 text-bitcoin" />
                Quản Lý Tài Khoản
              </h1>
              <p className="text-xl text-gray-600" data-testid="text-auth-description">
                Quản lý tài khoản và mật khẩu cho admin và thành viên
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-bitcoin to-bitcoin-light hover:from-bitcoin-light hover:to-bitcoin text-white" data-testid="button-add-user">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Tài Khoản
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm Tài Khoản Mới</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} data-testid="input-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="admin123" {...field} data-testid="input-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                {...field} 
                                data-testid="input-password" 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (tùy chọn)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@hhdcoin.net" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vai trò</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Chọn vai trò" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="investor">Investor</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addUserMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-bitcoin to-bitcoin-light hover:from-bitcoin-light hover:to-bitcoin text-white"
                        data-testid="button-submit-add"
                      >
                        {addUserMutation.isPending ? "Đang thêm..." : "Thêm"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng tài khoản</p>
                    <p className="text-2xl font-bold text-dark-slate">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-bitcoin" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admin</p>
                    <p className="text-2xl font-bold text-dark-slate">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Investor</p>
                    <p className="text-2xl font-bold text-dark-slate">
                      {users.filter(u => u.role === 'investor').length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hoạt động</p>
                    <p className="text-2xl font-bold text-dark-slate">
                      {users.filter(u => u.status === 'active').length}
                    </p>
                  </div>
                  <Key className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="text-center py-12" data-testid="loading-users">
              <div className="text-gray-500">Đang tải danh sách tài khoản...</div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Danh Sách Tài Khoản</CardTitle>
                <CardDescription>
                  Quản lý tất cả tài khoản admin và member trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Tài khoản</th>
                        <th className="text-left py-3 px-4">Vai trò</th>
                        <th className="text-left py-3 px-4">Trạng thái</th>
                        <th className="text-left py-3 px-4">Lần đăng nhập cuối</th>
                        <th className="text-left py-3 px-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50" data-testid={`user-row-${user.id}`}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-dark-slate">{user.fullName}</div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                              {user.email && (
                                <div className="text-sm text-gray-500">{user.email}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={roleColors[user.role] ?? roleColors.member}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Investor'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[user.status]}>
                              {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(user)}
                                data-testid={`button-edit-${user.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(user)}
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit User Dialog */}
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Chỉnh Sửa Tài Khoản</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-fullname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password mới (để trống nếu không đổi)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              {...field} 
                              data-testid="input-edit-password" 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-edit-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-role">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">Không hoạt động</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingUser(null)}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateUserMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-bitcoin to-bitcoin-light hover:from-bitcoin-light hover:to-bitcoin text-white"
                      data-testid="button-submit-edit"
                    >
                      {updateUserMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}