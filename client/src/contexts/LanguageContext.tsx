import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  vi: {
    // Navigation
    'nav.home': 'Trang chủ',
    'nav.account_management': 'Quản lý tài khoản',
    'nav.news': 'Tin tức',
    'nav.analysis': 'Phân tích',
    'nav.community': 'Cộng đồng',
    'nav.investment_management': 'Quản lý đầu tư',
    'nav.investment_utilities': 'Tiện ích đầu tư',
    'nav.investment_guide': 'Hướng dẫn đầu tư',
    'nav.contact': 'Liên hệ',
    'nav.packages': 'Gói đầu tư',
    'nav.investment': 'Đầu tư',

    // Investment Calculator - CRITICAL FIXES
    'calc.title': 'Máy tính đầu tư thông minh',
    'calc.description': 'Tính toán lợi nhuận đầu tư Bitcoin với AI dự báo và phân tích rủi ro tự động',
    'calc.form.title': 'Tính toán đầu tư',
    'calc.form.amount': 'Số tiền đầu tư (VNĐ)',
    'calc.form.amount_placeholder': 'Nhập số tiền...',
    'calc.form.duration': 'Thời gian đầu tư',
    'calc.form.duration.months': 'tháng',
    'calc.form.duration.6': '6 tháng',
    'calc.form.duration.12': '12 tháng',
    'calc.form.duration.18': '18 tháng',
    'calc.form.duration.24': '24 tháng',
    'calc.form.package': 'Gói đầu tư',
    'calc.package.basic': 'Cơ bản',
    'calc.package.premium': 'Cao cấp',
    'calc.package.vip': 'VIP',
    'calc.risk.level': 'Mức độ rủi ro',
    'calc.risk.low': 'Thấp',
    'calc.risk.medium': 'Trung bình',
    'calc.risk.high': 'Cao',
    'calc.results.title': 'Kết quả dự báo',
    'calc.results.investment': 'Tổng đầu tư',
    'calc.results.profit': 'Lợi nhuận ước tính',
    'calc.results.total': 'Tổng nhận về',
    'calc.ai.prediction_title': 'Dự báo AI',
    'calc.ai.trend': 'Xu hướng tăng mạnh',
    'calc.ai.confidence': 'Độ tin cậy: 89%',
    'calc.ai.scenario': 'Kịch bản tăng mạnh',
    'calc.ai.market_signals': 'Tín hiệu thị trường',
    'calc.ai.positive_signals': 'Tích cực',
    'calc.ai.neutral_signals': 'Trung tính',
    'calc.ai.negative_signals': 'Tiêu cực',
    'calc.disclaimer.title': 'Lưu ý quan trọng',
    'calc.disclaimer.text': 'Kết quả tính toán chỉ mang tính tham khảo. Đầu tư có rủi ro, giá trị có thể tăng hoặc giảm.',
    'calc.cta': 'Bắt đầu đầu tư ngay',

    // Contact Support - CRITICAL FIXES
    'contact.title': 'Liên hệ & Hỗ trợ',
    'contact.description': 'Đội ngũ chuyên gia HHDcoin luôn sẵn sàng hỗ trợ bạn 24/7',
    'contact.live_support': 'Hỗ trợ trực tuyến',
    'contact.response_time': 'Phản hồi trong vòng 2 giờ',
    'contact.support_247': 'Hỗ trợ 24/7',
    'contact.ai_assistant': 'AI Assistant luôn sẵn sàng',
    'contact.support_options.live_chat': 'Live Chat',
    'contact.support_options.video_call': 'Video Call',
    'contact.support_options.faq': 'FAQ',
    'contact.support_options.guide': 'Hướng dẫn',
    'contact.support_options.live_chat_subtitle': 'Trực tuyến',
    'contact.support_options.video_call_subtitle': 'Đặt lịch',
    'contact.support_options.faq_subtitle': 'Câu hỏi thường gặp',
    'contact.support_options.guide_subtitle': 'Tài liệu chi tiết',
    'contact.info.title': 'Thông tin liên hệ',
    'contact.form.name': 'Họ và tên',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Số điện thoại',
    'contact.form.subject': 'Chủ đề',
    'contact.form.message': 'Nội dung',
    'contact.form.send': 'Gửi tin nhắn',
    'contact.form.sending': 'Đang gửi...',
    'contact.privacy_policy': 'Tôi đồng ý với chính sách bảo mật',
    'contact.privacy_required': 'Vui lòng đồng ý với chính sách bảo mật',
    'contact.all_fields_required': 'Vui lòng điền đầy đủ thông tin bắt buộc',
    'contact.send_success': 'Tin nhắn đã được gửi thành công!',
    'contact.send_error': 'Có lỗi xảy ra khi gửi tin nhắn',

    // News Analysis - CRITICAL FIXES
    'news.title': 'Tin tức & Phân tích',
    'news.description': 'Cập nhật mới nhất từ thị trường Bitcoin',
    'news.featured_article_title': '🚀 Bitcoin chính thức vượt mốc $150K: Kỷ lục lịch sử mới!',
    'news.featured_article_excerpt': 'Lần đầu tiên trong lịch sử, Bitcoin đã phá vỡ ngưỡng tâm lý $150,000, đánh dấu cột mốc quan trọng cho thị trường crypto. AI dự báo của HHDcoin đã chính xác dự đoán sự kiện này với độ tin cậy 94%. Các chuyên gia nhận định đây là bước ngoặt quan trọng trong việc Bitcoin trở thành tài sản dự trữ toàn cầu...',
    'news.featured_category': 'Phân tích chuyên sâu',
    'news.time_ago': 'trước',
    'news.hours': 'giờ',
    'news.minutes': 'phút',
    'news.status.hot': 'Nóng hổi',
    'news.status.government': 'Chính phủ',
    'news.status.technology': 'Công nghệ',
    'news.status.country': 'Quốc gia',
    'news.read_more': 'Đọc thêm',
    'news.view_all_news': 'Xem tất cả tin tức',
    'news.latest_updates': 'Cập nhật mới nhất từ thị trường Bitcoin',
    'news.breaking_news': 'Tin tức khẩn cấp',
    'news.market_news': 'Tin thị trường',
    
    // News Items - NEW TRANSLATIONS
    'news.item1.title': '💰 BlackRock ETF đạt $100 tỷ AUM sau khi Bitcoin vượt $150K',
    'news.item2.title': '🏛️ El Salvador công bố mua thêm 1000 BTC tại mức $150K',
    'news.item3.title': '⚡ Lightning Network xử lý 10M giao dịch/ngày',
    'news.item4.title': '🌏 Nhật Bản xem xét Bitcoin làm tài sản dự trữ',
    
    // Community Discussion Posts - NEW TRANSLATIONS
    'community.post1.user': 'Nguyễn Hoàng',
    'community.post1.title': 'Có nên DCA Bitcoin trong tình hình hiện tại?',
    'community.post1.preview': 'Với việc giá Bitcoin đang dao động quanh mức $43K, mọi người nghĩ sao về chiến lược DCA...',
    'community.post2.user': 'HHDcoin AI Assistant',
    'community.post2.title': 'Báo cáo phân tích thị trường tuần này',
    'community.post2.preview': 'AI phân tích cho thấy Bitcoin có 78% khả năng tăng giá trong 7 ngày tới dựa trên...',
    'community.post3.user': 'Lê Thành',
    'community.post3.title': 'Phân tích kỹ thuật: Mô hình cờ bull đang hình thành',
    'community.post3.preview': 'Quan sát biểu đồ 4H của Bitcoin, tôi thấy mô hình bull flag rất rõ ràng. Target ngắn hạn...',
    'community.reply_button.default': 'Trả lời',
    'community.reply_button.bot': 'Xem báo cáo đầy đủ',

    // Market Analysis - CRITICAL FIXES
    'market.title': 'Phân tích thị trường',
    'market.description': 'Bitcoin vượt $150K - Phân tích kỹ thuật và xu hướng thị trường trong bull run lịch sử',
    'market.bitcoin_surges': '🚀 Bitcoin phá vỡ mọi kỷ lục - Đạt $152,500 ATH!',
    'market.realtime_updates': 'Biểu đồ real-time từ CoinGecko & Binance - Cập nhật mỗi 30 giây',
    'market.24h_high': 'Cao nhất 24h',
    'market.24h_low': 'Thấp nhất 24h',
    'market.24h_volume': 'Khối lượng 24h',
    'market.24h_change': 'Thay đổi 24h',
    'market.chart_title': 'Biểu đồ giá Bitcoin',
    'market.technical_indicators': 'Chỉ báo kỹ thuật',
    'market.rsi': 'RSI (14)',
    'market.macd': 'MACD',
    'market.ma_50_200': 'MA 50/200',
    'market.volume': 'Volume',
    'market.super_bull': 'Super Bull',
    'market.insights_title': 'Insights từ AI',
    'market.key_insights': 'Điểm chính',
    'market.institutional_adoption': 'Sự chấp nhận từ tổ chức tăng mạnh 340%',
    'market.technical_breakout': 'Đột phá kỹ thuật vượt resistance $148K',
    'market.bullish_momentum': 'Momentum tăng giá cực mạnh với RSI > 70',
    'market.volume_surge': 'Khối lượng giao dịch tăng 185% so với trung bình',
    'market.ai_prediction': 'Dự báo AI cho 7 ngày tới',
    'market.bull_run_continues': 'Bull run tiếp tục với xác suất 91%',
    'market.target_range': 'Mục tiêu: $165K - $180K',
    'market.support_level': 'Hỗ trợ mạnh tại $145K',
    'market.view_detailed_analysis': 'Xem phân tích chi tiết',

    // Community Section - CRITICAL FIXES
    'community.title': 'Cộng đồng HHDcoin',
    'community.description': 'Kết nối với hàng nghìn nhà đầu tư Bitcoin, chia sẻ kinh nghiệm và học hỏi từ các chuyên gia',
    'community.community_stats': 'Thống kê cộng đồng',
    'community.stats.members': 'Thành viên',
    'community.stats.messages_today': 'Tin nhắn hôm nay',
    'community.stats.experts': 'Chuyên gia',
    'community.stats.countries': 'Quốc gia',
    'community.discussions.title': 'Thảo luận nổi bật',
    'community.view_all_discussions': 'Xem tất cả thảo luận',
    'community.join_community': 'Tham gia cộng đồng',
    'community.member_levels.vip': 'VIP Member',
    'community.member_levels.bot': 'BOT',
    'community.member_levels.expert': 'Expert Trader',
    'community.likes': 'lượt thích',
    'community.replies': 'phản hồi',
    'community.login_required': 'Vui lòng đăng nhập để tham gia thảo luận',

    // Investment Packages - CRITICAL FIXES
    'packages.loading_message': 'Đang tải gói đầu tư...',
    'packages.popular': 'PHỔ BIẾN NHẤT',
    'packages.profit': 'Lợi nhuận/năm',
    'packages.features': 'Tính năng',
    'packages.contact_for_investment': 'Liên hệ để được tư vấn đầu tư',
    'packages.select': 'Chọn gói này',

    // Pages - CRITICAL FIXES
    'pages.news.title': 'Tin Tức & Phân Tích',
    'pages.news.subtitle': 'Cập nhật tin tức mới nhất về Bitcoin và thị trường cryptocurrency',
    'pages.investment_guide.title': 'Hướng dẫn đầu tư HHDcoin',
    'pages.investment_guide.step_by_step': 'Hướng dẫn chi tiết từng bước để bắt đầu hành trình đầu tư Bitcoin thông minh với AI và các tiện ích đầu tư',
    'pages.investment_guide.utilities_title': 'Tiện ích đầu tư thông minh',

    // Investment Guide - CRITICAL FIXES
    'guide.five_steps_title': '5 Bước Đầu Tư Với HHDcoin',
    'guide.step1_title': 'Bước 1: Tạo tài khoản',
    'guide.step2_title': 'Bước 2: Nạp khoản đầu tư',
    'guide.step3_title': 'Bước 3: Thanh toán & nhận hợp đồng',
    'guide.step4_title': 'Bước 4: Quản lý & theo dõi',
    'guide.step5_title': 'Bước 5: Chatbot AI hỗ trợ',
    'guide.view_history': 'Xem lịch sử',
    'guide.download_contract': 'Tải hợp đồng',
    'guide.send_request': 'Gửi yêu cầu',
    'guide.manage_notifications': 'Quản lý thông báo',
    'guide.ready_to_start': 'Sẵn sàng bắt đầu đầu tư?',
    'guide.follow_steps_description': 'Theo dõi 5 bước trên để bắt đầu hành trình đầu tư Bitcoin thông minh cùng HHDcoin',
    'guide.start_now': 'Bắt đầu ngay',
    'guide.contact_support': 'Liên hệ hỗ trợ',
    'guide.demo_interface': 'Demo Interface',
    'guide.latest_investment': 'Đầu tư gần nhất',
    'guide.contract': 'Hợp đồng',
    'guide.download_pdf': 'Tải PDF',
    'guide.status': 'Trạng thái',
    'guide.active': 'Hoạt động',

    // My Investments - CRITICAL FIXES
    'my_investments.title': 'Quản Lý Đầu Tư',
    'my_investments.login_required_title': 'Yêu cầu đăng nhập',
    'my_investments.login_required_message': 'Bạn cần đăng nhập để xem thông tin đầu tư của mình.',
    'my_investments.login_button': 'Đăng nhập ngay',
    'my_investments.no_investments_title': 'Chưa có khoản đầu tư nào',
    'my_investments.no_investments_message': 'Bạn chưa có khoản đầu tư nào. Hãy bắt đầu đầu tư ngay hôm nay!',
    'my_investments.start_investing': 'Bắt đầu đầu tư',
    'my_investments.portfolio_overview': 'Quản lý và theo dõi các khoản đầu tư Bitcoin của bạn',
    'my_investments.total_invested': 'Tổng đầu tư',
    'my_investments.current_value': 'Giá trị hiện tại',
    'my_investments.total_profit': 'Tổng lợi nhuận',
    'my_investments.investment_details': 'Chi tiết đầu tư',
    'my_investments.investment_amount': 'Số tiền đầu tư',
    'my_investments.profit_loss': 'Lãi/Lỗ',
    'my_investments.profit_loss_percentage': 'Phần trăm lãi/lỗ',
    'my_investments.start_date': 'Ngày bắt đầu',
    'my_investments.end_date': 'Ngày kết thúc',
    'my_investments.bitcoin_code': 'Mã Bitcoin',
    'my_investments.status.active': 'Đang hoạt động',
    'my_investments.status.completed': 'Hoàn thành',
    'my_investments.status.cancelled': 'Đã hủy',
    'my_investments.package_name': 'Gói đầu tư',
    'my_investments.view_details': 'Xem chi tiết',
    'my_investments.loading': 'Đang tải dữ liệu đầu tư...',
    'my_investments.error': 'Có lỗi xảy ra khi tải dữ liệu',
    'my_investments.details_button': 'Chi tiết',
    'my_investments.no_investments_title': 'Chưa có khoản đầu tư nào',
    'my_investments.no_investments_description': 'Bắt đầu hành trình đầu tư Bitcoin của bạn ngay hôm nay',
    'my_investments.start_investing_button': 'Bắt đầu đầu tư',
    'my_investments.investment_date': 'Ngày đầu tư',
    'my_investments.expected_profit': 'Lợi nhuận dự kiến',
    'my_investments.loading_error': 'Lỗi tải dữ liệu đầu tư',

    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.success': 'Thành công',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.edit': 'Chỉnh sửa',
    'common.delete': 'Xóa',
    'common.confirm': 'Xác nhận',
    'common.yes': 'Có',
    'common.no': 'Không',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.account_management': 'Account Management',
    'nav.news': 'News',
    'nav.analysis': 'Analysis',
    'nav.community': 'Community',
    'nav.investment_management': 'Investment Management',
    'nav.investment_utilities': 'Investment Utilities',
    'nav.investment_guide': 'Investment Guide',
    'nav.contact': 'Contact',
    'nav.packages': 'Packages',
    'nav.investment': 'Investment',

    // Investment Calculator - CRITICAL FIXES
    'calc.title': 'Smart Investment Calculator',
    'calc.description': 'Calculate Bitcoin investment profits with AI prediction and automatic risk analysis',
    'calc.form.title': 'Investment Calculation',
    'calc.form.amount': 'Investment Amount (VND)',
    'calc.form.amount_placeholder': 'Enter amount...',
    'calc.form.duration': 'Investment Duration',
    'calc.form.duration.months': 'months',
    'calc.form.duration.6': '6 months',
    'calc.form.duration.12': '12 months',
    'calc.form.duration.18': '18 months',
    'calc.form.duration.24': '24 months',
    'calc.form.package': 'Investment Package',
    'calc.package.basic': 'Basic',
    'calc.package.premium': 'Premium',
    'calc.package.vip': 'VIP',
    'calc.risk.level': 'Risk Level',
    'calc.risk.low': 'Low',
    'calc.risk.medium': 'Medium',
    'calc.risk.high': 'High',
    'calc.results.title': 'Forecast Results',
    'calc.results.investment': 'Total Investment',
    'calc.results.profit': 'Estimated Profit',
    'calc.results.total': 'Total Return',
    'calc.ai.prediction_title': 'AI Prediction',
    'calc.ai.trend': 'Strong Uptrend',
    'calc.ai.confidence': 'Confidence: 89%',
    'calc.ai.scenario': 'Strong Growth Scenario',
    'calc.ai.market_signals': 'Market Signals',
    'calc.ai.positive_signals': 'Positive',
    'calc.ai.neutral_signals': 'Neutral',
    'calc.ai.negative_signals': 'Negative',
    'calc.disclaimer.title': 'Important Notice',
    'calc.disclaimer.text': 'Calculation results are for reference only. Investment carries risks, values may increase or decrease.',
    'calc.cta': 'Start Investing Now',

    // Contact Support - CRITICAL FIXES
    'contact.title': 'Contact & Support',
    'contact.description': 'HHDcoin expert team is always ready to support you 24/7',
    'contact.live_support': 'Live Support',
    'contact.response_time': 'Response within 2 hours',
    'contact.support_247': '24/7 Support',
    'contact.ai_assistant': 'AI Assistant always available',
    'contact.support_options.live_chat': 'Live Chat',
    'contact.support_options.video_call': 'Video Call',
    'contact.support_options.faq': 'FAQ',
    'contact.support_options.guide': 'Guide',
    'contact.support_options.live_chat_subtitle': 'Online',
    'contact.support_options.video_call_subtitle': 'Schedule',
    'contact.support_options.faq_subtitle': 'Frequently Asked Questions',
    'contact.support_options.guide_subtitle': 'Detailed Documentation',
    'contact.info.title': 'Contact Information',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Phone Number',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.privacy_policy': 'I agree with the privacy policy',
    'contact.privacy_required': 'Please agree with the privacy policy',
    'contact.all_fields_required': 'Please fill in all required fields',
    'contact.send_success': 'Message sent successfully!',
    'contact.send_error': 'Error sending message',

    // News Analysis - CRITICAL FIXES
    'news.title': 'News & Analysis',
    'news.description': 'Latest updates from Bitcoin market',
    'news.featured_article_title': '🚀 Bitcoin officially exceeds $150K: New historical record!',
    'news.featured_article_excerpt': 'For the first time in history, Bitcoin has broken the psychological threshold of $150,000, marking an important milestone for the crypto market. HHDcoin AI prediction accurately predicted this event with 94% confidence. Experts believe this is a crucial turning point for Bitcoin to become a global reserve asset...',
    'news.featured_category': 'In-depth Analysis',
    'news.time_ago': 'ago',
    'news.hours': 'hours',
    'news.minutes': 'minutes',
    'news.status.hot': 'Hot',
    'news.status.government': 'Government',
    'news.status.technology': 'Technology',
    'news.status.country': 'Country',
    'news.read_more': 'Read more',
    'news.view_all_news': 'View all news',
    'news.latest_updates': 'Latest updates from Bitcoin market',
    'news.breaking_news': 'Breaking News',
    'news.market_news': 'Market News',
    
    // News Items - NEW TRANSLATIONS
    'news.item1.title': '💰 BlackRock ETF reaches $100B AUM after Bitcoin exceeds $150K',
    'news.item2.title': '🏛️ El Salvador announces purchase of 1000 more BTC at $150K',
    'news.item3.title': '⚡ Lightning Network processes 10M transactions/day',
    'news.item4.title': '🌏 Japan considers Bitcoin as reserve asset',
    
    // Community Discussion Posts - NEW TRANSLATIONS
    'community.post1.user': 'Nguyen Hoang',
    'community.post1.title': 'Should we DCA Bitcoin in the current situation?',
    'community.post1.preview': 'With Bitcoin price fluctuating around $43K, what do you think about the DCA strategy...',
    'community.post2.user': 'HHDcoin AI Assistant',
    'community.post2.title': 'This week\'s market analysis report',
    'community.post2.preview': 'AI analysis shows Bitcoin has a 78% chance of price increase in the next 7 days based on...',
    'community.post3.user': 'Le Thanh',
    'community.post3.title': 'Technical analysis: Bull flag pattern is forming',
    'community.post3.preview': 'Looking at Bitcoin\'s 4H chart, I see a very clear bull flag pattern. Short-term target...',
    'community.reply_button.default': 'Reply',
    'community.reply_button.bot': 'View Full Report',

    // Market Analysis - CRITICAL FIXES
    'market.title': 'Market Analysis',
    'market.description': 'Bitcoin exceeds $150K - Technical analysis and market trends in historical bull run',
    'market.bitcoin_surges': '🚀 Bitcoin breaks all records - Reaches $152,500 ATH!',
    'market.realtime_updates': 'Real-time chart from CoinGecko & Binance - Updated every 30 seconds',
    'market.24h_high': '24h High',
    'market.24h_low': '24h Low',
    'market.24h_volume': '24h Volume',
    'market.24h_change': '24h Change',
    'market.chart_title': 'Bitcoin Price Chart',
    'market.technical_indicators': 'Technical Indicators',
    'market.rsi': 'RSI (14)',
    'market.macd': 'MACD',
    'market.ma_50_200': 'MA 50/200',
    'market.volume': 'Volume',
    'market.super_bull': 'Super Bull',
    'market.insights_title': 'AI Insights',
    'market.key_insights': 'Key Points',
    'market.institutional_adoption': 'Institutional adoption surges 340%',
    'market.technical_breakout': 'Technical breakout above $148K resistance',
    'market.bullish_momentum': 'Extremely strong bullish momentum with RSI > 70',
    'market.volume_surge': 'Trading volume up 185% from average',
    'market.ai_prediction': 'AI prediction for next 7 days',
    'market.bull_run_continues': 'Bull run continues with 91% probability',
    'market.target_range': 'Target: $165K - $180K',
    'market.support_level': 'Strong support at $145K',
    'market.view_detailed_analysis': 'View detailed analysis',

    // Community Section - CRITICAL FIXES
    'community.title': 'HHDcoin Community',
    'community.description': 'Connect with thousands of Bitcoin investors, share experiences and learn from experts',
    'community.community_stats': 'Community Statistics',
    'community.stats.members': 'Members',
    'community.stats.messages_today': 'Messages Today',
    'community.stats.experts': 'Experts',
    'community.stats.countries': 'Countries',
    'community.discussions.title': 'Featured Discussions',
    'community.view_all_discussions': 'View all discussions',
    'community.join_community': 'Join Community',
    'community.member_levels.vip': 'VIP Member',
    'community.member_levels.bot': 'BOT',
    'community.member_levels.expert': 'Expert Trader',
    'community.likes': 'likes',
    'community.replies': 'replies',
    'community.login_required': 'Please login to join discussions',

    // Investment Packages - CRITICAL FIXES
    'packages.loading_message': 'Loading investment packages...',
    'packages.popular': 'MOST POPULAR',
    'packages.profit': 'Annual Profit',
    'packages.features': 'Features',
    'packages.contact_for_investment': 'Contact for investment consultation',
    'packages.select': 'Select This Package',

    // Pages - CRITICAL FIXES
    'pages.news.title': 'News & Analysis',
    'pages.news.subtitle': 'Latest news updates on Bitcoin and cryptocurrency market',
    'pages.investment_guide.title': 'HHDcoin Investment Guide',
    'pages.investment_guide.step_by_step': 'Detailed step-by-step guide to start your smart Bitcoin investment journey with AI and investment utilities',
    'pages.investment_guide.utilities_title': 'Smart Investment Utilities',

    // My Investments - CRITICAL FIXES
    'my_investments.title': 'Investment Management',
    'my_investments.login_required_title': 'Login Required',
    'my_investments.login_required_message': 'You need to login to view your investment information.',
    'my_investments.login_button': 'Login Now',
    'my_investments.no_investments_title': 'No Investments Yet',
    'my_investments.no_investments_message': 'You don\'t have any investments yet. Start investing today!',
    'my_investments.start_investing': 'Start Investing',
    'my_investments.portfolio_overview': 'Portfolio Overview',
    'my_investments.total_invested': 'Total Invested',
    'my_investments.current_value': 'Current Value',
    'my_investments.total_profit': 'Total Profit',
    'my_investments.investment_details': 'Investment Details',
    'my_investments.investment_amount': 'Investment Amount',
    'my_investments.profit_loss': 'Profit/Loss',
    'my_investments.profit_loss_percentage': 'Profit/Loss Percentage',
    'my_investments.start_date': 'Start Date',
    'my_investments.end_date': 'End Date',
    'my_investments.bitcoin_code': 'Bitcoin Code',
    'my_investments.status.active': 'Active',
    'my_investments.status.completed': 'Completed',
    'my_investments.status.cancelled': 'Cancelled',
    'my_investments.package_name': 'Investment Package',
    'my_investments.view_details': 'View Details',
    'my_investments.loading': 'Loading investment data...',
    'my_investments.error': 'Error loading data',
    'my_investments.details_button': 'Details',
    'my_investments.no_investments_title': 'No Investments Yet',
    'my_investments.no_investments_description': 'Start your Bitcoin investment journey today',
    'my_investments.start_investing_button': 'Start Investing',
    'my_investments.investment_date': 'Investment Date',
    'my_investments.expected_profit': 'Expected Profit',
    'my_investments.loading_error': 'Error loading investment data',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations['vi']] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}