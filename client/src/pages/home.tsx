import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FounderSection from "@/components/founder-section";
import InvestmentCalculator from "@/components/investment-calculator";
import InvestmentSection from "@/components/investment-section";
import FeaturesSection from "@/components/features-section";
import ContactSupport from "@/components/contact-support";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Smartphone, Bot, GraduationCap, FlaskConical, Award, Cpu, Rocket, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { t } = useLanguage();

  const newsItems = [
    {
      icon: TrendingUp,
      title: t('news.bitcoin_title'),
      content: t('news.bitcoin_surge')
    },
    {
      icon: Bot,
      title: t('news.ai_title'),
      content: t('news.ai_prediction')
    },
    {
      icon: Smartphone,
      title: t('news.mobile_title'),
      content: t('news.mobile_app')
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FounderSection />

      {/* News Section */}
      <section className="py-16 bg-gray-50" data-testid="section-news">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-news-title">
            {t('news.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {newsItems.map((news, index) => {
              const Icon = news.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-news-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-bitcoin" />
                      <span className="text-lg">{news.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {news.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      <InvestmentCalculator />
      <InvestmentSection />
      <FeaturesSection />

      {/* HHDCoin Ecosystem Modules */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30 text-sm px-4 py-1">
              BEP-20 · BNB Smart Chain
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Hệ sinh thái <span className="text-bitcoin">HHD Coin</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              5 module sản phẩm kết nối Giáo dục · Nghiên cứu · AI · Chuyển đổi số — powered by blockchain
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: GraduationCap,
                color: "from-yellow-500 to-orange-500",
                title: "HHD EdTech Platform",
                desc: "Học bổng token hoá, phần thưởng hoàn thành khoá học, thư viện phi tập trung IPFS — sinh viên nhận HHD khi đạt milestones học tập.",
              },
              {
                icon: FlaskConical,
                color: "from-blue-500 to-indigo-600",
                title: "HHD Research DAO",
                desc: "Nhà nghiên cứu nhận phần thưởng HHD từ peer-review, theo dõi trích dẫn on-chain, quỹ tài trợ nghiên cứu do cộng đồng quản lý.",
              },
              {
                icon: Award,
                color: "from-purple-500 to-pink-600",
                title: "HHD Credential Chain",
                desc: "Bằng cấp NFT soulbound trên BSC — xác minh học thuật tức thì, chống gian lận bằng giả, không cần giấy tờ hay điện thoại.",
              },
              {
                icon: Cpu,
                color: "from-green-500 to-teal-600",
                title: "HHD DigiX Program",
                desc: "Chấm điểm trưởng thành số cho SME Việt Nam bằng HHDAI, cấp grant HHD để mua công cụ số, đào tạo và tư vấn từ hệ sinh thái.",
              },
              {
                icon: Rocket,
                color: "from-red-500 to-orange-600",
                title: "HHD Innovation Fund",
                desc: "Micro-grant $5K–$50K cho AI/deep-tech startup tại SEA, do DAO bỏ phiếu, đội tiềm năng được lên HHD Launchpad phát hành IDO.",
              },
              {
                icon: Bot,
                color: "from-cyan-500 to-blue-600",
                title: "HHDAI 2.0 Platform",
                desc: "Nền tảng trí tuệ macro độc quyền với 11 mô hình kinh tế từ HHD-index framework — truy cập qua staking token.",
              },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="group bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-bitcoin/30 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{m.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tokenomics">
              <Button className="bg-bitcoin hover:bg-bitcoin-light text-white px-8 py-3 text-base">
                Xem Tokenomics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-base">
                Lộ trình 2026–2030
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Token Metrics Bar */}
      <section className="bg-gray-900 text-white py-8 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {[
              { label: "Tổng cung", value: "1 Tỷ HHD" },
              { label: "Blockchain", value: "BNB Smart Chain" },
              { label: "Giá Seed", value: "$0.005" },
              { label: "Giá Public", value: "$0.020" },
              { label: "Hard Cap", value: "$25M" },
              { label: "Staking APY", value: "8%–55%" },
            ].map((m, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                <div className="font-bold text-bitcoin text-sm">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App */}
      <section className="py-20 bg-gradient-to-br from-bitcoin/5 via-white to-blue-50" data-testid="section-mobile-app">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <Badge className="mb-4 bg-bitcoin/10 text-bitcoin border-bitcoin/30">
                <Smartphone className="w-3 h-3 mr-1 inline" /> Ứng dụng di động
              </Badge>
              <h2 className="text-4xl font-bold text-dark-slate mb-4">
                HHD Coin trong <span className="text-bitcoin">túi của bạn</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Quản lý danh mục, theo dõi giá real-time, nhận tín hiệu AI và tham gia staking mọi lúc mọi nơi.
                Ứng dụng HHD Coin cho Android &amp; iOS sắp ra mắt.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="flex items-center gap-3 bg-dark-slate text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors" data-testid="btn-appstore">
                  <svg viewBox="0 0 384 512" className="w-7 h-7 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  <div className="text-left leading-tight"><div className="text-[10px] opacity-80">Tải về trên</div><div className="font-semibold">App Store</div></div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-dark-slate text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors" data-testid="btn-googleplay">
                  <svg viewBox="0 0 512 512" className="w-7 h-7 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-221.3 60.1 60.1L104.6 499z"/></svg>
                  <div className="text-left leading-tight"><div className="text-[10px] opacity-80">Tải về trên</div><div className="font-semibold">Google Play</div></div>
                </a>
              </div>
              <p className="text-xs text-gray-400 mt-4">* Đang phát triển — đăng ký tài khoản để nhận thông báo khi ra mắt.</p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-[520px] bg-dark-slate rounded-[2.5rem] border-[10px] border-gray-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
                <div className="h-full bg-gradient-to-b from-dark-slate via-gray-800 to-dark-slate flex flex-col items-center justify-center text-white p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bitcoin to-amber-500 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold">H</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">HHD Coin</div>
                  <div className="text-bitcoin text-3xl font-bold mb-1">$0.020</div>
                  <div className="text-green-400 text-sm mb-6">+12.4% ▲</div>
                  <div className="w-full space-y-2">
                    {["Danh mục", "AI Signal", "Staking", "Governance"].map((x) => (
                      <div key={x} className="bg-white/10 rounded-lg px-4 py-2.5 text-sm flex justify-between"><span>{x}</span><span className="opacity-50">›</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactSupport />
      <Footer />
    </div>
  );
}
