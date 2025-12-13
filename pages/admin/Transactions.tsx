import React, { useEffect, useState } from 'react';
import { Download, Filter, TrendingUp, Calendar, Plus, X, Save, ShoppingBag, Trash2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../services/db';
import { Transaction, Product } from '../../types';

interface CartItem {
  product: Product;
  quantity: number;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  
  // Data for Sales
  const [products, setProducts] = useState<Product[]>([]);

  // States for Manual Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState(200);
  const [transactionType, setTransactionType] = useState<'simple' | 'sale'>('simple');
  const [paymentMethod, setPaymentMethod] = useState<string>('Espèces');
  
  // Generated Link State
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Cart for Sales
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQty, setProductQty] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Parallel fetch for stats and products
    const [stats, prods] = await Promise.all([
        db.getStats(),
        db.getProducts()
    ]);
    
    // Sort transactions
    const sorted = stats.allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sorted); 
    setProducts(prods);
    setLoading(false);
  };

  const addToCart = () => {
      if (!selectedProductId) return;
      const product = products.find(p => p.id === selectedProductId);
      if (!product) return;

      const existingItemIndex = cart.findIndex(item => item.product.id === selectedProductId);
      if (existingItemIndex >= 0) {
          const newCart = [...cart];
          newCart[existingItemIndex].quantity += productQty;
          setCart(newCart);
      } else {
          setCart([...cart, { product, quantity: productQty }]);
      }
      
      // Reset selection
      setSelectedProductId('');
      setProductQty(1);
  };

  const removeFromCart = (index: number) => {
      setCart(cart.filter((_, i) => i !== index));
  };

  const calculateCartTotal = () => {
      return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const resetModal = () => {
      setManualPhone('');
      setManualAmount(200);
      setCart([]);
      setTransactionType('simple');
      setPaymentMethod('Espèces');
      setGeneratedLink(null);
      setCopied(false);
      setIsModalOpen(false);
  };

  const handleGenerateLink = async () => {
      let finalAmount = manualAmount;
      let details = '';

      if (transactionType === 'sale') {
          if (cart.length === 0) {
              alert("Panier vide.");
              return;
          }
          finalAmount = calculateCartTotal();
          details = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
      } else {
          details = 'Encaissement simple';
      }
      
      if (!manualPhone || finalAmount <= 0) {
          alert("Veuillez remplir le numéro et le montant/panier.");
          return;
      }

      // On passe les détails pour qu'ils soient enregistrés dans l'URL
      const result = await db.initiateTransaction(paymentMethod, manualPhone, finalAmount, details);
      if (result.success && result.paymentUrl) {
          setGeneratedLink(result.paymentUrl);
      }
  };

  const copyToClipboard = () => {
      if (generatedLink) {
          navigator.clipboard.writeText(generatedLink);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let finalAmount = manualAmount;
      let details = '';

      // 1. Calcul et préparation des données
      if (transactionType === 'sale') {
          if (cart.length === 0) {
              alert("Veuillez ajouter des produits au panier.");
              return;
          }
          finalAmount = calculateCartTotal();
          details = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
      } else {
          details = 'Encaissement simple';
      }

      // 2. Validations
      if (!manualPhone) {
          alert("Le numéro du client est obligatoire.");
          return;
      }

      if (finalAmount <= 0) {
          alert("Le montant doit être supérieur à 0.");
          return;
      }
      
      try {
          // 3. Mise à jour du stock (seulement si vente directe validée, pas pour un lien)
          if (transactionType === 'sale') {
              for (const item of cart) {
                  await db.updateProductStock(item.product.id, item.quantity);
              }
          }

          // 4. Enregistrement transaction
          await db.addManualTransaction(finalAmount, manualPhone, paymentMethod, details);
          
          resetModal();
          await loadData();
      } catch (err) {
          console.error("Erreur lors de la validation:", err);
          alert("Une erreur est survenue lors de l'enregistrement de la transaction.");
      }
  };

  const filteredTransactions = transactions.filter(t => 
    filterMethod === 'all' ? true : t.method === filterMethod
  );

  // Calcul du montant total
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calcul de la période
  let periodStr = "N/A";
  if (filteredTransactions.length > 0) {
      const maxDate = new Date(filteredTransactions[0].date).toLocaleDateString();
      const minDate = new Date(filteredTransactions[filteredTransactions.length - 1].date).toLocaleDateString();
      periodStr = `${minDate} au ${maxDate}`;
  }

  const handleExport = () => {
    const doc = new jsPDF();
    const titleSuffix = filterMethod === 'all' ? 'Global' : filterMethod;
    
    // En-tête du PDF
    doc.setFontSize(18);
    doc.text(`Historique des Transactions (${titleSuffix})`, 14, 20);
    doc.setFontSize(10);
    doc.text("KAMBEGOYE - Rapport Financier", 14, 26);
    
    // Informations détaillées
    doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Période couverte: ${periodStr}`, 14, 40);
    doc.text(`Nombre de transactions: ${filteredTransactions.length}`, 14, 45);
    
    // Montant Total en gras
    doc.setFont("helvetica", "bold");
    doc.text(`MONTANT TOTAL: ${totalAmount.toLocaleString('fr-FR')} FCFA`, 14, 52);
    doc.setFont("helvetica", "normal");

    const tableColumn = ["ID", "Date", "Tél Client", "Montant", "Méthode", "Détails"];
    const tableRows = filteredTransactions.map(tx => [
      tx.id.substring(0, 8),
      new Date(tx.date).toLocaleDateString() + ' ' + new Date(tx.date).toLocaleTimeString(),
      tx.clientPhone || 'N/A',
      `${tx.amount} FCFA`,
      tx.method,
      tx.details || (tx.status === 'success' ? 'Validé' : tx.status)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      headStyles: { fillColor: [22, 163, 74] }, // Couleur verte Kambegoye
      columnStyles: {
          5: { cellWidth: 50 } // Give more space to Details column
      }
    });

    doc.save(`transactions_${filterMethod}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historique des Transactions</h2>
        
        <div className="flex space-x-2">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Encaisser / Vendre
          </button>
          
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
             </div>
             <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             >
                <option value="all">Toutes méthodes</option>
                <option value="Mynita">Mynita</option>
                <option value="Amanata">Amanata</option>
                <option value="Espèces">Espèces</option>
             </select>
          </div>
          
          <button 
            onClick={handleExport}
            className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Résumé Période et Montant Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Montant Total ({filterMethod === 'all' ? 'Global' : filterMethod})</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalAmount.toLocaleString('fr-FR')} FCFA</p>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
             <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Période concernée</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{periodStr}</p>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tél. Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Détails</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tx.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                  {tx.clientPhone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  {tx.amount} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {tx.method}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                   {tx.details ? (
                       <span title={tx.details} className="truncate block max-w-xs">{tx.details}</span>
                   ) : (
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                       }`}>
                        {tx.status === 'success' ? 'Succès' : tx.status}
                       </span>
                   )}
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucune transaction trouvée pour ce critère.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Encaisser un paiement
              </h3>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleManualAdd} className="space-y-4">
               
               {/* Transaction Type Toggle */}
               <div className="flex rounded-md shadow-sm mb-4">
                 <button
                   type="button"
                   onClick={() => setTransactionType('simple')}
                   className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${transactionType === 'simple' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                 >
                   Encaissement Simple
                 </button>
                 <button
                   type="button"
                   onClick={() => setTransactionType('sale')}
                   className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border ${transactionType === 'sale' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                 >
                   Vente Boutique (POS)
                 </button>
               </div>

               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro du client</label>
                   <input 
                      type="text" 
                      required
                      placeholder="Ex: 90000000"
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   />
               </div>

               {transactionType === 'simple' ? (
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (FCFA)</label>
                       <input 
                          type="number" 
                          required
                          value={manualAmount}
                          onChange={e => setManualAmount(parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       />
                       <p className="text-xs text-gray-500 mt-1">Pour les frais d'accès aux contacts ou services divers.</p>
                   </div>
               ) : (
                   <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                       <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                           <ShoppingBag className="w-4 h-4 mr-2"/> Sélectionner Produits
                       </h4>
                       <div className="flex gap-2 mb-2">
                           <select 
                             className="flex-1 rounded-md border-gray-300 shadow-sm p-2 text-sm"
                             value={selectedProductId}
                             onChange={e => setSelectedProductId(e.target.value)}
                           >
                               <option value="">-- Choisir Produit --</option>
                               {products.filter(p => p.stock > 0).map(p => (
                                   <option key={p.id} value={p.id}>{p.name} ({p.price} F)</option>
                               ))}
                           </select>
                           <input 
                             type="number" 
                             min="1" 
                             className="w-16 rounded-md border-gray-300 shadow-sm p-2 text-sm"
                             value={productQty}
                             onChange={e => setProductQty(parseInt(e.target.value))}
                           />
                           <button type="button" onClick={addToCart} className="bg-blue-600 text-white px-3 rounded-md text-sm">+</button>
                       </div>

                       {/* Cart Summary */}
                       {cart.length > 0 && (
                           <div className="mt-4 border-t pt-2 border-gray-200 dark:border-gray-600">
                               <table className="w-full text-sm">
                                   <thead>
                                       <tr className="text-left text-gray-500">
                                           <th>Produit</th>
                                           <th>Qté</th>
                                           <th>Total</th>
                                           <th></th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {cart.map((item, idx) => (
                                           <tr key={idx} className="border-b border-gray-100 dark:border-gray-600">
                                               <td className="py-1">{item.product.name}</td>
                                               <td>{item.quantity}</td>
                                               <td>{item.product.price * item.quantity} F</td>
                                               <td className="text-right">
                                                   <button type="button" onClick={() => removeFromCart(idx)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                               <div className="mt-2 text-right font-bold text-lg text-brand-600">
                                   Total: {calculateCartTotal()} FCFA
                               </div>
                           </div>
                       )}
                   </div>
               )}

               {/* Payment Method Selector */}
               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de Paiement</label>
                   <select 
                      value={paymentMethod}
                      onChange={e => {
                          setPaymentMethod(e.target.value);
                          setGeneratedLink(null); // Reset link if method changes
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   >
                       <option value="Espèces">Espèces (Main à main)</option>
                       <option value="Mynita">Mynita (Moov Money)</option>
                       <option value="Amanata">Amanata (Airtel Money)</option>
                   </select>
               </div>
               
               {/* Link Generator for Remote Payment */}
               {paymentMethod !== 'Espèces' && (
                   <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                       <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                           Si le client n'est pas présent, vous pouvez générer un lien de paiement à lui envoyer.
                       </p>
                       
                       {!generatedLink ? (
                           <button 
                             type="button" 
                             onClick={handleGenerateLink}
                             className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
                           >
                               <LinkIcon className="w-4 h-4 mr-2" /> Générer Lien de Paiement
                           </button>
                       ) : (
                           <div className="flex items-center gap-2">
                               <input 
                                 readOnly 
                                 value={generatedLink} 
                                 className="flex-1 text-xs p-2 border rounded bg-white dark:bg-gray-900 dark:text-white"
                               />
                               <button 
                                 type="button"
                                 onClick={copyToClipboard}
                                 className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
                               >
                                   {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                               </button>
                           </div>
                       )}
                   </div>
               )}

               <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={resetModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">
                        Annuler
                    </button>
                    <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Valider Paiement (Encaissé)
                    </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;