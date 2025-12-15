import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, CheckCircle, Shield, MapPin, ArrowRight, Wrench } from 'lucide-react';
import { db } from '../services/db';
import { Specialty, Neighborhood } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [s, n] = await Promise.all([
        db.getSpecialties(),
        db.getNeighborhoods()
      ]);
      setSpecialties(s);
      setNeighborhoods(n);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSpecialty) params.append('specialty', selectedSpecialty);
    if (selectedNeighborhood) params.append('neighborhood', selectedNeighborhood);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-brand-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop" 
            alt="Ouvrier au travail" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-center">
            Trouvez les meilleurs <span className="text-accent-500">ouvriers</span> à Niamey
          </h1>
          <p className="text-xl text-gray-300 text-center mb-10 max-w-2xl mx-auto">
            Électriciens, plombiers, maçons... Des experts qualifiés près de chez vous dans la capitale.
          </p>

          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-3 md:p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              
              {/* Specialty Select */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="h-5 w-5 text-gray-400" />
                </div>
                <select 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm text-gray-900"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">Quelle spécialité ?</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Neighborhood Select */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm text-gray-900"
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                >
                  <option value="">Quel quartier ?</option>
                  {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-brand-700 transition-colors shadow-md whitespace-nowrap">
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Partner Section - WADFOW */}
      <div className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-900 to-slate-900">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-500 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold mb-4 border border-orange-500/30">
                            <Wrench className="w-4 h-4 mr-2" />
                            PARTENAIRE OFFICIEL
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            WADFOW <span className="text-orange-500">TOOLS</span>
                        </h2>
                        <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
                            Découvrez la puissance professionnelle. Perceuses, visseuses, et une gamme complète d'outillage électroportatif robuste disponible dès maintenant sur notre boutique.
                        </p>
                        <Link 
                            to="/boutique" 
                            className="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg group"
                        >
                            Voir la collection
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        <img 
                            src="/wadfow.png" 
                            onError={(e) => {
                                // Fallback si l'image locale n'existe pas
                                e.currentTarget.src = "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800";
                            }}
                            alt="WADFOW Tools Collection" 
                            className="rounded-xl shadow-2xl border-4 border-white/10 w-full max-w-md object-cover transform md:rotate-3 hover:rotate-0 transition-all duration-500"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recherche Locale</h3>
              <p className="text-gray-500 dark:text-gray-300">Trouvez un professionnel qualifié directement à Niamey.</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ouvriers Vérifiés</h3>
              <p className="text-gray-500 dark:text-gray-300">Identités contrôlées et avis clients pour garantir votre sérénité.</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Qualité Assurée</h3>
              <p className="text-gray-500 dark:text-gray-300">Accédez aux meilleurs profils notés par la communauté.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;