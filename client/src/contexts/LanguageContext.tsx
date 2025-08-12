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
    'nav.investment': 'Đầu tư',
    'nav.news': 'Tin tức',
    'nav.analysis': 'Phân tích',
    'nav.community': 'Cộng đồng',
    'nav.contact': 'Liên hệ',
    
    // Hero Section
    'hero.title': 'Đầu tư Bitcoin',
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
    
    // Common
    'common.loading': 'Đang tải...',
    'common.read_more': 'Đọc tiếp',
    'common.view_all': 'Xem tất cả',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.investment': 'Investment',
    'nav.news': 'News',
    'nav.analysis': 'Analysis',
    'nav.community': 'Community',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Smart Bitcoin',
    'hero.title.highlight': 'Investment',
    'hero.title.suffix': 'with AI',
    'hero.description': 'Vietnam\'s leading Bitcoin investment platform with AI forecasting technology, in-depth analysis, and real-time updates 24/7.',
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