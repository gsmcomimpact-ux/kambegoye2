import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle, MapPin, Star, ArrowRight, MessageCircle } from 'lucide-react';
import { db } from '../services/db';
import { Worker, Specialty, Neighborhood } from '../types';

const AccessContacts = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Check payment status on mount
  useEffect(() => {
    if (!db.hasPaid()) {
        navigate('/payment');
        return;
    }
    setTimeLeft(db.getSessionTimeRemaining());
    
    // Timer
    const interval = setInterval(() => {
        const remaining = db.getSessionTimeRemaining();
        setTimeLeft(remaining);
        if (remaining <= 0) {
            clearInterval(interval);
            navigate('/search');
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      const [allWorkers, specs, hoods] = await Promise.all([
        db.getWorkers(),
        db.getSpecialties(),
        db.getNeighborhoods()
      ]);
      setSpecialties(specs);
      setNeighborhoods(hoods);

      // Try to retrieve previous search context
      let filteredWorkers = allWorkers.filter(w => w.accountStatus === 'active');
      const savedContext = sessionStorage.getItem('last_search_context');
      
      if (savedContext) {
          const { specialty, neighborhood } = JSON.parse(savedContext);
          
          if (neighborhood) {
              const hoodMatch = filteredWorkers.filter(w => w.neighborhoodId === neighborhood);
              if (hoodMatch.length > 0) filteredWorkers = hoodMatch;
          }
          
          if (specialty) {
             const specMatch = filteredWorkers.filter(w => w.specialtyId === specialty);
             // Keep filtering if matches found, otherwise show general list
             if (specMatch.length > 0) filteredWorkers = specMatch;
          }
      }

      // If list is still too big or empty, just show top rated
      if (filteredWorkers.length === 0) {
          filteredWorkers = allWorkers.filter(w => w.accountStatus === 'active');
      }

      // Shuffle and take top 10
      setWorkers(filteredWorkers.sort(() => 0.5 - Math.random()).slice(0, 10));
      setLoading(false);
    };
    loadData();
  }, []);

  const getSpecialtyName = (id: string) => specialties.find(s => s.id === id)?.name || 'Ouvrier';
  const getNeighborhoodName = (id?: string) => neighborhoods.find(n => n.id === id)?.name || 'Niamey';
  
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="p-10 text-center">Chargement des contacts...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">Paiement Confirmé !</h1>
        <p className="text-green-700 text-lg mb-4">
            Voici les numéros des ouvriers que vous recherchiez.
        </p>
        <div className="inline-block bg-white px-4 py-2 rounded-lg font-mono font-bold text-red-600 border border-red-200 shadow-sm">
            Temps restant : {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workers.map(worker => (
            <div key={worker.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-brand-500 overflow-hidden flex flex-col relative transform hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    PAYÉ & DÉBLOQUÉ
                </div>
                
                <div className="p-6 flex items-start space-x-4">
                    <img 
                        src={worker.photoUrl} 
                        alt={worker.firstName} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {worker.firstName} {worker.lastName}
                        </h3>
                        <p className="text-brand-600 font-medium">{getSpecialtyName(worker.specialtyId)}</p>
                        
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {getNeighborhoodName(worker.neighborhoodId)}
                        </div>
                        
                        <div className="flex items-center mt-2">
                             <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(worker.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                             </div>
                             <span className="text-xs text-gray-400 ml-1">({worker.reviewCount})</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 mt-auto border-t border-gray-100 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-3">
                        <a 
                            href={`tel:${worker.phone}`}
                            className="flex items-center justify-center bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors"
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            {worker.phone}
                        </a>
                        <a 
                             href={`https://wa.me/${worker.whatsapp.replace(/\D/g, '')}`} 
                             target="_blank" 
                             rel="noreferrer"
                             className="flex items-center justify-center bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button 
            onClick={() => navigate('/search')}
            className="text-brand-600 font-semibold hover:underline flex items-center justify-center mx-auto"
        >
            Voir toute la liste <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default AccessContacts;