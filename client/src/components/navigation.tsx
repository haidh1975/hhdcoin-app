import { useState } from "react";
import { Menu, X, ChevronDown, Package, UserCheck, Users, BarChart3, Settings, Coins, MapPin, Zap, Globe, FileText, GraduationCap } from "lucide-react";

// HHD-I (HHDAI) macro-intelligence platform — deployed on its own subdomain
const HHD_I_URL = "https://hhdai.hhdcoin.net";
import { SiBitcoin } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/hhd-coin-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BitcoinPriceTicker } from "@/components/BitcoinPriceTicker";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/50 sticky top-0 z-50 transition-colors duration-200" data-testid="header-navigation">
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
              href="/investment-guide"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-investment-guide"
            >
              {t('nav.investment_guide')}
            </Link>

            {/* Dự án HHD dropdown — dùng group hover CSS tránh Radix cache issue */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-dark-slate dark:text-gray-200 hover:text-bitcoin transition-colors font-medium outline-none">
                <span className="text-bitcoin font-bold">HHD</span>&nbsp;Token
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl p-1 min-w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <Link href="/tokenomics" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <Coins className="h-4 w-4 text-bitcoin flex-shrink-0" />
                  <span className="text-sm font-medium">Tokenomics</span>
                </Link>
                <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <FileText className="h-4 w-4 text-rose-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Whitepaper</span>
                </a>
                <Link href="/roadmap" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Lộ trình (Roadmap)</span>
                </Link>
                <Link href="/team" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Đội ngũ (Team)</span>
                </Link>
                <Link href="/research" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <GraduationCap className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Nghiên cứu (Research)</span>
                </Link>
                <Link href="/staking" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-bitcoin">
                  <Zap className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">Staking</span>
                </Link>
              </div>
            </div>

            {/* HHD-I — nền tảng phân tích vĩ mô (app riêng, subdomain) */}
            <a
              href={HHD_I_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
              data-testid="nav-link-hhd-i"
            >
              <Globe className="h-4 w-4" />
              HHD-I
            </a>

            <Link
              href="/contact"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-contact"
            >
              {t('nav.contact')}
            </Link>

            <Link
              href="/my-investments"
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-my-investments"
            >
              Đầu tư của tôi
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Bitcoin price real-time ticker */}
            <BitcoinPriceTicker className="hidden md:flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5" />

            {/* Dark / Light mode toggle */}
            <ThemeToggle className="hidden md:flex" />

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
            <ThemeToggle className="md:hidden" />
            <button
              className="md:hidden text-dark-slate dark:text-gray-200"
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
                href="/investment-guide"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-investment-guide"
              >
                {t('nav.investment_guide')}
              </Link>
              <div className="pt-2 pb-1 border-t border-gray-100">
                <div className="text-xs font-semibold text-bitcoin mb-2">HHD TOKEN</div>
              </div>
              <Link href="/tokenomics" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <Coins className="h-4 w-4 text-bitcoin" /> Tokenomics
              </Link>
              <a href="/whitepaper.pdf" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <FileText className="h-4 w-4 text-rose-500" /> Whitepaper
              </a>
              <Link href="/roadmap" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <MapPin className="h-4 w-4 text-blue-500" /> Lộ trình
              </Link>
              <Link href="/team" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <Users className="h-4 w-4 text-purple-500" /> Đội ngũ
              </Link>
              <Link href="/research" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <GraduationCap className="h-4 w-4 text-indigo-500" /> Nghiên cứu
              </Link>
              <Link href="/staking" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-dark-slate hover:text-bitcoin transition-colors font-medium">
                <Zap className="h-4 w-4 text-green-500" /> Staking
              </Link>
              <a
                href={HHD_I_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold w-fit"
                data-testid="nav-link-mobile-hhd-i"
              >
                <Globe className="h-4 w-4" /> HHD-I — Phân tích vĩ mô
              </a>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-contact"
              >
                {t('nav.contact')}
              </Link>
              
              <Link
                href="/my-investments"
                onClick={() => setIsMenuOpen(false)}
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-my-investments"
              >
                Đầu tư của tôi
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
