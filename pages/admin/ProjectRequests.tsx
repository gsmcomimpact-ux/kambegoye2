

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Phone, CheckCircle, Clock, XCircle, MessageSquare, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { db } from '../../services/db';
import { ProjectRequest } from '../../types';

const ProjectRequests = () => {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getProjectRequests();
    setRequests(data);
  };

  const handleStatusChange = async (id: string, status: any) => {
      await db.updateProjectRequestStatus(id, status);
      loadData();
  };

  const contactClient = (req: ProjectRequest) => {
      const msg = `Bonjour ${req.clientName}, suite à votre demande de projet ${req.reference ? `(${req.reference})` : ''} "${req.title}" sur KAMBEGOYE, nous souhaitons faire un point.`;
      const url = `https://wa.me/${req.clientPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      handleStatusChange(req.id, 'contacted');
  };

  const generateQuote = (req: ProjectRequest) => {
    navigate('/admin/devis', { state: { projectRequest: req } });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Demandes de Projets / Devis</h2>

      <div className="grid gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                       <div className="flex items-center gap-2 mb-2">
                           {req.reference && (
                               <span className="inline-block px-2 py-1 text-xs font-bold text-gray-600 bg-gray-200 rounded">
                                   {req.reference}
                               </span>
                           )}
                           <span className="inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider text-accent-600 bg-accent-50 rounded">
                               {req.category}
                           </span>
                       </div>
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">{req.title}</h3>
                       <p className="text-sm text-gray-500 dark:text-gray-400">
                           Reçu le {new Date(req.date).toLocaleDateString()} à {new Date(req.date).toLocaleTimeString()}
                       </p>
                   </div>
                   <div className="flex flex-col items-end">
                       {req.status === 'new' && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2">Nouveau</span>}
                       {req.status === 'contacted' && <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">Contacté</span>}
                       {req.status === 'completed' && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full mb-2">Terminé</span>}
                       {req.status === 'cancelled' && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mb-2">Annulé</span>}
                   </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{req.description}</p>
                    
                    {/* Images Section */}
                    {req.images && req.images.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Pièces jointes ({req.images.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {req.images.map((img, idx) => (
                                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="block relative h-20 w-20 rounded border border-gray-300 overflow-hidden hover:opacity-80 transition-opacity">
                                        <img src={img} alt={`Pièce jointe ${idx}`} className="w-full h-full object-cover" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm border-t border-gray-200 dark:border-gray-600 pt-4">
                        {req.budget && (
                            <div className="font-semibold text-gray-900 dark:text-white">
                                Budget: <span className="font-normal">{req.budget} FCFA</span>
                            </div>
                        )}
                        {req.deadline && (
                            <div className="font-semibold text-gray-900 dark:text-white">
                                Délai: <span className="font-normal">{req.deadline}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
                            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">{req.clientName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{req.clientPhone}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <button 
                            onClick={() => contactClient(req)}
                            className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            WhatsApp
                        </button>
                        
                        <button 
                            onClick={() => generateQuote(req)}
                            className="flex items-center px-3 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors text-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Générer Devis
                        </button>
                        
                        {req.status !== 'completed' && (
                            <button 
                                onClick={() => handleStatusChange(req.id, 'completed')}
                                className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 transition-colors text-sm"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Terminer
                            </button>
                        )}
                        
                        {req.status !== 'cancelled' && req.status !== 'completed' && (
                            <button 
                                onClick={() => handleStatusChange(req.id, 'cancelled')}
                                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
             </div>
          </div>
        ))}
        {requests.length === 0 && (
            <p className="text-gray-500 text-center py-8">Aucune demande de projet pour le moment.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectRequests;