import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2, Printer, Download, Edit, X, Save, FileSpreadsheet, MessageCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db, generateUUID } from '../../services/db';
import { Quote, QuoteItem, ProjectRequest } from '../../types';

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Partial<Quote>>({});
  
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
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
    if (window.confirm('Supprimer ce devis ?')) {
      await db.deleteQuote(id);
      loadData();
    }
  };

  const handleWhatsAppShare = (quote: Quote) => {
    if (!quote.clientPhone) {
        alert("Aucun numéro de téléphone enregistré pour ce client.");
        return;
    }
    const cleanPhone = quote.clientPhone.replace(/\D/g, '');
    const message = `*DEVIS KAMBEGOYE*\n\nBonjour ${quote.clientName},\nVoici le récapitulatif de votre devis N° ${quote.number}.\n\n📅 Date: ${new Date(quote.date).toLocaleDateString()}\n💰 *Montant Total: ${formatPrice(quote.totalAmount)}*\n\nMerci de votre confiance.\nL'équipe KAMBEGOYE.`;
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
    if (editingQuote.clientName && items.length > 0) {
      const fullQuote: Quote = {
        ...(editingQuote as Quote),
        items: items,
        totalAmount: calculateTotal()
      };
      await db.saveQuote(fullQuote);
      setIsModalOpen(false);
      loadData();
    } else {
        alert("Veuillez remplir le nom du client et ajouter au moins un article.");
    }
  };

  const generatePDF = (quote: Quote, action: 'download' | 'print') => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text("KAMBEGOYE", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Plateforme de mise en relation & Services", 14, 26);
    doc.text("Quartier Poudrière, Niamey, Niger", 14, 30);
    doc.text("Tél: +227 97 39 05 69 | Email: contact@kambegoye.com", 14, 34);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("DEVIS", 140, 20);
    doc.setFontSize(10);
    doc.text(`N°: ${quote.number}`, 140, 26);
    if(quote.projectRequestId) {
        doc.text(`Réf Projet: ${quote.projectRequestId}`, 140, 30);
    }
    doc.text(`Date: ${new Date(quote.date).toLocaleDateString()}`, 140, 34);
    doc.text(`Validité: ${new Date(quote.dueDate).toLocaleDateString()}`, 140, 38);

    doc.setDrawColor(200);
    doc.line(14, 46, 196, 46);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Client :", 14, 54);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(quote.clientName, 14, 60);
    if (quote.clientPhone) doc.text(quote.clientPhone, 14, 65);
    if (quote.clientAddress) doc.text(quote.clientAddress, 14, 70);

    const tableColumn = ["Description", "Qté", "Prix Unit.", "Total"];
    const tableRows = quote.items.map(item => [
      item.description,
      item.quantity,
      formatPrice(item.unitPrice),
      formatPrice(item.total)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
      }
    });

    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY || 150;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${formatPrice(quote.totalAmount)}`, 140, finalY + 15);

    if (quote.notes) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("Notes:", 14, finalY + 30);
        doc.setFont("helvetica", "normal");
        doc.text(quote.notes, 14, finalY + 35);
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Merci de votre confiance.", 105, 280, { align: 'center' });

    if (action === 'download') {
        doc.save(`Devis_${quote.number}.pdf`);
    } else {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <FileSpreadsheet className="mr-2" /> Générateur de Devis
        </h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Créer un devis
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Devis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {quote.number}
                  {quote.projectRequestId && <span className="block text-xs text-gray-500">Réf: {quote.projectRequestId}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {quote.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(quote.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  {formatPrice(quote.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                       quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                       quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                       quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                       'bg-red-100 text-red-800'
                   }`}>
                       {quote.status.toUpperCase()}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end space-x-2">
                  <button onClick={() => handleWhatsAppShare(quote)} className="text-green-500 hover:text-green-700" title="Envoyer par WhatsApp">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => generatePDF(quote, 'print')} className="text-gray-500 hover:text-gray-800" title="Imprimer">
                    <Printer className="w-5 h-5" />
                  </button>
                  <button onClick={() => generatePDF(quote, 'download')} className="text-gray-500 hover:text-gray-800" title="Télécharger PDF">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleEdit(quote)} className="text-indigo-600 hover:text-indigo-900" title="Modifier">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(quote.id)} className="text-red-600 hover:text-red-900" title="Supprimer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 shadow-2xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingQuote.id ? `Édition: ${editingQuote.number}` : 'Nouveau Devis'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Client</label>
                        <input 
                            type="text" 
                            required
                            value={editingQuote.clientName}
                            onChange={e => setEditingQuote({...editingQuote, clientName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de Devis</label>
                         <input 
                            type="text" 
                            value={editingQuote.number}
                            onChange={e => setEditingQuote({...editingQuote, number: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border font-mono bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                        <input 
                            type="text" 
                            value={editingQuote.clientPhone}
                            onChange={e => setEditingQuote({...editingQuote, clientPhone: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
                            placeholder="ex: 90000000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                        <select 
                            value={editingQuote.status}
                            onChange={e => setEditingQuote({...editingQuote, status: e.target.value as any})}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="sent">Envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Refusé</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                        <input 
                            type="text" 
                            value={editingQuote.clientAddress}
                            onChange={e => setEditingQuote({...editingQuote, clientAddress: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Articles & Services</h4>
                        <button type="button" onClick={addItem} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                            + Ajouter une ligne
                        </button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 dark:bg-gray-600">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-24">Qté</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">Prix Unit.</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                                    <th className="px-4 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="text" 
                                                value={item.description}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                placeholder="Désignation"
                                                className="w-full border-0 focus:ring-0 bg-transparent p-1"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="w-full text-right border-0 focus:ring-0 bg-transparent p-1"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number" 
                                                value={item.unitPrice}
                                                onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full text-right border-0 focus:ring-0 bg-transparent p-1"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                            {formatPrice(item.total)}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-600">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">TOTAL</td>
                                    <td className="px-4 py-3 text-right font-bold text-xl text-brand-600">
                                        {formatPrice(calculateTotal())}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Pied de page)</label>
                     <textarea 
                        rows={2}
                        value={editingQuote.notes}
                        onChange={e => setEditingQuote({...editingQuote, notes: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
                     />
                </div>
            </form>

            <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
                     Annuler
                 </button>
                 <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 flex items-center">
                     <Save className="w-4 h-4 mr-2" /> Enregistrer le Devis
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;