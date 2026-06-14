import Link from 'next/link';
import { FileText, Target, Lightbulb, Layers, Bot, GraduationCap, Download, ArrowRight } from 'lucide-react';

const PROBLEMS = [
  {
    problem: 'Nghiên cứu khoa học thiếu tài trợ minh bạch',
    solution: 'Research DAO cấp grant on-chain, cộng đồng bỏ phiếu phân bổ ngân sách',
  },
  {
    problem: 'Chứng chỉ học thuật khó xác thực, dễ giả mạo',
    solution: 'NFT chứng chỉ (HHDCredential, ERC-721) xác thực vĩnh viễn trên blockchain',
  },
  {
    problem: 'Phân tích vĩ mô phức tạp, khó tiếp cận',
    solution: 'HHDAI 2.0 với chỉ số nhạy cảm HHD-index cho 160+ quốc gia',
  },
  {
    problem: 'Quản trị tập trung, thiếu tiếng nói cộng đồng',
    solution: 'DAO + Timelock 48h, 1 HHD staked = 1 phiếu biểu quyết',
  },
  {
    problem: 'Lạm phát token làm giảm giá trị dài hạn',
    solution: 'Cơ chế giảm phát: đốt 1%/giao dịch + buy-back-burn 20% doanh thu kho bạc',
  },
];

const LAYERS = [
  { layer: 'Layer 0', name: 'Hạ tầng', desc: 'BNB Smart Chain, cầu LayerZero (BSC ↔ ETH ↔ Solana)' },
  { layer: 'Layer 1', name: 'Token & Kho bạc', desc: 'HHDToken (BEP-20), HHDTreasury (Gnosis 5/9 multisig)' },
  { layer: 'Layer 2', name: 'Staking & Vesting', desc: 'HHDStaking (5 tier), HHDVesting (cliff & linear)' },
  { layer: 'Layer 3', name: 'Quản trị', desc: 'HHDGovernance (OZ Governor + Timelock 48h), HHDRewardsDAO' },
  { layer: 'Layer 4', name: 'Tiện ích', desc: 'HHDLaunchpad (IDO), HHDCredential (NFT chứng chỉ)' },
  { layer: 'Layer 5', name: 'AI & Dữ liệu', desc: 'HHDAI 2.0, HHD Sensitivity Index, Macro Intelligence Dashboard' },
  { layer: 'Layer 6', name: 'Ứng dụng', desc: 'HHD dApp, NFT Marketplace, cổng cộng đồng' },
];

const DOCS = [
  { title: 'Whitepaper', desc: 'Tài liệu tổng quan dự án HHD Coin', file: '/docs/HHD_Coin_Whitepaper_v1.0.docx' },
  { title: 'Technical Architecture', desc: 'Kiến trúc kỹ thuật & smart contracts', file: '/docs/HHD_Coin_Technical_Architecture.docx' },
  { title: 'Pitch Deck', desc: 'Bản trình bày tóm tắt cho nhà đầu tư', file: '/docs/HHD_Coin_Pitch_Deck.docx' },
  { title: 'Investor Memo', desc: 'Bản ghi nhớ đầu tư chi tiết', file: '/docs/HHD_Coin_Investor_Memo_Exchange_Strategy.docx' },
];

export default function WhitepaperPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-brand" /> Whitepaper
        </h1>
        <p className="text-dark-400 mt-1 text-sm">Tóm tắt tài liệu chính thức của HHD Coin.</p>
      </div>

      {/* Vision / Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" /> Tầm nhìn
          </h2>
          <p className="text-sm text-dark-400 leading-relaxed">
            Xây dựng hệ sinh thái Web3 kết nối nghiên cứu khoa học, giáo dục và trí tuệ nhân tạo, hướng tới
            20 triệu ví và hơn 50 trường đại học đối tác vào năm 2030.
          </p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-brand" /> Sứ mệnh
          </h2>
          <p className="text-sm text-dark-400 leading-relaxed">
            Dùng token HHD để minh bạch hóa tài trợ nghiên cứu, xác thực chứng chỉ học thuật và dân chủ hóa
            quyền truy cập các công cụ phân tích vĩ mô bằng AI.
          </p>
        </div>
      </div>

      {/* Problems → Solutions */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-dark-600">
          <h2 className="text-base font-semibold text-white">5 vấn đề → giải pháp</h2>
        </div>
        <div className="divide-y divide-dark-600">
          {PROBLEMS.map((p, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-red-400 bg-red-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-dark-400">{p.problem}</p>
              </div>
              <div className="flex items-start gap-2.5 md:border-l md:border-dark-600 md:pl-5">
                <ArrowRight className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white">{p.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tokenomics summary */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">Tóm tắt Tokenomics</h2>
          <p className="text-sm text-dark-400 mt-1">
            Tổng cung 1 tỷ HHD (giảm dần còn 800 triệu sau đốt), 11 hạng mục phân bổ, FDV ra mắt $20M.
          </p>
        </div>
        <Link
          href="/hhd-token"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          Xem chi tiết Tokenomics <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Architecture layers */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" /> Kiến trúc theo lớp (Layer 0–6)
        </h2>
        <div className="space-y-2">
          {LAYERS.map((l) => (
            <div key={l.layer} className="flex items-start gap-4 bg-dark-700 border border-dark-600 rounded-lg p-3">
              <span className="text-xs font-bold text-brand w-16 flex-shrink-0 pt-0.5">{l.layer}</span>
              <div>
                <p className="text-sm font-semibold text-white">{l.name}</p>
                <p className="text-xs text-dark-400 mt-0.5">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HHDAI 2.0 */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4 text-brand" /> Nền tảng HHDAI 2.0
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-white">HHD Sensitivity Index</p>
            <p className="text-xs text-dark-400 mt-1">
              Chỉ số nhạy cảm tăng trưởng GDP theo truyền thống Harrod-Domar, công bố dưới tên HHD-index.
            </p>
          </div>
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-white">Research Paper AI Assistant</p>
            <p className="text-xs text-dark-400 mt-1">Trợ lý AI hỗ trợ viết và phân tích bài báo nghiên cứu.</p>
          </div>
          <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
            <p className="text-sm font-semibold text-white">Macro Intelligence Dashboard</p>
            <p className="text-xs text-dark-400 mt-1">Bảng điều khiển vĩ mô cho hơn 160 quốc gia.</p>
          </div>
        </div>
      </div>

      {/* Founder */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-7 h-7 text-black" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">PGS.TS. Đỗ Hữu Hải</h2>
          <p className="text-xs text-dark-400 mt-0.5">Phó Giáo sư, Tiến sĩ · ORCID 0000-0001-5811-7154</p>
          <p className="text-sm text-dark-400 mt-2 leading-relaxed">
            Người sáng tạo khung lý thuyết vĩ mô HHD-index và nền tảng HHDAI 2.0. Liên hệ:{' '}
            <a href="mailto:haidh1975@gmail.com" className="text-brand hover:underline">haidh1975@gmail.com</a> ·{' '}
            <a href="https://hhdcoin.net" className="text-brand hover:underline">hhdcoin.net</a> ·{' '}
            <a href="https://t.me/HHDCoin" className="text-brand hover:underline">t.me/HHDCoin</a>
          </p>
        </div>
      </div>

      {/* Downloads */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Tải tài liệu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCS.map((d) => (
            <a
              key={d.title}
              href={d.file}
              download
              className="group bg-dark-800 border border-dark-600 hover:border-brand rounded-xl p-5 transition-colors"
            >
              <FileText className="w-7 h-7 text-brand mb-3" />
              <p className="text-sm font-semibold text-white">{d.title}</p>
              <p className="text-xs text-dark-400 mt-1">{d.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-dark-500 group-hover:text-brand mt-3 transition-colors">
                <Download className="w-3.5 h-3.5" /> Tải xuống
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
        <p className="text-xs text-dark-500 leading-relaxed">
          <span className="font-semibold text-dark-400">Tuyên bố miễn trừ trách nhiệm:</span> Tài liệu này chỉ
          mang tính cung cấp thông tin và không cấu thành lời khuyên đầu tư, tài chính hay pháp lý. Đầu tư
          tài sản số tiềm ẩn rủi ro cao, bạn có thể mất toàn bộ vốn. Các số liệu, lộ trình và dự phóng có
          thể thay đổi. Vui lòng tự nghiên cứu (DYOR) và tuân thủ quy định pháp luật tại địa phương của bạn.
        </p>
      </div>
    </div>
  );
}
