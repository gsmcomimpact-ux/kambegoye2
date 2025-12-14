import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Briefcase, HelpCircle } from 'lucide-react';
import { db, generateUUID } from '../../services/db';
import { Specialty } from '../../types';

const Specialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Partial<Specialty>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getSpecialties();
    setSpecialties(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce métier ? Cela peut affecter les ouvriers liés.')) {
      await db.deleteSpecialty(id);
      loadData();
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSpecialty({
      id: generateUUID(),
      name: '',
      icon: 'briefcase' // default icon
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSpecialty.name) {
      // @ts-ignore
      await db.saveSpecialty(editingSpecialty as Specialty);
      setIsModalOpen(false);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Métiers & Spécialités</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter une catégorie
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden max-w-3xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Icone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom du métier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Identifiant</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {specialties.map((spec) => (
              <tr key={spec.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   {/* Just displaying the icon name or a generic icon if we don't have dynamic mapping */}
                   <div className="flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-gray-400" />
                       <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{spec.icon}</span>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {spec.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {spec.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(spec)} className="text-indigo-600 hover:text-indigo-900 mr-4 p-1 rounded hover:bg-indigo-50 dark:hover:bg-gray-700">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(spec.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {specialties.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Aucun métier configuré.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSpecialty.id ? 'Modifier Métier' : 'Nouveau Métier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du métier</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Plombier, Électricien"
                  value={editingSpecialty.name || ''}
                  onChange={e => setEditingSpecialty({...editingSpecialty, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'icône (Lucide React)</label>
                    <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center"><HelpCircle className="w-3 h-3 mr-1"/>Liste</a>
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="ex: zap, hammer, wrench"
                  value={editingSpecialty.icon || ''}
                  onChange={e => setEditingSpecialty({...editingSpecialty, icon: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Utilisé pour l'affichage visuel.</p>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">Annuler</button>
                <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specialties;