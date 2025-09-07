import { useState } from "react";
import { Menu, X, ChevronDown, Package, UserCheck, Users, BarChart3, Settings } from "lucide-react";
import { SiBitcoin } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ChatGPT Image 11_42_25 23 thg 8, 2025_1757214723752.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50" data-testid="header-navigation">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3" data-testid="logo-section">
            <img 
              src={logoPath} 
              alt="HHDcoin Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-gray-400">H</span>
                <span className="text-blue-600">H</span>
                <span className="text-yellow-500">D</span>
                <span className="text-bitcoin">coin</span>
              </h1>
              <p className="text-xs text-gray-500">Bitcoin Investment Platform</p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8" data-testid="nav-menu-desktop">
            <Link 
              href="/"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-home"
            >
              {t('nav.home')}
            </Link>
            
            <Link 
              href="/account-management"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-account-management"
            >
              {t('nav.account_management')}
            </Link>
            
            <Link 
              href="/news"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-news"
            >
              {t('nav.news')}
            </Link>
            
            <Link 
              href="/analysis"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-analysis"
            >
              {t('nav.analysis')}
            </Link>
            
            <Link
              href="/community"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-community"
            >
              {t('nav.community')}
            </Link>
            
            <Link 
              href="/investment-packages"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-investment-management"
            >
              {t('nav.investment_management')}
            </Link>
            
            <Link 
              href="/investment-utilities"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-investment-utilities"
            >
              {t('nav.investment_utilities')}
            </Link>
            
            <Link 
              href="/investment-guide"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-investment-guide"
            >
              {t('nav.investment_guide')}
            </Link>
            
            <Link 
              href="/contact"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-contact"
            >
              {t('nav.contact')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2" data-testid="language-switcher">
              <span 
                className={`text-sm cursor-pointer transition-colors ${
                  language === 'vi' ? 'text-bitcoin font-semibold' : 'text-gray-600 hover:text-bitcoin'
                }`}
                onClick={() => setLanguage('vi')}
              >
                VI
              </span>
              <div 
                className="w-8 h-5 bg-gray-300 rounded-full p-1 cursor-pointer relative"
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                data-testid="language-toggle"
              >
                <div 
                  className={`w-3 h-3 bg-white rounded-full shadow transform transition-transform ${
                    language === 'en' ? 'translate-x-3' : ''
                  }`}
                ></div>
              </div>
              <span 
                className={`text-sm cursor-pointer transition-colors ${
                  language === 'en' ? 'text-bitcoin font-semibold' : 'text-gray-600 hover:text-bitcoin'
                }`}
                onClick={() => setLanguage('en')}
              >
                EN
              </span>
            </div>
            <button 
              className="md:hidden text-dark-slate"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200" data-testid="nav-menu-mobile">
            <div className="flex flex-col space-y-4 pt-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-home"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/analysis"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-analysis"
              >
                Phân tích
              </Link>
              <Link
                href="/news"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-news"
              >
                Tin tức
              </Link>
              <Link
                href="/investment-packages"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-packages"
              >
                Gói đầu tư
              </Link>
              <Link
                href="/investors"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-investment"
              >
                Nhà đầu tư
              </Link>
              <Link
                href="/account-management"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-account-management"
              >
                {t('nav.account_management')}
              </Link>
              <Link
                href="/community"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-community"
              >
                {t('nav.community')}
              </Link>
              <Link
                href="/investment-utilities"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-investment-utilities"
              >
                {t('nav.investment_utilities')}
              </Link>
              <Link
                href="/investment-guide"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-investment-guide"
              >
                {t('nav.investment_guide')}
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-contact"
              >
                {t('nav.contact')}
              </Link>
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">Language:</span>
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-2 py-1 text-sm rounded ${
                    language === 'vi' ? 'bg-bitcoin text-white' : 'text-gray-600 hover:text-bitcoin'
                  }`}
                  data-testid="mobile-lang-vi"
                >
                  VI
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-sm rounded ${
                    language === 'en' ? 'bg-bitcoin text-white' : 'text-gray-600 hover:text-bitcoin'
                  }`}
                  data-testid="mobile-lang-en"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
