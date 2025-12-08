
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Wallet, Activity, Calendar, Download, TrendingUp, Eye } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../services/db';
import { Stats, Transaction } from '../../types';

const COLORS = ['#ea580c', '#22c55e']; // Brand Colors

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    db.getStats().then(setStats);
  }, []);

  const generatePDF = (type: 'daily' | 'weekly' | 'monthly' | 'all') => {
    if (!stats) return;

    const doc = new jsPDF();
    
    let title = "Rapport Financier - KAMBEGOYE";
    let transactions: Transaction[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = today - (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    if (type === 'daily') {
      title += " (Journalier)";
      transactions = stats.allTransactions.filter(t => new Date(t.date).getTime() >= today);
    } else if (type === 'weekly') {
      title += " (Hebdomadaire)";
      transactions = stats.allTransactions.filter(t => new Date(t.date).getTime() >= oneWeekAgo);
    } else if (type === 'monthly') {
      title += " (Mensuel)";
      transactions = stats.allTransactions.filter(t => new Date(t.date).getTime() >= startOfMonth);
    } else {
      title += " (Global)";
      transactions = stats.allTransactions;
    }

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Transactions: ${transactions.length}`, 14, 36);
    doc.text(`Revenu Total: ${transactions.reduce((acc, t) => acc + t.amount, 0)} FCFA`, 14, 42);

    const tableColumn = ["ID", "Date", "Montant", "Méthode", "Statut"];
    const tableRows = transactions.map(tx => [
      tx.id.substring(0, 8),
      new Date(tx.date).toLocaleDateString() + ' ' + new Date(tx.date).toLocaleTimeString(),
      `${tx.amount} FCFA`,
      tx.method,
      tx.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save(`rapport_${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const generatePaymentMethodPDF = (method: string) => {
    if (!stats) return;

    const doc = new jsPDF();
    const title = `Rapport ${method} - KAMBEGOYE`;
    const transactions = stats.allTransactions.filter(t => t.method === method);

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Transactions: ${transactions.length}`, 14, 36);
    doc.text(`Revenu Total: ${transactions.reduce((acc, t) => acc + t.amount, 0)} FCFA`, 14, 42);

    const tableColumn = ["ID", "Date", "Montant", "Statut"];
    const tableRows = transactions.map(tx => [
      tx.id.substring(0, 8),
      new Date(tx.date).toLocaleDateString() + ' ' + new Date(tx.date).toLocaleTimeString(),
      `${tx.amount} FCFA`,
      tx.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save(`rapport_${method}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (!stats) return <div className="p-6 text-center">Chargement des données...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de Bord</h2>
        <div className="flex space-x-2">
            <button onClick={() => generatePDF('all')} className="flex items-center text-sm bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" /> Rapport Complet
            </button>
        </div>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Ouvriers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-green-500">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Ventes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-brand-500">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Revenu Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue} F</p>
            </div>
            <Wallet className="h-8 w-8 text-brand-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
           <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ce mois</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.revenueMonthly} F</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Analytics Section: Top Workers */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
            <Eye className="w-5 h-5 mr-2 text-brand-600" /> Profils les plus consultés
        </h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topWorkers} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis 
                        dataKey="firstName" 
                        type="category" 
                        tickFormatter={(val, index) => `${val} ${stats.topWorkers[index]?.lastName?.charAt(0)}.`} 
                        width={100}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="views" fill="#ea580c" radius={[0, 4, 4, 0]} name="Vues" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2 font-medium text-gray-500">Ouvrier</th>
                        <th className="text-left py-2 font-medium text-gray-500">Spécialité</th>
                        <th className="text-right py-2 font-medium text-gray-500">Vues Totales</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.topWorkers.map(w => (
                        <tr key={w.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <td className="py-2 text-gray-900 dark:text-white font-medium">{w.firstName} {w.lastName}</td>
                            <td className="py-2 text-gray-500">{w.specialtyId}</td>
                            <td className="py-2 text-right font-bold text-brand-600">{w.views}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Detailed Revenue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> Détails Revenus
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Aujourd'hui</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.revenueDaily} FCFA</p>
                </div>
                <button onClick={() => generatePDF('daily')} className="p-2 text-gray-400 hover:text-brand-600"><Download size={20}/></button>
             </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Cette Semaine (7 jours)</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.revenueWeekly} FCFA</p>
                </div>
                <button onClick={() => generatePDF('weekly')} className="p-2 text-gray-400 hover:text-brand-600"><Download size={20}/></button>
             </div>
             <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Ce Mois</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.revenueMonthly} FCFA</p>
                </div>
                <button onClick={() => generatePDF('monthly')} className="p-2 text-gray-400 hover:text-brand-600"><Download size={20}/></button>
             </div>
          </div>
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex flex-col items-center">
           <div className="w-full flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Méthodes de Paiement</h3>
           </div>
           
           <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {stats.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
           </div>
           
           <div className="w-full grid grid-cols-2 gap-4 mt-4">
             {stats.paymentMethods.map((method) => (
               <button 
                 key={method.name}
                 onClick={() => generatePaymentMethodPDF(method.name)}
                 className="flex items-center justify-center py-2 px-3 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
               >
                 <Download className="w-3 h-3 mr-2" />
                 Export {method.name}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Dernières Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">ID</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Date</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Montant</th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-300">Méthode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-3 text-gray-900 dark:text-white">{tx.id.substring(0, 8)}...</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-green-600 font-bold">{tx.amount} FCFA</td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{tx.method}</td>
                </tr>
              ))}
              {stats.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Aucune transaction récente</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
