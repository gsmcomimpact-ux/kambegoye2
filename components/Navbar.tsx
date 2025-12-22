
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hammer, Sun, Moon, ShoppingBag, Bell, ShoppingCart, UserPlus, FileText } from 'lucide-react';
import { cartService } from '../services/cart';
import { db } from '../services/db';
import { Notification } from '../types';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') && !location.pathname.includes('/login');

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    setCartCount(cartService.getCount());
    
    const refreshData = async () => {
        const notifs = await db.getNotifications();
        setNotifCount(notifs.filter(n => !n.isRead).length);
    };
    
    refreshData();
    const handleCartUpdate = () => setCartCount(cartService.getCount());
    window.addEventListener('cart-updated', handleCartUpdate);
    
    const interval = setInterval(refreshData, 30000); // Poll notifs every 30s
    return () => {
        window.removeEventListener('cart-updated', handleCartUpdate);
        clearInterval(interval);
    };
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
    { name: 'Devis', path: '/projet', icon: FileText },
    { name: 'Devenir Ouvrier', path: '/inscription', icon: UserPlus },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-brand-600 p-1.5 rounded-lg mr-2">
                <Hammer className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">KAMBEGOYE</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  location.pathname === link.path
                    ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-gray-500 hover:text-brand-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-100 mx-2"></div>

            <Link to="/panier" className="relative p-2 text-gray-400 hover:text-brand-600 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
            </Link>

            {isAdmin && (
                <Link to="/admin" className="relative p-2 text-gray-400 hover:text-brand-600 transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifCount > 0 && <span className="absolute top-1 right-1 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{notifCount}</span>}
                </Link>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
          </div>

          <div className="flex items-center md:hidden gap-3">
             <Link to="/panier" className="relative p-2 text-gray-400">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-xl text-gray-400"><Menu size={24}/></button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 p-4 space-y-2 border-t animate-in slide-in-from-top-4 duration-200">
            {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block p-3 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 rounded-xl">{link.name}</Link>
            ))}
            <Link to="/admin/login" onClick={() => setIsOpen(false)} className="block p-3 font-bold text-brand-600 bg-brand-50 rounded-xl">Espace Pro</Link>
            <button onClick={toggleTheme} className="w-full text-left p-3 font-bold text-gray-500 flex items-center gap-2">
                {isDark ? <><Sun size={20}/> Mode Clair</> : <><Moon size={20}/> Mode Sombre</>}
            </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
