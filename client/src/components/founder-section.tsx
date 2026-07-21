import { GraduationCap, Award, ExternalLink, BookOpen, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import founderPhoto from "@assets/founder-hai.jpg";

// Link hồ sơ — cập nhật URL thật của bạn ở đây
const FOUNDER_LINKS = {
  profile: "https://orcid.org/0000-0001-5811-7154", // Hồ sơ khoa học (ORCID)
  research: "https://scholar.google.com/scholar?q=%22Do+Huu+Hai%22", // Công trình nghiên cứu
  scholar: "https://scholar.google.com/scholar?q=%22Do+Huu+Hai%22", // Google Scholar
};

const FOUNDER_PHOTO: string | null = founderPhoto;

export default function FounderSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-b from-white to-orange-50/40 dark:from-gray-950 dark:to-gray-900" data-testid="section-founder">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-orange-100 dark:border-gray-700 overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr] gap-0">
            {/* Ảnh / avatar */}
            <div className="bg-gradient-to-br from-bitcoin via-orange-500 to-amber-600 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white/15 backdrop-blur ring-4 ring-white/40 flex items-center justify-center overflow-hidden">
                  {FOUNDER_PHOTO ? (
                    <img src={FOUNDER_PHOTO} alt={t('founder.name')} className="w-full h-full object-cover object-top" />
                  ) : (
                    <span className="text-5xl font-bold text-white tracking-tight">ĐHH</span>
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-bitcoin text-xs font-bold px-3 py-1 rounded-full shadow">
                  PGS.TS.
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-white/90 text-sm">
                <GraduationCap className="h-4 w-4" />
                <span>VIU · Ton Duc Thang University</span>
              </div>
            </div>

            {/* Thông tin */}
            <div className="p-8 md:p-10">
              <div className="inline-flex items-center gap-2 text-bitcoin font-semibold text-sm uppercase tracking-wider mb-3">
                <Award className="h-4 w-4" />
                {t('founder.label')}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {t('founder.name')}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-bitcoin/10 text-bitcoin text-sm font-medium">{t('founder.role1')}</span>
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium">{t('founder.role2')}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('founder.desc')}
              </p>

              <div className="flex flex-wrap gap-3">
                <a href={FOUNDER_LINKS.profile} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-bitcoin hover:bg-bitcoin-light text-white" data-testid="btn-founder-profile">
                    <Award className="mr-2 h-4 w-4" />
                    {t('founder.btn_profile')}
                  </Button>
                </a>
                <a href={FOUNDER_LINKS.research} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-white" data-testid="btn-founder-research">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    {t('founder.btn_research')}
                  </Button>
                </a>
                <a href={FOUNDER_LINKS.scholar} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-white" data-testid="btn-founder-scholar">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('founder.btn_scholar')}
                    <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-60" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
