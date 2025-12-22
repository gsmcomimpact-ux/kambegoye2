
import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Image as ImageIcon, CheckCircle, Package } from 'lucide-react';
import { db, generateUUID } from '../../services/db';
import { Product, ProductCategory } from '../../types';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      await db.deleteProduct(id);
      loadData();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct({
      id: generateUUID(),
      stock: 10,
      price: 0,
      category: categories[0]?.name || '',
      imageUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          try {
              const dataUrl = await db.fileToDataURL(file);
              setEditingProduct(prev => ({...prev, imageUrl: dataUrl}));
          } catch(e) {
              alert("Erreur lors de la lecture du fichier");
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct.name && editingProduct.price && editingProduct.category) {
      setIsSubmitting(true);
      
      // Stockage dans la médiathèque si c'est une nouvelle image base64
      if (editingProduct.imageUrl?.startsWith('data:')) {
          await db.saveMedia({
              id: generateUUID(),
              type: 'image',
              name: `PROD_${editingProduct.name.replace(/\s+/g, '_')}`,
              data: editingProduct.imageUrl,
              date: new Date().toISOString()
          });
      }

      await db.saveProduct(editingProduct as Product);
      setIsModalOpen(false);
      setIsSubmitting(false);
      loadData();
    } else {
        alert("Veuillez remplir les champs obligatoires (Nom, Prix, Catégorie)");
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Package className="w-6 h-6 mr-2 text-brand-600" /> Boutique Niamey
        </h2>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-brand-700 shadow-lg font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nouveau Produit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group">
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                      {product.imageUrl ? (
                          <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={product.name}/>
                      ) : (
                          <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={40}/></div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full text-[10px] font-bold text-brand-600 shadow-sm uppercase tracking-wider">{product.category}</div>
                  </div>
                  <div className="p-4 flex-grow">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate" title={product.name}>{product.name}</h4>
                      <p className="text-lg font-black text-brand-600 mt-1">{product.price} F</p>
                      <p className="text-xs text-gray-400 mt-1">{product.stock} en stock</p>
                  </div>
                  <div className="p-3 border-t flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
              </div>
          ))}
          {products.length === 0 && <p className="col-span-full py-20 text-center text-gray-400 italic">Aucun produit dans la boutique.</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                {editingProduct.id && products.find(p => p.id === editingProduct.id) ? 'Édition Produit' : 'Création Produit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Désignation *</label>
                <input 
                  type="text" required value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Casque Wadfow Pro"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
                <textarea 
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full rounded-xl border-gray-200 p-3 text-sm dark:bg-gray-700 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Prix (F) *</label>
                  <input 
                    type="number" required value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({...editingProduct, price: parseInt(e.target.value)})}
                    className="w-full rounded-xl border-gray-200 p-3 font-black text-brand-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock *</label>
                  <input 
                    type="number" required value={editingProduct.stock || ''}
                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                    className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Catégorie *</label>
                <select 
                  required value={editingProduct.category || ''}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full rounded-xl border-gray-200 p-3 font-bold dark:bg-gray-700"
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Photo du produit</label>
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-gray-50 border rounded-2xl flex items-center justify-center overflow-hidden">
                         {editingProduct.imageUrl ? <img src={editingProduct.imageUrl} className="h-full w-full object-cover" /> : <ImageIcon className="text-gray-200" />}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs file:bg-brand-50 file:border-0 file:rounded-full file:px-4 file:py-1 file:font-bold file:text-brand-600 cursor-pointer"/>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/20 active:scale-95 transition-all">
                    {isSubmitting ? 'Chargement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
