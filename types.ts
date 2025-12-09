

export interface Country {
  id: string;
  name: string;
  code: string; // e.g., 'NE', 'CI', 'SN'
  currency: string; // e.g., 'XOF', 'GNF'
}

export interface City {
  id: string;
  name: string;
  countryId: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  countryId: string; // New
  cityId: string;    // New
  neighborhoodId?: string; // Made optional as not all cities might have mapped neighborhoods yet
  whatsapp: string;
  phone: string;
  photoUrl: string;
  idCardUrl?: string; // Admin only
  availability: 'available' | 'busy';
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  workImages: string[];
  latitude?: number;
  longitude?: number;
  accountStatus: 'pending' | 'active' | 'rejected' | 'suspended';
  views?: number; // New field for analytics
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // This now refers to the category name or ID
  imageUrl: string;
  stock: number;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string; // Link to a city
  latitude: number; // Added for GPS positioning
  longitude: number; // Added for GPS positioning
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: string; // Relaxed to string to support 'Espèces' etc.
  userId: string; // Simulated IP or Session ID
  clientPhone?: string; // Le numéro du client qui a payé
}

export interface ProjectRequest {
  id: string;
  reference?: string; // e.g., PROJ-2024-001
  clientName: string;
  clientPhone: string;
  title: string;
  description: string;
  category: string;
  countryId?: string; 
  cityId?: string;    
  neighborhoodId?: string; // Added field
  budget?: string;
  deadline?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  date: string;
  images?: string[]; // Added: Array of base64 image strings
}

export interface MediaItem {
  id: string;
  type: 'image' | 'document';
  name: string;
  data: string; // Base64 or URL
  date: string;
  relatedId?: string; // Worker ID or Project ID
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string; // e.g., DEV-2024-001
  projectRequestId?: string; // Link to the project request reference
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  items: QuoteItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
}

export interface Stats {
  totalWorkers: number;
  totalTransactions: number;
  totalRevenue: number;
  revenueDaily: number;
  revenueWeekly: number;
  revenueMonthly: number;
  paymentMethods: { name: string; value: number }[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  pendingProjects: number;
  topWorkers: Worker[]; // New field for top stats
}

export interface SystemSettings {
  consultationPrice: number;
}