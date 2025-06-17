
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    { label: 'Register', id: 'form' },
    { label: 'About', id: 'about' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100 transition-all duration-300">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
                alt="ManaCLG LevelUp"
                className="h-10 lg:h-12 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-bold text-gray-800">ManaCLG LevelUp</h1>
                <p className="text-xs text-gray-600">Recruitment Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-gray-700 font-medium hover:text-blue-600 transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
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
    </>
  );
};

export default Header;
