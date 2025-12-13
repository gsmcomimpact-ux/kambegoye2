import React, { useEffect, useState } from 'react';
import { Trash2, Search, BadgeCheck, Eye, Plus, Edit, X, Image as ImageIcon, Phone, MapPin, Check, Ban } from 'lucide-react';
import { db, generateUUID } from '../../services/db';
import { Worker, Specialty, Neighborhood } from '../../types';

const Workers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Partial<Worker>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [w, s, n] = await Promise.all([
        db.getWorkers(), 
        db.getSpecialties(),
        db.getNeighborhoods()
    ]);
    setWorkers(w);
    setSpecialties(s);
    setNeighborhoods(n);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cet ouvrier définitivement ?')) {
      await db.deleteWorker(id);
      loadData();
    }
  };

  const toggleVerification = async (worker: Worker) => {
      const updated = { ...worker, isVerified: !worker.isVerified };
      await db.saveWorker(updated);
      loadData();
  };
  
  const updateStatus = async (worker: Worker, newStatus: 'active' | 'pending' | 'rejected' | 'suspended') => {
      if (window.confirm(`Voulez-vous vraiment changer le statut de "${worker.firstName}" en "${newStatus}" ?`)) {
          const updated = { ...worker, accountStatus: newStatus } as Worker;
          await db.saveWorker(updated);
          loadData();
      }
  };

  const handleCreate = () => {
      setEditingWorker({
          id: generateUUID(),
          firstName: '',
          lastName: '',
          phone: '',
          whatsapp: '',
          specialtyId: '',
          neighborhoodId: '',
          cityId: 'NE_NIA',
          countryId: 'NE',
          availability: 'available',
          accountStatus: 'active',
          isVerified: false,
          rating: 5,
          reviewCount: 0,
          photoUrl: 'https://via.placeholder.com/150',
          workImages: []
      });
      setPhotoFile(null);
      setIsModalOpen(true);
  };

  const handleEdit = (worker: Worker) => {
      setEditingWorker(worker);
      setPhotoFile(null);
      setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setPhotoFile(file);
          try {
              const dataUrl = await db.fileToDataURL(file);
              setEditingWorker(prev => ({ ...prev, photoUrl: dataUrl }));
          } catch(e) {
              alert("Erreur lecture fichier");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker.firstName && editingWorker.lastName && editingWorker.phone && editingWorker.specialtyId) {
        // @ts-ignore
        await db.saveWorker(editingWorker as Worker);
        setIsModalOpen(false);
        loadData();
    } else {
        alert("Veuillez remplir les champs obligatoires (Nom, Prénom, Tél, Spécialité)");
    }
  };

  const getSpecialtyName = (id: string) => specialties.find(s => s.id === id)?.name || id;
  const getNeighborhoodName = (id?: string) => neighborhoods.find(n => n.id === id)?.name || '-';

  const filteredWorkers = workers.filter(w => 
    w.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'active': return <span className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs font-semibold rounded-full border">Actif</span>;
          case 'pending': return <span className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 py-1 text-xs font-semibold rounded-full border">En attente</span>;
          case 'suspended': return <span className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 text-xs font-semibold rounded-full border">Suspendu</span>;
          case 'rejected': return <span className="bg-red-100 text-red-800 border-red-200 px-2 py-1 text-xs font-semibold rounded-full border">Rejeté</span>;
          default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">{status}</span>;
      }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Ouvriers</h2>
        <div className="flex gap-2">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <button 
                onClick={handleCreate}
                className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" /> Ajouter
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ouvrier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quartier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWorkers.map((worker) => (
              <tr key={worker.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={worker.photoUrl} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          {worker.firstName} {worker.lastName}
                          {worker.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 ml-1" />}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getSpecialtyName(worker.specialtyId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   <div className="flex flex-col">
                       <span>{worker.phone}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getNeighborhoodName(worker.neighborhoodId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(worker.accountStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => toggleVerification(worker)} 
                        className={`p-1.5 rounded-full transition-colors ${worker.isVerified ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-blue-500'}`}
                      >
                        <BadgeCheck className="w-5 h-5" />
                      </button>

                      {worker.accountStatus !== 'active' && (
                        <button onClick={() => updateStatus(worker, 'active')} className="p-1.5 rounded-full text-green-600 hover:bg-green-50">
                            <Check className="w-5 h-5" />
                        </button>
                      )}

                      {worker.accountStatus === 'pending' && (
                          <button onClick={() => updateStatus(worker, 'rejected')} className="p-1.5 rounded-full text-red-600 hover:bg-red-50">
                            <X className="w-5 h-5" />
                        </button>
                      )}

                      {worker.accountStatus === 'active' && (
                          <button onClick={() => updateStatus(worker, 'suspended')} className="p-1.5 rounded-full text-orange-500 hover:bg-orange-50">
                            <Ban className="w-5 h-5" />
                        </button>
                      )}

                      <div className="h-4 w-px bg-gray-300 mx-1"></div>

                      <button onClick={() => handleEdit(worker)} className="p-1.5 rounded text-gray-500 hover:text-indigo-600">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(worker.id)} className="p-1.5 rounded text-gray-500 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingWorker.id && workers.find(w => w.id === editingWorker.id) ? 'Modifier Ouvrier' : 'Nouvel Ouvrier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom *</label>
                        <input 
                            type="text" 
                            required
                            value={editingWorker.firstName || ''}
                            onChange={e => setEditingWorker({...editingWorker, firstName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom *</label>
                        <input 
                            type="text" 
                            required
                            value={editingWorker.lastName || ''}
                            onChange={e => setEditingWorker({...editingWorker, lastName: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo de profil</label>
                  <div className="mt-2 flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border">
                           {editingWorker.photoUrl ? (
                               <img src={editingWorker.photoUrl} alt="Aperçu" className="h-full w-full object-cover" />
                           ) : (
                               <ImageIcon className="h-full w-full p-3 text-gray-300" />
                           )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Spécialité *</label>
                        <select 
                            required
                            value={editingWorker.specialtyId || ''}
                            onChange={e => setEditingWorker({...editingWorker, specialtyId: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Choisir...</option>
                            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut Compte</label>
                        <select 
                            value={editingWorker.accountStatus || 'active'}
                            // @ts-ignore
                            onChange={e => setEditingWorker({...editingWorker, accountStatus: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="active">Actif (Visible)</option>
                            <option value="pending">En attente</option>
                            <option value="suspended">Suspendu</option>
                            <option value="rejected">Rejeté</option>
                        </select>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone *</label>
                        <div className="relative">
                            <Phone className="absolute top-2.5 left-3 w-4 h-4 text-gray-400"/>
                            <input 
                                type="text" 
                                required
                                value={editingWorker.phone || ''}
                                onChange={e => setEditingWorker({...editingWorker, phone: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 pl-10 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                        <input 
                            type="text" 
                            value={editingWorker.whatsapp || ''}
                            onChange={e => setEditingWorker({...editingWorker, whatsapp: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quartier (Niamey)</label>
                        <div className="relative">
                            <MapPin className="absolute top-2.5 left-3 w-4 h-4 text-gray-400"/>
                            <select 
                                value={editingWorker.neighborhoodId || ''}
                                onChange={e => setEditingWorker({...editingWorker, neighborhoodId: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 pl-10 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Choisir un quartier...</option>
                                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">
                        Annuler
                    </button>
                    <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700">
                        Enregistrer
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;