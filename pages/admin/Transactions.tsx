import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Filter, TrendingUp, Calendar, Plus, X, Save, ShoppingBag, Trash2, Link as LinkIcon, Copy, Check, FileText, Printer, Search, MinusCircle, PlusCircle, Edit, Ban, AlertTriangle, Tag } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../services/db';
import { Transaction, Product, TransactionCategory } from '../../types';
import { formatCurrency } from '../../constants';

interface CartItem {
  product: Product;
  quantity: number;
}

const Transactions = () => {
  const location = useLocation();
  const isInvoicePage = location.pathname.includes('factures');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  
  // Data for Sales
  const [products, setProducts] = useState<Product[]>([]);

  // States for Manual Transaction Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState(200);
  const [manualDescription, setManualDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'simple' | 'sale'>('simple');
  const [paymentMethod, setPaymentMethod] = useState<string>('Espèces');
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'pending' | 'failed'>('success');
  const [transactionCategory, setTransactionCategory] = useState<TransactionCategory>('manual');
  
  // Sales UI State
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Generated Link State
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Parallel fetch for stats and products
    const [stats, prods] = await Promise.all([
        db.getStats(),
        db.getProducts()
    ]);
    
    // Sort transactions
    if (stats && stats.allTransactions) {
        const sorted = stats.allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(sorted); 
    }
    setProducts(prods || []);
    setLoading(false);
  };

  // Filter products for the modal list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) && p.stock > 0
  );

  const quickAddToCart = (product: Product) => {
      const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
      if (existingItemIndex >= 0) {
          const newCart = [...cart];
          newCart[existingItemIndex].quantity += 1;
          setCart(newCart);
      } else {
          setCart([...cart, { product, quantity: 1 }]);
      }
  };

  const updateCartQuantity = (index: number, delta: number) => {
      const newCart = [...cart];
      const newQty = newCart[index].quantity + delta;
      if (newQty > 0) {
          newCart[index].quantity = newQty;
          setCart(newCart);
      }
  };

  const removeFromCart = (index: number) => {
      setCart(cart.filter((_, i) => i !== index));
  };

  const calculateCartTotal = () => {
      return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const resetModal = () => {
      setEditingTransaction(null);
      setManualPhone('');
      setManualAmount(200);
      setManualDescription('');
      setCart([]);
      setProductSearchTerm('');
      setTransactionType(isInvoicePage ? 'sale' : 'simple'); // Reset to default based on page
      setPaymentMethod('Espèces');
      setTransactionStatus('success');
      setTransactionCategory('manual');
      setGeneratedLink(null);
      setCopied(false);
      setIsModalOpen(false);
  };

  const handleEdit = (tx: Transaction) => {
      setEditingTransaction(tx);
      setManualPhone(tx.clientPhone || '');
      setManualAmount(tx.amount);
      setManualDescription(tx.details || '');
      setPaymentMethod(tx.method);
      setTransactionStatus(tx.status);
      setTransactionCategory(tx.category || 'manual');
      
      // En mode édition, on simplifie : on édite le texte des détails et le montant total
      setTransactionType('simple'); 
      
      setIsModalOpen(true);
  };

  const handleCancelTransaction = async (tx: Transaction) => {
      if (window.confirm("Êtes-vous sûr de vouloir ANNULER cette facture ?\n\nCela marquera la transaction comme 'Échouée' et ajoutera la mention [ANNULÉ].")) {
          const updatedTx = {
              ...tx,
              status: 'failed' as const,
              details: (tx.details || '') + ' [ANNULÉ]'
          };
          await db.updateTransaction(updatedTx);
          await loadData();
      }
  };

  const generateInvoice = (tx: Transaction, mode: 'download' | 'print' = 'download') => {
      const doc = new jsPDF();
      
      // Watermark if failed/cancelled
      if (tx.status === 'failed') {
          doc.setTextColor(255, 200, 200);
          doc.setFontSize(60);
          doc.text("ANNULÉE", 40, 150, { angle: 45 });
      }

      // -- HEADER --
      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74); // Brand Color
      doc.text("KAMBEGOYE", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Plateforme de mise en relation & Boutique", 14, 26);
      doc.text("Quartier Poudrière, Niamey", 14, 31);
      doc.text("Tél: +227 97 39 05 69", 14, 36);

      // -- INVOICE INFO --
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("FACTURE", 140, 20);
      doc.setFontSize(10);
      doc.text(`N°: ${tx.id.substring(0, 8).toUpperCase()}`, 140, 28);
      doc.text(`Date: ${new Date(tx.date).toLocaleDateString()}`, 140, 33);
      doc.text(`Heure: ${new Date(tx.date).toLocaleTimeString()}`, 140, 38);
      
      if (tx.status === 'failed') {
          doc.setTextColor(220, 38, 38);
          doc.text("STATUT : ANNULÉE", 140, 43);
          doc.setTextColor(0);
      }

      // -- CLIENT INFO --
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Client:", 14, 50);
      doc.setFont("helvetica", "normal");
      doc.text(tx.clientPhone || "Client Comptoir", 14, 56);

      // -- PARSING DETAILS FOR TABLE --
      const rows = [];
      if (tx.details && tx.details.includes('x ')) {
          const items = tx.details.split(', ');
          items.forEach(itemStr => {
              const regex = /^(\d+)x\s(.+)$/;
              const match = itemStr.match(regex);
              if (match) {
                  rows.push([match[2], match[1], "-", "-"]); 
              } else {
                  rows.push([itemStr, "1", "-", "-"]);
              }
          });
      } else {
          rows.push([tx.details || "Article divers", "1", formatCurrency(tx.amount), formatCurrency(tx.amount)]);
      }

      // -- TABLE --
      autoTable(doc, {
          head: [["Désignation", "Qté", "Prix U.", "Total"]],
          body: rows,
          startY: 65,
          headStyles: { fillColor: tx.status === 'failed' ? [150, 150, 150] : [22, 163, 74] },
          theme: 'grid'
      });

      // -- TOTAL --
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      
      doc.setFontSize(10);
      doc.text(`Méthode de paiement: ${tx.method}`, 14, finalY + 10);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL PAYÉ: ${formatCurrency(tx.amount)}`, 140, finalY + 10);

      // -- FOOTER --
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150);
      doc.text("Merci de votre confiance. Les marchandises vendues ne sont ni reprises ni échangées.", 105, 280, { align: "center" });

      if (mode === 'print') {
          doc.autoPrint();
          const blob = doc.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
      } else {
          doc.save(`Facture_${tx.id.substring(0, 8)}.pdf`);
      }
  };

  const handleGenerateLink = async () => {
      let finalAmount = manualAmount;
      let details = '';
      let cat: TransactionCategory = transactionCategory;

      if (transactionType === 'sale') {
          if (cart.length === 0) {
              alert("Panier vide.");
              return;
          }
          finalAmount = calculateCartTotal();
          details = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
          cat = 'store';
      } else {
          // Use manual description or fallback
          details = manualDescription || 'Encaissement divers';
      }
      
      if (!manualPhone || finalAmount <= 0) {
          alert("Veuillez remplir le numéro et le montant/panier.");
          return;
      }

      const result = await db.initiateTransaction(paymentMethod, manualPhone, finalAmount, details, cat);
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
      
      try {
          let finalAmount = 0;
          let details = '';
          let cat: TransactionCategory = transactionCategory;
          const isSale = transactionType === 'sale';

          if (isSale) {
              if (cart.length === 0) {
                  alert("Veuillez ajouter des produits au panier.");
                  return;
              }
              finalAmount = calculateCartTotal();
              details = cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
              cat = 'store';
          } else {
              finalAmount = manualAmount;
              details = manualDescription || 'Encaissement divers';
          }

          if (!manualPhone && paymentMethod !== 'Espèces') {
              alert("Le numéro du client est obligatoire pour les paiements mobiles.");
              return;
          }

          if (finalAmount <= 0) {
              alert("Le montant doit être supérieur à 0.");
              return;
          }
          
          const phoneToSave = manualPhone || (isSale ? 'Client Boutique' : 'Client Comptoir');
          
          if (editingTransaction) {
              // MODE UPDATE
              const updatedTx: Transaction = {
                  ...editingTransaction,
                  amount: finalAmount,
                  clientPhone: phoneToSave,
                  details: details,
                  method: paymentMethod,
                  status: transactionStatus,
                  category: cat
              };
              await db.updateTransaction(updatedTx);
              alert("Transaction mise à jour !");
          } else {
              // MODE CREATE
              if (isSale) {
                  for (const item of cart) {
                      await db.updateProductStock(item.product.id, item.quantity);
                  }
              }

              const newTx = await db.addManualTransaction(finalAmount, phoneToSave, paymentMethod, details, cat);
              
              if (isSale && newTx) {
                  generateInvoice(newTx, 'print');
              }

              alert("Paiement enregistré avec succès !");
          }
          
          resetModal();
          await loadData(); 
          
      } catch (err) {
          console.error("Erreur lors de la validation:", err);
          alert("Une erreur est survenue lors de l'enregistrement.");
      }
  };

  const filteredTransactions = transactions.filter(t => 
    filterMethod === 'all' ? true : t.method === filterMethod
  );

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.status === 'success' ? t.amount : 0), 0);

  let periodStr = "N/A";
  if (filteredTransactions.length > 0) {
      const maxDate = new Date(filteredTransactions[0].date).toLocaleDateString();
      const minDate = new Date(filteredTransactions[filteredTransactions.length - 1].date).toLocaleDateString();
      periodStr = `${minDate} au ${maxDate}`;
  }

  const handleExport = () => {
    const doc = new jsPDF();
    const titleSuffix = filterMethod === 'all' ? 'Global' : filterMethod;
    
    doc.setFontSize(18);
    doc.text(`Historique des Transactions (${titleSuffix})`, 14, 20);
    doc.setFontSize(10);
    doc.text("KAMBEGOYE - Rapport Financier", 14, 26);
    
    doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Période couverte: ${periodStr}`, 14, 40);
    doc.text(`Nombre de transactions: ${filteredTransactions.length}`, 14, 45);
    
    doc.setFont("helvetica", "bold");
    doc.text(`MONTANT TOTAL ENCAISSÉ: ${formatCurrency(totalAmount)}`, 14, 52);
    doc.setFont("helvetica", "normal");

    const tableColumn = ["ID", "Date", "Tél Client", "Montant", "Type", "Méthode", "Statut"];
    const tableRows = filteredTransactions.map(tx => [
      tx.id.substring(0, 8),
      new Date(tx.date).toLocaleDateString() + ' ' + new Date(tx.date).toLocaleTimeString(),
      tx.clientPhone || 'N/A',
      formatCurrency(tx.amount),
      tx.category || 'manual',
      tx.method,
      tx.status === 'success' ? 'Validé' : 'Annulé/Échoué'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`transactions_${filterMethod}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'access': return { label: 'Accès', color: 'bg-blue-100 text-blue-800' };
          case 'store': return { label: 'Boutique', color: 'bg-purple-100 text-purple-800' };
          case 'quote': return { label: 'Devis', color: 'bg-orange-100 text-orange-800' };
          default: return { label: 'Autre', color: 'bg-gray-100 text-gray-800' };
      }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isInvoicePage ? 'Gestion des Factures' : 'Historique Financier'}
        </h2>
        
        <div className="flex space-x-2">
           <button 
            onClick={() => {
              setTransactionType(isInvoicePage ? 'sale' : 'simple');
              setIsModalOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> {isInvoicePage ? 'Créer une Facture' : 'Encaisser / Vendre'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Encaissé ({filterMethod === 'all' ? 'Global' : filterMethod})</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type / Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut / Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((tx) => {
                const catStyle = getCategoryLabel(tx.category);
                return (
                  <tr key={tx.id} className={tx.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {tx.clientPhone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${catStyle.color}`}>
                           {catStyle.label}
                       </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${tx.status === 'failed' ? 'text-gray-400 line-through' : 'text-green-600'}`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {tx.method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                       <div className="flex justify-between items-center">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-2 ${
                              tx.status === 'success' ? 'bg-green-100 text-green-800' : 
                              tx.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                           }`}>
                            {tx.status === 'success' ? 'Succès' : tx.status === 'failed' ? 'Annulé' : tx.status}
                           </span>
                           
                           <div className="flex gap-1">
                               <button 
                                onClick={() => generateInvoice(tx, 'print')}
                                className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                                title="Imprimer"
                               >
                                   <Printer className="w-4 h-4" />
                               </button>
                               <button 
                                onClick={() => generateInvoice(tx, 'download')}
                                className="p-1.5 text-gray-500 hover:text-green-600 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                                title="PDF"
                               >
                                   <Download className="w-4 h-4" />
                               </button>
                               <button 
                                onClick={() => handleEdit(tx)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                                title="Modifier"
                               >
                                   <Edit className="w-4 h-4" />
                               </button>
                               {tx.status === 'success' && (
                                   <button 
                                    onClick={() => handleCancelTransaction(tx)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                                    title="Annuler (Marquer comme échoué)"
                                   >
                                       <Ban className="w-4 h-4" />
                                   </button>
                               )}
                           </div>
                       </div>
                    </td>
                  </tr>
                );
            })}
            {filteredTransactions.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune transaction trouvée pour ce critère.</td>
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
                {editingTransaction ? 'Modifier Transaction' : (isInvoicePage ? 'Créer une Facture' : 'Encaisser un paiement')}
              </h3>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleManualAdd} className="space-y-4">
               
               {!editingTransaction && (
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
               )}
               
               {editingTransaction && (
                   <div className="mb-4 bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200 flex items-start">
                       <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                       Mode Correction : Modification d'une transaction existante.
                   </div>
               )}

               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                       Numéro du client
                   </label>
                   <input 
                      type="text" 
                      placeholder={paymentMethod === 'Espèces' ? "Facultatif pour espèces" : "Ex: 90000000"}
                      value={manualPhone}
                      onChange={e => setManualPhone(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   />
               </div>

               {transactionType === 'simple' ? (
                   <div>
                       <div className="mb-4">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de revenu</label>
                           <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    value={transactionCategory}
                                    // @ts-ignore
                                    onChange={e => setTransactionCategory(e.target.value)}
                                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="manual">Prestation / Service</option>
                                    <option value="store">Vente Boutique</option>
                                    <option value="access">Frais Accès (Site)</option>
                                    <option value="quote">Règlement Devis</option>
                                    <option value="other">Autre</option>
                                </select>
                           </div>
                       </div>

                       <div className="mb-4">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Objet / Détails</label>
                           <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Frais d'accès, Consultation, Acompte..."
                                    value={manualDescription}
                                    onChange={e => setManualDescription(e.target.value)}
                                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                           </div>
                       </div>
                       
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (FCFA)</label>
                       <input 
                          type="number" 
                          required
                          value={manualAmount}
                          onChange={e => setManualAmount(parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       />
                   </div>
               ) : (
                   <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                       {/* Sales UI kept same as before */}
                       <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                           <ShoppingBag className="w-4 h-4 mr-2"/> Sélectionner Produits
                       </h4>
                       <div className="mb-4">
                           <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                               <input 
                                   type="text"
                                   placeholder="Rechercher un produit à ajouter..."
                                   value={productSearchTerm}
                                   onChange={e => setProductSearchTerm(e.target.value)}
                                   className="w-full pl-9 pr-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-500 dark:text-white"
                               />
                           </div>
                           <div className="mt-2 max-h-32 overflow-y-auto border rounded-md bg-white dark:bg-gray-800 dark:border-gray-500">
                               {filteredProducts.length > 0 ? (
                                   filteredProducts.map(p => (
                                       <div 
                                           key={p.id} 
                                           onClick={() => quickAddToCart(p)}
                                           className="px-3 py-2 border-b last:border-0 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center text-sm dark:text-gray-200 dark:border-gray-600"
                                       >
                                           <span>{p.name}</span>
                                           <div className="flex items-center gap-2">
                                               <span className="font-bold text-gray-600 dark:text-gray-400">{formatCurrency(p.price)}</span>
                                               <PlusCircle className="w-4 h-4 text-green-600" />
                                           </div>
                                       </div>
                                   ))
                               ) : (
                                   <div className="p-3 text-xs text-center text-gray-500">Aucun produit trouvé.</div>
                               )}
                           </div>
                       </div>
                       {cart.length > 0 && (
                           <div className="mt-4 border-t pt-2 border-gray-200 dark:border-gray-600">
                               <table className="w-full text-sm">
                                   <thead>
                                       <tr className="text-left text-gray-500">
                                           <th className="pb-2">Produit</th>
                                           <th className="pb-2 text-center">Qté</th>
                                           <th className="pb-2 text-right">Total</th>
                                           <th></th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {cart.map((item, idx) => (
                                           <tr key={idx} className="border-b border-gray-100 dark:border-gray-600 last:border-0">
                                               <td className="py-2 text-gray-900 dark:text-white">{item.product.name}</td>
                                               <td className="py-2">
                                                   <div className="flex items-center justify-center gap-2">
                                                       <button type="button" onClick={() => updateCartQuantity(idx, -1)} className="text-gray-400 hover:text-red-500"><MinusCircle className="w-4 h-4"/></button>
                                                       <span className="font-semibold w-6 text-center">{item.quantity}</span>
                                                       <button type="button" onClick={() => updateCartQuantity(idx, 1)} className="text-gray-400 hover:text-green-500"><PlusCircle className="w-4 h-4"/></button>
                                                   </div>
                                               </td>
                                               <td className="py-2 text-right font-medium dark:text-gray-200">{formatCurrency(item.product.price * item.quantity)}</td>
                                               <td className="text-right pl-2">
                                                   <button type="button" onClick={() => removeFromCart(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                               <div className="mt-3 text-right font-bold text-lg text-brand-600">
                                   Total: {formatCurrency(calculateCartTotal())}
                               </div>
                           </div>
                       )}
                   </div>
               )}

               <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de Paiement</label>
                   <select 
                      value={paymentMethod}
                      onChange={e => {
                          setPaymentMethod(e.target.value);
                          setGeneratedLink(null); 
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                   >
                       <option value="Espèces">Espèces (Main à main)</option>
                       <option value="Mynita">Mynita (Moov Money)</option>
                       <option value="Amanata">Amanata (Airtel Money)</option>
                   </select>
               </div>

               {editingTransaction && (
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut Transaction</label>
                       <select 
                          value={transactionStatus}
                          // @ts-ignore
                          onChange={e => setTransactionStatus(e.target.value)}
                          className={`mt-1 block w-full rounded-md shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                              transactionStatus === 'failed' ? 'border-red-300 bg-red-50 text-red-800' : 'border-gray-300 bg-white'
                          }`}
                       >
                           <option value="success">Succès / Validé</option>
                           <option value="pending">En attente</option>
                           <option value="failed">Annulé / Échoué</option>
                       </select>
                   </div>
               )}
               
               {!editingTransaction && paymentMethod !== 'Espèces' && (
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
                        <Save className="w-4 h-4 mr-2" /> {editingTransaction ? 'Mettre à jour' : 'Valider Paiement'}
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