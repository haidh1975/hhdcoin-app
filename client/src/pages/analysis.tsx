import Navigation from "@/components/navigation";
import MarketAnalysis from "@/components/market-analysis";
import BitcoinChart from "@/components/bitcoin-chart";
import Footer from "@/components/footer";

export default function Analysis() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-analysis-title">
            Phân Tích Thị Trường
          </h1>
          <p className="text-xl max-w-3xl mx-auto" data-testid="text-analysis-subtitle">
            Phân tích chuyên sâu về thị trường Bitcoin với AI và dữ liệu thời gian thực
          </p>
        </div>
      </section>

      {/* Bitcoin Chart Section */}
      <BitcoinChart />
      
      {/* Market Analysis Section */}
      <MarketAnalysis />
      
      <Footer />
    </div>
  );
}