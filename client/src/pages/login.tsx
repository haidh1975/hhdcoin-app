import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Bitcoin, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Password phải có ít nhất 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.username, data.password);
    if (success) {
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn trở lại HHDcoin.",
      });
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bitcoin/5 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-bitcoin rounded-xl flex items-center justify-center">
            <Bitcoin className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-dark-slate">
              Đăng nhập HHDcoin
            </CardTitle>
            <CardDescription className="text-gray-600">
              Truy cập vào tài khoản đầu tư Bitcoin của bạn
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tài khoản</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập tài khoản của bạn"
                        data-testid="input-username"
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu của bạn"
                          data-testid="input-password"
                          className="h-12 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-bitcoin hover:bg-bitcoin/90 text-white font-semibold"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link href="/register">
                <a className="text-bitcoin hover:text-bitcoin/80 font-semibold" data-testid="link-register">
                  Đăng ký ngay
                </a>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Tài khoản demo:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Member:</strong> member1 / member123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}