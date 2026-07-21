import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle, Rocket, Globe, Shield, TrendingUp } from "lucide-react";

const PHASES = [
  {
    phase: "Phase 1",
    name: "Nền tảng",
    timeline: "Q1–Q2 2026",
    status: "in-progress",
    exchange: null,
    milestones: [
      { done: true, text: "Nghiên cứu thị trường & whitepaper v1.0" },
      { done: true, text: "Thiết kế smart contract (HHDToken.sol, HHDStaking.sol)" },
      { done: false, text: "Kiểm toán bảo mật CertiK + PeckShield" },
      { done: false, text: "Cấu trúc pháp lý: Cayman Foundation + Singapore Pte Ltd" },
      { done: false, text: "Đóng vòng Seed ($250K @ $0.005)" },
      { done: false, text: "KYC toàn bộ đội ngũ" },
    ],
  },
  {
    phase: "Phase 2",
    name: "Ra mắt",
    timeline: "Q3–Q4 2026",
    status: "upcoming",
    exchange: "PancakeSwap + MEXC",
    milestones: [
      { done: false, text: "Triển khai mainnet BNB Smart Chain" },
      { done: false, text: "PancakeSwap DEX listing — $150K thanh khoản khóa 12 tháng" },
      { done: false, text: "Đóng vòng Private A ($320K) + Private B ($400K)" },
      { done: false, text: "Public Sale / MEXC IEO" },
      { done: false, text: "Ra mắt dApp v1.0 + Staking" },
      { done: false, text: "CoinGecko & CoinMarketCap listing" },
      { done: false, text: "100K thành viên cộng đồng" },
    ],
  },
  {
    phase: "Phase 3",
    name: "Tăng trưởng",
    timeline: "2027",
    status: "upcoming",
    exchange: "KuCoin + Bybit",
    milestones: [
      { done: false, text: "Ra mắt HHD Research DAO" },
      { done: false, text: "NFT Credential Chain — cấp bằng on-chain" },
      { done: false, text: "Cross-chain bridge BSC ↔ Ethereum (wHHD)" },
      { done: false, text: "Governance v2 — DAO bỏ phiếu on-chain" },
      { done: false, text: "KuCoin listing (Target: $30M+ market cap)" },
      { done: false, text: "Bybit listing (Target: $50M+ market cap)" },
      { done: false, text: "2M thành viên cộng đồng" },
    ],
  },
  {
    phase: "Phase 4",
    name: "Mở rộng",
    timeline: "2028",
    status: "upcoming",
    exchange: "OKX + Binance",
    milestones: [
      { done: false, text: "OKX listing (Target: $80M+ market cap)" },
      { done: false, text: "Ra mắt HHDAI 3.0 — nền tảng AI nghiên cứu" },
      { done: false, text: "HHD DigiX Program cho SME Việt Nam" },
      { done: false, text: "$100M+ market cap duy trì 90 ngày" },
      { done: false, text: "Nộp đơn xin listing Binance" },
      { done: false, text: "Market maker chuyên nghiệp (Wintermute/GSR)" },
    ],
  },
  {
    phase: "Phase 5",
    name: "Dẫn đầu khu vực",
    timeline: "2029–2030",
    status: "upcoming",
    exchange: "Coinbase",
    milestones: [
      { done: false, text: "Coinbase listing (Q4 2028 target)" },
      { done: false, text: "20M người dùng toàn cầu" },
      { done: false, text: "Dẫn đầu knowledge economy token ASEAN" },
      { done: false, text: "$1B+ market cap target" },
      { done: false, text: "50+ đại học đối tác tại 15 quốc gia" },
    ],
  },
];

const EXCHANGE_TIMELINE = [
  { q: "Q3 2026", exchange: "PancakeSwap", tier: "DEX", color: "bg-yellow-500", req: "Self-listing · $150K liquidity" },
  { q: "Q4 2026", exchange: "MEXC Global", tier: "Tier 3", color: "bg-orange-500", req: "5K holders · $5M MC · Full audit" },
  { q: "Q1 2027", exchange: "Gate.io", tier: "Tier 3", color: "bg-orange-500", req: "10K holders · $10M MC · CertiK" },
  { q: "Q1 2027", exchange: "BitMart", tier: "Tier 3", color: "bg-orange-400", req: "3K holders · $5M MC" },
  { q: "Q3 2027", exchange: "KuCoin", tier: "Tier 2", color: "bg-blue-500", req: "100K holders · $30M MC · DAO active" },
  { q: "Q4 2027", exchange: "Bybit", tier: "Tier 2", color: "bg-blue-600", req: "200K holders · $50M MC · Market maker" },
  { q: "Q1 2028", exchange: "OKX", tier: "Tier 1.5", color: "bg-purple-600", req: "500K holders · $80M MC · Legal opinion" },
  { q: "Q3 2028", exchange: "Binance", tier: "Tier 1", color: "bg-bitcoin", req: "$100M MC · $5M+/day volume · 36-month plan" },
  { q: "Q4 2028", exchange: "Coinbase", tier: "Tier 1", color: "bg-blue-700", req: "Free merit-based · non-security opinion" },
];

const STATUS_ICON = {
  done: CheckCircle2,
  "in-progress": Clock,
  upcoming: Circle,
};

const STATUS_COLOR = {
  done: "text-green-500",
  "in-progress": "text-bitcoin",
  upcoming: "text-gray-400",
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30">
            <Rocket className="w-3 h-3 mr-1 inline" /> Lộ trình 2026–2030
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Lộ trình phát triển <span className="text-bitcoin">HHD Coin</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Từ DEX ra mắt tới Binance & Coinbase trong 36 tháng — Lộ trình minh bạch, có thể kiểm chứng
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-xl p-4">
              <Rocket className="w-6 h-6 text-bitcoin mx-auto mb-2" />
              <div className="font-bold">Q3 2026</div>
              <div className="text-sm text-gray-300">DEX Launch</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="font-bold">2027</div>
              <div className="text-sm text-gray-300">Tier 2 CEX</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="font-bold">Q3 2028</div>
              <div className="text-sm text-gray-300">Binance</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="font-bold">2030</div>
              <div className="text-sm text-gray-300">$1B Target</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Phase Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Các giai đoạn phát triển</h2>
          <div className="space-y-6">
            {PHASES.map((p, i) => {
              const isActive = p.status === "in-progress";
              return (
                <div key={i} className="flex gap-4">
                  {/* Left: connector */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isActive ? "bg-bitcoin text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                      {i + 1}
                    </div>
                    {i < PHASES.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                  </div>

                  {/* Right: content */}
                  <Card className={`flex-1 mb-6 dark:bg-gray-900 dark:border-gray-700 ${isActive ? "ring-2 ring-bitcoin" : ""}`}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="dark:text-white text-lg">{p.phase}: {p.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{p.timeline}</Badge>
                        {p.exchange && (
                          <Badge className="bg-bitcoin/10 text-bitcoin border-bitcoin/30 text-xs">
                            {p.exchange}
                          </Badge>
                        )}
                        {isActive && <Badge className="bg-green-100 text-green-800 text-xs">Đang thực hiện</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {p.milestones.map((m, j) => {
                          const Icon = m.done ? CheckCircle2 : (isActive && j < 3 ? Clock : Circle);
                          return (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${m.done ? "text-green-500" : (isActive && j < 2 ? "text-bitcoin" : "text-gray-400")}`} />
                              <span className={m.done ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"}>{m.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exchange Listing Timeline */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Lộ trình listing sàn giao dịch</CardTitle>
            <p className="text-sm text-gray-500">DEX → Tier 3 → Tier 2 → Tier 1 (Binance + Coinbase)</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Thời gian</th>
                    <th className="pb-3 font-medium">Sàn</th>
                    <th className="pb-3 font-medium">Hạng</th>
                    <th className="pb-3 font-medium">Yêu cầu chính</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {EXCHANGE_TIMELINE.map((ex, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{ex.q}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ex.color}`} />
                          <span className="font-semibold text-gray-900 dark:text-white">{ex.exchange}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className={`${ex.color} text-white border-0 text-xs`}>{ex.tier}</Badge>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-400 text-xs">{ex.req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
