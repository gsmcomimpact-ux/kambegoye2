import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowLeft, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cartService } from '../services/cart';
import { db } from '../services/db';
import { CartItem } from '../types';
import { formatCurrency } from '../constants';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  
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

    // 1. Sauvegarde dans la base de données (Admin)
    await db.createStoreOrder(cart, clientPhone, clientName, clientAddress);

    // 2. Préparation du message WhatsApp
    const total = cartService.getTotal();
    let message = `*NOUVELLE COMMANDE KAMBEGOYE*\n`;
    message += `Client: ${clientName}\n`;
    message += `Tél: ${clientPhone}\n`;
    message += `Adresse: ${clientAddress}\n\n`;
    message += `*Articles :*\n`;
    
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.product.name} (${formatCurrency(item.product.price * item.quantity)})\n`;
    });
    
    message += `\n*TOTAL: ${formatCurrency(total)}*\n\nJe souhaite valider cette commande et convenir de la livraison à mon adresse.`;

    const adminPhone = '22797390569';
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (cart.length === 0) {
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
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {cart.map((item) => (
                    <div key={item.product.id} className="p-4 flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.product.price)} / unité</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                            
                            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
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
        <div className="w-full lg:w-80 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Validation Commande</h3>
                
                {/* Client Info Inputs */}
                <div className="space-y-3 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Votre Nom complet</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ex: Moussa Ali"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Votre Numéro (WhatsApp)</label>
                        <input 
                            type="tel" 
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ex: 90000000"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Adresse / Quartier</label>
                        <input 
                            type="text" 
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Ex: Plateau, près de la pharmacie..."
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2 text-gray-600 dark:text-gray-400">
                    <span>Sous-total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-gray-400">
                    <span>Livraison</span>
                    <span className="text-sm italic">À définir</span>
                </div>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-6 flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-xl text-brand-600">{formatCurrency(totalAmount)}</span>
                </div>

                <button 
                    onClick={handleWhatsAppOrder}
                    disabled={!clientName || !clientPhone || !clientAddress}
                    className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold shadow-md transition-all mb-3"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Commander sur WhatsApp
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
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
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