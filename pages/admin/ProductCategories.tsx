
import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import { db } from '../../services/db';
import { ProductCategory } from '../../types';

const ProductCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<ProductCategory>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.getProductCategories();
    setCategories(data);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      await db.deleteProductCategory(id);
      loadData();
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory.name) {
      // @ts-ignore
      await db.saveProductCategory(editingCategory as ProductCategory);
      setIsModalOpen(false);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Catégories de la Boutique</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter une catégorie
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden max-w-2xl">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom de la catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {cat.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(cat)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
                <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">Aucune catégorie.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCategory.id ? 'Modifier Catégorie' : 'Nouvelle Catégorie'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input 
                  type="text" 
                  required
                  value={editingCategory.name || ''}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
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

export default ProductCategories;