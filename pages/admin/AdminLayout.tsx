
import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, LogOut, Home, Database, Settings, ShoppingBag, Tags, FileText, Image, FileSpreadsheet } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('kambegoye_admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('kambegoye_admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Projets / Demandes', path: '/admin/projets', icon: FileText },
    { name: 'Générateur Devis', path: '/admin/devis', icon: FileSpreadsheet },
    { name: 'Ouvriers', path: '/admin/ouvriers', icon: Users },
    { name: 'Boutique', path: '/admin/produits', icon: ShoppingBag },
    { name: 'Catégories', path: '/admin/categories-produits', icon: Tags },
    { name: 'Paiements', path: '/admin/paiements', icon: Wallet },
    { name: 'Médiathèque', path: '/admin/media', icon: Image },
    { name: 'Données', path: '/admin/data', icon: Database },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-600">KAMBEGOYE</h1>
          <p className="text-xs text-gray-500">Administration</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-50 text-brand-600 dark:bg-gray-700 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Link
             to="/"
             className="flex items-center w-full px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
          >
            <Home className="h-5 w-5 mr-3" />
            Retour au Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Mobile Header & Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
           <span className="font-bold text-lg">Admin Panel</span>
           <div className="flex items-center gap-4">
             <Link to="/"><Home size={20} className="text-gray-600 dark:text-gray-300" /></Link>
             <button onClick={handleLogout} className="text-red-500"><LogOut size={20}/></button>
           </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;