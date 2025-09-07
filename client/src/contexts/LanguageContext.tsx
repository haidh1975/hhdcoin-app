import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
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
    
    // Hero Section
    'hero.title': 'Đầu tư Bitcoin Thông minh với AI',
    'hero.title.highlight': 'Thông minh',
    'hero.title.suffix': 'với AI',
    'hero.description': 'Nền tảng đầu tư Bitcoin hàng đầu Việt Nam với công nghệ AI dự báo, phân tích chuyên sâu và cập nhật real-time 24/7.',
    'hero.cta.invest': 'Bắt đầu đầu tư',
    'hero.cta.demo': 'Xem demo AI',
    'hero.feature.security': 'Bảo mật tuyệt đối',
    'hero.feature.ai': 'AI dự báo chính xác',
    'hero.feature.realtime': 'Cập nhật 24/7',
    'hero.price.title': 'Giá Bitcoin hiện tại',
    'hero.ai.prediction': 'Dự báo AI (7 ngày)',
    'hero.ai.confidence': 'Độ tin cậy:',
    
    // Investment Calculator
    'calc.title': 'Máy tính đầu tư thông minh',
    'calc.description': 'Tính toán lợi nhuận đầu tư Bitcoin với AI dự báo và phân tích rủi ro tự động',
    'calc.form.title': 'Tính toán đầu tư',
    'calc.form.amount': 'Số tiền đầu tư (VNĐ)',
    'calc.form.duration': 'Thời gian đầu tư',
    'calc.form.package': 'Gói đầu tư',
    'calc.risk.level': 'Mức độ rủi ro',
    'calc.results.title': 'Kết quả dự báo',
    'calc.results.investment': 'Tổng đầu tư',
    'calc.results.profit': 'Lợi nhuận ước tính',
    'calc.results.total': 'Tổng nhận về',
    'calc.ai.trend': 'Xu hướng tăng mạnh',
    'calc.ai.confidence': 'Độ tin cậy: 89%',
    'calc.cta': 'Bắt đầu đầu tư ngay',
    
    // Investment Section
    'investment.title': 'Đầu tư Bitcoin thông minh',
    'investment.description': 'Khám phá các gói đầu tư và theo dõi hiệu quả của cộng đồng nhà đầu tư',
    'investment.tabs.packages': 'Gói đầu tư',
    'investment.tabs.investors': 'Nhà đầu tư',
    
    // Investment Packages
    'packages.title': 'Gói đầu tư HHDcoin',
    'packages.description': 'Chọn gói đầu tư phù hợp với mục tiêu tài chính của bạn',
    'packages.popular': 'PHỔ BIẾN NHẤT',
    'packages.profit': 'Lợi nhuận/năm',
    'packages.select': 'Chọn gói này',
    
    // Contact
    'contact.title': 'Liên hệ & Hỗ trợ',
    'contact.description': 'Đội ngũ chuyên gia HHDcoin luôn sẵn sàng hỗ trợ bạn 24/7',
    'contact.form.name': 'Họ và tên',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Số điện thoại',
    'contact.form.subject': 'Chủ đề',
    'contact.form.message': 'Nội dung',
    'contact.form.send': 'Gửi tin nhắn',
    'contact.form.sending': 'Đang gửi...',
    
    // Investors
    'investors.title': 'Bảng thông tin nhà đầu tư',
    'investors.description': 'Theo dõi hiệu quả đầu tư và thành tích của các nhà đầu tư trên nền tảng HHDcoin',
    'investors.stats.total': 'Tổng nhà đầu tư',
    'investors.stats.investment': 'Tổng đầu tư',
    'investors.stats.profit': 'Tổng lợi nhuận',
    'investors.table.name': 'Họ và tên',
    'investors.table.email': 'Email',
    'investors.table.phone': 'Số điện thoại',
    'investors.table.amount': 'Số tiền đầu tư',
    'investors.table.time': 'Thời gian',
    'investors.table.bitcoin': 'Mã Bitcoin',
    'investors.table.currentValue': 'Giá trị hiện tại',
    'investors.table.profit': 'Lãi/Lỗ',
    'investors.table.percentage': 'Phần trăm',
    'investors.table.status': 'Trạng thái',
    'investors.status.active': 'Hoạt động',
    'investors.status.inactive': 'Không hoạt động',
    
    // News Section
    'news.bitcoin_surge': 'Bitcoin tăng giá mạnh: Giá BTC vượt mốc $125.000 lần đầu tiên trong năm 2025 nhờ lực mua từ các tổ chức lớn.',
    'news.ai_prediction': 'AI dự báo xu hướng giảm nhẹ: Mô hình AI cho thấy xác suất điều chỉnh giá trong 3 ngày tới lên tới 63%.',
    'news.mobile_app': 'HHDcoin ra mắt phiên bản app mobile: Ứng dụng đầu tư Bitcoin tích hợp AI đã có mặt trên iOS và Android.',
    
    // Analytics Page
    'analytics.title': 'Phân tích',
    'analytics.investment_chart': 'Biểu đồ đầu tư: AI sẽ phân tích xu hướng tăng trưởng, khuyến nghị đầu tư và rủi ro dựa trên dữ liệu mới nhất.',
    'analytics.market_share': 'Biểu đồ thị phần: So sánh phần trăm đầu tư giữa các đồng coin và tổng danh mục của bạn.',
    'analytics.interest_rate': 'Phân tích lãi suất: Tự động đánh giá hiệu suất theo lãi suất %/tháng.',
    
    // Community Page
    'community.join_title': 'Đăng ký tham gia cộng đồng HHDcoin',
    'community.form.full_name': 'Họ và tên',
    'community.form.email': 'Email',
    'community.form.phone': 'Số điện thoại',
    'community.form.zalo': 'Liên hệ qua Zalo',
    'community.form.submit': 'Gửi đăng ký',
    
    // Investment Utilities
    'utilities.title': 'Tiện ích đầu tư thông minh',
    'utilities.history': 'Lịch sử đầu tư: Xem chi tiết các khoản đầu tư trước đây, bao gồm thời gian, số tiền và lãi tích lũy.',
    'utilities.pdf_contract': 'Tải hợp đồng PDF: Tải nhanh hợp đồng đầu tư có chữ ký điện tử với đầy đủ thông tin pháp lý.',
    'utilities.withdrawal': 'Gửi yêu cầu rút vốn: Nộp yêu cầu rút vốn nhanh chóng, xử lý trong vòng 24h làm việc.',
    'utilities.notifications': 'Thông báo & cảnh báo: Nhận thông báo qua email khi đến hạn hợp đồng, thay đổi trạng thái, hoặc cập nhật hệ thống.',
    
    // Investment Guide
    'guide.title': 'Hướng dẫn đầu tư HHDcoin',
    'guide.step1': '1. Tạo tài khoản: Truy cập trang Đăng ký và điền thông tin cá nhân để bắt đầu hành trình đầu tư.',
    'guide.step2': '2. Nạp khoản đầu tư: Điền số tiền (VND), thời gian đầu tư (tháng) và hệ thống sẽ tính lãi suất %/tháng.',
    'guide.step3': '3. Thanh toán & nhận hợp đồng: Bạn có thể chuyển khoản ngân hàng hoặc gửi USDT/BTC. Sau khi xác nhận, hợp đồng PDF sẽ được tạo tự động.',
    'guide.step4': '4. Quản lý & theo dõi: Vào khu vực Quản lý tài khoản để xem lịch sử đầu tư, tải hợp đồng và gửi yêu cầu rút vốn.',
    'guide.step5': '5. Chatbot AI hỗ trợ: Dùng chatbot để được hỗ trợ bất cứ lúc nào, 24/7, cả tiếng Việt và tiếng Anh.',
    
    // Contact Page
    'contact.page_title': 'Liên hệ',
    'contact.email': 'Email: haidh1975@gmail.com',
    'contact.phone': 'Tel: +84 888151975',
    'contact.address': 'Địa chỉ: Số 25, ngõ 155 đường Cầu Giấy, TP. Hà Nội',
    'contact.facebook': 'Facebook: Zalo hỗ trợ HHDcoin',
    
    // Account Management
    'account.title': 'Xem dữ liệu đầu tư',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.read_more': 'Đọc tiếp',
    'common.view_all': 'Xem tất cả',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.account_management': 'Account Management',
    'nav.news': 'News',
    'nav.analysis': 'Analytics',
    'nav.community': 'Community',
    'nav.investment_management': 'Investment Management',
    'nav.investment_utilities': 'Investment Utilities',
    'nav.investment_guide': 'Investment Guide',
    'nav.contact': 'Contact',
    'nav.packages': 'Investment Packages',
    'nav.investment': 'Investment',
    
    // Hero Section
    'hero.title': 'Smart Bitcoin Investing with AI',
    'hero.title.highlight': 'Investment',
    'hero.title.suffix': 'with AI',
    'hero.description': 'Vietnam\'s leading Bitcoin investment platform with AI-driven forecasting, in-depth analysis, and real-time updates 24/7.',
    'hero.cta.invest': 'Start Investing',
    'hero.cta.demo': 'View AI Demo',
    'hero.feature.security': 'Absolute Security',
    'hero.feature.ai': 'Accurate AI Prediction',
    'hero.feature.realtime': '24/7 Updates',
    'hero.price.title': 'Current Bitcoin Price',
    'hero.ai.prediction': 'AI Prediction (7 days)',
    'hero.ai.confidence': 'Confidence:',
    
    // Investment Calculator
    'calc.title': 'Smart Investment Calculator',
    'calc.description': 'Calculate Bitcoin investment profits with AI forecasting and automatic risk analysis',
    'calc.form.title': 'Investment Calculation',
    'calc.form.amount': 'Investment Amount (VND)',
    'calc.form.duration': 'Investment Duration',
    'calc.form.package': 'Investment Package',
    'calc.risk.level': 'Risk Level',
    'calc.results.title': 'Forecast Results',
    'calc.results.investment': 'Total Investment',
    'calc.results.profit': 'Estimated Profit',
    'calc.results.total': 'Total Return',
    'calc.ai.trend': 'Strong Upward Trend',
    'calc.ai.confidence': 'Confidence: 89%',
    'calc.cta': 'Start Investing Now',
    
    // Investment Section
    'investment.title': 'Smart Bitcoin Investment',
    'investment.description': 'Explore investment packages and track the performance of our investor community',
    'investment.tabs.packages': 'Investment Packages',
    'investment.tabs.investors': 'Investors',
    
    // Investment Packages
    'packages.title': 'HHDcoin Investment Packages',
    'packages.description': 'Choose the investment package that suits your financial goals',
    'packages.popular': 'MOST POPULAR',
    'packages.profit': 'Profit/year',
    'packages.select': 'Select This Package',
    
    // Contact
    'contact.title': 'Contact & Support',
    'contact.description': 'HHDcoin expert team is always ready to support you 24/7',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Phone Number',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    
    // Investors
    'investors.title': 'Investor Information Table',
    'investors.description': 'Track investment performance and achievements of investors on the HHDcoin platform',
    'investors.stats.total': 'Total Investors',
    'investors.stats.investment': 'Total Investment',
    'investors.stats.profit': 'Total Profit',
    'investors.table.name': 'Full Name',
    'investors.table.email': 'Email',
    'investors.table.phone': 'Phone',
    'investors.table.amount': 'Investment Amount',
    'investors.table.time': 'Time',
    'investors.table.bitcoin': 'Bitcoin Code',
    'investors.table.currentValue': 'Current Value',
    'investors.table.profit': 'Profit/Loss',
    'investors.table.percentage': 'Percentage',
    'investors.table.status': 'Status',
    'investors.status.active': 'Active',
    'investors.status.inactive': 'Inactive',
    
    // News Section
    'news.bitcoin_surge': 'Bitcoin Price Surges: BTC price surpassed the $125,000 mark for the first time in 2025 due to strong institutional buying.',
    'news.ai_prediction': 'AI Predicts Minor Correction: The AI model indicates a 63% probability of a price correction over the next 3 days.',
    'news.mobile_app': 'HHDcoin Launches Mobile App: The AI-integrated Bitcoin investment app is now available on iOS and Android.',
    
    // Analytics Page
    'analytics.title': 'Analytics',
    'analytics.investment_chart': 'Investment Chart: AI will analyze growth trends, investment recommendations, and risks based on the latest data.',
    'analytics.market_share': 'Market Share Chart: Compare the investment percentage between different coins and your total portfolio.',
    'analytics.interest_rate': 'Interest Rate Analysis: Automatically evaluate performance based on a monthly interest rate percentage.',
    
    // Community Page
    'community.join_title': 'Join the HHDcoin Community',
    'community.form.full_name': 'Full Name',
    'community.form.email': 'Email',
    'community.form.phone': 'Phone Number',
    'community.form.zalo': 'Contact via Zalo',
    'community.form.submit': 'Submit',
    
    // Investment Utilities
    'utilities.title': 'Smart Investment Utilities',
    'utilities.history': 'Investment History: View detailed past investments, including time, amount, and accumulated profit.',
    'utilities.pdf_contract': 'Download PDF Contract: Quickly download investment contracts with electronic signatures and full legal information.',
    'utilities.withdrawal': 'Submit Withdrawal Request: Submit your withdrawal request quickly; it will be processed within 24 working hours.',
    'utilities.notifications': 'Notifications & Alerts: Receive email notifications when a contract expires, a status changes, or a system update occurs.',
    
    // Investment Guide
    'guide.title': 'HHDcoin Investment Guide',
    'guide.step1': '1. Create an Account: Go to the Register page and fill in your personal information to start your investment journey.',
    'guide.step2': '2. Deposit Funds: Enter the amount (VND) and investment duration (months); the system will calculate the monthly interest rate.',
    'guide.step3': '3. Make Payment & Receive Contract: You can transfer via bank or send USDT/BTC. After confirmation, a PDF contract will be automatically generated.',
    'guide.step4': '4. Manage & Track: Access the Account Management area to view your investment history, download contracts, and submit withdrawal requests.',
    'guide.step5': '5. AI Chatbot Support: Use our chatbot for 24/7 assistance in both Vietnamese and English.',
    
    // Contact Page
    'contact.page_title': 'Contacts',
    'contact.email': 'Email: haidh1975@gmail.com',
    'contact.phone': 'Tel: +84 888151975',
    'contact.address': 'Address: 25, lane 155 Cau Giay street, Hanoi city, Vietnam',
    'contact.facebook': 'Facebook: HHDcoin Zalo Support',
    
    // Account Management
    'account.title': 'View Investment Data',
    
    // Common
    'common.loading': 'Loading...',
    'common.read_more': 'Read More',
    'common.view_all': 'View All',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
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

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['vi']] || key;
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