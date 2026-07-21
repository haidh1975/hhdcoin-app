import { SiBitcoin, SiFacebook, SiTelegram, SiYoutube } from "react-icons/si";
import { FaTwitter } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/hhd-coin-logo.png";

export default function Footer() {
  const { t } = useLanguage();
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const quickLinks = [
    { label: t("nav.home"), section: "home" },
    { label: t("nav.investment"), section: "investment" },
    { label: t("nav.news"), section: "news" },
    { label: t("nav.analysis"), section: "analysis" },
    { label: t("nav.community"), section: "community" },
    { label: t("nav.contact"), section: "contact" }
  ];

  const supportLinks = [
    { label: t("footer.links.investment_guide"), href: "#" },
    { label: t("footer.links.faq"), href: "#" },
    { label: t("footer.links.security"), href: "#" },
    { label: t("footer.links.terms"), href: "#" },
    { label: t("footer.links.policy"), href: "#" },
    { label: t("footer.links.contact_support"), href: "mailto:haidh1975@gmail.com" }
  ];

  const footerLinks = [
    { label: t("footer.links.privacy_policy"), href: "#" },
    { label: t("footer.links.terms_of_use"), href: "#" },
    { label: t("footer.links.cookie_policy"), href: "#" },
    { label: t("footer.links.sitemap"), href: "#" }
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
              <img 
                src={logoPath} 
                alt="HHDcoin Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="text-2xl font-bold" data-testid="text-company-name">
                  <span className="text-gray-400">H</span>
                  <span className="text-blue-600">H</span>
                  <span className="text-yellow-500">D</span>
                  <span className="text-bitcoin">coin</span>
                </h3>
                <p className="text-gray-400 text-sm">{t("footer.subtitle")}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed" data-testid="text-company-description">
              <span className="text-gray-400">H</span><span className="text-blue-600">H</span><span className="text-black">D</span><span className="text-bitcoin">coin</span> {t("footer.description")}
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
            <h4 className="text-xl font-bold mb-6">{t("footer.quick_links")}</h4>
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
            <h4 className="text-xl font-bold mb-6">{t("footer.support")}</h4>
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
              {t("footer.copyright")}
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
