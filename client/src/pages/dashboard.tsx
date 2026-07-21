import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, TrendingUp, DollarSign, Shield, User, Calendar, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-slate" data-testid="text-dashboard-title">
                {t('dashboard.welcome', { name: user?.fullName ?? '' })}
              </h1>
              <p className="text-gray-600">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="bg-bitcoin text-white">
                <Shield className="mr-1 h-3 w-3" />
                {user?.role === "admin" ? t('dashboard.admin') : t('dashboard.member')}
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                {t('dashboard.logout')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.account_info')}
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.username}</div>
              <p className="text-xs text-muted-foreground">
                {user?.email || t('dashboard.email_not_updated')}
              </p>
            </CardContent>
          </Card>

          {/* Bitcoin Price Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.current_bitcoin_price')}
              </CardTitle>
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$112,300</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">↗ +2.45%</span> (24h)
              </p>
            </CardContent>
          </Card>

          {/* Portfolio Value */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.portfolio_value')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫0</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.no_investments')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
              <CardDescription>
                {t('dashboard.frequent_features')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/investment-packages">
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-packages">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('dashboard.view_packages')}
                </Button>
              </Link>
              
              <Link href="/analysis">
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-analysis">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('dashboard.market_analysis')}
                </Button>
              </Link>

              <Link href="/community">
                <Button className="w-full justify-start" variant="outline" data-testid="button-view-community">
                  <User className="mr-2 h-4 w-4" />
                  {t('dashboard.community')}
                </Button>
              </Link>

              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button className="w-full justify-start bg-bitcoin hover:bg-bitcoin/90" data-testid="button-admin-panel">
                    <Shield className="mr-2 h-4 w-4" />
                    {t('dashboard.admin_panel')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.account_details')}</CardTitle>
              <CardDescription>
                {t('dashboard.personal_info')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.account')}</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.full_name')}</span>
                <span className="font-medium">{user?.fullName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.email')}</span>
                <span className="font-medium">{user?.email || t('dashboard.not_updated')}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.role')}</span>
                <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                  {user?.role === "admin" ? t('dashboard.administrator') : t('dashboard.member_role')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('dashboard.status')}</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {t('dashboard.active')}
                </Badge>
              </div>

              <Button className="w-full mt-4" variant="outline" data-testid="button-account-settings">
                <Settings className="mr-2 h-4 w-4" />
                {t('dashboard.account_settings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}