import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Search, Trash2, Eye, Filter, Phone, MessageCircle } from 'lucide-react';
import { db } from '../../services/db';
import { Dispute } from '../../types';

const Disputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await db.getDisputes();
    // Sort by date desc
    const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDisputes(sorted);
    setLoading(false);
  };

  const handleStatusChange = async (dispute: Dispute, newStatus: Dispute['status']) => {
      const updated = { ...dispute, status: newStatus };
      await db.updateDispute(updated);
      setSelectedDispute(updated); // Update modal if open
      loadData();
  };

  const handleDelete = async (id: string) => {
      if(window.confirm("Supprimer ce litige définitivement ?")) {
          await db.deleteDispute(id);
          if (selectedDispute?.id === id) setSelectedDispute(null);
          loadData();
      }
  };

  const contactClient = (phone: string, ticket: string) => {
      const msg = `Bonjour, concernant votre réclamation (Ticket ${ticket}) sur KAMBEGOYE...`;
      const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const filteredDisputes = disputes.filter(d => 
      filter === 'all' ? true : d.status === filter
  );

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'new': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1"/> Nouveau</span>;
          case 'investigating': return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> En cours</span>;
          case 'resolved': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Résolu</span>;
          case 'closed': return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Fermé</span>;
          default: return status;
      }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            Gestion des Litiges
        </h2>
        
        <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
             </div>
             <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveaux</option>
                <option value="investigating">En cours d'investigation</option>
                <option value="resolved">Résolus</option>
                <option value="closed">Fermés</option>
             </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {dispute.ticketNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(dispute.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{dispute.clientName}</div>
                        <div className="text-xs text-gray-500">{dispute.clientPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className="truncate block max-w-[150px]" title={dispute.reason}>{dispute.reason}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dispute.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setSelectedDispute(dispute)}
                                className="text-brand-600 hover:text-brand-900 bg-brand-50 p-2 rounded-full"
                                title="Voir détails"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(dispute.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
                {filteredDisputes.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            Aucun litige trouvé pour ce filtre.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            Litige {selectedDispute.ticketNumber}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Ouvert le {new Date(selectedDispute.date).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-500">
                        <XCircle className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Actions */}
                    <div className="flex flex-wrap gap-2 items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium mr-2 dark:text-gray-300">Changer statut :</span>
                        <button 
                            onClick={() => handleStatusChange(selectedDispute, 'investigating')}
                            className={`px-3 py-1 rounded text-sm ${selectedDispute.status === 'investigating' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 hover:bg-orange-50 text-gray-700'}`}
                        >
                            Investigation
                        </button>
                        <button 
                            onClick={() => handleStatusChange(selectedDispute, 'resolved')}
                            className={`px-3 py-1 rounded text-sm ${selectedDispute.status === 'resolved' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 hover:bg-green-50 text-gray-700'}`}
                        >
                            Résolu
                        </button>
                        <button 
                            onClick={() => handleStatusChange(selectedDispute, 'closed')}
                            className={`px-3 py-1 rounded text-sm ${selectedDispute.status === 'closed' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'}`}
                        >
                            Fermé
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Client</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedDispute.clientName}</p>
                                <div className="flex items-center mt-2 text-brand-600 cursor-pointer hover:underline" onClick={() => contactClient(selectedDispute.clientPhone, selectedDispute.ticketNumber)}>
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    {selectedDispute.clientPhone}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Ouvrier Concerné</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600">
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedDispute.workerName || "Non spécifié"}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Motif : {selectedDispute.reason}</h4>
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded border border-red-100 dark:border-red-900/30">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selectedDispute.description}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 text-right">
                    <button 
                        onClick={() => setSelectedDispute(null)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Disputes;
