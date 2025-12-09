import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Star, MapPin, BadgeCheck, MessageCircle } from 'lucide-react';
import * as L from 'leaflet';
import { db } from '../services/db';
import { Worker, Specialty, Neighborhood } from '../types';

const WorkerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  // Map Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Paywall Check with Session Logic
    if (!db.hasPaid()) {
      navigate('/payment');
      return;
    }

    const loadData = async () => {
      if (id) {
          // Increment View Count
          db.incrementWorkerView(id);
      }

      const [w, s, n] = await Promise.all([
        db.getWorkerById(id || ''),
        db.getSpecialties(),
        db.getNeighborhoods()
      ]);
      
      // Security: Only show active workers
      if (w && w.accountStatus === 'active') {
        setWorker(w);
      } else {
        setWorker(null);
      }

      setSpecialties(s);
      setNeighborhoods(n);
      setLoading(false);
    };
    loadData();
  }, [id, navigate]);

  // Initialize Map when worker data is loaded
  useEffect(() => {
    if (worker && worker.latitude && worker.longitude && mapContainerRef.current && !mapInstanceRef.current) {
      
      const map = L.map(mapContainerRef.current).setView([worker.latitude, worker.longitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom icon to ensure it renders correctly from CDN
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([worker.latitude, worker.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${worker.firstName} ${worker.lastName}</b><br>Quartier estimé`)
        .openPopup();

      mapInstanceRef.current = map;
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [worker]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!worker) return <div className="p-8 text-center">Ouvrier introuvable ou profil non validé.</div>;

  const getSpecialtyName = (id: string) => specialties.find(s => s.id === id)?.name;
  const getNeighborhoodName = (id: string) => neighborhoods.find(n => n.id === id)?.name;

  // Helper to clean phone number for WhatsApp
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 h-32 md:h-48 relative">
           <div className="absolute -bottom-16 left-4 md:left-8">
             <img 
               src={worker.photoUrl} 
               alt={worker.firstName} 
               className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
             />
           </div>
        </div>

        <div className="pt-20 px-4 md:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {worker.firstName} {worker.lastName}
                </h1>
                {worker.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-600 text-white shadow-sm">
                    <BadgeCheck className="w-4 h-4 mr-1.5" />
                    Ouvrier Vérifié
                  </span>
                )}
              </div>
              <p className="text-xl text-brand-600 font-semibold mt-1">{getSpecialtyName(worker.specialtyId)}</p>
              <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                <MapPin className="w-4 h-4 mr-1" />
                {getNeighborhoodName(worker.neighborhoodId)}
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col gap-2">
               <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full w-fit">
                 <Star className="w-5 h-5 fill-current mr-1" />
                 <span className="font-bold">{worker.rating}</span>
                 <span className="text-sm ml-1">({worker.reviewCount} avis)</span>
               </div>
               <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                 worker.availability === 'available' 
                 ? 'bg-green-100 text-green-800' 
                 : 'bg-red-100 text-red-800'
               }`}>
                 {worker.availability === 'available' ? 'Disponible maintenant' : 'Actuellement occupé'}
               </span>
            </div>
          </div>

          {/* Map Section */}
          {worker.latitude && worker.longitude && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-brand-600" />
                Localisation approximative
              </h3>
              <div 
                ref={mapContainerRef} 
                className="w-full h-64 rounded-lg shadow-md z-0 border border-gray-200 dark:border-gray-700"
              />
              <p className="text-xs text-gray-500 mt-2 italic">
                La position est indicative. Veuillez demander l'adresse exacte lors de l'appel.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <a 
               href={`https://wa.me/${cleanPhone(worker.whatsapp)}`} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
             >
               <MessageCircle className="w-6 h-6 mr-2" />
               Contacter sur WhatsApp
             </a>
             <a 
               href={`tel:${worker.phone}`}
               className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
             >
               <Phone className="w-6 h-6 mr-2" />
               Appeler {worker.phone}
             </a>
          </div>

          {/* Work Gallery */}
          {worker.workImages && worker.workImages.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Réalisations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {worker.workImages.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Travail ${idx + 1}`} 
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

           {/* Legal Disclaimer for Client */}
           <div className="mt-10 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-300">
             <p><strong>Note :</strong> KAMBEGOYE n'est pas responsable de la qualité des travaux effectués. Veuillez convenir des modalités avec l'ouvrier avant le début du chantier.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetails;