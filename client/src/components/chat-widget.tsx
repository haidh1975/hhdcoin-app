import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const GREETING: Msg = {
  role: "assistant",
  content: "Xin chào! 👋 Tôi là HHD AI Assistant. Hỏi tôi về HHD Token, Tokenomics, Whitepaper, Staking hay giá Bitcoin nhé!",
};

const SUGGESTIONS = ["HHD Token là gì?", "Tokenomics?", "Staking APY bao nhiêu?", "Giá Bitcoin?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Gửi các lượt thật (bỏ lời chào UI)
      const payload = next.filter((m, i) => !(i === 0 && m === GREETING));
      const res = await apiRequest("POST", "/api/chat", { messages: payload });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Xin lỗi, tôi chưa có câu trả lời." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Có lỗi kết nối. Vui lòng thử lại sau giây lát." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Nút nổi */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-bitcoin to-amber-500 text-white shadow-xl shadow-bitcoin/40 flex items-center justify-center hover:scale-105 transition-transform"
        data-testid="chat-toggle"
        aria-label="HHD AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 bg-white text-bitcoin text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">AI</span>
        )}
      </button>

      {/* Panel chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[60] w-[calc(100vw-3rem)] sm:w-96 h-[520px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" data-testid="chat-panel">
          {/* Header */}
          <div className="bg-gradient-to-r from-bitcoin to-amber-500 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">HHD AI Assistant</div>
              <div className="text-xs text-white/80 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Trực tuyến</div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-lg p-1" aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-bitcoin text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-bitcoin/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-bitcoin/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-bitcoin/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            {/* Gợi ý nhanh — chỉ khi mới mở */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-bitcoin/10 text-bitcoin hover:bg-bitcoin/20 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-900"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-bitcoin dark:text-white"
              data-testid="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-bitcoin text-white flex items-center justify-center disabled:opacity-40 hover:bg-bitcoin-light transition-colors"
              aria-label="Gửi"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
