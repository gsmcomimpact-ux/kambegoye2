
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, NavigateFunction } from 'react-router-dom';
import { Star, MapPin, BadgeCheck, Lock, RotateCw, Map, Clock } from 'lucide-react';
import { db } from '../services/db';
import { Worker, Specialty, Country, City, Neighborhood } from '../types';

interface WorkerCardProps {
  worker: Worker;
  isNearby?: boolean;
  hasPaid: boolean;
  navigate: NavigateFunction;
  specialties: Specialty[];
  cities: City[];
  countries: Country[];
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, isNearby = false, hasPaid, navigate, specialties, cities, countries }) => {
  const specialtyName = specialties.find(s => s.id === worker.specialtyId)?.name;
  const cityName = cities.find(c => c.id === worker.cityId)?.name || 'Niamey';
  
  // Masquer le nom si pas payé
  const displayName = hasPaid 
    ? `${worker.firstName} ${worker.lastName}` 
    : `${worker.firstName} ${worker.lastName.charAt(0)}.`;

  return (
    <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border ${isNearby ? 'border-orange-200 bg-orange-50 dark:bg-gray-800 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {/* Photo floutée si pas payé */}
        <img 
          src={worker.photoUrl} 
          alt="Ouvrier" 
          className={`w-full h-full object-cover transition-all duration-300 ${!hasPaid ? 'blur-[4px] scale-110 opacity-80' : ''}`}
        />
        
        {/* Overlay Cadenas si pas payé */}
        {!hasPaid && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="bg-white/90 p-3 rounded-full shadow-lg">
              <Lock className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        )}

        {worker.isVerified && hasPaid && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-md z-10">
            <BadgeCheck className="w-3 h-3 mr-1" /> Vérifié
          </div>
        )}
        
        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold z-10 ${
          worker.availability === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {worker.availability === 'available' ? 'Disponible' : 'Occupé'}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h3>
            <p className="text-brand-600 font-medium">{specialtyName}</p>
          </div>
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 fill-current mr-1" />
            <span className="text-sm font-bold">{worker.rating}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          {cityName}
        </div>
        
        {isNearby && (
            <div className="mt-2 text-xs font-semibold text-orange-600 flex items-center">
                <Map className="w-3 h-3 mr-1"/> Suggestion (Autre Spécialité proche)
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {hasPaid ? (
            <Link 
              to={`/ouvrier/${worker.id}`}
              className="block w-full text-center bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700 transition-colors font-medium"
            >
              Voir Profil Complet
            </Link>
          ) : (
            <div className="relative group">
               <button 
                onClick={() => navigate('/payment')}
                className="block w-full text-center bg-gray-900 text-white py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors font-medium flex items-center justify-center shadow-sm"
              >
                <Lock className="w-4 h-4 mr-2" />
                Débloquer le contact
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<Worker[]>([]);
  
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consultationPrice, setConsultationPrice] = useState(200);
  const [timeLeft, setTimeLeft] = useState(0);

  // Filters from URL
  const specialtyFilter = searchParams.get('specialty') || '';
  const neighborhoodFilter = searchParams.get('neighborhood') || '';

  const shuffleArray = (array: Worker[]) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
  };

  // Load initial static data
  useEffect(() => {
    const init = async () => {
        const [specs, cntrs, hoods] = await Promise.all([
          db.getSpecialties(), 
          db.getCountries(),
          db.getNeighborhoods()
        ]);
        setSpecialties(specs);
        setCountries(cntrs);
        setNeighborhoods(hoods);
        const settings = await db.getSettings();
        setConsultationPrice(settings.consultationPrice);
        db.getCities().then(setCities);
    };
    init();
  }, []);

  // Main search logic
  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true);
      const allWorkers = await db.getWorkers();
      
      // Basic Filter: Active account status
      let baseList = allWorkers.filter(w => w.accountStatus === 'active');
      
      // Filter by neighborhood if selected
      if (neighborhoodFilter) {
          baseList = baseList.filter(w => w.neighborhoodId === neighborhoodFilter);
      }

      // Exact Matches (Specialty)
      let exactMatches = [...baseList];
      
      if (specialtyFilter) {
        exactMatches = exactMatches.filter(w => w.specialtyId === specialtyFilter);
      }
      
      // Shuffle exact matches
      const shuffledMatches = shuffleArray(exactMatches);
      setWorkers(shuffledMatches.slice(0, 5)); // Show up to 5 main results

      // Suggestions (Same neighborhood but different specialty, OR same specialty different hood if result low)
      let nearby: Worker[] = [];
      if (specialtyFilter && shuffledMatches.length < 3) {
         // Fallback: If filtered by neighborhood, show other workers in that neighborhood
         // If no neighborhood filter, show other workers in same specialty (which we already have in exactMatches)
         nearby = baseList.filter(w => w.specialtyId !== specialtyFilter);
         const needed = 3 - shuffledMatches.length;
         setNearbyWorkers(shuffleArray(nearby).slice(0, Math.max(needed, 3)));
      } else {
          setNearbyWorkers([]);
      }
      
      // Paid status check
      const paid = db.hasPaid();
      setHasPaid(paid);
      if (paid) {
          setTimeLeft(db.getSessionTimeRemaining());
      }
      setLoading(false);
    };
    loadWorkers();
  }, [specialtyFilter, neighborhoodFilter]);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (hasPaid && timeLeft > 0) {
        interval = setInterval(() => {
            const remaining = db.getSessionTimeRemaining();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setHasPaid(false); // Session expired
                clearInterval(interval);
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasPaid, timeLeft]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        
        {/* Specialty Filter */}
        <div className="w-full md:w-1/3 relative">
            <select
                value={specialtyFilter}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 pl-8"
            >
                <option value="">Toutes les spécialités</option>
                {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
             <Star className="w-4 h-4 absolute left-2.5 top-3 text-gray-500"/>
        </div>

        {/* Neighborhood Filter */}
        <div className="w-full md:w-1/3 relative">
            <select
                value={neighborhoodFilter}
                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 pl-8"
            >
                <option value="">Tous les quartiers (Niamey)</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
             <MapPin className="w-4 h-4 absolute left-2.5 top-3 text-gray-500"/>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto flex items-center whitespace-nowrap">
          {workers.length} expert(s) trouvé(s)
        </div>
      </div>

      {/* Paywall Banner OR Timer */}
      {!hasPaid && (workers.length > 0 || nearbyWorkers.length > 0) ? (
        <div className="bg-accent-600 text-white rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center mb-4 sm:mb-0">
            <Lock className="h-6 w-6 mr-3" />
            <div>
              <p className="font-bold text-lg">Débloquez les contacts !</p>
              <p className="text-sm opacity-90">Payez {consultationPrice} FCFA pour accéder aux ouvriers pendant 5 minutes.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/payment')}
            className="bg-white text-accent-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Payer {consultationPrice} F
          </button>
        </div>
      ) : hasPaid && timeLeft > 0 && (
          <div className="bg-green-100 text-green-800 border border-green-200 rounded-lg p-3 mb-6 flex items-center justify-center shadow-sm">
             <Clock className="w-5 h-5 mr-2" />
             <span className="font-bold">Session active : {formatTime(timeLeft)} restants</span>
          </div>
      )}

      {/* Results Grid - Exact Matches */}
      {workers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">Résultats</h2>
                 <span className="ml-2 bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded-full">{workers.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workers.map((worker) => (
                  <WorkerCard 
                    key={worker.id} 
                    worker={worker} 
                    hasPaid={hasPaid} 
                    navigate={navigate} 
                    specialties={specialties} 
                    cities={cities}
                    countries={countries}
                  />
                ))}
            </div>
          </div>
      )}

      {/* No Exact Matches Message */}
      {workers.length === 0 && !loading && (
         <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg mb-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun ouvrier trouvé pour ces critères.</p>
            {nearbyWorkers.length > 0 && <p className="text-brand-600 mt-2 font-medium">Voici d'autres professionnels disponibles :</p>}
         </div>
      )}
      
      {/* Nearby Suggestions */}
      {nearbyWorkers.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <RotateCw className="w-5 h-5 mr-2 text-orange-500" />
                    Autres professionnels (Suggestions)
                </h2>
                <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{nearbyWorkers.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyWorkers.map((worker) => (
                  <WorkerCard 
                    key={worker.id} 
                    worker={worker} 
                    isNearby={true}
                    hasPaid={hasPaid} 
                    navigate={navigate} 
                    specialties={specialties} 
                    cities={cities}
                    countries={countries}
                  />
                ))}
            </div>
          </div>
      )}

      {workers.length === 0 && nearbyWorkers.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun résultat trouvé.</p>
        </div>
      )}

      {loading && <p className="text-center p-12">Chargement...</p>}
    </div>
  );
};

export default Search;
