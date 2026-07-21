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
import { Bitcoin, Eye, EyeOff, UserPlus, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Create register schema with translation function
const createRegisterSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(3, t('register.username_min_error')),
  password: z.string().min(6, t('register.password_min_error')),
  confirmPassword: z.string(),
  fullName: z.string().min(2, t('register.full_name_min_error')),
  email: z.string().email(t('register.email_invalid_error')).optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('register.password_mismatch_error'),
  path: ["confirmPassword"],
});

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email?: string;
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const registerSchema = createRegisterSchema(t);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    const success = await register({
      ...registerData,
      email: data.email || undefined,
      role: "investor", // Default role for registration
    });
    
    if (success) {
      toast({
        title: t('register.success_title'),
        description: t('register.success_description'),
      });
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bitcoin/5 via-white to-emerald-50 flex items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-bitcoin font-medium transition-colors" data-testid="link-back-home">
        <ArrowLeft className="h-4 w-4" />
        {t('register.back_home')}
      </Link>
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-bitcoin rounded-xl flex items-center justify-center">
            <Bitcoin className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-dark-slate">
              {t('register.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('register.subtitle')}
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.full_name_label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('register.full_name_placeholder')}
                        data-testid="input-fullname"
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.username_label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('register.username_placeholder')}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.email_label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('register.email_placeholder')}
                        data-testid="input-email"
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
                    <FormLabel>{t('register.password_label')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t('register.password_placeholder')}
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('register.confirm_password_label')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('register.confirm_password_placeholder')}
                          data-testid="input-confirm-password"
                          className="h-12 pr-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? (
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
                data-testid="button-register"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>{t('register.registering')}</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('register.register_button')}
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              {t('register.have_account')}{" "}
              <Link href="/login">
                <a className="text-bitcoin hover:text-bitcoin/80 font-semibold" data-testid="link-login">
                  {t('register.login_now')}
                </a>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}