
export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  neighborhoodId: string;
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
  accountStatus: 'pending' | 'active' | 'rejected';
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
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: 'Mynita' | 'Amanata';
  userId: string; // Simulated IP or Session ID
}

export interface ProjectRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  title: string;
  description: string;
  category: string;
  budget?: string;
  deadline?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  date: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'document';
  name: string;
  data: string; // Base64 or URL
  date: string;
  relatedId?: string; // Worker ID or Project ID
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
