import Navigation from "@/components/navigation";
import NewsAnalysis from "@/components/news-analysis";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function News() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-news-title">
            {t('pages.news.title')}
          </h1>
          <p className="text-xl max-w-3xl mx-auto" data-testid="text-news-subtitle">
            {t('pages.news.subtitle')}
          </p>
        </div>
      </section>

      {/* News & Analysis Section */}
      <NewsAnalysis />
      
      <Footer />
    </div>
  );
}