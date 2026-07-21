import { generateChat } from "./ai-router";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystem(liveBtc?: string): string {
  return `Bạn là "HHD AI Assistant" — trợ lý ảo chính thức của HHD Coin. Trả lời NGẮN GỌN (2-4 câu), thân thiện, bằng tiếng Việt (hoặc theo ngôn ngữ người dùng dùng). Có thể dùng emoji nhẹ.

KIẾN THỨC VỀ HHD COIN:
- HHD Coin (ticker: HHD) là utility token trên BNB Smart Chain (chuẩn BEP-20, tương thích ERC-20).
- Tổng cung cố định 1 tỷ HHD; lưu hành ban đầu 100 triệu (10% tại TGE).
- Giá bán: Seed $0.005 · Private $0.008–0.010 · Public $0.020. Hard cap $25M, soft cap $3M, FDV khởi điểm $20M.
- Cơ chế: đốt giảm phát 1% mỗi giao dịch + mua lại hàng quý; Staking APY 8–55% (5 tầng, khóa 30–365 ngày); Governance on-chain (1 HHD stake = 1 phiếu bầu).
- Hệ sinh thái: HHD EdTech, HHD Research DAO, HHD Credential Chain (NFT bằng cấp), HHD DigiX (SME), HHD Innovation Fund, và HHDAI 2.0.
- HHD-I (HHDAI): trợ lý AI đầu tư — dự báo thị trường, phân tích Bitcoin, phân tích danh mục, vĩ mô 193 quốc gia. Truy cập: hhdai.hhdcoin.net.
- Nhà sáng lập: PGS.TS. Đỗ Hữu Hải (ORCID 0000-0001-5811-7154), 20+ công bố Scopus/WoS.
- Lộ trình: Q3 2026 ra mắt PancakeSwap + MEXC; 2027 KuCoin/Bybit; 2028 OKX/Binance; mục tiêu 2030 vốn hóa $1B.
- Whitepaper: hhdcoin.net/whitepaper.pdf · Tokenomics: hhdcoin.net/tokenomics · Lộ trình: hhdcoin.net/roadmap.

QUY TẮC:
- Chỉ trả lời về HHD Coin, crypto, đầu tư, blockchain, AI và các trang/tính năng của website. Câu hỏi ngoài phạm vi: lịch sự từ chối.
- KHÔNG đưa lời khuyên tài chính chắc chắn. Khi nói về giá tương lai/dự báo: nêu rõ "chỉ mang tính tham khảo, không phải lời khuyên đầu tư".
${liveBtc ? `- Giá Bitcoin hiện tại (tham khảo): ${liveBtc}.` : ""}`;
}

// FAQ trả lời sẵn — dùng khi AI chưa sẵn sàng (chưa nạp credit) để chatbot vẫn hữu ích
function localAnswer(text: string, liveBtc?: string): string | null {
  const q = (text || "").toLowerCase();
  const has = (...ks: string[]) => ks.some((k) => q.includes(k));

  if (has("tokenomics", "phân phối", "tổng cung", "cung token", "phân bổ"))
    return "📊 Tokenomics HHD: tổng cung cố định 1 tỷ HHD, đốt giảm phát 1%/giao dịch. Giá Seed $0.005 → Public $0.020, hard cap $25M. Xem chi tiết tại hhdcoin.net/tokenomics.";
  if (has("whitepaper", "sách trắng"))
    return "📄 Whitepaper HHD Coin v1.0 có tại: hhdcoin.net/whitepaper.pdf — đầy đủ tầm nhìn, kiến trúc kỹ thuật và tokenomics.";
  if (has("staking", "apy", "lãi suất", "phần thưởng", "lợi nhuận"))
    return "💰 Staking HHD: 5 tầng APY 8–55% (khóa 30–365 ngày), kèm quyền quản trị DAO và ưu tiên Launchpad. Xem hhdcoin.net/staking.";
  if (has("roadmap", "lộ trình", "kế hoạch", "khi nào"))
    return "🚀 Lộ trình: Q3 2026 ra mắt PancakeSwap + MEXC; 2027 KuCoin/Bybit; 2028 OKX/Binance; mục tiêu 2030 vốn hóa $1B. Chi tiết: hhdcoin.net/roadmap.";
  if (has("team", "đội ngũ", "sáng lập", "đỗ hữu hải", "founder", "ai làm"))
    return "👨‍🏫 Nhà sáng lập: PGS.TS. Đỗ Hữu Hải — Phó Giáo sư, Tiến sĩ, 20+ công bố Scopus/WoS. Xem đội ngũ tại hhdcoin.net/team.";
  if (has("hhd-i", "hhdai", "trợ lý", "phân tích danh mục", "dự báo"))
    return "🤖 HHD-I (HHDAI) là trợ lý AI đầu tư: dự báo thị trường, phân tích Bitcoin & danh mục, dữ liệu vĩ mô 193 quốc gia. Trải nghiệm tại hhdai.hhdcoin.net.";
  if (has("giá", "price", "bitcoin", "btc"))
    return `📈 Giá Bitcoin hiện tại: ${liveBtc ?? "đang cập nhật"}. Lưu ý: chỉ mang tính tham khảo, không phải lời khuyên đầu tư.`;
  if (has("mua", "đầu tư", "tạo tài khoản", "đăng ký", "tham gia", "làm sao", "làm thế nào"))
    return "✅ Bạn có thể tạo tài khoản tại hhdcoin.net/register, sau đó chọn gói đầu tư phù hợp. Tham khảo Hướng dẫn đầu tư trên menu nhé!";
  if (has("governance", "quản trị", "bỏ phiếu", "dao", "vote"))
    return "🗳️ Quản trị HHD theo cơ chế DAO on-chain: 1 HHD stake = 1 phiếu bầu, cộng đồng quyết định hướng phát triển.";
  if (has("hhd token", "hhd coin", "hhd là", "là gì", "giới thiệu", "về hhd"))
    return "🪙 HHD Coin là utility token trên BNB Smart Chain (BEP-20), tổng cung 1 tỷ, phục vụ hệ sinh thái Giáo dục – Nghiên cứu – AI – Chuyển đổi số. Tìm hiểu thêm tại hhdcoin.net/tokenomics.";
  return null;
}

const GENERIC_HELP =
  "Chào bạn! Mình là HHD AI Assistant 🤖. Bạn có thể hỏi về: HHD Token, Tokenomics, Whitepaper, Staking, Lộ trình, Đội ngũ, HHD-I hoặc giá Bitcoin.";

export async function chatWithAI(
  messages: ChatMessage[],
  liveBtc?: string,
): Promise<{ reply: string; provider: string }> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Thử router AI (Gemini → Claude → OpenAI). Thành công thì dùng câu trả lời AI thật.
  const result = await generateChat(buildSystem(liveBtc), messages, 600);
  if (result?.text) {
    return { reply: result.text, provider: result.provider };
  }

  // Tất cả nhà cung cấp AI lỗi/hết credit/chưa cấu hình → FAQ trả lời sẵn (vẫn hữu ích)
  return { reply: localAnswer(lastUser, liveBtc) ?? GENERIC_HELP, provider: "faq" };
}
