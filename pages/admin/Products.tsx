
import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { db } from '../../services/db';
import { Product, ProductCategory } from '../../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prodData, catData] = await Promise.all([
      db.getProducts(),
      db.getProductCategories()
    ]);
    setProducts(prodData);
    setCategories(catData);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      await db.deleteProduct(id);
      loadData();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      stock: 10,
      price: 0,
      imageUrl: 'https://via.placeholder.com/150'
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
              setEditingProduct({...editingProduct, imageUrl: dataUrl});
          } catch(e) {
              alert("Erreur lecture fichier");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct.name && editingProduct.price && editingProduct.category) {
      
      // Save Image to Media Library if new file selected
      if (imageFile && editingProduct.imageUrl) {
          await db.saveMedia({
              id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
              type: 'image',
              name: `PROD_${editingProduct.name}`,
              data: editingProduct.imageUrl,
              date: new Date().toISOString()
          });
      }

      // @ts-ignore
      await db.saveProduct(editingProduct as Product);
      setIsModalOpen(false);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion de la Boutique</h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700"
        >
          <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt="" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  {product.price} F
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">{product.stock} en stock</span>
                  ) : (
                      <span className="text-red-600 font-bold">Rupture</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun produit en stock.</td>
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
                {editingProduct.id ? 'Modifier Produit' : 'Nouveau Produit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du produit</label>
                <input 
                  type="text" 
                  required
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                  required
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (FCFA)</label>
                  <input 
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
                  <input 
                    type="number"
                    required
                    value={editingProduct.stock || ''}
                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                <select 
                  required
                  value={editingProduct.category || ''}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner une catégorie...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image du Produit</label>
                <div className="mt-2 flex items-center space-x-4">
                    <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                         {editingProduct.imageUrl ? (
                             <img src={editingProduct.imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
                         ) : (
                             <ImageIcon className="h-full w-full p-4 text-gray-300" />
                         )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                </div>
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

export default Products;
