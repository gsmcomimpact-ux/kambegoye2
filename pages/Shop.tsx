
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../services/db';
import { Product, ProductCategory } from '../types';

const ITEMS_PER_PAGE = 12;

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
        const [prodData, catData] = await Promise.all([
            db.getProducts(),
            db.getProductCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
        setLoading(false);
    };
    loadData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          La Boutique <span className="text-brand-600">KAMBEGOYE</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Équipements de protection, outillage professionnel et matériel de chantier disponibles à Niamey.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center border border-gray-100 dark:border-gray-700 sticky top-16 z-30">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit (ex: Casque, Perceuse...)"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
           </div>
           <select
             value={categoryFilter}
             onChange={(e) => setCategoryFilter(e.target.value)}
             className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
           >
             <option value="">Toutes les catégories</option>
             {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
           </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
         <span>{filteredProducts.length} produit(s) trouvé(s)</span>
         {filteredProducts.length > 0 && <span>Page {currentPage} sur {totalPages}</span>}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p>Chargement de la boutique...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.stock <= 5 && product.stock > 0 && (
                   <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                     Plus que {product.stock}
                   </span>
                )}
                {product.stock === 0 && (
                   <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                     Rupture
                   </span>
                )}
              </div>
              
              <div className="p-4 flex-grow flex flex-col">
                <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={product.name}>{product.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{product.price.toLocaleString()} F</span>
                  <Link 
                    to={`/boutique/${product.id}`}
                    className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-2 rounded-full hover:bg-brand-600 dark:hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 dark:text-gray-400">Aucun produit ne correspond à votre recherche.</p>
          <button 
             onClick={() => {setSearchTerm(''); setCategoryFilter('');}}
             className="mt-4 text-brand-600 font-semibold hover:underline"
          >
              Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
               // Simple logic to not show too many buttons if many pages, 
               // keeping it simple for now (all pages shown)
               <button
                 key={page}
                 onClick={() => handlePageChange(page)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentPage === page
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                 }`}
               >
                 {page}
               </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
