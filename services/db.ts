import { Worker, Specialty, Neighborhood, Transaction, Stats, SystemSettings, Product, ProductCategory, ProjectRequest, MediaItem, Quote, Country, City } from '../types';
import { INITIAL_WORKERS, INITIAL_SPECIALTIES, INITIAL_NEIGHBORHOODS, INITIAL_PRODUCTS, INITIAL_PRODUCT_CATEGORIES, PAYMENT_AMOUNT, IPAY_CONFIG, INITIAL_COUNTRIES, INITIAL_CITIES } from '../constants';

// Keys for LocalStorage
const KEYS = {
  WORKERS: 'kambegoye_workers',
  SPECIALTIES: 'kambegoye_specialties',
  COUNTRIES: 'kambegoye_countries',
  CITIES: 'kambegoye_cities',
  NEIGHBORHOODS: 'kambegoye_neighborhoods',
  TRANSACTIONS: 'kambegoye_transactions',
  PRODUCTS: 'kambegoye_products',
  PRODUCT_CATEGORIES: 'kambegoye_product_categories',
  PROJECT_REQUESTS: 'kambegoye_project_requests',
  PAID_SESSION_TIMESTAMP: 'kambegoye_paid_session_ts', // Updated key for timestamp
  SETTINGS: 'kambegoye_settings',
  ADMIN_AUTH: 'kambegoye_admin_auth',
  MEDIA: 'kambegoye_media',
  QUOTES: 'kambegoye_quotes'
};

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 Minutes

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
    // Migration: Ensure all workers have accountStatus, views, and location
    const workers = safeParse<Worker[]>(KEYS.WORKERS, []);
    const updatedWorkers = workers.map(w => ({
        ...w,
        accountStatus: w.accountStatus || 'active',
        views: w.views || 0,
        countryId: w.countryId || 'NE', // Default to Niger for migration
        cityId: w.cityId || 'NE_NIA'    // Default to Niamey for migration
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

  // Countries Init
  if (!localStorage.getItem(KEYS.COUNTRIES)) {
      localStorage.setItem(KEYS.COUNTRIES, JSON.stringify(INITIAL_COUNTRIES));
  }

  // Cities Merge
  const storedCities = safeParse<City[]>(KEYS.CITIES, []);
  if (storedCities.length === 0) {
      localStorage.setItem(KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
  } else {
     // Merge new cities if not present
     const existingIds = new Set(storedCities.map(c => c.id));
     const citiesToUpdate = [...storedCities];
     let cityAdded = false;
     INITIAL_CITIES.forEach(c => {
         if(!existingIds.has(c.id)){
             citiesToUpdate.push(c);
             cityAdded = true;
         }
     });
     if(cityAdded) {
         localStorage.setItem(KEYS.CITIES, JSON.stringify(citiesToUpdate));
     }
  }

  // Neighborhoods Merge
  const storedHoods = safeParse<Neighborhood[]>(KEYS.NEIGHBORHOODS, []);
  if (storedHoods.length === 0) {
    localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(INITIAL_NEIGHBORHOODS));
  } else {
     // Migration: Ensure existing neighborhoods have cityId
     const migratedHoods = storedHoods.map(n => ({
         ...n,
         cityId: n.cityId || 'NE_NIA' // Default to Niamey for legacy data
     }));
     localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(migratedHoods));
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

  // Settings Init with Migration
  const settings = safeParse(KEYS.SETTINGS, null);
  if (!settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ consultationPrice: PAYMENT_AMOUNT }));
  } else if (settings.consultationPrice === 100) {
    // Migration: Update old default 100 to new default PAYMENT_AMOUNT (200)
    settings.consultationPrice = PAYMENT_AMOUNT;
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  if (!localStorage.getItem(KEYS.ADMIN_AUTH)) {
    localStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify({ username: 'admin', password: 'admin' }));
  }
  
  if (!localStorage.getItem(KEYS.MEDIA)) {
      localStorage.setItem(KEYS.MEDIA, JSON.stringify([]));
  }

  if (!localStorage.getItem(KEYS.QUOTES)) {
    localStorage.setItem(KEYS.QUOTES, JSON.stringify([]));
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
  // const returnUrl = `${baseUrl}/payment/callback?ref=${reference}`;
  // const cancelUrl = `${baseUrl}/payment?error=cancel`;

  // SAVE CONTEXT: We store the phone number, method and AMOUNT temporarily
  // Storing amount allows validation to check correct value later if needed
  sessionStorage.setItem(`pending_tx_${reference}`, JSON.stringify({ phone, method, amount }));

  // Use the static link provided by user
  const iPayStaticLink = "https://i-pay.money/external_payments/2ae97b1832eb/preview";
  
  // For demo, wrap in simulation page but functionality remains
  const paymentUrl = `${baseUrl}/payment/simulation?amount=${amount}&method=${method}&phone=${phone}&ref=${reference}`;

  console.log('--- INITIALISATION I-PAY (SIMULATION) ---', { amount, method, phone, reference });

  return {
      success: true,
      paymentUrl: paymentUrl,
      reference: reference
  };
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

  getCountries: async () => {
    await delay(100);
    return safeParse(KEYS.COUNTRIES, INITIAL_COUNTRIES);
  },

  getCities: async (countryId?: string) => {
    await delay(100);
    const cities: City[] = safeParse(KEYS.CITIES, INITIAL_CITIES);
    if (countryId) {
        return cities.filter(c => c.countryId === countryId);
    }
    return cities;
  },

  getNeighborhoods: async (cityId?: string) => {
    await delay(100);
    const hoods: Neighborhood[] = safeParse(KEYS.NEIGHBORHOODS, []);
    if (cityId) {
        return hoods.filter(h => h.cityId === cityId);
    }
    return hoods;
  },

  getSettings: async () => {
    await delay(100);
    return safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
  },

  updateSettings: async (settings: Partial<SystemSettings>) => {
    await delay(300);
    const current = safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
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
  initiateTransaction: async (method: string, phone: string, customAmount?: number) => {
      const settings = safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
      const amount = customAmount || settings.consultationPrice;
      return initiateIPayPayment(amount, method, phone);
  },

  finalizeTransaction: async (reference: string) => {
      // Check status
      const status = await verifyIPayPayment(reference);
      
      if (status === 'success') {
          // Record transaction
          const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
          // Check if already recorded to avoid duplicates
          if (transactions.find(t => t.id === reference)) return true;

          const settings = safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
          
          // RETRIEVE CONTEXT (Phone, Method, Amount)
          const contextStr = sessionStorage.getItem(`pending_tx_${reference}`);
          const context = contextStr ? JSON.parse(contextStr) : { phone: 'N/A', method: 'Mynita', amount: settings.consultationPrice };

          const newTx: Transaction = {
              id: reference,
              amount: context.amount || settings.consultationPrice,
              date: new Date().toISOString(),
              status: 'success',
              method: context.method,
              userId: 'user-' + Date.now(),
              clientPhone: context.phone // STORE CLIENT PHONE
          };
          transactions.unshift(newTx);
          localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
          
          // Enable Session with TIMESTAMP (Expires in 5 mins)
          // Only enable session if it was a consultation payment (standard amount)
          if (newTx.amount === settings.consultationPrice) {
             sessionStorage.setItem(KEYS.PAID_SESSION_TIMESTAMP, Date.now().toString());
          }

          // Notify Admin
          await notifyAdmin('NOUVEAU PAIEMENT', `Paiement reçu de ${newTx.amount} FCFA via ${context.method}. Client: ${context.phone}. Ref: ${reference}`);
          
          // Cleanup context
          sessionStorage.removeItem(`pending_tx_${reference}`);

          return true;
      }
      return false;
  },

  forceValidatePayment: async (phone: string, method?: string) => {
      const reference = generateUUID();
      // Force simulation success status
      sessionStorage.setItem(`sim_status_${reference}`, 'success');
      // Store Mynita as default or passed method if expanded in future
      sessionStorage.setItem(`pending_tx_${reference}`, JSON.stringify({ phone, method: method || 'Mynita' }));
      
      return await db.finalizeTransaction(reference);
  },

  // CHECK ACCESS STATUS WITH 5 MINUTE TIMEOUT
  hasPaid: () => {
      const sessionStartStr = sessionStorage.getItem(KEYS.PAID_SESSION_TIMESTAMP);
      if (!sessionStartStr) return false;

      const sessionStart = parseInt(sessionStartStr, 10);
      const now = Date.now();

      // Check if session has expired
      if (now - sessionStart > SESSION_DURATION_MS) {
          // Session expired
          sessionStorage.removeItem(KEYS.PAID_SESSION_TIMESTAMP);
          return false;
      }

      return true;
  },
  
  // Helper to get remaining time in seconds
  getSessionTimeRemaining: () => {
      const sessionStartStr = sessionStorage.getItem(KEYS.PAID_SESSION_TIMESTAMP);
      if (!sessionStartStr) return 0;
      
      const sessionStart = parseInt(sessionStartStr, 10);
      const now = Date.now();
      const elapsed = now - sessionStart;
      const remaining = SESSION_DURATION_MS - elapsed;
      
      return remaining > 0 ? Math.floor(remaining / 1000) : 0;
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
      categories: safeParse(KEYS.PRODUCT_CATEGORIES, []),
      quotes: safeParse(KEYS.QUOTES, [])
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
      if (data.quotes) localStorage.setItem(KEYS.QUOTES, JSON.stringify(data.quotes));
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
    await delay(200);
    const products: Product[] = safeParse(KEYS.PRODUCTS, []);
    return products.find(p => p.id === id);
  },
  
  getProductCategories: async () => {
    await delay(200);
    return safeParse(KEYS.PRODUCT_CATEGORIES, []);
  },

  saveProduct: async (product: Product) => {
    await delay(400);
    const products: Product[] = safeParse(KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: async (id: string) => {
    await delay(300);
    let products: Product[] = safeParse(KEYS.PRODUCTS, []);
    products = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  saveProductCategory: async (category: ProductCategory) => {
    await delay(300);
    const categories: ProductCategory[] = safeParse(KEYS.PRODUCT_CATEGORIES, []);
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
  },

  deleteProductCategory: async (id: string) => {
    await delay(300);
    let categories: ProductCategory[] = safeParse(KEYS.PRODUCT_CATEGORIES, []);
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
  },

  // Project Requests
  saveProjectRequest: async (request: any): Promise<ProjectRequest | null> => {
    await delay(500);
    try {
      const requests: ProjectRequest[] = safeParse(KEYS.PROJECT_REQUESTS, []);
      
      // Generate unique reference ID
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `PROJ-${year}-${randomSuffix}`;

      const newRequest: ProjectRequest = {
        ...request,
        id: generateUUID(),
        reference: reference,
        status: 'new',
        date: new Date().toISOString(),
        images: request.images || []
      };
      
      // OPTIONAL: Save images to Media Library for Admin visibility outside the project card
      if (newRequest.images && newRequest.images.length > 0) {
          const medias: MediaItem[] = safeParse(KEYS.MEDIA, []);
          const timestamp = Date.now();
          newRequest.images.forEach((imgBase64, idx) => {
              if (imgBase64.startsWith('data:')) {
                  medias.unshift({
                      id: `PROJ_IMG_${timestamp}_${idx}`,
                      type: 'image',
                      name: `PROJET_${newRequest.clientName.replace(/\s+/g,'_')}_${idx+1}`,
                      data: imgBase64,
                      date: new Date().toISOString(),
                      relatedId: newRequest.id
                  });
              }
          });
          // Limit storage
          if (medias.length > 50) medias.pop();
          localStorage.setItem(KEYS.MEDIA, JSON.stringify(medias));
      }

      requests.unshift(newRequest);
      localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify(requests));
      
      await notifyAdmin('NOUVEAU PROJET', `Demande de devis (${reference}) de ${newRequest.clientName} (${newRequest.clientPhone}). Titre: ${newRequest.title}`);
      
      return newRequest;
    } catch (e) {
      return null;
    }
  },

  getProjectRequests: async () => {
    await delay(300);
    return safeParse(KEYS.PROJECT_REQUESTS, []);
  },

  updateProjectRequestStatus: async (id: string, status: any) => {
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
      await delay(300);
      const medias: MediaItem[] = safeParse(KEYS.MEDIA, []);
      medias.unshift(media);
      // Limit storage for demo
      if (medias.length > 50) medias.pop();
      localStorage.setItem(KEYS.MEDIA, JSON.stringify(medias));
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
  },

  // QUOTES
  saveQuote: async (quote: Quote) => {
    await delay(400);
    const quotes: Quote[] = safeParse(KEYS.QUOTES, []);
    const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
    
    const index = quotes.findIndex(q => q.id === quote.id);
    
    // Update Quotes List
    if (index >= 0) {
      quotes[index] = quote;
    } else {
      quotes.unshift(quote);
    }
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));

    // Handle Transaction Logic for Statistics
    const txId = `QUOTE_${quote.id}`;
    const txIndex = transactions.findIndex(t => t.id === txId);

    if (quote.status === 'accepted') {
        const txData: Transaction = {
            id: txId,
            amount: quote.totalAmount,
            date: new Date().toISOString(),
            status: 'success',
            method: 'Espèces', // Assume cash/offline payment for quotes
            userId: 'admin',
            clientPhone: quote.clientPhone || 'N/A'
        };

        if (txIndex >= 0) {
            // Update existing transaction in case amount changed
            transactions[txIndex] = { ...transactions[txIndex], amount: quote.totalAmount, clientPhone: quote.clientPhone || 'N/A' };
        } else {
            // Create new
            transactions.unshift(txData);
        }
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } else {
        // If status is NOT accepted (e.g. moved back to draft), remove the transaction if it exists
        // to keep stats accurate.
        if (txIndex >= 0) {
            transactions.splice(txIndex, 1);
            localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
        }
    }
  },

  getQuotes: async () => {
    await delay(300);
    return safeParse(KEYS.QUOTES, []);
  },

  deleteQuote: async (id: string) => {
    await delay(300);
    let quotes: Quote[] = safeParse(KEYS.QUOTES, []);
    quotes = quotes.filter(q => q.id !== id);
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
  }
};