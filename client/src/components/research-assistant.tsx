import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const EXAMPLES = [
  "Tác động của blockchain đến hệ thống tài chính Việt Nam?",
  "Phương pháp đo lường chuyển đổi số cho SME?",
  "Xu hướng nghiên cứu tokenomics 2025-2026?",
];

/** HHD AI Research Assistant — hỏi đáp học thuật qua AI Router (Gemini/Claude/OpenAI). */
export default function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await apiRequest("POST", "/api/research-assist", { question: text });
      const data = await res.json();
      setAnswer(data.answer ?? "Không nhận được câu trả lời.");
      setProvider(data.provider ?? null);
    } catch {
      setAnswer("Có lỗi kết nối tới trợ lý nghiên cứu. Vui lòng thử lại.");
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-700 border-bitcoin/30 bg-gradient-to-br from-bitcoin/5 to-transparent" data-testid="research-assistant">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-bitcoin" /> HHD AI Research Assistant
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hỏi đáp học thuật về kinh tế, tài chính, blockchain, AI &amp; chuyển đổi số
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(question); }}
          className="space-y-3"
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Ứng dụng NFT trong xác thực văn bằng có những thách thức pháp lý nào?"
            className="min-h-24 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            data-testid="research-question-input"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-bitcoin hover:bg-bitcoin-light text-white"
              data-testid="research-ask-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Đang phân tích...
                </span>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Hỏi trợ lý</>
              )}
            </Button>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setQuestion(ex); ask(ex); }}
                className="text-xs px-3 py-1.5 rounded-full bg-bitcoin/10 text-bitcoin hover:bg-bitcoin/20 transition-colors"
              >
                {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
              </button>
            ))}
          </div>
        </form>

        {answer && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4" data-testid="research-answer">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-bitcoin" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Trả lời</span>
              {provider && provider !== "none" && (
                <Badge variant="outline" className="text-[10px] uppercase">{provider}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
            <p className="text-[11px] text-gray-400 mt-3">
              * Nội dung do AI tạo — chỉ mang tính tham khảo học thuật, cần kiểm chứng với nguồn chính thống.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
