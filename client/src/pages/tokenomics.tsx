import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Coins, TrendingUp, Lock, Flame, Vote, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TOKEN_ALLOCATIONS = [
  { name: "Hệ sinh thái Giáo dục", nameEn: "Education Ecosystem", pct: 20, color: "#F59E0B", tokens: 200_000_000, vesting: "Release dần 48 tháng" },
  { name: "Nghiên cứu & Phát triển", nameEn: "R&D / Technology", pct: 15, color: "#3B82F6", tokens: 150_000_000, vesting: "Release dần 36 tháng" },
  { name: "Nhóm sáng lập", nameEn: "Team & Founders", pct: 15, color: "#8B5CF6", tokens: 150_000_000, vesting: "Cliff 12 tháng, vest 36 tháng" },
  { name: "Bán công khai (Public)", nameEn: "Public Sale", pct: 10, color: "#10B981", tokens: 100_000_000, vesting: "TGE 100%" },
  { name: "Kho bạc Treasury", nameEn: "Treasury", pct: 10, color: "#6366F1", tokens: 100_000_000, vesting: "DAO quản lý" },
  { name: "Marketing & Cộng đồng", nameEn: "Marketing & Community", pct: 10, color: "#EC4899", tokens: 100_000_000, vesting: "Release dần 24 tháng" },
  { name: "Thanh khoản DEX", nameEn: "DEX Liquidity", pct: 7, color: "#14B8A6", tokens: 70_000_000, vesting: "Khóa 12 tháng LP" },
  { name: "Bán riêng tư (Private)", nameEn: "Private Sale (A+B)", pct: 8, color: "#F97316", tokens: 80_000_000, vesting: "Cliff 6 tháng, vest 18 tháng" },
  { name: "Hạt giống (Seed)", nameEn: "Seed Round", pct: 5, color: "#EF4444", tokens: 50_000_000, vesting: "Cliff 6 tháng, vest 24 tháng" },
];

const SALE_ROUNDS = [
  { round: "Seed", price: 0.005, raise: 250_000, tokens: 50_000_000, pct: 5, status: "Đang mở", statusColor: "bg-green-100 text-green-800", fvd: 5_000_000 },
  { round: "Private A", price: 0.008, raise: 320_000, tokens: 40_000_000, pct: 4, status: "Sắp mở", statusColor: "bg-blue-100 text-blue-800", fvd: 8_000_000 },
  { round: "Private B", price: 0.010, raise: 400_000, tokens: 40_000_000, pct: 4, status: "Sắp mở", statusColor: "bg-purple-100 text-purple-800", fvd: 10_000_000 },
  { round: "Public IEO", price: 0.020, raise: 2_000_000, tokens: 100_000_000, pct: 10, status: "Q3 2026", statusColor: "bg-yellow-100 text-yellow-800", fvd: 20_000_000 },
];

const TOKEN_METRICS = [
  { label: "Tổng cung tối đa", value: "1,000,000,000 HHD", icon: Coins, color: "text-bitcoin" },
  { label: "Lưu hành ban đầu (TGE)", value: "100,000,000 HHD (10%)", icon: TrendingUp, color: "text-green-600" },
  { label: "Cơ chế đốt token", value: "1% mỗi giao dịch + mua lại hàng quý", icon: Flame, color: "text-red-500" },
  { label: "Chuẩn token", value: "BEP-20 (BSC) / ERC-20 compatible", icon: Lock, color: "text-blue-600" },
  { label: "Staking APY", value: "8% – 55% (5 tầng)", icon: TrendingUp, color: "text-purple-600" },
  { label: "Quản trị", value: "1 HHD stake = 1 phiếu bầu", icon: Vote, color: "text-indigo-600" },
];

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtUSD = (n: number) => "$" + n.toLocaleString("en-US");

export default function Tokenomics() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30">BEP-20 · BNB Smart Chain</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            HHD Coin — <span className="text-bitcoin">Tokenomics</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            1 tỷ HHD cố định · Cơ chế đốt giảm phát · Staking APY 8-55% · Quản trị on-chain
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-bitcoin">$0.005</div>
              <div className="text-sm text-gray-300">Giá Seed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">$0.020</div>
              <div className="text-sm text-gray-300">Giá Public</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">$25M</div>
              <div className="text-sm text-gray-300">Hard Cap</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">$20M</div>
              <div className="text-sm text-gray-300">FDV Khởi điểm</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Thông số Token</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TOKEN_METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-6 w-6 mt-0.5 flex-shrink-0 ${m.color}`} />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{m.label}</div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{m.value}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Token Allocation */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Phân phối Token</CardTitle>
              <p className="text-sm text-gray-500">1,000,000,000 HHD — 9 danh mục</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={TOKEN_ALLOCATIONS}
                    dataKey="pct"
                    nameKey={language === "vi" ? "name" : "nameEn"}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    strokeWidth={2}
                    stroke="#1f2937"
                  >
                    {TOKEN_ALLOCATIONS.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, "Tỷ lệ"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-gray-700 dark:text-gray-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Chi tiết phân phối</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {TOKEN_ALLOCATIONS.map((a, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-gray-700 dark:text-gray-300">{language === "vi" ? a.name : a.nameEn}</span>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{a.pct}%</span>
                  </div>
                  <Progress value={a.pct} className="h-2" style={{ ["--progress-color" as string]: a.color }} />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{fmt(a.tokens)} HHD</span>
                    <span>{a.vesting}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sale Rounds */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Các vòng bán Token</CardTitle>
            <p className="text-sm text-gray-500">Tổng huy động: $2,970,000 · Hard Cap: $25,000,000</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Vòng</th>
                    <th className="pb-3 font-medium">Giá</th>
                    <th className="pb-3 font-medium">Token</th>
                    <th className="pb-3 font-medium">% Cung</th>
                    <th className="pb-3 font-medium">Huy động</th>
                    <th className="pb-3 font-medium">FDV ngụ ý</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {SALE_ROUNDS.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white">{r.round}</td>
                      <td className="py-3 text-bitcoin font-bold">{fmtUSD(r.price)}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{fmt(r.tokens)} HHD</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{r.pct}%</td>
                      <td className="py-3 text-green-600 font-semibold">{fmtUSD(r.raise)}</td>
                      <td className="py-3 text-blue-600">{fmtUSD(r.fvd)}</td>
                      <td className="py-3">
                        <Badge className={r.statusColor}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Projections */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Dự báo thị trường — Kịch bản cơ sở</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                    <th className="pb-3 font-medium">Năm</th>
                    <th className="pb-3 font-medium">Market Cap</th>
                    <th className="pb-3 font-medium">Giá Token</th>
                    <th className="pb-3 font-medium">Ví hoạt động</th>
                    <th className="pb-3 font-medium">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {[
                    { year: "2026", cap: "$20M", price: "$0.02", wallets: "50K", rev: "$95K" },
                    { year: "2027", cap: "$60M", price: "$0.06", wallets: "500K", rev: "$830K" },
                    { year: "2028", cap: "$200M", price: "$0.20", wallets: "2M", rev: "$4.5M" },
                    { year: "2029", cap: "$400M", price: "$0.40", wallets: "7M", rev: "$16.5M" },
                    { year: "2030", cap: "$800M", price: "$0.80", wallets: "20M", rev: "$57M" },
                  ].map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 font-bold text-gray-900 dark:text-white">{r.year}</td>
                      <td className="py-3 text-bitcoin font-semibold">{r.cap}</td>
                      <td className="py-3 text-green-600 font-semibold">{r.price}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{r.wallets}</td>
                      <td className="py-3 text-blue-600">{r.rev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4">* Kịch bản bảo thủ: $5M → $200M. Kịch bản bull: $50M → $3B. Đây là dự báo — không phải cam kết đầu tư.</p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
