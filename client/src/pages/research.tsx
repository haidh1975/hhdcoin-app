import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import OrcidPublications from "@/components/orcid-publications";
import ResearchAssistant from "@/components/research-assistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, TrendingUp, Brain, Link2, ExternalLink, GraduationCap, Award } from "lucide-react";

const ORCID = "https://orcid.org/0000-0001-5811-7154";
const SCHOLAR = "https://scholar.google.com/scholar?q=%22Do+Huu+Hai%22";

const PILLARS = [
  { icon: BookOpen, color: "from-blue-500 to-indigo-600", title: "Công bố Scopus", count: "20+", desc: "Bài báo khoa học trên các tạp chí thuộc danh mục Scopus về kinh tế, quản trị, FinTech." },
  { icon: Award, color: "from-purple-500 to-pink-600", title: "Công bố WoS", count: "ISI/WoS", desc: "Công trình trên hệ thống Web of Science — Green HRM, ESG, Industry 4.0/5.0." },
  { icon: TrendingUp, color: "from-amber-500 to-orange-600", title: "Báo cáo kinh tế", count: "HHD-index", desc: "Khung phân tích vĩ mô HHD-index, báo cáo thị trường và chuyển đổi số." },
  { icon: Brain, color: "from-cyan-500 to-blue-600", title: "AI Research", count: "HHDAI 2.0", desc: "Nền tảng trí tuệ vĩ mô 193 quốc gia, mô hình dự báo và hệ khuyến nghị." },
  { icon: Link2, color: "from-emerald-500 to-teal-600", title: "Blockchain Research", count: "BEP-20", desc: "Token tiện ích, NFT credential, governance on-chain & cơ chế giảm phát." },
];

export default function Research() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />

      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-bitcoin/20 text-bitcoin border-bitcoin/30">
            <GraduationCap className="w-3 h-3 mr-1 inline" /> Học thuật &amp; Nghiên cứu
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Nền tảng <span className="text-bitcoin">tri thức học thuật</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            HHD Coin được dẫn dắt bởi nghiên cứu khoa học thực chứng — minh bạch, có thể kiểm chứng và phục vụ cộng đồng tri thức.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <a href={ORCID} target="_blank" rel="noopener noreferrer">
              <Button className="bg-bitcoin hover:bg-bitcoin-light text-white"><Award className="mr-2 h-4 w-4" /> Hồ sơ ORCID</Button>
            </a>
            <a href={SCHOLAR} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10"><BookOpen className="mr-2 h-4 w-4" /> Google Scholar <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" /></Button>
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Card key={i} className="dark:bg-gray-900 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.title}</h3>
                    <Badge className="bg-bitcoin/10 text-bitcoin border-0">{p.count}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* HHD AI Research Assistant */}
        <ResearchAssistant />

        {/* Công bố khoa học trực tiếp từ ORCID */}
        <OrcidPublications />

        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-bitcoin" /> Whitepaper &amp; Tài liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer">
              <Button className="bg-bitcoin hover:bg-bitcoin-light text-white"><FileText className="mr-2 h-4 w-4" /> HHD Coin Whitepaper v1.0</Button>
            </a>
            <a href="/tokenomics">
              <Button variant="outline" className="dark:text-white dark:border-gray-600"><TrendingUp className="mr-2 h-4 w-4" /> Tokenomics</Button>
            </a>
            <a href="/roadmap">
              <Button variant="outline" className="dark:text-white dark:border-gray-600">Lộ trình phát triển</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
