import { Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsAnalysis() {
  const featuredArticle = {
    title: "Bitcoin vượt mốc $44K: Tín hiệu tăng trưởng mạnh hay bẫy bull trap?",
    excerpt: "Phân tích kỹ thuật cho thấy Bitcoin đã phá vỡ ngưỡng kháng cự quan trọng tại $43,500. AI dự báo của HHDcoin chỉ ra khả năng tiếp tục tăng trưởng trong 7 ngày tới với độ tin cậy 87%...",
    category: "Phân tích chuyên sâu",
    time: "2 giờ trước",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
  };

  const newsItems = [
    {
      title: "ETF Bitcoin tiếp tục thu hút dòng vốn khủng",
      time: "1 giờ trước",
      status: "Tích cực",
      statusColor: "text-green-500",
      image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=100"
    },
    {
      title: "Fed có thể cắt giảm lãi suất sớm hơn dự kiến",
      time: "3 giờ trước",
      status: "Quan trọng",
      statusColor: "text-bitcoin",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=100"
    },
    {
      title: "Công nghệ Lightning Network đạt kỷ lục mới",
      time: "5 giờ trước",
      status: "Công nghệ",
      statusColor: "text-blue-500",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=100"
    },
    {
      title: "Thị trường châu Á phản ứng tích cực với Bitcoin",
      time: "8 giờ trước",
      status: "Thị trường",
      statusColor: "text-green-500",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=100"
    }
  ];

  return (
    <section id="news" className="py-20 bg-gray-50" data-testid="section-news-analysis">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-news-title">
              Tin tức & Phân tích
            </h2>
            <p className="text-xl text-gray-600" data-testid="text-news-description">
              Cập nhật mới nhất từ thị trường Bitcoin
            </p>
          </div>
          <Button 
            className="mt-4 lg:mt-0 bg-bitcoin text-white px-6 py-3 rounded-lg font-semibold hover:bg-bitcoin-light transition-colors"
            data-testid="button-view-all-news"
          >
            Xem tất cả
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          <Card className="lg:col-span-2 overflow-hidden shadow-lg hover:shadow-xl transition-shadow" data-testid="card-featured-article">
            <img 
              src={featuredArticle.image}
              alt="Bitcoin market analysis and trading charts" 
              className="w-full h-64 object-cover"
            />
            
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-bitcoin text-white px-3 py-1 rounded-full text-sm font-medium" data-testid="text-featured-category">
                  {featuredArticle.category}
                </span>
                <span className="text-gray-500 text-sm" data-testid="text-featured-time">
                  {featuredArticle.time}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-dark-slate mb-4" data-testid="text-featured-title">
                {featuredArticle.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed" data-testid="text-featured-excerpt">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-bitcoin rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <div className="font-medium text-dark-slate">Hệ thống AI HHDcoin</div>
                    <div className="text-sm text-gray-500">Chuyên gia phân tích</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-bitcoin hover:text-bitcoin-light font-medium"
                  data-testid="button-read-more-featured"
                >
                  Đọc tiếp <ExternalLink className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* News List */}
          <div className="space-y-6">
            {newsItems.map((item, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow" data-testid={`card-news-item-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={item.image}
                      alt="Cryptocurrency news and market updates" 
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark-slate mb-2" data-testid={`text-news-title-${index}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        <span data-testid={`text-news-time-${index}`}>{item.time}</span>
                        <span className="mx-2">•</span>
                        <span className={item.statusColor} data-testid={`text-news-status-${index}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
