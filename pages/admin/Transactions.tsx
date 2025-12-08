import React, { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../services/db';
import { Transaction } from '../../types';

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState<string>('all');

  useEffect(() => {
    db.getStats().then(stats => {
      setTransactions(stats.allTransactions); 
      setLoading(false);
    });
  }, []);

  const filteredTransactions = transactions.filter(t => 
    filterMethod === 'all' ? true : t.method === filterMethod
  );

  const handleExport = () => {
    const doc = new jsPDF();
    const titleSuffix = filterMethod === 'all' ? 'Global' : filterMethod;
    doc.text(`Historique des Transactions (${titleSuffix}) - KAMBEGOYE`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Total: ${filteredTransactions.length} transactions`, 14, 34);

    const tableColumn = ["ID", "Date", "Heure", "Montant", "Méthode", "Statut"];
    const tableRows = filteredTransactions.map(tx => [
      tx.id.substring(0, 8),
      new Date(tx.date).toLocaleDateString(),
      new Date(tx.date).toLocaleTimeString(),
      `${tx.amount} FCFA`,
      tx.method,
      tx.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save(`transactions_${filterMethod}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historique des Transactions</h2>
        
        <div className="flex space-x-2">
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
             </select>
          </div>
          
          <button 
            onClick={handleExport}
            className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Exporter PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Méthode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tx.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  {tx.amount} FCFA
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {tx.method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {tx.status === 'success' ? 'Succès' : tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aucune transaction trouvée pour ce critère.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;