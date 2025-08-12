import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SiBitcoin } from "react-icons/si";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <div className="flex items-center space-x-3" data-testid="logo-section">
            <div className="w-10 h-10 bg-gradient-to-r from-bitcoin to-bitcoin-light rounded-full flex items-center justify-center">
              <SiBitcoin className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-slate">HHDcoin</h1>
              <p className="text-xs text-gray-500">Bitcoin Investment Platform</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8" data-testid="nav-menu-desktop">
            <button 
              onClick={() => scrollToSection("home")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-home"
            >
              Trang chủ
            </button>
            <button 
              onClick={() => scrollToSection("investment")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-investment"
            >
              Đầu tư
            </button>
            <button 
              onClick={() => scrollToSection("news")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-news"
            >
              Tin tức
            </button>
            <button 
              onClick={() => scrollToSection("analysis")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-analysis"
            >
              Phân tích
            </button>
            <button 
              onClick={() => scrollToSection("community")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-community"
            >
              Cộng đồng
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className="text-dark-slate hover:text-bitcoin transition-colors font-medium"
              data-testid="nav-link-contact"
            >
              Liên hệ
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2" data-testid="language-switcher">
              <span className="text-sm text-gray-600">VI</span>
              <div className="w-8 h-5 bg-gray-300 rounded-full p-1 cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full shadow transform transition-transform"></div>
              </div>
              <span className="text-sm text-gray-400">EN</span>
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
              <button 
                onClick={() => scrollToSection("home")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-home"
              >
                Trang chủ
              </button>
              <button 
                onClick={() => scrollToSection("investment")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-investment"
              >
                Đầu tư
              </button>
              <button 
                onClick={() => scrollToSection("news")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-news"
              >
                Tin tức
              </button>
              <button 
                onClick={() => scrollToSection("analysis")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-analysis"
              >
                Phân tích
              </button>
              <button 
                onClick={() => scrollToSection("community")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-community"
              >
                Cộng đồng
              </button>
              <button 
                onClick={() => scrollToSection("contact")} 
                className="text-dark-slate hover:text-bitcoin transition-colors font-medium text-left"
                data-testid="nav-link-mobile-contact"
              >
                Liên hệ
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
