import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, LogOut, Home, Database, Settings, ShoppingBag, Tags, FileText, Image, FileSpreadsheet, Receipt, Briefcase, AlertTriangle, Handshake, Menu, X, UserCog, Shield } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Initialize role directly from storage to avoid redirect flickers
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('kambegoye_admin_role') || 'manager');

  useEffect(() => {
    if (!localStorage.getItem('kambegoye_admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('kambegoye_admin_token');
    localStorage.removeItem('kambegoye_admin_role');
    navigate('/admin/login');
  };

  // Define Nav items with allowed roles
  // If allowedRoles is undefined, it's accessible by everyone (admin + manager)
  const allNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Projets / Demandes', path: '/admin/projets', icon: FileText },
    { name: 'Litiges / Réclamations', path: '/admin/litiges', icon: AlertTriangle },
    { name: 'Générateur Devis', path: '/admin/devis', icon: FileSpreadsheet },
    { name: 'Ouvriers', path: '/admin/ouvriers', icon: Users },
    { name: 'Métiers (Spécialités)', path: '/admin/specialties', icon: Briefcase },
    { name: 'Partenaires', path: '/admin/partners', icon: Handshake },
    { name: 'Boutique', path: '/admin/produits', icon: ShoppingBag },
    { name: 'Catégories Produits', path: '/admin/categories-produits', icon: Tags },
    { name: 'Factures', path: '/admin/factures', icon: Receipt },
    { name: 'Paiements', path: '/admin/paiements', icon: Wallet },
    { name: 'Médiathèque', path: '/admin/media', icon: Image },
    // Restricted Items (Admin Only)
    { name: 'Utilisateurs', path: '/admin/users', icon: Shield, allowedRoles: ['admin'] },
    { name: 'Données', path: '/admin/data', icon: Database, allowedRoles: ['admin'] },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings, allowedRoles: ['admin'] },
  ];

  // Redirect if user tries to access a restricted route manually
  useEffect(() => {
      const currentItem = allNavItems.find(item => item.path === location.pathname);
      if (currentItem && currentItem.allowedRoles && !currentItem.allowedRoles.includes(userRole)) {
          navigate('/admin'); // Redirect unauthorized access to dashboard
      }
  }, [location.pathname, userRole, navigate]);

  const visibleNavItems = allNavItems.filter(item => {
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(userRole);
  });

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand-600">KAMBEGOYE</h1>
        <div className="flex items-center mt-1">
            <UserCog className="w-3 h-3 text-gray-400 mr-1" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">{userRole === 'admin' ? 'Administrateur' : 'Manager'}</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {visibleNavItems.map((item) => (
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
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex flex-col h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-10">
           <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
             >
                <Menu className="h-6 w-6" />
             </button>
             <span className="font-bold text-lg text-gray-900 dark:text-white">Admin Panel</span>
           </div>
           
           <div className="flex items-center gap-4">
             <Link to="/"><Home size={20} className="text-gray-600 dark:text-gray-300" /></Link>
           </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;