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
  PAID_SESSION_TIMESTAMP: 'kambegoye_paid_session_ts',
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

// --- DATA GENERATION HELPERS (Moved to top for initDB usage) ---
const firstNames = ["Abdou", "Moussa", "Ibrahim", "Sani", "Omar", "Fatima", "Aicha", "Zeneba", "Halima", "Issaka", "Ousmane", "Amadou", "Souleymane", "Yacouba", "Bintou", "Mariama", "Hadiza", "Ramatou"];
const lastNames = ["Diallo", "Maiga", "Seyni", "Oumarou", "Kimba", "Saley", "Adamou", "Maman", "Soumana", "Tiemogo", "Hassane", "Garba", "Idrissa", "Mahamadou", "Abdoulaye"];

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// UUID Polyfill - Robust for HTTP contexts on XAMPP/iFastNet
export const generateUUID = () => {
  // Try native crypto first (works on HTTPS or localhost)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
          return crypto.randomUUID();
      } catch (e) {
          // Fallback
      }
  }
  
  // Manual fallback for insecure contexts
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
  try {
    // 1. WORKERS INITIALIZATION (AUTO-SEEDING)
    if (!localStorage.getItem(KEYS.WORKERS)) {
      console.log("Premier lancement détecté : Génération de la base de données ouvriers...");
      const workers: Worker[] = [...INITIAL_WORKERS]; // Start with static data
      
      // Generate 50 random workers immediately
      for (let i = 0; i < 50; i++) {
          const spec = randomElement(INITIAL_SPECIALTIES);
          const hood = randomElement(INITIAL_NEIGHBORHOODS);
          const firstName = randomElement(firstNames);
          const lastName = randomElement(lastNames);
          
          workers.push({
              id: generateUUID(),
              firstName,
              lastName,
              specialtyId: spec.id,
              countryId: 'NE',
              cityId: 'NE_NIA',
              neighborhoodId: hood.id,
              phone: `9${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`,
              whatsapp: `2279${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`,
              photoUrl: `https://picsum.photos/seed/${i + 500}/200/200`,
              availability: Math.random() > 0.3 ? 'available' : 'busy',
              rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
              reviewCount: randomNumber(1, 50),
              isVerified: Math.random() > 0.5,
              workImages: [],
              latitude: hood.latitude + (Math.random() - 0.5) * 0.01,
              longitude: hood.longitude + (Math.random() - 0.5) * 0.01,
              accountStatus: 'active',
              views: randomNumber(0, 200)
          });
      }
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
    } else {
      // Migration logic for existing data
      const workers = safeParse<Worker[]>(KEYS.WORKERS, []);
      const updatedWorkers = workers.map(w => ({
          ...w,
          accountStatus: w.accountStatus || 'active',
          views: w.views || 0,
          countryId: w.countryId || 'NE', 
          cityId: w.cityId || 'NE_NIA'
      }));
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(updatedWorkers));
    }

    const storedSpecialties = safeParse<Specialty[]>(KEYS.SPECIALTIES, []);
    if (storedSpecialties.length === 0) {
      localStorage.setItem(KEYS.SPECIALTIES, JSON.stringify(INITIAL_SPECIALTIES));
    }

    if (!localStorage.getItem(KEYS.COUNTRIES)) {
        localStorage.setItem(KEYS.COUNTRIES, JSON.stringify(INITIAL_COUNTRIES));
    }

    const storedCities = safeParse<City[]>(KEYS.CITIES, []);
    if (storedCities.length === 0) {
        localStorage.setItem(KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
    }

    const storedHoods = safeParse<Neighborhood[]>(KEYS.NEIGHBORHOODS, []);
    if (storedHoods.length === 0) {
      localStorage.setItem(KEYS.NEIGHBORHOODS, JSON.stringify(INITIAL_NEIGHBORHOODS));
    }
    
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }

    const storedProdCats = safeParse<ProductCategory[]>(KEYS.PRODUCT_CATEGORIES, []);
    if (storedProdCats.length === 0) {
      localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(INITIAL_PRODUCT_CATEGORIES));
    }

    // 2. TRANSACTIONS INITIALIZATION (AUTO-SEEDING)
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
      console.log("Génération de l'historique des transactions...");
      const transactions: Transaction[] = [];
      // Generate 25 initial transactions
      for (let i = 0; i < 25; i++) {
          const date = new Date();
          date.setDate(date.getDate() - randomNumber(0, 30)); // Past 30 days
          transactions.push({
              id: generateUUID(),
              amount: Math.random() > 0.8 ? 15000 : 200, 
              date: date.toISOString(),
              status: 'success',
              method: Math.random() > 0.5 ? 'Mynita' : 'Amanata',
              userId: `user-${randomNumber(1000, 9999)}`,
              clientPhone: `9${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}...`
          });
      }
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
    
    if (!localStorage.getItem(KEYS.PROJECT_REQUESTS)) {
      localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify([]));
    }

    const settings = safeParse(KEYS.SETTINGS, null);
    if (!settings) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ consultationPrice: PAYMENT_AMOUNT }));
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
  } catch (error) {
    console.error("Critical DB Init Error", error);
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const notifyAdmin = async (subject: string, message: string) => {
    console.log(`[KAMBEGOYE NOTIF] ${subject}: ${message}`);
    await delay(100);
};

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

export interface PaymentInitiationResult {
  success: boolean;
  paymentUrl: string; 
  reference: string;
}

const initiateIPayPayment = async (amount: number, method: string, phone: string, details?: string): Promise<PaymentInitiationResult> => {
  const reference = generateUUID();
  
  // Stockage contextuel pour la validation (navigateur courant)
  sessionStorage.setItem(`pending_tx_${reference}`, JSON.stringify({ phone, method, amount, details }));
  
  // Utilisation d'un lien de simulation interne
  // AJOUT des détails dans l'URL pour que la page de simulation puisse les afficher
  // même si ouverte dans un autre onglet/appareil
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const detailsParam = details ? `&details=${encodeURIComponent(details)}` : '';
  const paymentUrl = `${origin}/payment/simulation?ref=${reference}&phone=${phone}&amount=${amount}&method=${method}${detailsParam}`;

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
    return 'pending';
};

export const db = {
  init: () => initDB(),
  fileToDataURL: (file: File) => fileToDataURL(file),

  // ... (Existing methods) ...
  getWorkers: async () => {
    await delay(300);
    return safeParse(KEYS.WORKERS, []);
  },

  getWorkerById: async (id: string) => {
    await delay(200);
    const workers: Worker[] = safeParse(KEYS.WORKERS, []);
    return workers.find(w => w.id === id);
  },

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
    if (!worker.views) worker.views = 0;
    
    if (index >= 0) {
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
        await notifyAdmin('INSCRIPTION OUVRIER', `Nouveau: ${newWorker.firstName}`);
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

  initiateTransaction: async (method: string, phone: string, customAmount?: number, details?: string) => {
      const settings = safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
      const amount = customAmount || settings.consultationPrice;
      return initiateIPayPayment(amount, method, phone, details);
  },

  addManualTransaction: async (amount: number, phone: string, method: string = 'Espèces', details?: string) => {
      await delay(300);
      const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
      const newTx: Transaction = {
          id: generateUUID(),
          amount: amount,
          date: new Date().toISOString(),
          status: 'success',
          method: method,
          userId: 'admin',
          clientPhone: phone,
          details: details
      };
      transactions.unshift(newTx);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return newTx;
  },
  
  updateProductStock: async (id: string, quantitySold: number) => {
      await delay(100);
      const products: Product[] = safeParse(KEYS.PRODUCTS, []);
      const index = products.findIndex(p => p.id === id);
      if (index >= 0) {
          const currentStock = products[index].stock || 0;
          products[index].stock = Math.max(0, currentStock - quantitySold);
          localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
      }
  },

  finalizeTransaction: async (reference: string, overrideData?: any) => {
      const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
      if (transactions.find(t => t.id === reference)) return true;

      const settings = safeParse(KEYS.SETTINGS, { consultationPrice: PAYMENT_AMOUNT });
      
      const contextStr = sessionStorage.getItem(`pending_tx_${reference}`);
      
      // Si on a des données dans le sessionStorage (même navigateur), on les utilise
      // Sinon on utilise les données passées en override (provenant de l'URL si lien externe)
      let context = contextStr ? JSON.parse(contextStr) : null;
      
      if (!context && overrideData) {
          context = overrideData;
      }
      
      // Fallback par défaut
      if (!context) {
          context = { phone: 'N/A', method: 'Mynita', amount: settings.consultationPrice };
      }

      const newTx: Transaction = {
          id: reference,
          amount: context.amount || settings.consultationPrice,
          date: new Date().toISOString(),
          status: 'success',
          method: context.method,
          userId: 'user-' + Date.now(),
          clientPhone: context.phone,
          details: context.details // On récupère les détails (produits) si présents
      };
      transactions.unshift(newTx);
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
      
      // Activer la session payante
      if (newTx.amount === settings.consultationPrice) {
         sessionStorage.setItem(KEYS.PAID_SESSION_TIMESTAMP, Date.now().toString());
      }

      sessionStorage.removeItem(`pending_tx_${reference}`);
      return true;
  },

  forceValidatePayment: async (phone: string, method?: string) => {
      const reference = generateUUID();
      sessionStorage.setItem(`sim_status_${reference}`, 'success');
      sessionStorage.setItem(`pending_tx_${reference}`, JSON.stringify({ phone, method: method || 'Mynita' }));
      return await db.finalizeTransaction(reference);
  },

  hasPaid: () => {
      const sessionStartStr = sessionStorage.getItem(KEYS.PAID_SESSION_TIMESTAMP);
      if (!sessionStartStr) return false;

      const sessionStart = parseInt(sessionStartStr, 10);
      const now = Date.now();

      if (now - sessionStart > SESSION_DURATION_MS) {
          sessionStorage.removeItem(KEYS.PAID_SESSION_TIMESTAMP);
          return false;
      }

      return true;
  },
  
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

    const methodCounts = transactions.reduce((acc, t) => {
        acc[t.method] = (acc[t.method] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const paymentMethods = Object.keys(methodCounts).map(key => ({
        name: key,
        value: methodCounts[key]
    }));

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

  // === FUNCTION TO GENERATE MOCK DATA (SEED) - Can also be called manually ===
  seedDatabase: async () => {
      await delay(1000);
      
      let workers: Worker[] = safeParse(KEYS.WORKERS, []);
      
      // Generate 20 more workers when called manually
      for (let i = 0; i < 20; i++) {
          const spec = randomElement(INITIAL_SPECIALTIES);
          const hood = randomElement(INITIAL_NEIGHBORHOODS);
          const firstName = randomElement(firstNames);
          const lastName = randomElement(lastNames);
          
          workers.push({
              id: generateUUID(),
              firstName,
              lastName,
              specialtyId: spec.id,
              countryId: 'NE',
              cityId: 'NE_NIA',
              neighborhoodId: hood.id,
              phone: `9${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`,
              whatsapp: `2279${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}${randomNumber(0, 9)}`,
              photoUrl: `https://picsum.photos/seed/${Date.now() + i}/200/200`,
              availability: Math.random() > 0.3 ? 'available' : 'busy',
              rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
              reviewCount: randomNumber(1, 50),
              isVerified: Math.random() > 0.5,
              workImages: [],
              latitude: hood.latitude + (Math.random() - 0.5) * 0.01,
              longitude: hood.longitude + (Math.random() - 0.5) * 0.01,
              accountStatus: 'active',
              views: randomNumber(0, 200)
          });
      }
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));

      return true;
  },

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

  saveProjectRequest: async (request: any): Promise<ProjectRequest | null> => {
    await delay(500);
    try {
      const requests: ProjectRequest[] = safeParse(KEYS.PROJECT_REQUESTS, []);
      
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
          if (medias.length > 50) medias.pop();
          localStorage.setItem(KEYS.MEDIA, JSON.stringify(medias));
      }

      requests.unshift(newRequest);
      localStorage.setItem(KEYS.PROJECT_REQUESTS, JSON.stringify(requests));
      
      await notifyAdmin('NOUVEAU PROJET', `Demande: ${reference} - ${newRequest.clientName}`);
      
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

  saveMedia: async (media: MediaItem) => {
      await delay(300);
      const medias: MediaItem[] = safeParse(KEYS.MEDIA, []);
      medias.unshift(media);
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

  saveQuote: async (quote: Quote) => {
    await delay(400);
    const quotes: Quote[] = safeParse(KEYS.QUOTES, []);
    const transactions: Transaction[] = safeParse(KEYS.TRANSACTIONS, []);
    
    const index = quotes.findIndex(q => q.id === quote.id);
    
    if (index >= 0) {
      quotes[index] = quote;
    } else {
      quotes.unshift(quote);
    }
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));

    const txId = `QUOTE_${quote.id}`;
    const txIndex = transactions.findIndex(t => t.id === txId);

    if (quote.status === 'accepted') {
        const txData: Transaction = {
            id: txId,
            amount: quote.totalAmount,
            date: new Date().toISOString(),
            status: 'success',
            method: 'Espèces', 
            userId: 'admin',
            clientPhone: quote.clientPhone || 'N/A'
        };

        if (txIndex >= 0) {
            transactions[txIndex] = { ...transactions[txIndex], amount: quote.totalAmount, clientPhone: quote.clientPhone || 'N/A' };
        } else {
            transactions.unshift(txData);
        }
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } else {
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