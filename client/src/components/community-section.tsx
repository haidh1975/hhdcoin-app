import { Users, MessageCircle, Star, Globe, ThumbsUp, MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CommunitySection() {
  const { t } = useLanguage();
  
  const communityStats = {
    members: "15,847",
    messages: "1,234", 
    experts: "47",
    countries: "23"
  };

  const discussions = [
    {
      user: { name: t('community.post1.user'), level: t('community.member_levels.vip'), avatar: "NH" },
      post: {
        title: t('community.post1.title'),
        preview: t('community.post1.preview'),
        time: `2 ${t('news.hours')} ${t('news.time_ago')}`,
        likes: 23,
        replies: 8
      }
    },
    {
      user: { name: t('community.post2.user'), level: t('community.member_levels.bot'), avatar: "AI" },
      post: {
        title: t('community.post2.title'),
        preview: t('community.post2.preview'),
        time: `1 ${t('news.hours')} ${t('news.time_ago')}`,
        likes: 156,
        replies: 45
      }
    },
    {
      user: { name: t('community.post3.user'), level: t('community.member_levels.expert'), avatar: "LT" },
      post: {
        title: t('community.post3.title'),
        preview: t('community.post3.preview'),
        time: `5 ${t('news.hours')} ${t('news.time_ago')}`,
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
            {t('community.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-community-description">
            {t('community.description')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Community Stats */}
          <Card className="shadow-lg" data-testid="card-community-stats">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dark-slate mb-6">{t('community.community_stats')}</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="text-bitcoin text-xl h-6 w-6" />
                    <span className="text-gray-700">{t('community.stats.members')}</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-members">
                    {communityStats.members}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="text-green-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">{t('community.stats.messages_today')}</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-messages">
                    {communityStats.messages}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Star className="text-yellow-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">{t('community.stats.experts')}</span>
                  </div>
                  <span className="text-2xl font-bold text-dark-slate" data-testid="stat-experts">
                    {communityStats.experts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="text-blue-500 text-xl h-6 w-6" />
                    <span className="text-gray-700">{t('community.stats.countries')}</span>
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
                {t('community.join_community')}
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Discussions */}
          <Card className="lg:col-span-2 shadow-lg" data-testid="card-recent-discussions">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-dark-slate">{t('community.discussions.title')}</h3>
                <Button variant="ghost" className="text-bitcoin hover:text-bitcoin-light font-medium" data-testid="button-view-all-discussions">
                  {t('community.view_all_discussions')}
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
                            {discussion.post.likes} {t('community.likes')}
                          </span>
                          <span data-testid={`post-replies-${index}`}>
                            <MessageSquare className="inline mr-1 h-4 w-4" />
                            {discussion.post.replies} {t('community.replies')}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-bitcoin hover:text-bitcoin-light p-0 h-auto"
                            data-testid={`button-reply-${index}`}
                          >
                            {discussion.user.level === t('community.member_levels.bot') ? t('community.reply_button.bot') : t('community.reply_button.default')}
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
