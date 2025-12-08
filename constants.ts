
import { Specialty, Neighborhood, Worker, Product, ProductCategory } from './types';

export const PAYMENT_AMOUNT = 200;

// CONFIGURATION DES NUMEROS MARCHANDS (POUR RECEPTION PAIEMENT)
export const MERCHANT_NUMBERS = {
  MYNITA: '90 00 00 00', // À remplacer par le vrai numéro Moov/Mynita
  AMANATA: '97 39 05 69'  // Numéro Airtel/Amanata (Basé sur le contact admin)
};

// CONFIGURATION I-PAY.MONEY
export const IPAY_CONFIG = {
  PUBLIC_KEY: 'pk_e979c6d9f5524f4c9571c72c4714d5ae',
  SECRET_KEY: 'sk_adcab0ea514b43d49b2bf9479e5146e6', // ATTENTION: En production, cette clé doit rester côté serveur (Backend)
  API_URL: 'https://i-pay.money/api/v1/payments/initiate' // URL d'API supposée pour l'intégration
};

export const INITIAL_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Protection' },
  { id: '2', name: 'Outillage' },
  { id: '3', name: 'Équipement' },
  { id: '4', name: 'Chantier' },
  { id: '5', name: 'Électricité' },
  { id: '6', name: 'Plomberie' },
  { id: '7', name: 'Peinture' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Kit de Sécurité Complet',
    description: 'Casque de chantier, gilet fluorescent, gants renforcés et lunettes de protection. Indispensable pour tout chantier.',
    price: 15000,
    category: 'Protection',
    imageUrl: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&q=80&w=400',
    stock: 50
  },
  {
    id: 'p2',
    name: 'Perceuse à Percussion Pro',
    description: 'Perceuse électrique 750W avec kit de mèches béton, bois et métal. Marque reconnue.',
    price: 45000,
    category: 'Outillage',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
    stock: 12
  },
  {
    id: 'p3',
    name: 'Caisse à Outils Complète',
    description: 'Coffret de 108 pièces : tournevis, clés, marteau, pinces. Idéal pour plombiers et mécaniciens.',
    price: 35000,
    category: 'Outillage',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400',
    stock: 20
  },
  {
    id: 'p4',
    name: 'Chaussures de Sécurité',
    description: 'Chaussures coquées, semelle anti-perforation, normes ISO. Tailles disponibles : 40-45.',
    price: 18500,
    category: 'Protection',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    stock: 30
  },
  {
    id: 'p5',
    name: 'Échelle Télescopique 3.8m',
    description: 'Aluminium léger, rétractable, facile à transporter. Supporte jusqu\'à 150kg.',
    price: 55000,
    category: 'Équipement',
    imageUrl: 'https://images.unsplash.com/photo-1522066597568-a47735eb8436?auto=format&fit=crop&q=80&w=400',
    stock: 5
  },
  {
    id: 'p6',
    name: 'Brouette Renforcée',
    description: 'Roue increvable, cuve acier galvanisé 100L. Pour maçonnerie et jardinage.',
    price: 22000,
    category: 'Chantier',
    imageUrl: 'https://images.unsplash.com/photo-1592313175865-c7e657c66432?auto=format&fit=crop&q=80&w=400',
    stock: 15
  }
];

export const INITIAL_SPECIALTIES: Specialty[] = [
  { id: '1', name: 'Électricien', icon: 'zap' },
  { id: '2', name: 'Plombier', icon: 'droplet' },
  { id: '3', name: 'Maçon', icon: 'brick-wall' },
  { id: '4', name: 'Menuisier', icon: 'hammer' },
  { id: '5', name: 'Peintre', icon: 'paint-roller' },
  { id: '6', name: 'Frigoriste', icon: 'snowflake' },
  { id: '7', name: 'Soudeur', icon: 'flame' },
  { id: '8', name: 'Mécanicien', icon: 'wrench' },
  { id: '9', name: 'Jardinier', icon: 'flower' },
  { id: '10', name: 'Personnel de maison', icon: 'sparkles' },
  { id: '11', name: 'Antenniste', icon: 'satellite' },
  { id: '12', name: 'Vidéosurveillance', icon: 'cctv' },
];

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  { id: '1', name: 'Niamey 2000' },
  { id: '2', name: 'Plateau' },
  { id: '3', name: 'Lazaret' },
  { id: '4', name: 'Rive Droite' },
  { id: '5', name: 'Francophonie' },
  { id: '6', name: 'Yantala' },
  { id: '7', name: 'Bobiel' },
  { id: '8', name: 'Goudel' },
  { id: '9', name: 'Koira Kano' },
  { id: '10', name: 'Koira Tégui' },
  { id: '11', name: 'Boukoki' },
  { id: '12', name: 'Wadata' },
  { id: '13', name: 'Talladjé' },
  { id: '14', name: 'Gamkallé' },
  { id: '15', name: 'Saga' },
  { id: '16', name: 'Poudrière' },
  { id: '17', name: 'Dar Es Salam' },
  { id: '18', name: 'Bassora' },
  { id: '19', name: 'Aéroport' },
  { id: '20', name: 'Karadjé' },
  { id: '21', name: 'Lamordé' },
  { id: '22', name: 'Nouveau Marché' },
  { id: '23', name: 'Banifandou' },
  { id: '24', name: 'Cité Caisse' },
  { id: '25', name: 'Terminus' },
  { id: '26', name: 'Pays Bas' },
  { id: '27', name: 'Tchangarey' },
  { id: '28', name: 'Kirkisoye' }
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: '101',
    firstName: 'Moussa',
    lastName: 'Ibrahim',
    specialtyId: '1',
    neighborhoodId: '3',
    whatsapp: '22790000001',
    phone: '90000001',
    photoUrl: 'https://picsum.photos/id/1012/200/200',
    availability: 'available',
    rating: 4.8,
    reviewCount: 24,
    isVerified: true,
    workImages: ['https://picsum.photos/id/1/400/300', 'https://picsum.photos/id/2/400/300'],
    latitude: 13.541,
    longitude: 2.132,
    accountStatus: 'active'
  },
  {
    id: '102',
    firstName: 'Abdoulaye',
    lastName: 'Sani',
    specialtyId: '2',
    neighborhoodId: '1',
    whatsapp: '22790000002',
    phone: '90000002',
    photoUrl: 'https://picsum.photos/id/1027/200/200',
    availability: 'busy',
    rating: 4.2,
    reviewCount: 15,
    isVerified: true,
    workImages: [],
    latitude: 13.535,
    longitude: 2.145,
    accountStatus: 'active'
  },
  {
    id: '103',
    firstName: 'Fatima',
    lastName: 'Diallo',
    specialtyId: '5',
    neighborhoodId: '2',
    whatsapp: '22790000003',
    phone: '90000003',
    photoUrl: 'https://picsum.photos/id/338/200/200',
    availability: 'available',
    rating: 5.0,
    reviewCount: 8,
    isVerified: false,
    workImages: ['https://picsum.photos/id/10/400/300'],
    latitude: 13.524,
    longitude: 2.109,
    accountStatus: 'active'
  },
  {
    id: '104',
    firstName: 'Issaka',
    lastName: 'Oumarou',
    specialtyId: '3',
    neighborhoodId: '5',
    whatsapp: '22790000004',
    phone: '90000004',
    photoUrl: 'https://picsum.photos/id/1005/200/200',
    availability: 'available',
    rating: 4.5,
    reviewCount: 32,
    isVerified: true,
    workImages: [],
    latitude: 13.520,
    longitude: 2.095,
    accountStatus: 'active'
  }
];
