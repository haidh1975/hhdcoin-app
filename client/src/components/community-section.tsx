import { Users, MessageCircle, Star, Globe, ThumbsUp, MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CommunitySection() {
  const communityStats = {
    members: "15,847",
    messages: "1,234", 
    experts: "47",
    countries: "23"
  };

  const discussions = [
    {
      user: { name: "Nguyễn Hoàng", level: "VIP Member", avatar: "NH" },
      post: {
        title: "Có nên DCA Bitcoin trong tình hình hiện tại?",
        preview: "Với việc giá Bitcoin đang dao động quanh mức $43K, mọi người nghĩ sao về chiến lược DCA...",
        time: "2 giờ trước",
        likes: 23,
        replies: 8
      }
    },
    {
      user: { name: "HHDcoin AI Assistant", level: "BOT", avatar: "AI" },
      post: {
        title: "Báo cáo phân tích thị trường tuần này",
        preview: "AI phân tích cho thấy Bitcoin có 78% khả năng tăng giá trong 7 ngày tới dựa trên...",
        time: "1 giờ trước",
        likes: 156,
        replies: 45
      }
    },
    {
      user: { name: "Lê Thành", level: "Expert Trader", avatar: "LT" },
      post: {
        title: "Phân tích kỹ thuật: Mô hình cờ bull đang hình thành",
        preview: "Quan sát biểu đồ 4H của Bitcoin, tôi thấy mô hình bull flag rất rõ ràng. Target ngắn hạn...",
        time: "5 giờ trước",
        likes: 89,
        replies: 32
      }
    }
  ];

  return (
    <section id="community" className="py-20 bg-gray-50" data-testid="section-community">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-dark-slate mb-4" data-testid="text-community-title">
            Cộng đồng HHDcoin
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-community-description">
            Kết nối với hàng nghìn nhà đầu tư Bitcoin, chia sẻ kinh nghiệm và học hỏi từ các chuyên gia
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Community Stats */}
          <Card className="shadow-lg" data-testid="card-community-stats">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dark-slate mb-6">Thống kê cộng đồng</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="text-bitcoin text-xl h-6 w-6" />
                    <span className="text-gray-700">Thành viên</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-members">
                    {communityStats.members}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="text-green-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">Tin nhắn hôm nay</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-messages">
                    {communityStats.messages}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="text-yellow-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">Chuyên gia</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-experts">
                    {communityStats.experts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="text-blue-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">Quốc gia</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-countries">
                    {communityStats.countries}
                  </span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-8 bg-bitcoin text-white py-3 rounded-lg font-semibold hover:bg-bitcoin-light transition-colors"
                data-testid="button-join-community"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Tham gia cộng đồng
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Discussions */}
          <Card className="lg:col-span-2 shadow-lg" data-testid="card-recent-discussions">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-dark-slate">Thảo luận gần đây</h3>
                <Button variant="ghost" className="text-bitcoin hover:text-bitcoin-light font-medium" data-testid="button-view-all-discussions">
                  Xem tất cả
                </Button>
              </div>
              
              <div className="space-y-6">
                {discussions.map((discussion, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0" data-testid={`discussion-${index}`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        discussion.user.level === 'BOT' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                        discussion.user.level === 'Expert Trader' ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                        'bg-gradient-to-r from-bitcoin to-bitcoin-light'
                      }`}>
                        <span className="text-white font-bold" data-testid={`user-avatar-${index}`}>
                          {discussion.user.avatar}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-dark-slate" data-testid={`user-name-${index}`}>
                            {discussion.user.name}
                          </span>
                          {discussion.user.level === 'BOT' ? (
                            <span className="bg-bitcoin text-white px-2 py-1 rounded-full text-xs">BOT</span>
                          ) : (
                            <span className="text-sm text-gray-500" data-testid={`user-level-${index}`}>
                              {discussion.user.level}
                            </span>
                          )}
                          <span className="text-sm text-gray-400" data-testid={`post-time-${index}`}>
                            {discussion.post.time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-dark-slate mb-2" data-testid={`post-title-${index}`}>
                          {discussion.post.title}
                        </h4>
                        <p className="text-gray-600 mb-3" data-testid={`post-preview-${index}`}>
                          {discussion.post.preview}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span data-testid={`post-likes-${index}`}>
                            <ThumbsUp className="inline mr-1 h-4 w-4" />
                            {discussion.post.likes} likes
                          </span>
                          <span data-testid={`post-replies-${index}`}>
                            <MessageSquare className="inline mr-1 h-4 w-4" />
                            {discussion.post.replies} replies
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-bitcoin hover:text-bitcoin-light p-0 h-auto"
                            data-testid={`button-reply-${index}`}
                          >
                            {discussion.user.level === 'BOT' ? 'Xem báo cáo đầy đủ' : 'Trả lời'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
