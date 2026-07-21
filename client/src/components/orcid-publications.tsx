import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, FileText } from "lucide-react";

interface Publication { title: string; year: string | null; type: string; journal: string | null; url: string | null }
interface OrcidProfile { orcidId: string; total: number; publications: Publication[]; source: string }

/** Danh sách công bố khoa học lấy TRỰC TIẾP từ ORCID Public API (qua backend, cache 12h). */
export default function OrcidPublications() {
  const { data, isLoading } = useQuery<OrcidProfile>({
    queryKey: ["/api/orcid-works"],
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="py-10 text-center text-gray-400 animate-pulse">
          Đang tải hồ sơ ORCID...
        </CardContent>
      </Card>
    );
  }

  if (!data || data.publications.length === 0) {
    return (
      <Card className="dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="py-8 text-center text-sm text-gray-400">
          Không tải được dữ liệu ORCID lúc này — xem trực tiếp tại{" "}
          <a href="https://orcid.org/0000-0001-5811-7154" target="_blank" rel="noopener noreferrer" className="text-bitcoin underline">
            orcid.org
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-700" data-testid="orcid-publications">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-bitcoin" /> Công bố khoa học (ORCID)
          </span>
          <span className="flex items-center gap-2">
            <Badge className="bg-bitcoin/10 text-bitcoin border-0">{data.total} công trình</Badge>
            <Badge variant="outline" className="text-xs font-mono">{data.orcidId}</Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
        {data.publications.map((p, i) => (
          <div key={i} className="py-3 flex items-start gap-3">
            <FileText className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-gray-900 dark:text-white leading-snug">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-bitcoin">
                    {p.title} <ExternalLink className="inline h-3 w-3 opacity-50" />
                  </a>
                ) : p.title}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {[p.year, p.journal, p.type].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
