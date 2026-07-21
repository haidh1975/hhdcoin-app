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
import { Bitcoin, Eye, EyeOff, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Create login schema with translation function  
const createLoginSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(3, t('login.username_min_error')),
  password: z.string().min(6, t('login.password_min_error')),
});

type LoginFormData = {
  username: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginSchema = createLoginSchema(t);
  
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
        title: t('login.success_title'),
        description: t('login.success_description'),
      });
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bitcoin/5 via-white to-emerald-50 flex items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-bitcoin font-medium transition-colors" data-testid="link-back-home">
        <ArrowLeft className="h-4 w-4" />
        {t('login.back_home')}
      </Link>
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-bitcoin rounded-xl flex items-center justify-center">
            <Bitcoin className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-dark-slate">
              {t('login.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('login.subtitle')}
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
                    <FormLabel>{t('login.username_label')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('login.username_placeholder')}
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
                    <FormLabel>{t('login.password_label')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t('login.password_placeholder')}
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
                    <span>{t('login.logging_in')}</span>
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('login.login_button')}
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
                <span className="bg-white px-2 text-gray-500">{t('login.or')}</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {t('login.no_account')}{" "}
              <Link href="/register">
                <a className="text-bitcoin hover:text-bitcoin/80 font-semibold" data-testid="link-register">
                  {t('login.register_now')}
                </a>
              </Link>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}