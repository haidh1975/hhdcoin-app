import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InvestmentPackages from "./investment-packages";
import InvestorsTable from "./investors-table";

export default function InvestmentSection() {
  const { t } = useLanguage();

  return (
    <section id="investment" className="py-16 bg-white" data-testid="section-investment">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-investment-title">
            {t('investment.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-investment-description">
            {t('investment.description')}
          </p>
        </div>

        <Tabs defaultValue="packages" className="w-full" data-testid="tabs-investment">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg" data-testid="tabs-list-investment">
            <TabsTrigger 
              value="packages" 
              className="flex items-center gap-2 text-sm font-medium py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-bitcoin data-[state=active]:shadow-sm"
              data-testid="tab-packages"
            >
              <Package className="h-4 w-4" />
              {t('investment.tabs.packages')}
            </TabsTrigger>
            <TabsTrigger 
              value="investors" 
              className="flex items-center gap-2 text-sm font-medium py-3 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-bitcoin data-[state=active]:shadow-sm"
              data-testid="tab-investors"
            >
              <Users className="h-4 w-4" />
              {t('investment.tabs.investors')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="packages" className="mt-6" data-testid="tab-content-packages">
            <div className="space-y-8">
              <div className="packages-content bg-gray-50 p-8 rounded-lg">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-dark-slate mb-4">
                    {t('packages.title')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {t('packages.description')}
                  </p>
                </div>
                <InvestmentPackages />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="investors" className="mt-6" data-testid="tab-content-investors">
            <div className="space-y-8">
              <div className="investors-content bg-gray-50 p-8 rounded-lg">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-dark-slate mb-4">
                    {t('investors.title')}
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {t('investors.description')}
                  </p>
                </div>
                <InvestorsTable />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}