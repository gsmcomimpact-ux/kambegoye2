
export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
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
  countryId: string;
  cityId: string;
  neighborhoodId?: string;
  whatsapp: string;
  phone: string;
  photoUrl: string;
  idCardUrl?: string;
  availability: 'available' | 'busy';
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  workImages: string[];
  latitude?: number;
  longitude?: number;
  accountStatus: 'pending' | 'active' | 'rejected' | 'suspended';
  views?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
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
  cityId: string;
  latitude: number;
  longitude: number;
}

export type TransactionCategory = 'access' | 'store' | 'quote' | 'manual' | 'other';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
  userId: string;
  clientPhone?: string;
  details?: string;
  category: TransactionCategory; 
}

export interface ProjectRequest {
  id: string;
  reference?: string;
  clientName: string;
  clientPhone: string;
  title: string;
  description: string;
  category: string;
  countryId?: string; 
  cityId?: string;    
  neighborhoodId?: string;
  budget?: string;
  deadline?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  date: string;
  images?: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'document';
  name: string;
  data: string;
  date: string;
  relatedId?: string;
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
  number: string;
  projectRequestId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  date: string;
  dueDate: string;
  items: QuoteItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
  paymentMethod?: string;
}

export interface Dispute {
  id: string;
  ticketNumber: string;
  clientName: string;
  clientPhone: string;
  workerName: string; // Nom de l'ouvrier concerné
  reason: string;
  description: string;
  date: string;
  status: 'new' | 'investigating' | 'resolved' | 'closed';
}

export interface AppEvent {
  id: string;
  type: 'transaction' | 'project' | 'quote' | 'media' | 'dispute';
  title: string;
  description: string;
  date: string;
  amount?: number;
  status?: string;
}

export interface Stats {
  totalWorkers: number;
  totalTransactions: number;
  totalRevenue: number;
  revenueDaily: number;
  revenueWeekly: number;
  revenueMonthly: number;
  paymentMethods: { name: string; value: number }[];
  revenueBySource: { name: string; value: number }[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  pendingProjects: number;
  topWorkers: Worker[];
  recentEvents: AppEvent[];
}

export interface SystemSettings {
  consultationPrice: number;
}
