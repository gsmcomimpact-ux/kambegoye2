
import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Check, XCircle, Clock, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { db } from '../../services/db';
import { Worker, Specialty, Neighborhood } from '../../types';

const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Partial<Worker>>({});
  
  // Filter state for Admin view
  const [viewFilter, setViewFilter] = useState<'active' | 'pending' | 'rejected'>('active');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [w, s, n] = await Promise.all([db.getWorkers(), db.getSpecialties(), db.getNeighborhoods()]);
    setWorkers(w);
    setSpecialties(s);
    setNeighborhoods(n);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ouvrier ?')) {
      await db.deleteWorker(id);
      loadData();
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setIsModalOpen(true);
  };
  
  const handleStatusChange = async (worker: Worker, newStatus: 'active' | 'rejected') => {
      const updatedWorker = { ...worker, accountStatus: newStatus };
      await db.saveWorker(updatedWorker);
      loadData();
  };

  const handleCreate = () => {
    setEditingWorker({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      availability: 'available',
      rating: 5,
      reviewCount: 0,
      isVerified: false,
      workImages: [],
      photoUrl: 'https://picsum.photos/200',
      latitude: 13.51,
      longitude: 2.11,
      accountStatus: 'active'
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'idCardUrl') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          try {
              const dataUrl = await db.fileToDataURL(file);
              setEditingWorker(prev => ({ ...prev, [field]: dataUrl }));
          } catch (error) {
              console.error("Erreur lecture fichier", error);
              alert("Impossible de lire le fichier.");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker.firstName && editingWorker.lastName) {
      
      const baseName = `${editingWorker.firstName}_${editingWorker.lastName}`.toUpperCase().replace(/\s+/g, '_');
      const timestamp = Date.now();

      // AUTO-SAVE TO MEDIA LIBRARY
      
      // 1. Check for new Photo Upload (Base64)
      if (editingWorker.photoUrl && editingWorker.photoUrl.startsWith('data:')) {
           console.log("Admin: Saving Photo to Library");
           await db.saveMedia({
               id: `PHOTO_${timestamp}`,
               type: 'image',
               name: `PHOTO_PROFIL_${baseName}`,
               data: editingWorker.photoUrl,
               date: new Date().toISOString()
           });
      }

      // 2. Check for new ID Card Upload (Base64)
      if (editingWorker.idCardUrl && editingWorker.idCardUrl.startsWith('data:')) {
           console.log("Admin: Saving ID to Library");
           await db.saveMedia({
               id: `ID_${timestamp}`,
               type: 'document',
               name: `PIECE_IDENTITE_${baseName}`,
               data: editingWorker.idCardUrl,
               date: new Date().toISOString()
           });
      }

      // @ts-ignore
      await db.saveWorker(editingWorker as Worker);
      setIsModalOpen(false);
      loadData();
    }
  };

  const getSpecialtyName = (id: string) => specialties.find(s => s.id === id)?.name || id;

  const filteredWorkers = workers.filter(w => {
      if (viewFilter === 'pending') return w.accountStatus === 'pending';
      if (viewFilter === 'rejected') return w.accountStatus === 'rejected';
      return w.accountStatus === 'active' || w.accountStatus === undefined;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Ouvriers</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setViewFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${viewFilter === 'active' ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
                Validés
            </button>
            <button 
                onClick={() => setViewFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${viewFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            >
                <Clock className="w-4 h-4 mr-2" /> En attente
                {workers.filter(w => w.accountStatus === 'pending').length > 0 && (
                    <span className="ml-2 bg-white text-orange-500 text-xs px-2 py-0.5 rounded-full font-bold">
                        {workers.filter(w => w.accountStatus === 'pending').length}
                    </span>
                )}
            </button>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWorkers.map((worker) => (
              <tr key={worker.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src={worker.photoUrl} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{worker.firstName} {worker.lastName}</div>
                      <div className="text-xs text-gray-500">{worker.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getSpecialtyName(worker.specialtyId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {worker.accountStatus === 'pending' && <span className="text-orange-500 font-bold flex items-center"><Clock className="w-4 h-4 mr-1"/> En attente</span>}
                   {worker.accountStatus === 'active' && <span className="text-green-500 font-bold flex items-center"><Check className="w-4 h-4 mr-1"/> Actif</span>}
                   {worker.accountStatus === 'rejected' && <span className="text-red-500 font-bold flex items-center"><XCircle className="w-4 h-4 mr-1"/> Rejeté</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {worker.accountStatus === 'pending' ? (
                      <div className="flex space-x-2">
                          <button onClick={() => handleStatusChange(worker, 'active')} className="text-white bg-green-500 px-2 py-1 rounded hover:bg-green-600" title="Valider">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(worker, 'rejected')} className="text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600" title="Rejeter">
                            <X className="w-4 h-4" />
                          </button>
                           <button onClick={() => handleEdit(worker)} className="text-indigo-600 hover:text-indigo-900 px-2">
                            <Edit className="w-5 h-5" />
                          </button>
                      </div>
                  ) : (
                      <div className="flex space-x-4">
                        <button onClick={() => handleEdit(worker)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(worker.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                  )}
                </td>
              </tr>
            ))}
             {filteredWorkers.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aucun ouvrier dans cette catégorie.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingWorker.id ? 'Modifier Ouvrier' : 'Nouvel Ouvrier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                  <input 
                    type="text" 
                    required
                    value={editingWorker.firstName || ''}
                    onChange={e => setEditingWorker({...editingWorker, firstName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                  <input 
                    type="text" 
                    required
                    value={editingWorker.lastName || ''}
                    onChange={e => setEditingWorker({...editingWorker, lastName: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Spécialité</label>
                <select 
                  value={editingWorker.specialtyId || ''}
                  onChange={e => setEditingWorker({...editingWorker, specialtyId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quartier</label>
                <select 
                  value={editingWorker.neighborhoodId || ''}
                  onChange={e => setEditingWorker({...editingWorker, neighborhoodId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input 
                    type="text" 
                    value={editingWorker.phone || ''}
                    onChange={e => setEditingWorker({...editingWorker, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                  <input 
                    type="text" 
                    value={editingWorker.whatsapp || ''}
                    onChange={e => setEditingWorker({...editingWorker, whatsapp: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
                  <input 
                    type="number"
                    step="any"
                    value={editingWorker.latitude || ''}
                    onChange={e => setEditingWorker({...editingWorker, latitude: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
                  <input 
                    type="number"
                    step="any"
                    value={editingWorker.longitude || ''}
                    onChange={e => setEditingWorker({...editingWorker, longitude: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo de Profil</label>
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                        {editingWorker.photoUrl && !editingWorker.photoUrl.startsWith('http') && !editingWorker.photoUrl.startsWith('data:') ? (
                            <img src={editingWorker.photoUrl} className="h-full w-full object-cover" alt="Preview" />
                        ) : editingWorker.photoUrl ? (
                            <img src={editingWorker.photoUrl} className="h-full w-full object-cover" alt="Preview" />
                        ) : (
                            <ImageIcon className="h-full w-full p-3 text-gray-400" />
                        )}
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 flex items-center shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photoUrl')} />
                    </label>
                </div>
              </div>

              {/* ID Card Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Carte d'Identité (Admin)</label>
                <div className="flex flex-col space-y-2">
                    {editingWorker.idCardUrl && (
                        <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                            <FileText className="w-4 h-4 mr-2" />
                            <span className="truncate flex-1">Document présent</span>
                            <a 
                                href={editingWorker.idCardUrl} 
                                download={`ID_${editingWorker.firstName}_${editingWorker.lastName}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 font-bold hover:underline"
                            >
                                Voir/Télécharger
                            </a>
                        </div>
                    )}
                    <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 flex items-center justify-center shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <Upload className="w-4 h-4 mr-2" />
                        {editingWorker.idCardUrl ? "Remplacer le document" : "Téléverser une pièce d'identité"}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'idCardUrl')} />
                    </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut du Compte</label>
                <select 
                  value={editingWorker.accountStatus || 'pending'}
                  onChange={e => setEditingWorker({...editingWorker, accountStatus: e.target.value as any})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pending">En attente</option>
                  <option value="active">Actif (Validé)</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>

              <div className="flex items-center mt-2">
                <input
                  id="verified"
                  type="checkbox"
                  checked={editingWorker.isVerified || false}
                  onChange={e => setEditingWorker({...editingWorker, isVerified: e.target.checked})}
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Badge "Vérifié" (Visible publiquement)
                </label>
              </div>
              
              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Annuler</button>
                <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
