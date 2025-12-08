
import React from 'react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import WorkerDetails from './pages/WorkerDetails';
import Payment from './pages/Payment';
import PaymentCallback from './pages/PaymentCallback';
import PaymentSimulation from './pages/PaymentSimulation';
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
import CGU from './pages/Legal/CGU';
import Mentions from './pages/Legal/Mentions';

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
          <Route path="paiements" element={<AdminTransactions />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          <Route path="data" element={<AdminDataManagement />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

export default App;