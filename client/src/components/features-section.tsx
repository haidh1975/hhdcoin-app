import { Bot, Zap, TrendingUp, Gift } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "AI Dự báo Thông minh",
      description: "Công nghệ AI độc quyền phân tích 50+ chỉ số thị trường để đưa ra dự báo chính xác đến 89%",
      color: "from-bitcoin to-bitcoin-light"
    },
    {
      icon: Zap,
      title: "Cập nhật Siêu nhanh",
      description: "Hệ thống real-time cập nhật giá Bitcoin và tin tức thị trường trong vòng 0.1 giây",
      color: "from-green-500 to-green-400"
    },
    {
      icon: TrendingUp,
      title: "Phân tích Chuyên sâu",
      description: "Đội ngũ chuyên gia 10+ năm kinh nghiệm cung cấp phân tích kỹ thuật và cơ bản chi tiết",
      color: "from-blue-500 to-blue-400"
    },
    {
      icon: Gift,
      title: "Hoàn toàn Miễn phí",
      description: "Tất cả tính năng cơ bản hoàn toàn miễn phí, không phí ẩn, cam kết minh bạch",
      color: "from-purple-500 to-purple-400"
    }
  ];

  return (
    <section className="py-20 bg-white" data-testid="section-features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-features-title">
            Tại sao chọn <span className="text-gray-400">H</span><span className="text-blue-600">H</span><span className="text-black">D</span><span className="text-bitcoin">coin</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-description">
            Những điểm khác biệt vượt trội giúp <span className="text-gray-400">H</span><span className="text-blue-600">H</span><span className="text-black">D</span><span className="text-bitcoin">coin</span> dẫn đầu thị trường đầu tư Bitcoin Việt Nam
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
