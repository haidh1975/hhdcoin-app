import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Lock, TrendingUp, Shield, Users, Award } from "lucide-react";

const STAKING_TIERS = [
  {
    label: "Starter",
    days: 30,
    apy: 8,
    minAmount: 1_000,
    color: "from-blue-500 to-blue-400",
    badge: "bg-blue-100 text-blue-800",
    popular: false,
    perks: ["Rút trước khi đáo hạn: phí 5%", "Governance quyền bỏ phiếu cơ bản", "Cộng đồng Discord truy cập"],
  },
  {
    label: "Silver",
    days: 60,
    apy: 12,
    minAmount: 5_000,
    color: "from-gray-500 to-gray-400",
    badge: "bg-gray-100 text-gray-800",
    popular: false,
    perks: ["Rút sớm: phí 4%", "Newsletter hàng tuần", "Early access tính năng mới"],
  },
  {
    label: "Gold",
    days: 90,
    apy: 20,
    minAmount: 10_000,
    color: "from-yellow-500 to-yellow-400",
    badge: "bg-yellow-100 text-yellow-800",
    popular: true,
    perks: ["Rút sớm: phí 3%", "Priority support", "Tham gia Research DAO", "NFT badge Gold Staker"],
  },
  {
    label: "Platinum",
    days: 180,
    apy: 35,
    minAmount: 50_000,
    color: "from-purple-500 to-purple-400",
    badge: "bg-purple-100 text-purple-800",
    popular: false,
    perks: ["Rút sớm: phí 2%", "Launchpad allocation ưu tiên", "Council member Research DAO", "Governance power x2"],
  },
  {
    label: "Diamond",
    days: 365,
    apy: 55,
    minAmount: 100_000,
    color: "from-cyan-500 to-blue-600",
    badge: "bg-cyan-100 text-cyan-800",
    popular: false,
    perks: ["Không rút sớm (lock toàn bộ)", "Governance power x5", "Direct founder access", "Partner NFT + badge đặc biệt", "Whitelist launchpad IDO"],
  },
];

const STATS = [
  { label: "Tổng HHD đang stake", value: "—", icon: Lock, color: "text-bitcoin" },
  { label: "APY trung bình toàn mạng", value: "23.4%", icon: TrendingUp, color: "text-green-600" },
  { label: "Người stake đang hoạt động", value: "—", icon: Users, color: "text-blue-600" },
  { label: "Phần thưởng đã phân phối", value: "—", icon: Award, color: "text-purple-600" },
];

export default function Staking() {
  const [amount, setAmount] = useState("");
  const [selectedDays, setSelectedDays] = useState(90);

  const tier = STAKING_TIERS.find((t) => t.days === selectedDays) ?? STAKING_TIERS[2];
  const principal = parseFloat(amount) || 0;
  const reward = (principal * tier.apy / 100) * (tier.days / 365);
  const total = principal + reward;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30">
            <Zap className="w-3 h-3 mr-1 inline" /> APY 8% – 55%
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Staking <span className="text-bitcoin">HHD Coin</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Khóa token để nhận phần thưởng, quyền quản trị DAO và ưu tiên tham gia Launchpad
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <Icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                  <div className="font-bold text-lg">{s.value}</div>
                  <div className="text-xs text-gray-300">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-10">
        {/* Staking Tiers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">5 Tầng Staking</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAKING_TIERS.map((tier, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden ${tier.popular ? "ring-2 ring-bitcoin" : ""}`}>
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-bitcoin text-white text-xs text-center py-1 font-semibold">
                    Phổ biến nhất
                  </div>
                )}
                <div className={`bg-gradient-to-br ${tier.color} p-4 text-white ${tier.popular ? "pt-7" : ""}`}>
                  <div className="text-sm font-medium opacity-80">{tier.label}</div>
                  <div className="text-3xl font-bold">{tier.apy}%</div>
                  <div className="text-sm opacity-80">APY</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 border dark:border-gray-700 rounded-b-2xl">
                  <div className="text-sm text-gray-500 mb-1">Khóa {tier.days} ngày</div>
                  <div className="text-xs text-gray-400 mb-3">Tối thiểu {tier.minAmount.toLocaleString()} HHD</div>
                  <ul className="space-y-1.5">
                    {tier.perks.map((p, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-bitcoin to-bitcoin-light text-white text-sm"
                    size="sm"
                    disabled
                  >
                    Sắp ra mắt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Máy tính phần thưởng Staking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Số HHD muốn stake</label>
                <Input
                  type="number"
                  placeholder="Ví dụ: 10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dark:bg-gray-800 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Chọn kỳ hạn</label>
                <div className="grid grid-cols-5 gap-2">
                  {STAKING_TIERS.map((t) => (
                    <button
                      key={t.days}
                      onClick={() => setSelectedDays(t.days)}
                      className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                        selectedDays === t.days
                          ? "bg-bitcoin text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {t.days}d
                    </button>
                  ))}
                </div>
              </div>
              {principal > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số HHD stake</span>
                    <span className="font-semibold dark:text-white">{principal.toLocaleString()} HHD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">APY ({tier.apy}% × {tier.days}/365)</span>
                    <span className="font-semibold text-green-600">+{reward.toFixed(2)} HHD</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-700">
                    <span className="dark:text-white">Nhận về sau {tier.days} ngày</span>
                    <span className="text-bitcoin">{total.toFixed(2)} HHD</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Quyền lợi khi Stake</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: TrendingUp, title: "Phần thưởng APY", desc: "Thu nhập thụ động 8–55% mỗi năm, trả theo kỳ hạn đã chọn" },
                { icon: Shield, title: "Quyền quản trị DAO", desc: "1 HHD stake = 1 phiếu bầu trong các đề xuất quản trị on-chain" },
                { icon: Zap, title: "Ưu tiên Launchpad", desc: "Người stake được phân bổ IDO slot ưu tiên trong HHD Launchpad" },
                { icon: Award, title: "NFT Staker Badge", desc: "NFT soulbound (không chuyển nhượng) xác nhận cấp độ staker" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Icon className="w-5 h-5 text-bitcoin flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm dark:text-white">{item.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 p-4 bg-bitcoin/10 rounded-xl border border-bitcoin/20">
                <p className="text-sm text-bitcoin font-semibold mb-1">Lưu ý</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Staking sẽ ra mắt đồng thời với dApp v1.0 trong Q3 2026. Phần thưởng thanh toán bằng token HHD.
                  Rút trước kỳ hạn bị phí theo tầng (2%–5%). Smart contract được kiểm toán CertiK.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
