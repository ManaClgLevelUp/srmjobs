import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'form') {
      const element = document.getElementById('registration-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'Benefits', id: 'benefits' },
    { label: 'Register', id: 'registration-form' },
    { label: 'About', id: 'about' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="px-5 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
              alt="ManaCLG LevelUp"
              className="h-10 w-auto"
            />
            <div className={`ml-3 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              <h1 className="text-lg font-bold leading-tight">ManaCLG LevelUp</h1>
              <p className="text-xs">Careers & Recruitment</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`font-medium hover:text-orange-500 transition-colors duration-300 relative group ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="pt-20 px-6">
              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="block w-full text-left text-gray-700 font-medium text-lg hover:text-blue-600 transition-colors duration-300 py-3 border-b border-gray-100 last:border-0"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
