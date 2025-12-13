import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Truck, ShieldCheck, Check } from 'lucide-react';
import { db } from '../services/db';
import { Product } from '../types';

const ShopProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

           {/* Commande */}
           <div className="space-y-4">
              {product.stock > 0 ? (
                <>
                    <button 
                        onClick={handleWhatsAppOrder}
                        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all text-lg"
                    >
                        <MessageCircle className="w-6 h-6 mr-3" />
                        Commander sur WhatsApp
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        Vous serez redirigé vers WhatsApp pour finaliser la commande avec un agent.
                    </p>
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