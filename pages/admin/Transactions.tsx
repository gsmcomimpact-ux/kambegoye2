
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState<number>(200);
  const [manualDescription, setManualDescription] = useState('');
  const [transactionType, setTransactionType] = useState<'simple' | 'sale'>('simple');
  const [paymentMethod, setPaymentMethod] = useState<string>('Espèces');
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'pending' | 'failed'>('success');
  const [transactionCategory, setTransactionCategory] = useState<TransactionCategory>('manual');
  
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [stats, prods] = await Promise.all([db.getStats(), db.getProducts()]);
    if (stats && stats.allTransactions) {
        setTransactions(stats.allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); 
    }
    setProducts(prods || []);
    setLoading(false);
  };

  const resetModal = () => {
      setEditingTransaction(null); setManualPhone(''); setManualAmount(200); setManualDescription(''); setCart([]); setProductSearchTerm(''); setTransactionType(isInvoicePage ? 'sale' : 'simple'); setPaymentMethod('Espèces'); setTransactionStatus('success'); setTransactionCategory('manual'); setGeneratedLink(null); setCopied(false); setIsModalOpen(false);
  };

  const handleEdit = (tx: Transaction) => {
      setEditingTransaction(tx); setManualPhone(tx.clientPhone || ''); setManualAmount(tx.amount); setManualDescription(tx.details || ''); setPaymentMethod(tx.method); setTransactionStatus(tx.status); setTransactionCategory(tx.category || 'manual'); setTransactionType('simple'); setIsModalOpen(true);
  };

  const generateInvoice = (tx: Transaction, mode: 'download' | 'print' = 'download') => {
      const doc = new jsPDF();
      if (tx.status === 'failed') { doc.setTextColor(255, 200, 200); doc.setFontSize(60); doc.text("ANNULÉE", 40, 150, { angle: 45 }); }
      doc.setFontSize(22); doc.setTextColor(22, 163, 74); doc.text("KAMBEGOYE", 14, 20);
      doc.setFontSize(10); doc.setTextColor(100); doc.text("Niamey, Niger - Tél: +227 97 39 05 69", 14, 28);
      doc.setFontSize(16); doc.setTextColor(0); doc.text("FACTURE", 140, 20);
      doc.setFontSize(10); doc.text(`N°: ${tx.id.substring(0, 8).toUpperCase()}`, 140, 28);
      doc.text(`Date: ${new Date(tx.date).toLocaleDateString()}`, 140, 33);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Client:", 14, 50);
      doc.setFont("helvetica", "normal"); doc.text(tx.clientPhone || "Client Comptoir", 14, 56);
      const rows = tx.details ? [[tx.details, formatCurrency(tx.amount), "1", formatCurrency(tx.amount)]] : [["Prestation Divers", formatCurrency(tx.amount), "1", formatCurrency(tx.amount)]];
      autoTable(doc, { head: [["Désignation", "Prix U.", "Qté", "Total"]], body: rows, startY: 65, headStyles: { fillColor: [22, 163, 74] }, theme: 'grid' });
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(`TOTAL PAYÉ: ${formatCurrency(tx.amount)}`, 140, finalY + 15);
      if (mode === 'print') { const blob = doc.output('blob'); window.open(URL.createObjectURL(blob), '_blank'); } else { doc.save(`Facture_${tx.id.substring(0, 8)}.pdf`); }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const isSale = transactionType === 'sale';
          const finalAmount = isSale ? cart.reduce((s, i) => s + (i.product.price * i.quantity), 0) : (isNaN(manualAmount) ? 0 : manualAmount);
          const details = isSale ? cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ') : (manualDescription || 'Encaissement');
          const cat: TransactionCategory = isSale ? 'store' : transactionCategory;
          if (finalAmount <= 0) { alert("Le montant doit être valide."); return; }
          const phoneToSave = manualPhone || 'Client Niamey';
          if (editingTransaction) {
              await db.updateTransaction({ ...editingTransaction, amount: finalAmount, clientPhone: phoneToSave, details, method: paymentMethod, status: transactionStatus, category: cat });
          } else {
              if (isSale) { for (const item of cart) await db.updateProductStock(item.product.id, item.quantity); }
              const newTx = await db.addManualTransaction(finalAmount, phoneToSave, paymentMethod, details, cat);
              if (isSale && newTx) generateInvoice(newTx, 'print');
          }
          resetModal(); await loadData(); 
      } catch (err) { alert("Erreur d'enregistrement."); }
  };

  const filteredTransactions = transactions.filter(t => filterMethod === 'all' ? true : t.method === filterMethod);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Finances</h2>
        <div className="flex gap-2">
           <button onClick={() => { setTransactionType(isInvoicePage ? 'sale' : 'simple'); setIsModalOpen(true); }} className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-brand-700 font-bold shadow-lg transition-all"><Plus className="w-4 h-4 mr-2" /> Nouveau</button>
           <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="rounded-xl border-gray-300 dark:bg-gray-700 dark:text-white text-sm font-bold"><option value="all">Tout</option><option value="Mynita">Mynita</option><option value="Amanata">Amanata</option><option value="Espèces">Espèces</option></select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Méthode</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{tx.clientPhone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500 uppercase tracking-wider">{tx.method}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => generateInvoice(tx, 'print')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Printer size={16}/></button>
                        <button onClick={() => handleEdit(tx)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><Edit size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{editingTransaction ? 'Édition' : 'Nouveau Paiement'}</h3>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleManualAdd} className="space-y-6">
               <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tél Client</label>
                   <input type="text" value={manualPhone} onChange={e => setManualPhone(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Ex: 90 00 00 00"/>
               </div>
               <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                   <select value={transactionCategory} onChange={e => setTransactionCategory(e.target.value as TransactionCategory)} className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600"><option value="manual">Prestation</option><option value="store">Boutique</option><option value="access">Accès Site</option><option value="quote">Devis</option></select>
               </div>
               <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Détails</label>
                   <input type="text" value={manualDescription} onChange={e => setManualDescription(e.target.value)} className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Objet de l'encaissement"/>
               </div>
               <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Montant (FCFA)</label>
                   <input type="number" value={manualAmount} onChange={e => setManualAmount(parseInt(e.target.value) || 0)} className="w-full rounded-xl border-gray-200 p-3 font-black text-lg text-brand-600 dark:bg-gray-700 dark:border-gray-600"/>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={resetModal} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Annuler</button>
                    <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-brand-700 shadow-lg shadow-brand-500/20 active:scale-95 transition-all">Valider</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
