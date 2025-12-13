import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Truck, ShieldCheck, Check, CreditCard, Wallet } from 'lucide-react';
import { db } from '../services/db';
import { Product } from '../types';

const ShopProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Payment State
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Mynita');
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    // Use window.open with fallback for mobile
    window.open(whatsappUrl, '_blank');
  };

  const handleDirectPayment = async () => {
      if (!clientPhone) {
          alert("Veuillez entrer votre numéro de téléphone pour le paiement.");
          return;
      }
      setIsProcessing(true);
      
      try {
          const details = `Achat Boutique: ${product.name}`;
          const result = await db.initiateTransaction(paymentMethod, clientPhone, product.price, details);
          
          if (result.success && result.paymentUrl) {
              window.location.href = result.paymentUrl;
          } else {
              alert("Erreur lors de l'initialisation du paiement.");
          }
      } catch (error) {
          console.error(error);
          alert("Une erreur est survenue.");
      } finally {
          setIsProcessing(false);
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

           {/* Zone Actions */}
           <div className="space-y-6">
              {product.stock > 0 ? (
                <>
                    {/* WhatsApp */}
                    <button 
                        onClick={handleWhatsAppOrder}
                        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-lg"
                    >
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Commander sur WhatsApp
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Ou paiement direct</span>
                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    </div>

                    {/* Payment Form */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Votre Téléphone</label>
                                <input 
                                    type="tel"
                                    placeholder="Ex: 90000000"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm dark:text-white focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Méthode</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('Mynita')}
                                        className={`flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                                            paymentMethod === 'Mynita' 
                                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' 
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        Mynita (Moov)
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Amanata')}
                                        className={`flex items-center justify-center py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                                            paymentMethod === 'Amanata' 
                                            ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                                        }`}
                                    >
                                        Amanata (Airtel)
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleDirectPayment}
                                disabled={isProcessing || !clientPhone}
                                className="w-full flex items-center justify-center bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 text-white py-3 rounded-lg font-bold shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                <CreditCard className="w-5 h-5 mr-2" />
                                {isProcessing ? 'Initialisation...' : `Payer ${product.price.toLocaleString()} FCFA`}
                            </button>
                        </div>
                    </div>
                </>
              ) : (
                   <button 
                    disabled
                    className="w-full flex items-center justify-center bg-gray-300 text-gray-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                  >
                    Indisponible (Rupture)
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