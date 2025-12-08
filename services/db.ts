
import { Worker, Specialty, Neighborhood, Transaction, Stats, SystemSettings, Product, ProductCategory, ProjectRequest, MediaItem } from '../types';
import { INITIAL_WORKERS, INITIAL_SPECIALTIES, INITIAL_NEIGHBORHOODS, INITIAL_PRODUCTS, INITIAL_PRODUCT_CATEGORIES, PAYMENT_AMOUNT, IPAY_CONFIG } from '../constants';

// Keys for LocalStorage
const KEYS = {
  WORKERS: 'kambegoye_workers',
  SPECIALTIES: 'kambegoye_specialties',
  NEIGHBORHOODS: 'kambegoye_neighborhoods',
  TRANSACTIONS: 'kambegoye_transactions',
  PRODUCTS: 'kambegoye_products',
  PRODUCT_CATEGORIES: 'kambegoye_product_categories',
  PROJECT_REQUESTS: 'kambegoye_project_requests',
  PAID_SESSION: 'kambegoye_paid_session',
  SETTINGS: 'kambegoye_settings',
  ADMIN_AUTH: 'kambegoye_admin_auth',
  MEDIA: 'kambegoye_media'
};

const ADMIN_CONTACT = {
    phone: '22797390569',
    email: 'contact@kambegoye.com'
};

// UUID Polyfill
const generateUUID = () => {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch (e) {
    // Ignore
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const initDB = () => {
  if (!localStorage.getItem(KEYS.WORKERS)) {
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
  } else {
    // Migration: Ensure all workers have accountStatus and views
    const workers = safeParse<Worker[]>(KEYS.WORKERS, []);
    const updatedWorkers = workers.map(w => ({
        ...w,
        accountStatus: w.accountStatus || 'active',
        views: w.views || 0 // Initialize views if missing
    }));
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(updatedWorkers));
  }

  // Specialties Merge
  const storedSpecialties = safeParse<Specialty[]>(KEYS.SPECIALTIES, []);
  if (storedSpecialties.length === 0) {
    localStorage.setItem(KEYS.SPECIALTIES, JSON.stringify(INITIAL_SPECIALTIES));
  } else {
    const existingIds = new Set(storedSpecialties.map(s => s.id));
    let hasChanges = false;
    const updatedSpecialties = [...storedSpecialties];

    INITIAL_SPECIALTIES.forEach(initSpec => {
      if (!existingIds.has(initSpec.id)) {
        updatedSpecialties.push(initSpec);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(KEYS.SPECIALTIES, JSON.stringify(updatedSpecialties));
    }
  }

  // Neighborhoods Merge
  const storedHoods = safeParse<Neighborhood[]>(KEYS.NEIGHBORHOODS, []);
  if (storedHoods.length === 0) {
    localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(INITIAL_NEIGHBORHOODS));
  } else {
    const existingIds = new Set(storedHoods.map(n => n.id));
    let hasChanges = false;
    const updatedHoods = [...storedHoods];

    INITIAL_NEIGHBORHOODS.forEach(initHood => {
      if (!existingIds.has(initHood.id)) {
        updatedHoods.push(initHood);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(updatedHoods));
    }
  }
  
  // Products Init
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }

  // Product Categories Init
  const storedProdCats = safeParse<ProductCategory[]>(KEYS.PRODUCT_CATEGORIES, []);
  if (storedProdCats.length === 0) {
    localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(INITIAL_PRODUCT_CATEGORIES));
  }

  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(KEYS.PROJECT_REQUESTS)) {
    localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ consultationPrice: PAYMENT_AMOUNT }));
  }
  if (!localStorage.getItem(KEYS.ADMIN_AUTH)) {
    localStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify({ username: 'admin', password: 'admin' }));
  }
  
  if (!localStorage.getItem(KEYS.MEDIA)) {
      localStorage.setItem(KEYS.MEDIA, JSON.stringify([]));
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- NOTIFICATION SYSTEM (MOCK) ---
const notifyAdmin = async (subject: string, message: string) => {
    const whatsappUrl = `https://wa.me/${ADMIN_CONTACT.phone}?text=${encodeURIComponent(`[KAMBEGOYE] ${subject}: ${message}`)}`;
    
    console.group('🔔 [MOCK] ADMIN NOTIFICATION');
    console.log(`TYPE: WhatsApp & Email`);
    console.log(`TO: ${ADMIN_CONTACT.phone} / ${ADMIN_CONTACT.email}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`WHATSAPP LINK (Simulation): ${whatsappUrl}`);
    console.groupEnd();
    
    // Simulate API latency
    await delay(100);
};

// --- FILE HELPER ---
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Failed to convert file to string'));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- PAYMENT API INTEGRATION (REDIRECT FLOW) ---

export interface PaymentInitiationResult {
  success: boolean;
  paymentUrl: string; // The URL to redirect the user to
  reference: string;
}

const initiateIPayPayment = async (amount: number, method: string, phone: string): Promise<PaymentInitiationResult> => {
  const reference = generateUUID();
  const baseUrl = window.location.origin; 
  const returnUrl = `${baseUrl}/payment/callback?ref=${reference}`;
  const cancelUrl = `${baseUrl}/payment?error=cancel`;

  const payload = {
    amount: amount,
    currency: 'XOF', 
    customer_phone_number: phone,
    payment_method: method.toLowerCase(), 
    invoice_reference: reference,
    description: 'Acces KAMBEGOYE',
    return_url: returnUrl,
    cancel_url: cancelUrl
  };

  console.log('--- INITIALISATION I-PAY (REDIRECT MODE) ---', payload);

  try {
    const response = await fetch(IPAY_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IPAY_CONFIG.SECRET_KEY}` 
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
        const data = await response.json();
        if (data.payment_url) {
            return {
                success: true,
                paymentUrl: data.payment_url,
                reference: reference
            };
        }
    }
    throw new Error("API call failed or no URL returned");

  } catch (error) {
    console.warn('Mode Simulation: Redirection vers le portail de paiement simulé.');
    return { 
        success: true, 
        paymentUrl: `/payment/simulation?amount=${amount}&ref=${reference}&method=${method}&phone=${phone}`, 
        reference: reference
    };
  }
};

const verifyIPayPayment = async (reference: string): Promise<'pending' | 'success' | 'failed'> => {
    const simulatedStatus = sessionStorage.getItem(`sim_status_${reference}`);
    if (simulatedStatus === 'success') return 'success';
    if (simulatedStatus === 'failed') return 'failed';

    try {
        const verifyUrl = `https://i-pay.money/api/v1/payments/${reference}/status`; 
        const response = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${IPAY_CONFIG.SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const status = data.status?.toLowerCase();
            if (status === 'successful' || status === 'completed' || status === 'paid') return 'success';
            if (status === 'failed' || status === 'cancelled') return 'failed';
        }
    } catch (e) {
    }
    return 'pending';
};

// ------------------------------

export const db = {
  init: () => initDB(),

  // EXPOSE HELPER
  fileToDataURL: (file: File) => fileToDataURL(file),

  getWorkers: async () => {
    await delay(300);
    return safeParse(KEYS.WORKERS, []);
  },

  getWorkerById: async (id: string) => {
    await delay(200);
    const workers: Worker[] = safeParse(KEYS.WORKERS, []);
    return workers.find(w => w.id === id);
  },

  // ANALYTICS
  incrementWorkerView: async (id: string) => {
      const workers: Worker[] = safeParse(KEYS.WORKERS, []);
      const index = workers.findIndex(w => w.id === id);
      if (index >= 0) {
          workers[index].views = (workers[index].views || 0) + 1;
          localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
      }
  },

  saveWorker: async (worker: Worker) => {
    await delay(500);
    const workers: Worker[] = safeParse(KEYS.WORKERS, []);
    const index = workers.findIndex(w => w.id === worker.id);
    if (!worker.accountStatus) worker.accountStatus = 'active';
    if (!worker.views) worker.views = 0; // Ensure views is set
    
    if (index >= 0) {
        // Preserve views if editing
        const existingViews = workers[index].views || 0;
        worker.views = existingViews;
        workers[index] = worker;
    } else {
        workers.push(worker);
    }
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  },

  registerWorker: async (workerData: any) => {
    await delay(800);
    try {
        const workers: Worker[] = safeParse(KEYS.WORKERS, []);
        const newWorker: Worker = {
            ...workerData,
            id: generateUUID(),
            rating: 0,
            reviewCount: 0,
            isVerified: false,
            availability: 'available',
            accountStatus: 'pending',
            workImages: workerData.workImages || [],
            views: 0
        };
        workers.push(newWorker);
        localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));

        // NOTIFY ADMIN
        const msg = `Nouvelle inscription : ${newWorker.firstName} ${newWorker.lastName} (${newWorker.phone}). Spécialité ID: ${newWorker.specialtyId}.`;
        await notifyAdmin('INSCRIPTION OUVRIER', msg);

        return true;
    } catch (e) {
        return false;
    }
  },

  deleteWorker: async (id: string) => {
    await delay(400);
    let workers: Worker[] = safeParse(KEYS.WORKERS, []);
    workers = workers.filter(w => w.id !== id);
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  },

  getSpecialties: async () => {
    await delay(100);
    return safeParse(KEYS.SPECIALTIES, []);
  },

  getNeighborhoods: async () => {
    await delay(100);
    return safeParse(KEYS.NEIGHBORHOODS, []);
  },

  getSettings: async () => {
    await delay(100);
    return safeParse(KEYS.SETTINGS, { consultationPrice: 200 });
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    await delay(300);
    const current = safeParse(KEYS.SETTINGS, { consultationPrice: 200 });
    const updated = { ...current, ...settings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  },

  verifyAdmin: async (u: string, p: string) => {
    await delay(500);
    const auth = safeParse(KEYS.ADMIN_AUTH, { username: 'admin', password: 'admin' });
    return u === auth.username && p === auth.password;
  },

  updateAdminPassword: async (newPassword: string) => {
    await delay(300);
    const auth = safeParse(KEYS.ADMIN_AUTH, { username: 'admin', password: 'admin' });
    auth.password = newPassword;
    localStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify(auth));
  },

  // Transactions
  initiateTransaction: async (method: string, phone: string) => {
      const settings = safeParse(KEYS.SETTINGS, { consultationPrice: 200 });
      return initiateIPayPayment(settings.consultationPrice, method, phone);
  },

  finalizeTransaction: async (reference: string) => {
      // Check status
      const status = await verifyIPayPayment(reference);
      
      if (status === 'success') {
          // Record transaction
          const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
          // Check if already recorded to avoid duplicates
          if (transactions.find(t => t.id === reference)) return true;

          const settings = safeParse(KEYS.SETTINGS, { consultationPrice: 200 });
          
          const newTx: Transaction = {
              id: reference,
              amount: settings.consultationPrice,
              date: new Date().toISOString(),
              status: 'success',
              method: 'Mynita', // Ideally retrieved from API, hardcoded for fallback
              userId: 'user-' + Date.now()
          };
          transactions.unshift(newTx);
          localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
          
          // Enable Session
          sessionStorage.setItem(KEYS.PAID_SESSION, 'true');

          // Notify Admin
          await notifyAdmin('NOUVEAU PAIEMENT', `Paiement reçu de ${settings.consultationPrice} FCFA. Ref: ${reference}`);
          
          return true;
      }
      return false;
  },

  hasPaid: () => {
      return sessionStorage.getItem(KEYS.PAID_SESSION) === 'true';
  },

  getStats: async () => {
    await delay(500);
    const workers: Worker[] = safeParse(KEYS.WORKERS, []);
    const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
    const projectRequests: ProjectRequest[] = safeParse(KEYS.PROJECT_REQUESTS, []);
    
    // Revenue calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = today - (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const revenueDaily = transactions
        .filter(t => new Date(t.date).getTime() >= today)
        .reduce((sum, t) => sum + t.amount, 0);

    const revenueWeekly = transactions
        .filter(t => new Date(t.date).getTime() >= oneWeekAgo)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const revenueMonthly = transactions
        .filter(t => new Date(t.date).getTime() >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Payment Methods Breakdown
    const methodCounts = transactions.reduce((acc, t) => {
        acc[t.method] = (acc[t.method] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const paymentMethods = Object.keys(methodCounts).map(key => ({
        name: key,
        value: methodCounts[key]
    }));

    // Top Workers (Most Viewed)
    const topWorkers = [...workers]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    return {
      totalWorkers: workers.length,
      totalTransactions: transactions.length,
      totalRevenue,
      revenueDaily,
      revenueWeekly,
      revenueMonthly,
      paymentMethods,
      recentTransactions: transactions.slice(0, 5),
      allTransactions: transactions,
      pendingProjects: projectRequests.filter(p => p.status === 'new').length,
      topWorkers
    };
  },

  exportData: async () => {
    return {
      workers: safeParse(KEYS.WORKERS, []),
      specialties: safeParse(KEYS.SPECIALTIES, []),
      neighborhoods: safeParse(KEYS.NEIGHBORHOODS, []),
      transactions: safeParse(KEYS.TRANSACTIONS, []),
      products: safeParse(KEYS.PRODUCTS, []),
      categories: safeParse(KEYS.PRODUCT_CATEGORIES, [])
    };
  },

  importData: async (data: any) => {
    try {
      if (data.workers) localStorage.setItem(KEYS.WORKERS, JSON.stringify(data.workers));
      if (data.specialties) localStorage.setItem(KEYS.SPECIALTIES, JSON.stringify(data.specialties));
      if (data.neighborhoods) localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(data.neighborhoods));
      if (data.transactions) localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
      if (data.products) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data.products));
      if (data.categories) localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(data.categories));
      return true;
    } catch (e) {
      return false;
    }
  },

  clearTransactions: async () => {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
      await delay(500);
  },

  resetDatabase: async () => {
      await delay(1000);
      localStorage.clear();
      initDB();
  },

  // Products
  getProducts: async () => {
      await delay(200);
      return safeParse(KEYS.PRODUCTS, []);
  },
  getProductById: async (id: string) => {
      await delay(100);
      const products: Product[] = safeParse(KEYS.PRODUCTS, []);
      return products.find(p => p.id === id);
  },
  saveProduct: async (product: Product) => {
      await delay(300);
      const products: Product[] = safeParse(KEYS.PRODUCTS, []);
      const index = products.findIndex(p => p.id === product.id);
      if (index >= 0) products[index] = product;
      else products.push(product);
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: async (id: string) => {
      await delay(300);
      let products: Product[] = safeParse(KEYS.PRODUCTS, []);
      products = products.filter(p => p.id !== id);
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Product Categories
  getProductCategories: async () => {
      await delay(100);
      return safeParse(KEYS.PRODUCT_CATEGORIES, []);
  },
  saveProductCategory: async (category: ProductCategory) => {
      await delay(300);
      const categories: ProductCategory[] = safeParse(KEYS.PRODUCT_CATEGORIES, []);
      const index = categories.findIndex(c => c.id === category.id);
      if (index >= 0) categories[index] = category;
      else categories.push(category);
      localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
  },
  deleteProductCategory: async (id: string) => {
      await delay(300);
      let categories: ProductCategory[] = safeParse(KEYS.PRODUCT_CATEGORIES, []);
      categories = categories.filter(c => c.id !== id);
      localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
  },

  // Project Requests
  saveProjectRequest: async (request: ProjectRequest) => {
      await delay(500);
      const requests: ProjectRequest[] = safeParse(KEYS.PROJECT_REQUESTS, []);
      // If it has no ID, it's new
      if (!request.id) {
          request.id = generateUUID();
          request.date = new Date().toISOString();
          request.status = 'new';
          requests.unshift(request); // Add to top
          
          // Notify Admin
          const msg = `Nouveau Projet: "${request.title}" par ${request.clientName} (${request.clientPhone}).`;
          await notifyAdmin('DEMANDE DE DEVIS', msg);
      } else {
          // Update existing
          const index = requests.findIndex(r => r.id === request.id);
          if (index >= 0) requests[index] = request;
      }
      localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify(requests));
      return true;
  },
  
  getProjectRequests: async () => {
      await delay(300);
      return safeParse(KEYS.PROJECT_REQUESTS, []);
  },

  updateProjectRequestStatus: async (id: string, status: 'new' | 'contacted' | 'completed' | 'cancelled') => {
      await delay(300);
      const requests: ProjectRequest[] = safeParse(KEYS.PROJECT_REQUESTS, []);
      const index = requests.findIndex(r => r.id === id);
      if (index >= 0) {
          requests[index].status = status;
          localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify(requests));
      }
  },

  // MEDIA LIBRARY
  saveMedia: async (media: MediaItem) => {
      await delay(200);
      const medias: MediaItem[] = safeParse(KEYS.MEDIA, []);
      medias.unshift(media);
      try {
        localStorage.setItem(KEYS.MEDIA, JSON.stringify(medias));
        return true;
      } catch (e) {
          console.error("LocalStorage Limit Reached", e);
          return false;
      }
  },
  
  getMedia: async () => {
      await delay(200);
      return safeParse(KEYS.MEDIA, []);
  },

  deleteMedia: async (id: string) => {
      await delay(200);
      let medias: MediaItem[] = safeParse(KEYS.MEDIA, []);
      medias = medias.filter(m => m.id !== id);
      localStorage.setItem(KEYS.MEDIA, JSON.stringify(medias));
  }
};
