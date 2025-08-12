import { SiBitcoin, SiFacebook, SiTelegram, SiYoutube } from "react-icons/si";
import { FaTwitter } from "react-icons/fa";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { label: "Trang chủ", section: "home" },
    { label: "Đầu tư", section: "investment" },
    { label: "Tin tức", section: "news" },
    { label: "Phân tích", section: "analysis" },
    { label: "Cộng đồng", section: "community" },
    { label: "Liên hệ", section: "contact" }
  ];

  const supportLinks = [
    { label: "Hướng dẫn đầu tư", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Bảo mật", href: "#" },
    { label: "Điều khoản", href: "#" },
    { label: "Chính sách", href: "#" },
    { label: "Liên hệ hỗ trợ", href: "mailto:haidh1975@gmail.com" }
  ];

  const footerLinks = [
    { label: "Chính sách bảo mật", href: "#" },
    { label: "Điều khoản sử dụng", href: "#" },
    { label: "Chính sách cookie", href: "#" },
    { label: "Sitemap", href: "#" }
  ];

  const socialLinks = [
    { 
      icon: SiFacebook, 
      href: "https://www.facebook.com/profile.php?id=100067837153049",
      label: "Facebook"
    },
    { icon: FaTwitter, href: "#", label: "Twitter" },
    { icon: SiTelegram, href: "#", label: "Telegram" },
    { icon: SiYoutube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-dark-slate text-white py-16" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2" data-testid="footer-company-info">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-bitcoin to-bitcoin-light rounded-full flex items-center justify-center">
                <SiBitcoin className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold" data-testid="text-company-name">
                  <span className="text-gray-400">H</span>
                  <span className="text-blue-600">H</span>
                  <span className="text-black">D</span>
                  <span className="text-bitcoin">coin</span>
                </h3>
                <p className="text-gray-400 text-sm">Bitcoin Investment Platform</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed" data-testid="text-company-description">
              <span className="text-gray-400">H</span><span className="text-blue-600">H</span><span className="text-black">D</span><span className="text-bitcoin">coin</span> là nền tảng đầu tư Bitcoin hàng đầu Việt Nam, cung cấp công nghệ AI dự báo tiên tiến, 
              phân tích thị trường chuyên sâu và dịch vụ tư vấn đầu tư chuyên nghiệp.
            </p>
            
            <div className="flex space-x-4" data-testid="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-bitcoin rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.label}
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="text-white h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div data-testid="footer-quick-links">
            <h4 className="text-xl font-bold mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => scrollToSection(link.section)}
                    className="text-gray-300 hover:text-bitcoin transition-colors text-left"
                    data-testid={`link-quick-${link.section}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div data-testid="footer-support">
            <h4 className="text-xl font-bold mb-6">Hỗ trợ</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-bitcoin transition-colors"
                    data-testid={`link-support-${index}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8" data-testid="footer-bottom">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="text-gray-400 text-sm mb-4 lg:mb-0" data-testid="text-copyright">
              © 2024 HHDcoin. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-gray-400" data-testid="footer-legal-links">
              {footerLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="hover:text-bitcoin transition-colors"
                  data-testid={`link-legal-${index}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
