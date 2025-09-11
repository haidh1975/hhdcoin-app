import { Bot, Zap, TrendingUp, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FeaturesSection() {
  const { t } = useLanguage();
  
  // Reusable brand name component
  const BrandName = () => (
    <span>
      <span className="text-gray-400">H</span>
      <span className="text-blue-600">H</span>
      <span className="text-black">D</span>
      <span className="text-bitcoin">coin</span>
    </span>
  );
  
  const features = [
    {
      icon: Bot,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
      color: "from-bitcoin to-bitcoin-light"
    },
    {
      icon: Zap,
      title: t("features.speed.title"),
      description: t("features.speed.description"),
      color: "from-green-500 to-green-400"
    },
    {
      icon: TrendingUp,
      title: t("features.analysis.title"),
      description: t("features.analysis.description"),
      color: "from-blue-500 to-blue-400"
    },
    {
      icon: Gift,
      title: t("features.free.title"),
      description: t("features.free.description"),
      color: "from-purple-500 to-purple-400"
    }
  ];

  return (
    <section className="py-20 bg-white" data-testid="section-features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-features-title">
            {t("features.title_prefix")} <BrandName />?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-description">
            {t("features.description_prefix")} <BrandName /> {t("features.description_suffix")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group" data-testid={`card-feature-${index}`}>
              <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white text-2xl h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-dark-slate mb-4" data-testid={`text-feature-title-${index}`}>
                {feature.title}
              </h3>
              <p className="text-gray-600" data-testid={`text-feature-description-${index}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
