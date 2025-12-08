import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Shield } from 'lucide-react';
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
      const s = await db.getSpecialties();
      const n = await db.getNeighborhoods();
      setSpecialties(s);
      setNeighborhoods(n);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSpecialty) params.append('specialty', selectedSpecialty);
    if (selectedNeighborhood) params.append('location', selectedNeighborhood);
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
            Électriciens, Plombiers, Maçons... Disponibles dans votre quartier en quelques clics.
          </p>

          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-2 md:p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
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

              <button type="submit" className="bg-brand-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-brand-700 transition-colors shadow-md">
                Rechercher
              </button>
            </form>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recherche Facile</h3>
              <p className="text-gray-500 dark:text-gray-300">Filtrez par métier et par quartier pour trouver le professionnel le plus proche.</p>
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
              <p className="text-gray-500 dark:text-gray-300">Accédez aux meilleurs profils notés par la communauté de Niamey.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
