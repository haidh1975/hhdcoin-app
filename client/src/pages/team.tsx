import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, GraduationCap, ExternalLink, BookOpen, FlaskConical, Link2, Brain, Coins, Cpu, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import founderPhoto from "@assets/founder-hai.jpg";

const FOUNDER_LINKS = {
  profile: "https://orcid.org/0000-0001-5811-7154",
  scholar: "https://scholar.google.com/scholar?q=%22Do+Huu+Hai%22",
};
const FOUNDER_PHOTO: string | null = founderPhoto;

const ADVISORS = [
  { area: "Blockchain", icon: Link2, color: "from-purple-500 to-indigo-600", desc: "Kiến trúc smart contract, bảo mật on-chain, hạ tầng BNB Smart Chain" },
  { area: "Trí tuệ nhân tạo (AI)", icon: Brain, color: "from-cyan-500 to-blue-600", desc: "Mô hình dự báo, NLP, hệ thống khuyến nghị đầu tư HHD-I" },
  { area: "Tài chính", icon: Coins, color: "from-amber-500 to-orange-600", desc: "Tokenomics, quản trị rủi ro, chiến lược thị trường vốn" },
  { area: "Công nghệ", icon: Cpu, color: "from-emerald-500 to-teal-600", desc: "Kiến trúc nền tảng, dữ liệu lớn, an ninh hệ thống" },
];

export default function Team() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30">
            <Users className="w-3 h-3 mr-1 inline" /> Đội ngũ HHD
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Đội ngũ <span className="text-bitcoin">HHD Coin</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Học thuật · Blockchain · AI · Tài chính — kiến tạo hệ sinh thái tri thức số minh bạch
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Ban sáng lập */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-bitcoin" /> Ban sáng lập
          </h2>
          <Card className="dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
            <div className="grid md:grid-cols-[260px_1fr]">
              <div className="bg-gradient-to-br from-bitcoin via-orange-500 to-amber-600 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative">
                  <div className="w-36 h-36 rounded-full bg-white/15 ring-4 ring-white/40 flex items-center justify-center overflow-hidden">
                    {FOUNDER_PHOTO ? (
                      <img src={FOUNDER_PHOTO} alt="PGS.TS. Đỗ Hữu Hải" className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-4xl font-bold text-white">ĐHH</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-bitcoin text-xs font-bold px-3 py-1 rounded-full shadow">PGS.TS.</div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-white/90 text-sm">
                  <GraduationCap className="h-4 w-4" /> VIU · Ton Duc Thang
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">PGS.TS. Đỗ Hữu Hải</h3>
                <p className="text-bitcoin font-semibold mb-3">Nhà sáng lập &amp; Chủ tịch HHD Foundation</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Phó Giáo sư", "Tiến sĩ", "Chuyên gia kinh tế", "AI & Blockchain"].map((r) => (
                    <span key={r} className="px-3 py-1 rounded-full bg-bitcoin/10 text-bitcoin text-sm font-medium">{r}</span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                  Phó Giáo sư, Tiến sĩ với 20+ công bố Scopus/WoS; người sáng tạo khung HHD-index và nền tảng HHDAI 2.0.
                  Chuyên gia tư vấn chiến lược, chuyển đổi số và quản trị, gắn kết tri thức học thuật với công nghệ blockchain & AI.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={FOUNDER_LINKS.profile} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-bitcoin hover:bg-bitcoin-light text-white"><Award className="mr-2 h-4 w-4" /> Hồ sơ khoa học</Button>
                  </a>
                  <a href={FOUNDER_LINKS.scholar} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="dark:text-white dark:border-gray-600"><BookOpen className="mr-2 h-4 w-4" /> Google Scholar <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" /></Button>
                  </a>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Ban cố vấn */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-bitcoin" /> Ban cố vấn
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVISORS.map((a, i) => {
              const Icon = a.icon;
              return (
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-700 text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Cố vấn {a.area}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{a.desc}</p>
                    <Badge variant="outline" className="text-xs">Đang cập nhật</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            HHD Foundation đang mở rộng ban cố vấn quốc tế. Liên hệ hợp tác qua trang Liên hệ.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
