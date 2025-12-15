import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, Check, Plus, Minus, ArrowRight, MessageCircle, X } from 'lucide-react';
import { db } from '../services/db';
import { cartService } from '../services/cart';
import { Product } from '../types';
import { formatCurrency } from '../constants';

const ShopProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Direct Order State
  const [showDirectOrderForm, setShowDirectOrderForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  useEffect(() => {
    db.getProductById(id || '').then(p => {
      setProduct(p || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!product) return <div className="p-10 text-center">Produit introuvable.</div>;

  const handleAddToCart = () => {
    cartService.addToCart(product, quantity);
    setAdded(true);
  };

  const handleDirectOrder = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clientName || !clientPhone || !clientAddress) return;

      // Create a temporary cart item for the order function
      const tempCart = [{ product, quantity }];
      
      // Save order to admin dashboard
      await db.createStoreOrder(tempCart, clientPhone, clientName, clientAddress);

      // Create WhatsApp Message
      const total = product.price * quantity;
      let message = `*COMMANDE RAPIDE KAMBEGOYE*\n`;
      message += `Article: ${product.name}\n`;
      message += `Quantité: ${quantity}\n`;
      message += `Prix Total: ${formatCurrency(total)}\n\n`;
      message += `*Infos Client:*\n`;
      message += `Nom: ${clientName}\n`;
      message += `Tél: ${clientPhone}\n`;
      message += `Adresse: ${clientAddress}\n\n`;
      message += `Merci de confirmer la livraison.`;

      const adminPhone = '22797390569';
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      setShowDirectOrderForm(false);
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
        <div className="h-64 md:h-96 bg-gray-100 relative">
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
              <span className="text-3xl font-bold text-gray-900 dark:text-white mr-4">{formatCurrency(product.price)}</span>
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
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité :</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-l-lg"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-2 font-bold min-w-[3rem] text-center dark:text-white">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-r-lg"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    {!added ? (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleAddToCart}
                                className="w-full flex items-center justify-center bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-lg font-bold shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-lg"
                            >
                                <ShoppingCart className="w-6 h-6 mr-3" />
                                Ajouter au panier
                            </button>
                            <button 
                                onClick={() => setShowDirectOrderForm(true)}
                                className="w-full flex items-center justify-center bg-green-500 text-white py-4 rounded-lg font-bold shadow-md hover:bg-green-600 transition-all text-lg"
                            >
                                <MessageCircle className="w-6 h-6 mr-3" />
                                Commander directement (WhatsApp)
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center justify-center font-medium">
                                <Check className="w-5 h-5 mr-2" /> Produit ajouté !
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => navigate('/boutique')}
                                    className="flex items-center justify-center border border-gray-300 text-gray-700 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Continuer achats
                                </button>
                                <button 
                                    onClick={() => navigate('/panier')}
                                    className="flex items-center justify-center bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700"
                                >
                                    Voir le panier <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}
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
                    <p className="text-xs text-gray-500">Partout à Niamey.</p>
                 </div>
              </div>
              <div className="flex items-start">
                 <ShieldCheck className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                 <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Qualité Garantie</h4>
                    <p className="text-xs text-gray-500">Matériel professionnel.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modal Achat Direct */}
      {showDirectOrderForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Commande Rapide</h3>
                      <button onClick={() => setShowDirectOrderForm(false)} className="text-gray-400 hover:text-gray-500">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-600 dark:text-gray-300">
                      Vous commandez : <strong>{quantity}x {product.name}</strong><br/>
                      Total : <strong>{formatCurrency(product.price * quantity)}</strong>
                  </div>

                  <form onSubmit={handleDirectOrder} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                          <input 
                              type="text" 
                              required
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                              placeholder="Votre nom"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone / WhatsApp</label>
                          <input 
                              type="tel" 
                              required
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                              placeholder="Ex: 90000000"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse / Quartier</label>
                          <input 
                              type="text" 
                              required
                              value={clientAddress}
                              onChange={(e) => setClientAddress(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                              placeholder="Ex: Plateau, près de..."
                          />
                      </div>

                      <button 
                          type="submit" 
                          className="w-full bg-green-500 text-white px-4 py-3 rounded-md font-bold hover:bg-green-600 flex items-center justify-center mt-4"
                      >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Envoyer la commande (WhatsApp)
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ShopProduct;