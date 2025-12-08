
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hammer, Sun, Moon, UserPlus, ShoppingBag, FileText } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Trouver un ouvrier', path: '/search' },
    { name: 'Boutique', path: '/boutique', icon: ShoppingBag },
    { name: 'Demander un Devis', path: '/projet', icon: FileText },
    { name: 'Devenir Ouvrier', path: '/inscription', icon: UserPlus },
    { name: 'Espace Pro', path: '/admin/login' }, 
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Hammer className="h-8 w-8 text-brand-600 dark:text-brand-500" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">KAMBEGOYE</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-brand-600 bg-brand-50 dark:bg-gray-800 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 mr-1.5" />}
                {link.name}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 mr-2" />}
                {link.name}
              </Link>
            ))}
             <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
            >
              {isDark ? <><Sun className="h-5 w-5 mr-2" /> Mode Clair</> : <><Moon className="h-5 w-5 mr-2" /> Mode Sombre</>}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
