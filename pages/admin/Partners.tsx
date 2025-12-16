import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Image as ImageIcon, ExternalLink, Check, EyeOff } from 'lucide-react';
import { db, generateUUID } from '../../services/db';
import { Partner } from '../../types';

const Partners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getPartners();
    // Sort by display order
    setPartners(data.sort((a, b) => a.displayOrder - b.displayOrder));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce partenaire ?')) {
      await db.deletePartner(id);
      loadData();
    }
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPartner({
      id: generateUUID(),
      name: '',
      description: '',
      linkUrl: '',
      isActive: true,
      displayOrder: partners.length + 1,
      imageUrl: ''
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          try {
              const dataUrl = await db.fileToDataURL(file);
              setEditingPartner(prev => ({ ...prev, imageUrl: dataUrl }));
          } catch(e) {
              alert("Erreur lecture fichier");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner.name && editingPartner.description) {
      if (imageFile && editingPartner.imageUrl) {
          // Optional: Save to Media Library if needed, but direct base64 in partner object is fine for now
      }
      // @ts-ignore
      await db.savePartner(editingPartner as Partner);
      setIsModalOpen(false);
      loadData();
    } else {
        alert("Nom et description obligatoires");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Partenaires</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter un partenaire
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo / Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lien</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ordre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center h-12 w-20 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    {partner.imageUrl ? (
                        <img className="h-full w-full object-cover" src={partner.imageUrl} alt="" />
                    ) : (
                        <ImageIcon className="text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{partner.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{partner.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                  {partner.linkUrl}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {partner.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {partner.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" /> Actif
                      </span>
                  ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeOff className="w-3 h-3 mr-1" /> Masqué
                      </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(partner)} className="text-indigo-600 hover:text-indigo-900 mr-4 p-1 rounded hover:bg-indigo-50 dark:hover:bg-gray-700">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(partner.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucun partenaire configuré.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPartner.id && partners.find(p => p.id === editingPartner.id) ? 'Modifier Partenaire' : 'Nouveau Partenaire'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Partenaire *</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: WADFOW TOOLS"
                  value={editingPartner.name || ''}
                  onChange={e => setEditingPartner({...editingPartner, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Slogan) *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Texte promotionnel..."
                  value={editingPartner.description || ''}
                  onChange={e => setEditingPartner({...editingPartner, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lien de redirection (Interne ou Externe)</label>
                <div className="relative mt-1">
                    <ExternalLink className="absolute top-2.5 left-3 w-4 h-4 text-gray-400"/>
                    <input 
                    type="text" 
                    placeholder="ex: /boutique ou https://site-partenaire.com"
                    value={editingPartner.linkUrl || ''}
                    onChange={e => setEditingPartner({...editingPartner, linkUrl: e.target.value})}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                    <input 
                        type="number" 
                        value={editingPartner.displayOrder || 1}
                        onChange={e => setEditingPartner({...editingPartner, displayOrder: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="flex items-end pb-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingPartner.isActive || false}
                            onChange={e => setEditingPartner({...editingPartner, isActive: e.target.checked})}
                            className="form-checkbox h-5 w-5 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                          />
                          <span className="text-gray-900 dark:text-white font-medium">Partenaire Actif</span>
                      </label>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image / Logo</label>
                <div className="mt-2 flex items-center space-x-4">
                    <div className="h-24 w-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border flex items-center justify-center">
                         {editingPartner.imageUrl ? (
                             <img src={editingPartner.imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
                         ) : (
                             <ImageIcon className="h-8 w-8 text-gray-300" />
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

              <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">Annuler</button>
                <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 flex items-center">
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

export default Partners;