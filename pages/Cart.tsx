import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowLeft, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cartService } from '../services/cart';
import { db } from '../services/db';
import { CartItem } from '../types';
import { formatCurrency } from '../constants';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  // Client Info State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  useEffect(() => {
    setCart(cartService.getCart());
    
    // Listen for updates in case changes happen elsewhere
    const handleCartUpdate = () => setCart(cartService.getCart());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const item = cart.find(i => i.product.id === id);
    if (item) {
      cartService.updateQuantity(id, item.quantity + delta);
    }
  };

  const removeItem = (id: string) => {
    if(window.confirm('Retirer cet article du panier ?')) {
        cartService.removeFromCart(id);
    }
  };

  const generatePDF = () => {
      const doc = new jsPDF();
      const totalAmount = cartService.getTotal();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74); // Brand Color
      doc.text("KAMBEGOYE", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Bon de Commande / Devis", 14, 26);
      doc.text("Niamey, Niger - Tél: +227 97 39 05 69", 14, 31);

      // Client Info
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Client :", 14, 45);
      doc.setFontSize(10);
      doc.text(`Nom : ${clientName || '_________________'}`, 14, 51);
      doc.text(`Téléphone : ${clientPhone || '_________________'}`, 14, 56);
      doc.text(`Adresse/Quartier : ${clientAddress || '_________________'}`, 14, 61);
      doc.text(`Date : ${new Date().toLocaleDateString()}`, 14, 66);

      // Table
      const tableColumn = ["Produit", "Quantité", "Prix Unitaire", "Total"];
      const tableRows = cart.map(item => [
          item.product.name,
          item.quantity,
          formatCurrency(item.product.price),
          formatCurrency(item.product.price * item.quantity)
      ]);

      autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 75,
          headStyles: { fillColor: [22, 163, 74] },
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL À PAYER : ${formatCurrency(totalAmount)}`, 14, finalY + 15);

      doc.save(`Commande_Kambegoye_${Date.now()}.pdf`);
  };

  const handleWhatsAppOrder = async () => {
    if (cart.length === 0) return;
    
    if (!clientName || !clientPhone || !clientAddress) {
        alert("Veuillez renseigner votre nom, téléphone et adresse pour valider la commande.");
        return;
    }

    try {
        // 1. Sauvegarde dans la base de données (Admin)
        await db.createStoreOrder(cart, clientPhone, clientName, clientAddress);

        // 2. Préparation du message WhatsApp
        const total = cartService.getTotal();
        let message = `*NOUVELLE COMMANDE KAMBEGOYE*\n`;
        message += `--------------------------------\n`;
        message += `👤 Client: ${clientName}\n`;
        message += `📞 Tél: ${clientPhone}\n`;
        message += `📍 Adresse: ${clientAddress}\n`;
        message += `--------------------------------\n`;
        message += `*Articles :*\n`;
        
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.product.name} (${formatCurrency(item.product.price * item.quantity)})\n`;
        });
        
        message += `\n*TOTAL À PAYER: ${formatCurrency(total)}*\n`;
        message += `--------------------------------\n`;
        message += `Je souhaite valider cette commande. Merci de confirmer la livraison.`;

        const adminPhone = '22797390569';
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');

        // 3. Vider le panier après la commande
        cartService.clearCart();
        setIsOrderSuccess(true);
    } catch (error) {
        console.error("Erreur lors de la commande", error);
        alert("Une erreur est survenue lors de l'enregistrement de la commande. Veuillez réessayer.");
    }
  };

  if (cart.length === 0) {
    if (isOrderSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                <div className="bg-green-100 text-green-600 p-6 rounded-full mb-6 shadow-sm">
                    <CheckCircle className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Commande Validée !</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    Votre commande a été enregistrée avec succès. La discussion WhatsApp s'est ouverte pour finaliser les détails de la livraison.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                      onClick={() => navigate('/boutique')}
                      className="bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-md"
                    >
                      Retour à la boutique
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Retour à l'accueil
                    </button>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Votre panier est vide</h2>
        <p className="text-gray-500 mb-6">Découvrez nos équipements et outillages.</p>
        <button 
          onClick={() => navigate('/boutique')}
          className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          Aller à la boutique
        </button>
      </div>
    );
  }

  const totalAmount = cartService.getTotal();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
          <button onClick={() => navigate('/boutique')} className="mr-4 text-gray-500 hover:text-brand-600">
              <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Votre Panier</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{cart.length} Articles</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {cart.map((item) => (
                    <div key={item.product.id} className="p-4 flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.product.price)} / unité</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                            
                            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                                <button 
                                    onClick={() => updateQuantity(item.product.id, -1)}
                                    className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                                >
                                    {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500"/> : <Minus className="w-4 h-4"/>}
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.product.id, 1)}
                                    className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                                >
                                    <Plus className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-96 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Validation Commande</h3>
                
                {/* Client Info Inputs */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-shadow"
                            placeholder="Ex: Moussa Ali"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro WhatsApp *</label>
                        <input 
                            type="tel" 
                            className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-shadow"
                            placeholder="Ex: 90000000"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse de livraison *</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-shadow"
                            placeholder="Ex: Plateau, près de la pharmacie..."
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                        />
                    </div>
                </div>

                {!clientName || !clientPhone || !clientAddress ? (
                    <div className="mb-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md flex items-start border border-yellow-200">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        Veuillez remplir vos informations pour valider la commande.
                    </div>
                ) : null}

                <div className="flex justify-between items-center mb-2 text-gray-600 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="text-sm italic">À définir sur WhatsApp</span>
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6 flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-xl text-brand-600">{formatCurrency(totalAmount)}</span>
                </div>

                <button 
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold shadow-lg transform active:scale-95 transition-all mb-4"
                >
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Valider la commande (WhatsApp)
                </button>
                
                <button 
                    onClick={generatePDF}
                    className="w-full flex items-center justify-center border border-gray-300 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 mb-3"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger Devis (PDF)
                </button>

                <button 
                    onClick={() => navigate('/boutique')}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline"
                >
                    Continuer mes achats
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;