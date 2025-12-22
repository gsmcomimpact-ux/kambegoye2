
import { Specialty, Neighborhood, Worker, Product, ProductCategory, Country, City, Partner } from './types';

export const PAYMENT_AMOUNT = 200;

export const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost/api.php' 
  : window.location.origin + '/api.php';

export const MERCHANT_NUMBERS = {
  MYNITA: '90 00 00 00',
  AMANATA: '97 39 05 69' 
};

export const formatCurrency = (amount: number | string | undefined): string => {
  if (amount === undefined || amount === null) return '0 FCFA';
  const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  if (isNaN(num)) return '0 FCFA';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " FCFA";
};

export const INITIAL_COUNTRIES: Country[] = [{ id: 'NE', name: 'Niger', code: 'NE', currency: 'XOF' }];
export const INITIAL_CITIES: City[] = [{ id: 'NE_NIA', name: 'Niamey', countryId: 'NE' }];

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
    // Commune 1
    { id: '1', name: 'Goudel', commune: '1', cityId: 'NE_NIA', latitude: 13.526, longitude: 2.062 },
    { id: '2', name: 'Koubia', commune: '1', cityId: 'NE_NIA', latitude: 13.535, longitude: 2.054 },
    { id: '3', name: 'Yantala Bas', commune: '1', cityId: 'NE_NIA', latitude: 13.518, longitude: 2.078 },
    { id: '4', name: 'Yantala Haut', commune: '1', cityId: 'NE_NIA', latitude: 13.525, longitude: 2.085 },
    { id: '5', name: 'Losso Goungou', commune: '1', cityId: 'NE_NIA', latitude: 13.512, longitude: 2.045 },
    
    // Commune 2
    { id: '6', name: 'Boukoki', commune: '2', cityId: 'NE_NIA', latitude: 13.528, longitude: 2.115 },
    { id: '7', name: 'Lazaret', commune: '2', cityId: 'NE_NIA', latitude: 13.545, longitude: 2.128 },
    { id: '8', name: 'Banifandou', commune: '2', cityId: 'NE_NIA', latitude: 13.538, longitude: 2.135 },
    { id: '9', name: 'Wadata', commune: '2', cityId: 'NE_NIA', latitude: 13.515, longitude: 2.122 },
    { id: '10', name: 'Darnis', commune: '2', cityId: 'NE_NIA', latitude: 13.520, longitude: 2.110 },
    
    // Commune 3
    { id: '11', name: 'Plateau', commune: '3', cityId: 'NE_NIA', latitude: 13.524, longitude: 2.109 },
    { id: '12', name: 'Kalley Nord', commune: '3', cityId: 'NE_NIA', latitude: 13.515, longitude: 2.105 },
    { id: '13', name: 'Kalley Sud', commune: '3', cityId: 'NE_NIA', latitude: 13.508, longitude: 2.110 },
    { id: '14', name: 'Marché Central', commune: '3', cityId: 'NE_NIA', latitude: 13.512, longitude: 2.114 },
    { id: '15', name: 'Zongo', commune: '3', cityId: 'NE_NIA', latitude: 13.505, longitude: 2.118 },
    
    // Commune 4
    { id: '16', name: 'Niamey 2000', commune: '4', cityId: 'NE_NIA', latitude: 13.518, longitude: 2.145 },
    { id: '17', name: 'Saga', commune: '4', cityId: 'NE_NIA', latitude: 13.485, longitude: 2.165 },
    { id: '18', name: 'Talladjé', commune: '4', cityId: 'NE_NIA', latitude: 13.495, longitude: 2.152 },
    { id: '19', name: 'Francophonie', commune: '4', cityId: 'NE_NIA', latitude: 13.505, longitude: 2.175 },
    { id: '20', name: 'Airport', commune: '4', cityId: 'NE_NIA', latitude: 13.482, longitude: 2.185 },
    
    // Commune 5 (Harobanda)
    { id: '21', name: 'Harobanda', commune: '5', cityId: 'NE_NIA', latitude: 13.505, longitude: 2.085 },
    { id: '22', name: 'Karadjé', commune: '5', cityId: 'NE_NIA', latitude: 13.495, longitude: 2.078 },
    { id: '23', name: 'Kirkissoye', commune: '5', cityId: 'NE_NIA', latitude: 13.485, longitude: 2.095 },
    { id: '24', name: 'Saguia', commune: '5', cityId: 'NE_NIA', latitude: 13.512, longitude: 2.075 },
    { id: '25', name: 'Lamordé', commune: '5', cityId: 'NE_NIA', latitude: 13.502, longitude: 2.098 },
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'wadfow_official',
    name: 'WADFOW TOOLS',
    description: "Découvrez la puissance professionnelle. Perceuses, visseuses, et une gamme complète d'outillage électroportatif robuste disponible dès maintenant sur notre boutique.",
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    linkUrl: '/boutique',
    isActive: true,
    displayOrder: 1
  }
];

export const INITIAL_SPECIALTIES: Specialty[] = [
  { id: '1', name: 'Électricien', icon: 'zap' },
  { id: '2', name: 'Plombier', icon: 'droplet' },
  { id: '3', name: 'Maçon', icon: 'brick-wall' },
  { id: '4', name: 'Menuisier', icon: 'hammer' },
  { id: '5', name: 'Peintre', icon: 'paint-bucket' },
  { id: '6', name: 'Froid & Clim', icon: 'snowflake' },
];

export const INITIAL_WORKERS: Worker[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Outillage' },
  { id: '2', name: 'Électricité' },
  { id: '3', name: 'Plomberie' },
  { id: '4', name: 'Sécurité' },
];
