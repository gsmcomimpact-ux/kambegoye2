import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2, Printer, Download, Edit, X, Save, FileSpreadsheet, MessageCircle, Check, CreditCard, Ban } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db, generateUUID } from '../../services/db';
import { Quote, QuoteItem, ProjectRequest } from '../../types';
import { formatCurrency } from '../../constants';

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Partial<Quote>>({});
  
  // Validation Modal State
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [quoteToValidate, setQuoteToValidate] = useState<Quote | null>(null);
  const [validationMethod, setValidationMethod] = useState('Espèces');
  
  const [items, setItems] = useState<QuoteItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
      if (location.state && location.state.projectRequest) {
          const projectReq = location.state.projectRequest as ProjectRequest;
          handleCreateFromProject(projectReq);
          window.history.replaceState({}, document.title);
      }
  }, [location]);

  const loadData = async () => {
    const data = await db.getQuotes();
    setQuotes(data);
  };

  const handleCreate = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setEditingQuote({
      id: generateUUID(),
      number: `DEV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: now.toISOString().split('T')[0],
      dueDate: nextMonth.toISOString().split('T')[0],
      status: 'draft',
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      notes: 'Ce devis est valable 30 jours. Une avance de 40% est demandée avant de commencer les travaux.'
    });
    setItems([]);
    setIsModalOpen(true);
  };

  const handleCreateFromProject = (project: ProjectRequest) => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setEditingQuote({
      id: generateUUID(),
      number: `DEV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      projectRequestId: project.reference,
      date: now.toISOString().split('T')[0],
      dueDate: nextMonth.toISOString().split('T')[0],
      status: 'draft',
      clientName: project.clientName,
      clientPhone: project.clientPhone,
      clientAddress: '',
      notes: `Réf Projet: ${project.reference}. Ce devis est valable 30 jours. Une avance de 40% est demandée avant de commencer les travaux.`
    });
    
    setItems([{
        id: Date.now().toString(),
        description: `Prestation : ${project.title}`,
        quantity: 1,
        unitPrice: 0,
        total: 0
    }]);
    
    setIsModalOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setItems(quote.items);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer ce devis DÉFINITIVEMENT ?')) {
      await db.deleteQuote(id);
      loadData();
    }
  };

  const handleCancelQuote = async (quote: Quote) => {
      if (window.confirm("Annuler ce devis ? Il passera en statut 'Rejeté'.")) {
          const updated = { ...quote, status: 'rejected' as const };
          await db.saveQuote(updated);
          loadData();
      }
  };

  const openValidationModal = (quote: Quote) => {
      setQuoteToValidate(quote);
      setValidationMethod('Espèces');
      setIsValidationModalOpen(true);
  };

  const confirmValidation = async () => {
      if (quoteToValidate) {
          const updated = { 
              ...quoteToValidate, 
              status: 'accepted' as const,
              paymentMethod: validationMethod
          };
          await db.saveQuote(updated);
          setIsValidationModalOpen(false);
          setQuoteToValidate(null);
          loadData();
      }
  };

  const handleWhatsAppShare = (quote: Quote) => {
    if (!quote.clientPhone) {
        alert("Aucun numéro de téléphone enregistré pour ce client.");
        return;
    }
    const cleanPhone = quote.clientPhone.replace(/\D/g, '');
    const message = `*DEVIS KAMBEGOYE*\n\nBonjour ${quote.clientName},\nVoici le récapitulatif de votre devis N° ${quote.number}.\n\n📅 Date: ${new Date(quote.date).toLocaleDateString()}\n💰 *Montant Total: ${formatCurrency(quote.totalAmount)}*\n\nMerci de votre confiance.\nL'équipe KAMBEGOYE.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    // @ts-ignore
    item[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = item.quantity * item.unitPrice;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuote.clientName && editingQuote.date) {
        const total = calculateTotal();
        const finalQuote = {
            ...editingQuote,
            items: items,
            totalAmount: total
        } as Quote;

        await db.saveQuote(finalQuote);
        setIsModalOpen(false);
        loadData();
    }
  };

  const generatePDF = (quote: Quote) => {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74); // Brand color
      doc.text("KAMBEGOYE", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Plateforme de mise en relation BTP", 14, 26);
      doc.text("Niamey, Niger", 14, 31);
      doc.text("Tél: +227 97 39 05 69", 14, 36);

      // Quote Info
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("DEVIS", 140, 20);
      doc.setFontSize(10);
      doc.text(`Numéro: ${quote.number}`, 140, 28);
      doc.text(`Date: ${new Date(quote.date).toLocaleDateString()}`, 140, 33);
      doc.text(`Validité: ${new Date(quote.dueDate).toLocaleDateString()}`, 140, 38);

      // Client Info
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Client:", 14, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(quote.clientName, 14, 56);
      doc.text(quote.clientPhone, 14, 61);
      if (quote.clientAddress) doc.text(quote.clientAddress, 14, 66);

      // Table
      const tableColumn = ["Description", "Quantité", "Prix Unitaire", "Total"];
      const tableRows = quote.items.map(item => [
          item.description,
          item.quantity,
          formatCurrency(item.unitPrice),
          formatCurrency(item.total)
      ]);

      autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 75,
          headStyles: { fillColor: [22, 163, 74] },
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: ${formatCurrency(quote.totalAmount)}`, 140, finalY + 10);

      // Notes
      if (quote.notes) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text("Notes:", 14, finalY + 25);
          doc.text(quote.notes, 14, finalY + 30, { maxWidth: 180 });
      }

      doc.save(`Devis_${quote.number}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Devis</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Nouveau Devis
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {quotes.map((quote) => (
              <tr key={quote.id} className={quote.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {quote.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {quote.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(quote.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(quote.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {quote.status === 'draft' && <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">Brouillon</span>}
                   {quote.status === 'sent' && <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold rounded-full">Envoyé</span>}
                   {quote.status === 'accepted' && <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded-full">Accepté (Payé)</span>}
                   {quote.status === 'rejected' && <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-semibold rounded-full">Rejeté</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-1">
                      <button onClick={() => handleWhatsAppShare(quote)} className="text-green-500 hover:text-green-600 p-1.5" title="Envoyer WhatsApp">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => generatePDF(quote)} className="text-gray-500 hover:text-gray-700 p-1.5" title="PDF">
                        <Download className="w-5 h-5" />
                      </button>
                      
                      {quote.status !== 'accepted' && quote.status !== 'rejected' && (
                          <button onClick={() => openValidationModal(quote)} className="text-green-600 hover:text-green-800 p-1.5" title="Valider Paiement">
                            <CreditCard className="w-5 h-5" />
                          </button>
                      )}

                      <button onClick={() => handleEdit(quote)} className="text-indigo-600 hover:text-indigo-900 p-1.5" title="Modifier">
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      {quote.status !== 'rejected' && (
                          <button onClick={() => handleCancelQuote(quote)} className="text-orange-500 hover:text-orange-700 p-1.5" title="Annuler (Rejeter)">
                            <Ban className="w-5 h-5" />
                          </button>
                      )}

                      <button onClick={() => handleDelete(quote.id)} className="text-red-600 hover:text-red-900 p-1.5" title="Supprimer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucun devis créé.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingQuote.id ? `Édition Devis ${editingQuote.number}` : 'Nouveau Devis'}
                  </h3>
                  {editingQuote.projectRequestId && (
                      <span className="text-xs text-blue-600 font-medium">Lié au projet: {editingQuote.projectRequestId}</span>
                  )}
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input 
                            type="date" 
                            required
                            value={editingQuote.date || ''}
                            onChange={e => setEditingQuote({...editingQuote, date: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Échéance</label>
                        <input 
                            type="date" 
                            required
                            value={editingQuote.dueDate || ''}
                            onChange={e => setEditingQuote({...editingQuote, dueDate: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                        <select 
                            value={editingQuote.status || 'draft'}
                            // @ts-ignore
                            onChange={e => setEditingQuote({...editingQuote, status: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-600 dark:text-white"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="sent">Envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Rejeté (Annulé)</option>
                        </select>
                    </div>
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Client</label>
                        <input 
                            type="text" 
                            required
                            value={editingQuote.clientName || ''}
                            onChange={e => setEditingQuote({...editingQuote, clientName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                        <input 
                            type="text" 
                            value={editingQuote.clientPhone || ''}
                            onChange={e => setEditingQuote({...editingQuote, clientPhone: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                {/* Items */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prestations / Produits</label>
                        <button type="button" onClick={addItem} className="text-sm text-brand-600 hover:text-brand-700 flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Ajouter ligne
                        </button>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden dark:border-gray-600">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Description</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 w-20">Qté</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 w-32">Prix U.</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 w-32">Total</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="p-2">
                                            <input 
                                                type="text" 
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                className="w-full border-0 focus:ring-0 p-1 bg-transparent dark:text-white"
                                                placeholder="Description..."
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
                                                className="w-full border-0 focus:ring-0 p-1 text-center bg-transparent dark:text-white"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number" 
                                                value={item.unitPrice}
                                                onChange={e => updateItem(index, 'unitPrice', parseInt(e.target.value))}
                                                className="w-full border-0 focus:ring-0 p-1 text-right bg-transparent dark:text-white"
                                            />
                                        </td>
                                        <td className="p-2 text-right font-medium dark:text-white">
                                            {formatCurrency(item.total)}
                                        </td>
                                        <td className="p-2 text-center">
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right text-gray-900 dark:text-white">TOTAL</td>
                                    <td className="px-4 py-3 text-right text-brand-600 text-lg">
                                        {formatCurrency(calculateTotal())}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Conditions</label>
                    <textarea 
                        rows={3}
                        value={editingQuote.notes || ''}
                        onChange={e => setEditingQuote({...editingQuote, notes: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">
                        Annuler
                    </button>
                    <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Enregistrer Devis
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Validation Payment Modal */}
      {isValidationModalOpen && quoteToValidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 shadow-xl text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Valider le paiement ?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Confirmer que le devis <strong>{quoteToValidate.number}</strong> d'un montant de <br/>
                    <span className="font-bold text-brand-600 text-lg">{formatCurrency(quoteToValidate.totalAmount)}</span><br/>
                    a été réglé ?
                </p>

                <div className="text-left mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Méthode de règlement</label>
                    <select
                        value={validationMethod}
                        onChange={(e) => setValidationMethod(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="Espèces">Espèces</option>
                        <option value="Mynita">Mynita (Moov)</option>
                        <option value="Amanata">Amanata (Airtel)</option>
                        <option value="Virement">Virement Bancaire</option>
                        <option value="Chèque">Chèque</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setIsValidationModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300">
                        Annuler
                    </button>
                    <button onClick={confirmValidation} className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-bold">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;