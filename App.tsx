import React, { ErrorInfo, ReactNode } from 'react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import AdminProjectRequests from './pages/admin/ProjectRequests';
import AdminMediaLibrary from './pages/admin/MediaLibrary';
import AdminQuotes from './pages/admin/Quotes';
import CGU from './pages/Legal/CGU';
import Mentions from './pages/Legal/Mentions';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
            <p className="text-gray-700 mb-4">L'application a rencontré un problème inattendu.</p>
            <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-auto max-h-48 mb-6 border border-gray-300">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      {/* MemoryRouter est utilisé pour éviter les erreurs de sécurité (Location.assign denied) 
          liées à l'utilisation de HashRouter sur une URL Blob/iframe sandboxée */}
      <MemoryRouter>
        <Routes>
          {/* Client Routes */}
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
            <Route path="projet" element={<ProjectRequestPage />} />
            <Route path="cgu" element={<CGU />} />
            <Route path="mentions-legales" element={<Mentions />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ouvriers" element={<AdminWorkers />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="categories-produits" element={<AdminProductCategories />} />
            <Route path="projets" element={<AdminProjectRequests />} />
            <Route path="devis" element={<AdminQuotes />} />
            <Route path="paiements" element={<AdminTransactions />} />
            <Route path="media" element={<AdminMediaLibrary />} />
            <Route path="data" element={<AdminDataManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ErrorBoundary>
  );
};

export default App;