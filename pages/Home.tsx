
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, CheckCircle, Shield, MapPin, ArrowRight, Wrench, Star } from 'lucide-react';
import { db } from '../services/db';
import { Specialty, Neighborhood, Partner } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [s, n, p] = await Promise.all([
        db.getSpecialties(),
        db.getNeighborhoods(),
        db.getPartners()
      ]);
      setSpecialties(s);
      setNeighborhoods(n);
      
      // Filtrage strict : on ne garde que les partenaires explicitement actifs
      const activePartners = p
        .filter(partner => partner && partner.isActive === true)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        
      setPartners(activePartners);
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

      {/* Partner Sections (Dynamic Grid) - Only rendered if partners exist */}
      {partners.length > 0 && (
        <div className="bg-white dark:bg-gray-900 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center uppercase tracking-wide">Nos Partenaires Officiels</h2>
                
                <div className={`grid grid-cols-1 gap-8 ${partners.length > 1 ? 'md:grid-cols-2' : ''}`}>
                    {partners.map((partner, index) => {
                        const isExternal = partner.linkUrl && (partner.linkUrl.startsWith('http') || partner.linkUrl.startsWith('www'));
                        const LinkComponent = isExternal ? 'a' : Link;
                        const linkProps = isExternal 
                            ? { href: partner.linkUrl, target: '_blank', rel: 'noopener noreferrer' } 
                            : { to: partner.linkUrl };

                        return (
                        <div key={partner.id} className={`relative rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
                            index % 2 === 0 
                            ? 'bg-gradient-to-br from-blue-900 to-slate-900' 
                            : 'bg-gradient-to-br from-slate-900 to-gray-800'
                        }`}>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-500 opacity-20 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>

                            <div className={`relative z-10 p-8 flex ${partners.length === 1 ? 'flex-col md:flex-row md:items-center md:gap-12' : 'flex-col'} h-full`}>
                                <div className="flex-1">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-4 border border-orange-500/30">
                                        <Star className="w-3 h-3 mr-1" />
                                        PARTENAIRE
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight uppercase">
                                        {partner.name}
                                    </h2>
                                    <p className="text-base text-gray-300 mb-6 leading-relaxed">
                                        {partner.description}
                                    </p>
                                    
                                    {partners.length === 1 && partner.linkUrl && (
                                        // @ts-ignore
                                        <LinkComponent 
                                        {...linkProps}
                                        className="hidden md:inline-flex justify-center items-center px-8 py-4 text-base font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-lg group cursor-pointer"
                                    >
                                        En savoir plus
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </LinkComponent>
                                    )}
                                </div>
                                
                                <div className={`mt-auto space-y-6 ${partners.length === 1 ? 'w-full md:w-1/2' : ''}`}>
                                    <div className={`w-full ${partners.length === 1 ? 'h-64' : 'h-48'} bg-white/5 rounded-xl overflow-hidden border border-white/10`}>
                                        <img 
                                            src={partner.imageUrl} 
                                            onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800";
                                            }}
                                            alt={partner.name} 
                                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {partner.linkUrl && (
                                        // @ts-ignore
                                        <LinkComponent 
                                            {...linkProps}
                                            className={`w-full inline-flex justify-center items-center px-6 py-4 text-base font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-all shadow-lg group cursor-pointer ${partners.length === 1 ? 'md:hidden' : ''}`}
                                        >
                                            En savoir plus
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </LinkComponent>
                                    )}
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
      )}
      
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
