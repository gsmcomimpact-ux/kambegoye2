import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, ShoppingBag, Truck, ShieldCheck, Check, Smartphone, Wallet } from 'lucide-react';
import { db } from '../services/db';
import { Product } from '../types';

const ShopProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientPhone, setClientPhone] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    db.getProductById(id || '').then(p => {
      setProduct(p || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!product) return <div className="p-10 text-center">Produit introuvable.</div>;

  const handleWhatsAppOrder = () => {
    const message = `Bonjour, je souhaite commander : ${product.name} au prix de ${product.price} FCFA. Est-ce disponible ?`;
    // Clean phone number: +227 97 39 05 69 -> 22797390569
    const adminPhone = '22797390569';
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePayment = async (method: 'Mynita' | 'Amanata') => {
      if (!clientPhone) {
          alert("Veuillez entrer votre numéro de téléphone pour le paiement.");
          return;
      }
      setPaymentLoading(true);
      try {
          const result = await db.initiateTransaction(method, clientPhone, product.price);
          if (result.success && result.paymentUrl) {
              window.open(result.paymentUrl, '_blank');
              // Optionally show a message or redirect to a tracking page
          } else {
              alert("Erreur lors de l'initialisation du paiement.");
          }
      } catch (e) {
          alert("Erreur système");
      } finally {
          setPaymentLoading(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate('/boutique')}
        className="flex items-center text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la boutique
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Image Section */}
        <div className="h-64 md:h-auto bg-gray-100 relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Section */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
           <span className="text-brand-600 font-bold uppercase tracking-wider text-sm mb-2">{product.category}</span>
           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{product.name}</h1>
           
           <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white mr-4">{product.price.toLocaleString()} FCFA</span>
              {product.stock > 0 ? (
                  <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                      <Check className="w-4 h-4 mr-1" /> En Stock
                  </span>
              ) : (
                  <span className="flex items-center text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">
                      Rupture de stock
                  </span>
              )}
           </div>

           <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
             {product.description}
           </p>

           {/* Commande & Paiement */}
           <div className="space-y-4">
              {product.stock > 0 ? (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre numéro (Requis pour paiement)</label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="90 00 00 00"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                            onClick={() => handlePayment('Mynita')}
                            disabled={paymentLoading}
                            className="flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Payer par Mynita
                        </button>
                        <button 
                            onClick={() => handlePayment('Amanata')}
                            disabled={paymentLoading}
                            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Payer par Amanata
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    <button 
                        onClick={handleWhatsAppOrder}
                        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Commander sur WhatsApp
                    </button>
                </>
              ) : (
                   <button 
                    disabled
                    className="w-full flex items-center justify-center bg-gray-300 text-gray-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                  >
                    Indisponible
                  </button>
              )}
           </div>

           <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
              <div className="flex items-start">
                 <Truck className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                 <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Livraison Rapide</h4>
                    <p className="text-xs text-gray-500">Partout à Niamey sous 24h.</p>
                 </div>
              </div>
              <div className="flex items-start">
                 <ShieldCheck className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                 <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Qualité Garantie</h4>
                    <p className="text-xs text-gray-500">Matériel professionnel vérifié.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProduct;