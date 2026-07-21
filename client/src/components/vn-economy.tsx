import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Percent, Briefcase, Globe2, LineChart, Banknote } from "lucide-react";

interface Ind { key: string; label: string; unit: string; value: number | null; year: string | null }
interface VnEconomy { country: string; indicators: Ind[]; source: string; updatedAt: string }

const ICONS: Record<string, any> = {
  gdpGrowth: LineChart, gdp: DollarSign, gdpPerCapita: Banknote, cpi: Percent,
  unemployment: Briefcase, population: Users, exports: Globe2, fdi: TrendingUp,
};
const COLORS: Record<string, string> = {
  gdpGrowth: "from-green-500 to-emerald-600", gdp: "from-blue-500 to-indigo-600",
  gdpPerCapita: "from-cyan-500 to-blue-600", cpi: "from-amber-500 to-orange-600",
  unemployment: "from-rose-500 to-red-600", population: "from-purple-500 to-violet-600",
  exports: "from-teal-500 to-emerald-600", fdi: "from-fuchsia-500 to-pink-600",
};

function fmt(v: number | null, unit: string): string {
  if (v == null) return "—";
  if (unit === "%") return v.toFixed(2) + "%";
  if (unit === "người") return v >= 1e6 ? (v / 1e6).toFixed(1) + " triệu" : v.toLocaleString("vi-VN");
  if (unit === "USD") {
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + " tỷ";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + " triệu";
    return "$" + Math.round(v).toLocaleString("en-US");
  }
  return String(v);
}

export default function VnEconomy() {
  const { data, isLoading } = useQuery<VnEconomy>({
    queryKey: ["/api/vn-economy"],
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="dark:bg-gray-900 dark:border-gray-700"><CardContent className="h-28 animate-pulse" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🇻🇳</span>
          <h3 className="text-xl font-bold text-dark-slate dark:text-white">Kinh tế Việt Nam</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {data.source === "live" ? "World Bank · dữ liệu thật" : "Dữ liệu tham khảo"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.indicators.map((ind) => {
          const Icon = ICONS[ind.key] ?? LineChart;
          const color = COLORS[ind.key] ?? "from-gray-500 to-gray-600";
          return (
            <Card key={ind.key} className="dark:bg-gray-900 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{ind.label}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{fmt(ind.value, ind.unit)}</div>
                {ind.year && <div className="text-[11px] text-gray-400 mt-1">Năm {ind.year}</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
