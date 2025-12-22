
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, NavigateFunction } from 'react-router-dom';
import { Star, MapPin, BadgeCheck, Lock, RotateCw, Map, Clock, Search as SearchIcon } from 'lucide-react';
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
  onUnlock: () => void;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, isNearby = false, hasPaid, specialties, cities, onUnlock }) => {
  const specialtyName = specialties.find(s => s.id === worker.specialtyId)?.name;
  const cityName = cities.find(c => c.id === worker.cityId)?.name || 'Niamey';
  const displayName = hasPaid ? `${worker.firstName} ${worker.lastName}` : `${worker.firstName} ${worker.lastName.charAt(0)}.`;

  return (
    <div className={`rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border ${isNearby ? 'border-orange-200 bg-orange-50 dark:bg-gray-800 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={worker.photoUrl} 
          alt="Ouvrier" 
          className={`w-full h-full object-cover transition-all duration-500 ${!hasPaid ? 'blur-[6px] scale-110 opacity-70' : ''}`}
        />
        {!hasPaid && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="bg-white/90 p-3 rounded-full shadow-2xl transform scale-110">
              <Lock className="w-6 h-6 text-gray-800" />
            </div>
          </div>
        )}
        {worker.isVerified && hasPaid && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center shadow-lg z-10">
            <BadgeCheck className="w-3 h-3 mr-1" /> Vérifié
          </div>
        )}
        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider z-10 shadow-sm ${
          worker.availability === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {worker.availability === 'available' ? 'Disponible' : 'Occupé'}
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{displayName}</h3>
            <p className="text-brand-600 font-bold text-sm uppercase tracking-wide mt-0.5">{specialtyName}</p>
          </div>
          <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100">
            <Star className="w-3.5 h-3.5 fill-current mr-1 text-yellow-500" />
            <span className="text-xs font-black">{worker.rating}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400 text-xs font-medium">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-red-500" />
          {cityName}
        </div>
        
        {isNearby && (
            <div className="mt-2 text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center">
                <Map className="w-3 h-3 mr-1"/> Suggestion Proche
            </div>
        )}

        <div className="mt-5">
          {hasPaid ? (
            <Link 
              to={`/ouvrier/${worker.id}`}
              className="block w-full text-center bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 transition-all font-bold shadow-md hover:shadow-brand-500/20"
            >
              Consulter le profil
            </Link>
          ) : (
            <button 
                onClick={onUnlock}
                className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl cursor-pointer hover:bg-black transition-all font-bold flex items-center justify-center shadow-lg active:scale-95"
              >
                <Lock className="w-4 h-4 mr-2" />
                Débloquer Contact
            </button>
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
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consultationPrice, setConsultationPrice] = useState(200);
  const [timeLeft, setTimeLeft] = useState(0);

  const specialtyFilter = searchParams.get('specialty') || '';
  const neighborhoodFilter = searchParams.get('neighborhood') || '';

  useEffect(() => {
    const init = async () => {
        const [specs, cntrs, hoods, settings, allCities] = await Promise.all([
          db.getSpecialties(), db.getCountries(), db.getNeighborhoods(), db.getSettings(), db.getCities()
        ]);
        setSpecialties(specs); setCountries(cntrs); setNeighborhoods(hoods); setConsultationPrice(settings.consultationPrice); setCities(allCities);
    };
    init();
  }, []);

  useEffect(() => {
    const loadWorkers = async () => {
      setLoading(true);
      const allWorkers = await db.getWorkers();
      let baseList = allWorkers.filter(w => w.accountStatus === 'active');
      if (neighborhoodFilter) baseList = baseList.filter(w => w.neighborhoodId === neighborhoodFilter);
      
      let exactMatches = [...baseList];
      if (specialtyFilter) exactMatches = exactMatches.filter(w => w.specialtyId === specialtyFilter);
      
      setWorkers(exactMatches.sort(() => Math.random() - 0.5));

      if (specialtyFilter && exactMatches.length < 3) {
         const nearby = baseList.filter(w => w.specialtyId !== specialtyFilter);
         setNearbyWorkers(nearby.sort(() => Math.random() - 0.5).slice(0, 4));
      } else setNearbyWorkers([]);
      
      const paid = db.hasPaid();
      setHasPaid(paid);
      if (paid) setTimeLeft(db.getSessionTimeRemaining());
      setLoading(false);
    };
    loadWorkers();
  }, [specialtyFilter, neighborhoodFilter]);

  useEffect(() => {
    let interval: any;
    if (hasPaid && timeLeft > 0) {
        interval = setInterval(() => {
            const remaining = db.getSessionTimeRemaining();
            setTimeLeft(remaining);
            if (remaining <= 0) { setHasPaid(false); clearInterval(interval); }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasPaid, timeLeft]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    setSearchParams(newParams);
  };
  
  const handleUnlockClick = () => {
      sessionStorage.setItem('last_search_context', JSON.stringify({ specialty: specialtyFilter, neighborhood: neighborhoodFilter }));
      navigate('/payment');
  };
  
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center border border-gray-100 dark:border-gray-700">
        <div className="w-full md:w-1/3 relative">
            <select
                value={specialtyFilter}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 pl-10 text-sm font-medium"
            >
                <option value="">Tous les métiers</option>
                {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
             {/* Fixed typo: changed StarIcon to Star */}
             <Star className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"/>
        </div>
        <div className="w-full md:w-1/3 relative">
            <select
                value={neighborhoodFilter}
                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-3 pl-10 text-sm font-medium"
            >
                <option value="">Tous les quartiers</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
             <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"/>
        </div>
        <div className="text-xs font-black uppercase tracking-widest text-gray-400 ml-auto flex items-center whitespace-nowrap">
          {workers.length} PROS TROUVÉS
        </div>
      </div>

      {!hasPaid && workers.length > 0 ? (
        <div className="bg-brand-600 text-white rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center mb-4 sm:mb-0 relative z-10">
            <div className="bg-white/20 p-3 rounded-xl mr-4"><Lock className="h-6 w-6" /></div>
            <div>
              <p className="font-black text-xl leading-tight">DÉBLOQUEZ LES CONTACTS !</p>
              <p className="text-xs font-bold text-brand-100 uppercase tracking-widest mt-1">Accès illimité pendant 5 minutes pour seulement {consultationPrice} F</p>
            </div>
          </div>
          <button 
            onClick={handleUnlockClick}
            className="bg-white text-brand-700 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-50 transition-all shadow-xl active:scale-95 relative z-10"
          >
            Payer {consultationPrice} FCFA
          </button>
        </div>
      ) : hasPaid && timeLeft > 0 && (
          <div className="bg-green-500 text-white border border-green-400 rounded-2xl p-4 mb-8 flex items-center justify-center shadow-lg animate-pulse">
             <Clock className="w-5 h-5 mr-3" />
             <span className="font-black uppercase tracking-widest text-sm">Session active : {formatTime(timeLeft)} restants</span>
          </div>
      )}

      {workers.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workers.map((worker) => (
                  <WorkerCard 
                    key={worker.id} worker={worker} hasPaid={hasPaid} navigate={navigate} specialties={specialties} cities={cities} countries={countries} onUnlock={handleUnlockClick}
                  />
                ))}
            </div>
          </div>
      )}

      {workers.length === 0 && !loading && (
         <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl mb-8 border-2 border-dashed border-gray-200 dark:border-gray-700">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">Aucun ouvrier trouvé à Niamey pour ces critères.</p>
            {nearbyWorkers.length > 0 && <p className="text-brand-600 mt-2 font-black uppercase tracking-widest text-xs">Découvrez d'autres professionnels proches :</p>}
         </div>
      )}
      
      {nearbyWorkers.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
                <div className="h-px bg-orange-200 flex-1"></div>
                <h2 className="mx-4 text-xs font-black text-orange-600 uppercase tracking-[0.2em] flex items-center whitespace-nowrap">
                    <RotateCw className="w-4 h-4 mr-2" />Suggestions Proches
                </h2>
                <div className="h-px bg-orange-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyWorkers.map((worker) => (
                  <WorkerCard 
                    key={worker.id} worker={worker} isNearby={true} hasPaid={hasPaid} navigate={navigate} specialties={specialties} cities={cities} countries={countries} onUnlock={handleUnlockClick}
                  />
                ))}
            </div>
          </div>
      )}

      {loading && <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div><p className="mt-4 font-black uppercase tracking-widest text-gray-400 text-xs">Chargement des experts...</p></div>}
    </div>
  );
};

export default Search;
