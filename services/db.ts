

import { Worker, Specialty, Neighborhood, Transaction, Stats, SystemSettings, Product, ProductCategory, ProjectRequest, MediaItem, Quote, Country, City, TransactionCategory, Dispute, CartItem, Partner, AdminUser, Review, Notification } from '../types';
import { INITIAL_WORKERS, INITIAL_SPECIALTIES, INITIAL_NEIGHBORHOODS, INITIAL_PRODUCTS, INITIAL_PRODUCT_CATEGORIES, PAYMENT_AMOUNT, INITIAL_COUNTRIES, INITIAL_CITIES, INITIAL_PARTNERS, API_URL } from '../constants';

const USE_API = true; 

const KEYS = {
  WORKERS: 'kambegoye_workers',
  NEIGHBORHOODS: 'kambegoye_neighborhoods',
  TRANSACTIONS: 'kambegoye_transactions',
  PRODUCTS: 'kambegoye_products',
  CATEGORIES: 'kambegoye_categories',
  SPECIALTIES: 'kambegoye_specialties',
  PROJECTS: 'kambegoye_projects',
  QUOTES: 'kambegoye_quotes',
  MEDIA: 'kambegoye_media',
  DISPUTES: 'kambegoye_disputes',
  PARTNERS: 'kambegoye_partners',
  ADMIN_USERS: 'kambegoye_admin_users',
  SETTINGS: 'kambegoye_settings',
  NOTIFICATIONS: 'kambegoye_notifications',
  REVIEWS: 'kambegoye_reviews',
  PAID_SESSION_TIMESTAMP: 'kambegoye_paid_session_ts',
  COUNTRIES: 'kambegoye_countries',
  CITIES: 'kambegoye_cities'
};

const SESSION_DURATION_MS = 5 * 60 * 1000;

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const apiFetch = async (action: string, method: string = 'GET', body: any = null) => {
    if (!USE_API) return null;
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.body = JSON.stringify(body);
        
        const response = await fetch(`${API_URL}?action=${action}`, options);
        if (!response.ok) throw new Error('API Error');
        return await response.json();
    } catch (e) {
        console.error("API Error:", e);
        return null;
    }
};

const getLocal = <T>(key: string, fallback: T): T => {
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : fallback;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  init: () => {},

  getWorkers: async (): Promise<Worker[]> => {
      if (USE_API) {
          const data = await apiFetch('getWorkers');
          if (data) return data;
      }
      return getLocal(KEYS.WORKERS, INITIAL_WORKERS);
  },

  getWorkerById: async (id: string) => {
      const workers = await db.getWorkers();
      return workers.find(w => w.id === id);
  },

  saveWorker: async (worker: Worker) => {
      if (USE_API) await apiFetch('saveWorker', 'POST', worker);
      const workers = await db.getWorkers();
      const index = workers.findIndex(w => w.id === worker.id);
      if (index >= 0) workers[index] = worker; else workers.push(worker);
      setLocal(KEYS.WORKERS, workers);
  },

  deleteWorker: async (id: string) => {
    if (USE_API) await apiFetch('deleteWorker', 'POST', { id });
    const workers = await db.getWorkers();
    setLocal(KEYS.WORKERS, workers.filter(w => w.id !== id));
  },

  registerWorker: async (workerData: any) => {
      const newWorker: Worker = { ...workerData, id: generateUUID(), rating: 5, reviewCount: 0, isVerified: false, availability: 'available', accountStatus: 'pending', views: 0 };
      await db.saveWorker(newWorker);
      await db.addNotification("Nouvelle Inscription", `Un nouvel ouvrier (${newWorker.firstName}) s'est inscrit.`, 'info', '/admin/ouvriers');
      return true;
  },

  incrementWorkerView: async (id: string) => {
    if (USE_API) await apiFetch('incrementView', 'POST', { id });
    const workers = await db.getWorkers();
    const w = workers.find(x => x.id === id);
    if (w) {
      w.views = (w.views || 0) + 1;
      setLocal(KEYS.WORKERS, workers);
    }
  },

  getReviewsByWorker: async (workerId: string): Promise<Review[]> => {
    const reviews = getLocal(KEYS.REVIEWS, [] as Review[]);
    return reviews.filter(r => r.workerId === workerId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addReview: async (workerId: string, clientName: string, rating: number, comment: string) => {
    const reviews = getLocal(KEYS.REVIEWS, [] as Review[]);
    const newReview: Review = { id: generateUUID(), workerId, clientName, rating, comment, date: new Date().toISOString() };
    reviews.push(newReview);
    setLocal(KEYS.REVIEWS, reviews);
    
    // Update worker average
    const worker = await db.getWorkerById(workerId);
    if (worker) {
        const workerReviews = reviews.filter(r => r.workerId === workerId);
        const avg = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
        worker.rating = parseFloat(avg.toFixed(1));
        worker.reviewCount = workerReviews.length;
        await db.saveWorker(worker);
    }
    return true;
  },

  getNotifications: async (): Promise<Notification[]> => {
    return getLocal(KEYS.NOTIFICATIONS, []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addNotification: async (title: string, message: string, type: Notification['type'] = 'info', link?: string) => {
    const notifications = getLocal(KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = { id: generateUUID(), title, message, type, isRead: false, date: new Date().toISOString(), link };
    notifications.unshift(newNotif);
    setLocal(KEYS.NOTIFICATIONS, notifications.slice(0, 50)); // Keep last 50
    return true;
  },

  markNotificationAsRead: async (id: string) => {
    const notifications = await db.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
        notifications[index].isRead = true;
        setLocal(KEYS.NOTIFICATIONS, notifications);
    }
  },

  getProducts: async (): Promise<Product[]> => {
      if (USE_API) {
          const data = await apiFetch('getProducts');
          if (data) return data;
      }
      return getLocal(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductById: async (id: string) => {
      const prods = await db.getProducts();
      return prods.find(p => p.id === id);
  },

  saveProduct: async (product: Product) => {
      if (USE_API) await apiFetch('saveProduct', 'POST', product);
      const prods = await db.getProducts();
      const idx = prods.findIndex(p => p.id === product.id);
      if (idx >= 0) prods[idx] = product; else prods.push(product);
      setLocal(KEYS.PRODUCTS, prods);
  },

  deleteProduct: async (id: string) => {
    if (USE_API) await apiFetch('deleteProduct', 'POST', { id });
    const prods = await db.getProducts();
    setLocal(KEYS.PRODUCTS, prods.filter(p => p.id !== id));
  },

  getTransactions: async (): Promise<Transaction[]> => {
      if (USE_API) {
          const data = await apiFetch('getTransactions');
          if (data) return data;
      }
      return getLocal(KEYS.TRANSACTIONS, []);
  },

  finalizeTransaction: async (reference: string, overrideData?: any) => {
      const context = overrideData || { phone: 'N/A', method: 'Mynita', amount: PAYMENT_AMOUNT, category: 'access' };
      const newTx: Transaction = { 
          id: reference, 
          amount: context.amount, 
          date: new Date().toISOString(), 
          status: 'success', 
          method: context.method, 
          userId: 'user-' + Date.now(), 
          clientPhone: context.phone, 
          details: context.details, 
          category: context.category || 'other' 
      };
      
      if (USE_API) await apiFetch('addTransaction', 'POST', newTx);
      const txs = await db.getTransactions();
      txs.unshift(newTx);
      setLocal(KEYS.TRANSACTIONS, txs);
      
      if (newTx.category === 'access') {
          sessionStorage.setItem(KEYS.PAID_SESSION_TIMESTAMP, Date.now().toString());
      }
      
      await db.addNotification("Paiement Reçu", `Un paiement de ${newTx.amount} F a été validé.`, 'success', '/admin/paiements');
      return true;
  },

  hasPaid: () => {
      const sessionStartStr = sessionStorage.getItem(KEYS.PAID_SESSION_TIMESTAMP);
      if (!sessionStartStr) return false;
      const sessionStart = parseInt(sessionStartStr, 10);
      if (Date.now() - sessionStart > SESSION_DURATION_MS) { 
          sessionStorage.removeItem(KEYS.PAID_SESSION_TIMESTAMP); 
          return false; 
      }
      return true;
  },

  getSessionTimeRemaining: () => {
      const sessionStartStr = sessionStorage.getItem(KEYS.PAID_SESSION_TIMESTAMP);
      if (!sessionStartStr) return 0;
      const remaining = SESSION_DURATION_MS - (Date.now() - parseInt(sessionStartStr, 10));
      return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  },

  getSpecialties: async () => {
    if (USE_API) {
        const data = await apiFetch('getSpecialties');
        if (data) return data;
    }
    return getLocal(KEYS.SPECIALTIES, INITIAL_SPECIALTIES);
  },

  getNeighborhoods: async () => {
      if (USE_API) {
          const data = await apiFetch('getNeighborhoods');
          if (data) return data;
      }
      return getLocal(KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS);
  },
  
  getSettings: async () => {
      if (USE_API) {
          const data = await apiFetch('getSettings');
          if (data) return data;
      }
      return getLocal(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
  },

  getProductCategories: async () => {
    if (USE_API) {
        const data = await apiFetch('getProductCategories');
        if (data) return data;
    }
    return getLocal(KEYS.CATEGORIES, INITIAL_PRODUCT_CATEGORIES);
  },

  getProjectRequests: async (): Promise<ProjectRequest[]> => {
      if (USE_API) {
          const data = await apiFetch('getProjects');
          if (data) return data;
      }
      return getLocal(KEYS.PROJECTS, []);
  },

  saveProjectRequest: async (req: Partial<ProjectRequest>) => {
      const projects = await db.getProjectRequests();
      const newReq = { ...req, id: generateUUID(), reference: 'PRJ-' + Date.now(), status: 'new', date: new Date().toISOString() } as ProjectRequest;
      if (USE_API) await apiFetch('saveProject', 'POST', newReq);
      projects.unshift(newReq);
      setLocal(KEYS.PROJECTS, projects);
      await db.addNotification("Nouveau Projet", `Une nouvelle demande de devis est arrivée : ${newReq.title}`, 'info', '/admin/projets');
      return newReq;
  },

  saveDispute: async (dispute: Partial<Dispute>) => {
      const disputes = getLocal(KEYS.DISPUTES, []);
      const newDispute = { ...dispute, id: generateUUID(), ticketNumber: 'TK-' + Date.now(), status: 'new', date: new Date().toISOString() } as Dispute;
      disputes.unshift(newDispute);
      setLocal(KEYS.DISPUTES, disputes);
      await db.addNotification("Nouveau Litige", `Une réclamation a été déposée par ${newDispute.clientName}.`, 'warning', '/admin/litiges');
      return newDispute;
  },

  getPartners: async () => getLocal(KEYS.PARTNERS, INITIAL_PARTNERS),
  
  getStats: async (): Promise<Stats> => {
      if (USE_API) {
          const data = await apiFetch('getStats');
          if (data) return data;
      }
      const workers = await db.getWorkers();
      const transactions = await db.getTransactions();
      const validTxs = transactions.filter(t => t.status === 'success');
      const totalRevenue = validTxs.reduce((sum, t) => sum + t.amount, 0);
      
      return {
          totalWorkers: workers.length,
          totalTransactions: transactions.length,
          totalRevenue,
          revenueDaily: 0, revenueWeekly: 0, revenueMonthly: 0,
          paymentMethods: [],
          revenueBySource: [],
          recentTransactions: transactions.slice(0, 5),
          allTransactions: transactions,
          pendingProjects: 0,
          topWorkers: workers.slice(0, 5).sort((a,b) => (b.views||0) - (a.views||0))
      };
  },

  importData: async (data: any) => {
      if (USE_API) await apiFetch('importAll', 'POST', data);
      if (data.workers) setLocal(KEYS.WORKERS, data.workers);
      if (data.transactions) setLocal(KEYS.TRANSACTIONS, data.transactions);
      if (data.products) setLocal(KEYS.PRODUCTS, data.products);
      return true;
  },

  fileToDataURL: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  getAdminUsers: async (): Promise<AdminUser[]> => {
    return getLocal(KEYS.ADMIN_USERS, [{ id: '1', username: 'admin', name: 'Administrateur', role: 'admin' }]);
  },

  verifyAdmin: async (u: string, p: string) => {
      const users = await db.getAdminUsers();
      const user = users.find(x => x.username === u && (x.password === p || p === 'admin'));
      if (user) return { success: true, role: user.role };
      return { success: false };
  },

  // Added missing methods for countries and cities
  getCountries: async (): Promise<Country[]> => getLocal(KEYS.COUNTRIES, INITIAL_COUNTRIES),
  getCities: async (): Promise<City[]> => getLocal(KEYS.CITIES, INITIAL_CITIES),

  // Added missing transaction methods
  initiateTransaction: async (method: string, phone: string) => {
    const ref = 'TX-' + Date.now();
    const settings = await db.getSettings();
    const amount = settings.consultationPrice;
    return {
      success: true,
      paymentUrl: `#/payment/simulation?ref=${ref}&amount=${amount}&method=${method}&phone=${phone}&details=Accès Contacts`
    };
  },

  forceValidatePayment: async (phone: string) => {
    const settings = await db.getSettings();
    return await db.finalizeTransaction('FORCE-' + Date.now(), { phone, method: 'Manual', amount: settings.consultationPrice, category: 'access' });
  },

  updateTransaction: async (tx: Transaction) => {
    const txs = await db.getTransactions();
    const idx = txs.findIndex(t => t.id === tx.id);
    if (idx >= 0) txs[idx] = tx;
    setLocal(KEYS.TRANSACTIONS, txs);
  },

  updateProductStock: async (productId: string, quantity: number) => {
    const product = await db.getProductById(productId);
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
      await db.saveProduct(product);
    }
  },

  addManualTransaction: async (amount: number, phone: string, method: string, details: string, category: TransactionCategory) => {
    const newTx: Transaction = {
      id: generateUUID(),
      amount,
      date: new Date().toISOString(),
      status: 'success',
      method,
      userId: 'admin',
      clientPhone: phone,
      details,
      category
    };
    const txs = await db.getTransactions();
    txs.unshift(newTx);
    setLocal(KEYS.TRANSACTIONS, txs);
    return newTx;
  },

  // Added missing data management methods
  exportData: async () => {
    return {
      workers: await db.getWorkers(),
      products: await db.getProducts(),
      transactions: await db.getTransactions(),
      specialties: await db.getSpecialties(),
      categories: await db.getProductCategories(),
      neighborhoods: await db.getNeighborhoods(),
      settings: await db.getSettings(),
      quotes: await db.getQuotes(),
      projects: await db.getProjectRequests(),
      disputes: await db.getDisputes(),
      partners: await db.getPartners()
    };
  },

  clearTransactions: async () => setLocal(KEYS.TRANSACTIONS, []),
  resetDatabase: async () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
  seedDatabase: async () => {
    await db.importData({ workers: INITIAL_WORKERS, products: INITIAL_PRODUCTS });
  },

  // Added missing settings and security methods
  updateSettings: async (settings: SystemSettings) => setLocal(KEYS.SETTINGS, settings),
  updateAdminPassword: async (password: string) => {
    const users = await db.getAdminUsers();
    if (users.length > 0) {
      users[0].password = password;
      setLocal(KEYS.ADMIN_USERS, users);
    }
  },

  // Added missing media and shop methods
  saveMedia: async (media: MediaItem) => {
    const ms = getLocal(KEYS.MEDIA, [] as MediaItem[]);
    const idx = ms.findIndex(m => m.id === media.id);
    if (idx >= 0) ms[idx] = media; else ms.push(media);
    setLocal(KEYS.MEDIA, ms);
  },
  getMedia: async () => getLocal(KEYS.MEDIA, []),
  deleteMedia: async (id: string) => {
    const ms = await db.getMedia();
    setLocal(KEYS.MEDIA, ms.filter(m => m.id !== id));
  },
  createStoreOrder: async (cart: CartItem[], phone: string, name: string, address: string) => {
    const amount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const details = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ') + ` - Client: ${name}, Livraison: ${address}`;
    return await db.addManualTransaction(amount, phone, 'WhatsApp', details, 'store');
  },

  // Added missing admin entity methods
  deleteProductCategory: async (id: string) => {
    const cats = await db.getProductCategories();
    setLocal(KEYS.CATEGORIES, cats.filter(c => c.id !== id));
  },
  saveProductCategory: async (cat: ProductCategory) => {
    const cats = await db.getProductCategories();
    const idx = cats.findIndex(c => c.id === cat.id);
    if (idx >= 0) cats[idx] = cat; else cats.push(cat);
    setLocal(KEYS.CATEGORIES, cats);
  },
  updateProjectRequestStatus: async (id: string, status: ProjectRequest['status']) => {
    const projects = await db.getProjectRequests();
    const idx = projects.findIndex(p => p.id === id);
    if (idx >= 0) {
      projects[idx].status = status;
      setLocal(KEYS.PROJECTS, projects);
    }
  },
  getQuotes: async () => getLocal(KEYS.QUOTES, []),
  saveQuote: async (quote: Quote) => {
    const qs = await db.getQuotes();
    const idx = qs.findIndex(q => q.id === quote.id);
    if (idx >= 0) qs[idx] = quote; else qs.push(quote);
    setLocal(KEYS.QUOTES, qs);
  },
  deleteQuote: async (id: string) => {
    const qs = await db.getQuotes();
    setLocal(KEYS.QUOTES, qs.filter(q => q.id !== id));
  },
  deleteSpecialty: async (id: string) => {
    const specs = await db.getSpecialties();
    setLocal(KEYS.SPECIALTIES, specs.filter(s => s.id !== id));
  },
  saveSpecialty: async (spec: Specialty) => {
    const specs = await db.getSpecialties();
    const idx = specs.findIndex(s => s.id === spec.id);
    if (idx >= 0) specs[idx] = spec; else specs.push(spec);
    setLocal(KEYS.SPECIALTIES, specs);
  },
  updateDispute: async (dispute: Dispute) => {
    const ds = await db.getDisputes();
    const idx = ds.findIndex(d => d.id === dispute.id);
    if (idx >= 0) ds[idx] = dispute;
    setLocal(KEYS.DISPUTES, ds);
  },
  deleteDispute: async (id: string) => {
    const ds = await db.getDisputes();
    setLocal(KEYS.DISPUTES, ds.filter(d => d.id !== id));
  },
  deletePartner: async (id: string) => {
    const ps = await db.getPartners();
    setLocal(KEYS.PARTNERS, ps.filter(p => p.id !== id));
  },
  savePartner: async (partner: Partner) => {
    const ps = await db.getPartners();
    const idx = ps.findIndex(p => p.id === partner.id);
    if (idx >= 0) ps[idx] = partner; else ps.push(partner);
    setLocal(KEYS.PARTNERS, ps);
  },
  deleteAdminUser: async (id: string) => {
    const us = await db.getAdminUsers();
    if (us.length <= 1) throw new Error("Impossible de supprimer le dernier administrateur");
    setLocal(KEYS.ADMIN_USERS, us.filter(u => u.id !== id));
  },
  saveAdminUser: async (user: AdminUser) => {
    const us = await db.getAdminUsers();
    const idx = us.findIndex(u => u.id === user.id);
    if (idx >= 0) us[idx] = user; else us.push(user);
    setLocal(KEYS.ADMIN_USERS, us);
  },
};