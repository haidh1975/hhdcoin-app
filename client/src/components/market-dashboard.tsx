import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Gauge, PieChart, Sparkles, Activity } from "lucide-react";

interface Mover { symbol: string; name: string; price: number; change24h: number; image?: string }
interface Stats {
  fearGreed: { value: number; label: string };
  btcDominance: number; ethDominance: number;
  totalMarketCap: number; marketCapChange24h: number;
  topGainers: Mover[]; topLosers: Mover[];
  aiSignal: { action: string; confidence: number; reason: string };
}

const fmtPrice = (p: number) => p >= 1 ? "$" + p.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "$" + p.toPrecision(2);
const fgColor = (v: number) => v <= 25 ? "#ef4444" : v <= 45 ? "#f97316" : v < 55 ? "#eab308" : v < 75 ? "#84cc16" : "#22c55e";

function MoverRow({ m, up }: { m: Mover; up: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {m.image ? <img src={m.image} alt="" className="w-6 h-6 rounded-full flex-shrink-0" /> : <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />}
        <div className="min-w-0">
          <div className="font-semibold text-sm text-gray-900 dark:text-white">{m.symbol}</div>
          <div className="text-xs text-gray-400 truncate">{m.name}</div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm text-gray-700 dark:text-gray-200">{fmtPrice(m.price)}</div>
        <div className={`text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
          {up ? "▲" : "▼"} {Math.abs(m.change24h).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export default function MarketDashboard() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["/api/market-stats"],
    refetchInterval: 90_000,
  });

  if (isLoading || !data) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="dark:bg-gray-900 dark:border-gray-700"><CardContent className="h-40 animate-pulse" /></Card>
        ))}
      </div>
    );
  }

  const fg = data.fearGreed;
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fear & Greed */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-500 dark:text-gray-400"><Gauge className="h-4 w-4" /> Fear &amp; Greed Index</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold" style={{ color: fgColor(fg.value) }}>{fg.value}</div>
              <div className="pb-1">
                <Badge style={{ backgroundColor: fgColor(fg.value) + "22", color: fgColor(fg.value) }} className="border-0">{fg.label}</Badge>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow" style={{ left: `calc(${fg.value}% - 6px)`, borderColor: fgColor(fg.value) }} />
            </div>
          </CardContent>
        </Card>

        {/* BTC Dominance */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-gray-500 dark:text-gray-400"><PieChart className="h-4 w-4" /> BTC Dominance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-bitcoin">{data.btcDominance}%</div>
            <div className="text-xs text-gray-400 mt-1">ETH: {data.ethDominance}%</div>
            <div className="mt-3 text-xs flex items-center gap-1">
              <span className="text-gray-400">Tổng vốn hóa:</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">${(data.totalMarketCap / 1e12).toFixed(2)}T</span>
              <span className={data.marketCapChange24h >= 0 ? "text-green-600" : "text-red-500"}>
                ({data.marketCapChange24h >= 0 ? "+" : ""}{data.marketCapChange24h}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Signal */}
        <Card className="dark:bg-gray-900 dark:border-gray-700 lg:col-span-2 bg-gradient-to-br from-bitcoin/5 to-blue-50 dark:from-gray-900 dark:to-gray-900">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-bitcoin"><Sparkles className="h-4 w-4" /> Tín hiệu AI (HHD-I)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.aiSignal.action}</div>
                <div className="text-xs text-gray-400 mt-1">Độ tin cậy: <span className="font-semibold text-bitcoin">{data.aiSignal.confidence}%</span></div>
              </div>
              <div className="flex-1 h-12 w-px bg-gray-200 dark:bg-gray-700" />
              <p className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{data.aiSignal.reason}</p>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">* Mô hình quy tắc dựa trên Fear&amp;Greed + xu hướng — chỉ tham khảo, không phải lời khuyên đầu tư.</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Gainers / Losers */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-green-600"><TrendingUp className="h-5 w-5" /> Top tăng giá (24h)</CardTitle></CardHeader>
          <CardContent className="pt-0">{data.topGainers.map((m, i) => <MoverRow key={i} m={m} up />)}</CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-red-500"><TrendingDown className="h-5 w-5" /> Top giảm giá (24h)</CardTitle></CardHeader>
          <CardContent className="pt-0">{data.topLosers.map((m, i) => <MoverRow key={i} m={m} up={false} />)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
