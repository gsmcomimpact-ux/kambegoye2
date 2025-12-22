
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Upload, CheckCircle, AlertCircle, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { db, generateUUID } from '../services/db';
import { Specialty, Neighborhood } from '../types';

const Register = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialtyId: '',
    countryId: 'NE',
    cityId: 'NE_NIA',
    neighborhoodId: '', 
    phone: '',
    whatsapp: '',
    photoUrl: 'https://picsum.photos/200', 
    idCardUrl: '',
    latitude: 0,
    longitude: 0,
    workImages: [] as string[]
  });

  const [idFile, setIdFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [s, n] = await Promise.all([db.getSpecialties(), db.getNeighborhoods()]);
      setSpecialties(s);
      setNeighborhoods(n);
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hoodId = e.target.value;
    const selectedHood = neighborhoods.find(n => n.id === hoodId);
    setFormData({ ...formData, neighborhoodId: hoodId, latitude: selectedHood?.latitude || 0, longitude: selectedHood?.longitude || 0 });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'photo') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) { setFileError("Le fichier est trop volumineux (Max 2MB)."); return; }
          setFileError('');
          try {
              const dataUrl = await db.fileToDataURL(file);
              if (type === 'id') { setIdFile(file); setFormData({ ...formData, idCardUrl: dataUrl }); }
              else { setPhotoFile(file); setFormData({ ...formData, photoUrl: dataUrl }); }
          } catch (e) { setFileError("Erreur lors de la lecture."); }
      }
  };

  const handleWorkImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      const newImages: string[] = [];
      for (const file of files) {
         if (file.size > 2 * 1024 * 1024) continue;
         try { const url = await db.fileToDataURL(file); newImages.push(url); } catch(e) {}
      }
      setFormData(prev => ({ ...prev, workImages: [...prev.workImages, ...newImages] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.specialtyId || !formData.neighborhoodId) { setFileError("Veuillez remplir tous les champs requis."); return; }
    setStatus('submitting');
    try {
        const timestamp = Date.now();
        const baseName = `${formData.firstName}_${formData.lastName}`.toUpperCase().replace(/\s+/g, '_');
        if (idFile && formData.idCardUrl) { await db.saveMedia({ id: `ID_${timestamp}`, type: 'document', name: `CNI_${baseName}`, data: formData.idCardUrl, date: new Date().toISOString() }); }
        if (photoFile && formData.photoUrl) { await db.saveMedia({ id: `PHOTO_${timestamp}`, type: 'image', name: `PHOTO_${baseName}`, data: formData.photoUrl, date: new Date().toISOString() }); }
        const success = await db.registerWorker({ ...formData });
        if (success) setStatus('success'); else setStatus('error');
    } catch (e) { setStatus('error'); }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border border-green-50">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 shadow-inner">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Dossier Reçu !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium">
            Nagode ! Votre inscription est en cours de vérification par nos administrateurs à Niamey.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-brand-600 text-white py-4 rounded-2xl hover:bg-brand-700 font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/20 active:scale-95 transition-all">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Rejoindre KAMBEGOYE</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Proposez votre expertise aux habitants de la capitale.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-brand-600 px-8 py-5 flex items-center text-white">
          <UserPlus className="w-6 h-6 mr-3" />
          <h2 className="text-xl font-black uppercase tracking-tight">Formulaire d'Ouvrier</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Prénom</label>
              <input type="text" name="firstName" required className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleChange}/>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom</label>
              <input type="text" name="lastName" required className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleChange}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quartier (Niamey)</label>
              <select name="neighborhoodId" required className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleNeighborhoodChange}>
                <option value="">Sélectionner...</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
             <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Métier</label>
                <select name="specialtyId" required className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleChange}>
                  <option value="">Choisir...</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Téléphone</label>
              <input type="tel" name="phone" required placeholder="90 00 00 00" className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleChange}/>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">WhatsApp</label>
              <input type="tel" name="whatsapp" required placeholder="227 90 00 00 00" className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3.5 border font-bold dark:bg-gray-700 dark:text-white dark:border-gray-600" onChange={handleChange}/>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-600 space-y-6">
             <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm flex items-center"><Upload className="w-4 h-4 mr-2 text-brand-600" /> Documents Requis</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Photo de Profil</label>
                  <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-white rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm flex-shrink-0">
                          {formData.photoUrl.startsWith('data:') ? <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-full w-full p-4 text-gray-200" />}
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} className="text-xs font-bold text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"/>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pièce d'Identité (CNI)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'id')} className="text-xs font-bold text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required />
               </div>
             </div>
          </div>

          {fileError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {fileError}</div>}

          <button type="submit" disabled={status === 'submitting'} className="w-full bg-brand-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-brand-500/30 hover:bg-brand-700 transition-all disabled:opacity-50 active:scale-[0.98]">{status === 'submitting' ? 'Vérification...' : "Soumettre Inscription"}</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
