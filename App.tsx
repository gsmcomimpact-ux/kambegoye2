

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Search from './pages/Search';
import WorkerDetails from './pages/WorkerDetails';
import Payment from './pages/Payment';
import PaymentCallback from './pages/PaymentCallback';
import PaymentSimulation from './pages/PaymentSimulation';
import AccessContacts from './pages/AccessContacts';
import Register from './pages/Register';
import Shop from './pages/Shop';
import ShopProduct from './pages/ShopProduct';
import Cart from './pages/Cart';
import ProjectRequestPage from './pages/ProjectRequest';
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminWorkers from './pages/admin/Workers';
import AdminTransactions from './pages/admin/Transactions';
import AdminDataManagement from './pages/admin/DataManagement';
import AdminSettings from './pages/admin/Settings';
import AdminProducts from './pages/admin/Products';
import AdminProductCategories from './pages/admin/ProductCategories';
import AdminSpecialties from './pages/admin/Specialties';
import AdminProjectRequests from './pages/admin/ProjectRequests';
import AdminMediaLibrary from './pages/admin/MediaLibrary';
import AdminQuotes from './pages/admin/Quotes';
import AdminDisputes from './pages/admin/Disputes';
import AdminPartners from './pages/admin/Partners';
import AdminUsers from './pages/admin/Users';
import CGU from './pages/Legal/CGU';
import Mentions from './pages/Legal/Mentions';
import Reclamation from './pages/Reclamation';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Use property initialization for state to avoid potential scope issues
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical error captured:", error, errorInfo);
  }

  render() {
    // Explicitly use this.state
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Désolé, une erreur est survenue</h2>
            <p className="text-gray-600 mb-6">L'application doit être rechargée.</p>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-all font-bold"
            >
              Réinitialiser et Recharger
            </button>
          </div>
        </div>
      );
    }
    // Explicitly use this.props
    return this.props.children;
  }
}

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <AIAssistant />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="ouvrier/:id" element={<WorkerDetails />} />
            <Route path="payment" element={<Payment />} />
            <Route path="payment/callback" element={<PaymentCallback />} />
            <Route path="payment/simulation" element={<PaymentSimulation />} />
            <Route path="access-contacts" element={<AccessContacts />} />
            <Route path="inscription" element={<Register />} />
            <Route path="boutique" element={<Shop />} />
            <Route path="boutique/:id" element={<ShopProduct />} />
            <Route path="panier" element={<Cart />} />
            <Route path="projet" element={<ProjectRequestPage />} />
            <Route path="cgu" element={<CGU />} />
            <Route path="mentions-legales" element={<Mentions />} />
            <Route path="reclamation" element={<Reclamation />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ouvriers" element={<AdminWorkers />} />
            <Route path="specialties" element={<AdminSpecialties />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="categories-produits" element={<AdminProductCategories />} />
            <Route path="projets" element={<AdminProjectRequests />} />
            <Route path="litiges" element={<AdminDisputes />} />
            <Route path="devis" element={<AdminQuotes />} />
            <Route path="factures" element={<AdminTransactions />} />
            <Route path="paiements" element={<AdminTransactions />} />
            <Route path="media" element={<AdminMediaLibrary />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="data" element={<AdminDataManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;