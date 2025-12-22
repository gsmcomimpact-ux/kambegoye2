
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Star, MapPin, BadgeCheck, MessageCircle, User, Calendar, Send } from 'lucide-react';
import * as L from 'leaflet';
import { db } from '../services/db';
import { Worker, Specialty, Neighborhood, Review } from '../types';

const WorkerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!db.hasPaid()) {
      navigate('/payment');
      return;
    }

    const loadData = async () => {
      if (id) db.incrementWorkerView(id);

      const [w, s, n, r] = await Promise.all([
        db.getWorkerById(id || ''),
        db.getSpecialties(),
        db.getNeighborhoods(),
        db.getReviewsByWorker(id || '')
      ]);
      
      if (w && w.accountStatus === 'active') {
        setWorker(w);
      } else {
        setWorker(null);
      }

      setSpecialties(s);
      setNeighborhoods(n);
      setReviews(r);
      setLoading(false);
    };
    loadData();
  }, [id, navigate]);

  useEffect(() => {
    if (worker && worker.latitude && worker.longitude && mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([worker.latitude, worker.longitude], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([worker.latitude, worker.longitude], { icon: customIcon }).addTo(map);
      mapInstanceRef.current = map;
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [worker]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment || !id) return;
    setIsSubmittingReview(true);
    await db.addReview(id, newReviewName, newReviewRating, newReviewComment);
    const updatedReviews = await db.getReviewsByWorker(id);
    setReviews(updatedReviews);
    setNewReviewComment('');
    setNewReviewName('');
    setIsSubmittingReview(false);
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!worker) return <div className="p-8 text-center">Ouvrier introuvable.</div>;

  const getSpecialtyName = (id: string) => specialties.find(s => s.id === id)?.name;
  const getNeighborhoodName = (id: string) => neighborhoods.find(n => n.id === id)?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand-600 h-32 md:h-48 relative">
           <div className="absolute -bottom-16 left-4 md:left-8">
             <img src={worker.photoUrl} alt={worker.firstName} className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover" />
           </div>
        </div>

        <div className="pt-20 px-4 md:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{worker.firstName} {worker.lastName}</h1>
                {worker.isVerified && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Vérifié</span>}
              </div>
              <p className="text-xl text-brand-600 font-semibold mt-1">{getSpecialtyName(worker.specialtyId)}</p>
              <div className="flex items-center text-gray-500 mt-2"><MapPin className="w-4 h-4 mr-1" />{getNeighborhoodName(worker.neighborhoodId || '')}</div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col gap-2">
               <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                 <Star className="w-5 h-5 fill-current mr-1" /><span className="font-bold">{worker.rating}</span><span className="text-sm ml-1">({worker.reviewCount} avis)</span>
               </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <a href={`https://wa.me/${worker.whatsapp.replace(/\D/g, '')}`} target="_blank" className="flex items-center justify-center bg-green-500 text-white py-3 rounded-lg font-bold"><MessageCircle className="w-6 h-6 mr-2" />WhatsApp</a>
             <a href={`tel:${worker.phone}`} className="flex items-center justify-center bg-gray-900 text-white py-3 rounded-lg font-bold"><Phone className="w-6 h-6 mr-2" />Appeler</a>
          </div>

          {worker.latitude && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-3 flex items-center"><MapPin className="w-5 h-5 mr-2 text-brand-600" />Localisation approximative</h3>
              <div ref={mapContainerRef} className="w-full h-64 rounded-lg z-0 border" />
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-500 fill-current" /> Avis Clients
              </h3>
              
              {reviews.length === 0 ? (
                  <p className="text-gray-500 italic">Aucun avis pour le moment. Soyez le premier !</p>
              ) : (
                  reviews.map(review => (
                      <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                  <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mr-3 font-bold">
                                      {review.clientName.charAt(0)}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-900 dark:text-white">{review.clientName}</h4>
                                      <div className="flex text-yellow-400">
                                          {[...Array(5)].map((_, i) => (
                                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <span className="text-xs text-gray-400 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" /> {new Date(review.date).toLocaleDateString()}
                              </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{review.comment}"</p>
                      </div>
                  ))
              )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-brand-100 dark:border-brand-900/30 h-fit">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Laisser un avis</h4>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Votre Nom</label>
                      <input 
                        type="text" required value={newReviewName} onChange={e => setNewReviewName(e.target.value)}
                        className="w-full rounded-lg border-gray-200 p-2 text-sm dark:bg-gray-700 dark:text-white" placeholder="Ex: Moussa Alifa"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Note</label>
                      <select 
                        value={newReviewRating} onChange={e => setNewReviewRating(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-200 p-2 text-sm dark:bg-gray-700 dark:text-white"
                      >
                          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                          <option value="4">⭐⭐⭐⭐ Très bien</option>
                          <option value="3">⭐⭐⭐ Moyen</option>
                          <option value="2">⭐⭐ Déçu</option>
                          <option value="1">⭐ Mauvais</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commentaire</label>
                      <textarea 
                        required value={newReviewComment} onChange={e => setNewReviewComment(e.target.value)}
                        className="w-full rounded-lg border-gray-200 p-2 text-sm dark:bg-gray-700 dark:text-white" rows={3} placeholder="Dites-nous comment s'est passé le travail..."
                      ></textarea>
                  </div>
                  <button 
                    disabled={isSubmittingReview}
                    className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold flex items-center justify-center hover:bg-brand-700 transition-colors"
                  >
                      {isSubmittingReview ? 'Envoi...' : <><Send className="w-4 h-4 mr-2" /> Publier</>}
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};

export default WorkerDetails;
