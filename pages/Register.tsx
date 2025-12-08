
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Upload, CheckCircle, AlertCircle, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { db } from '../services/db';
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
    neighborhoodId: '',
    phone: '',
    whatsapp: '',
    photoUrl: 'https://picsum.photos/200', 
    idCardUrl: '',
    latitude: 13.51,
    longitude: 2.11,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'photo') => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
              setFileError("Le fichier est trop volumineux (Max 2MB).");
              return;
          }
          setFileError('');

          try {
              const dataUrl = await db.fileToDataURL(file);
              if (type === 'id') {
                  setIdFile(file);
                  setFormData({ ...formData, idCardUrl: dataUrl });
              } else {
                  setPhotoFile(file);
                  setFormData({ ...formData, photoUrl: dataUrl });
              }
          } catch (e) {
              setFileError("Erreur lors de la lecture du fichier.");
          }
      }
  };

  const handleWorkImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      const newImages: string[] = [];
      
      for (const file of files) {
         if (file.size > 2 * 1024 * 1024) continue;
         try {
            const url = await db.fileToDataURL(file);
            newImages.push(url);
         } catch(e) {}
      }

      setFormData(prev => ({
         ...prev,
         workImages: [...prev.workImages, ...newImages]
      }));
    }
  };

  const removeWorkImage = (index: number) => {
      setFormData(prev => ({
          ...prev,
          workImages: prev.workImages.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
        // Save ID Card to Media
        if (idFile && formData.idCardUrl) {
             await db.saveMedia({
                 id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                 type: 'document',
                 name: `ID_${formData.firstName}_${formData.lastName}`,
                 data: formData.idCardUrl,
                 date: new Date().toISOString()
             });
        }

        // Save Profile Photo to Media (optional but good for archive)
        if (photoFile && formData.photoUrl) {
            await db.saveMedia({
                 id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                 type: 'image',
                 name: `PHOTO_${formData.firstName}_${formData.lastName}`,
                 data: formData.photoUrl,
                 date: new Date().toISOString()
             });
        }

        // Simulate API call
        const success = await db.registerWorker({
            ...formData
        });

        if (success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
    } catch (e) {
        setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Demande envoyée !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre inscription a bien été prise en compte. Un administrateur va vérifier votre dossier (pièce d'identité et profil) avant d'activer votre compte.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-brand-600 text-white py-3 rounded-md hover:bg-brand-700 font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Devenir Ouvrier KAMBEGOYE</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Inscrivez-vous gratuitement pour proposer vos services à des milliers de clients à Niamey.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
        <div className="bg-brand-600 px-6 py-4 flex items-center text-white">
          <UserPlus className="w-6 h-6 mr-3" />
          <h2 className="text-xl font-bold">Formulaire d'inscription</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
              <input
                type="text"
                name="firstName"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                name="lastName"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Métier / Spécialité</label>
              <select
                name="specialtyId"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              >
                <option value="">Choisir...</option>
                {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quartier de résidence</label>
              <select
                name="neighborhoodId"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              >
                <option value="">Choisir...</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone (Appels)</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="Ex: 90000000"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                required
                placeholder="Ex: 22790000000"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-md border border-yellow-200 dark:border-gray-600">
             <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center">
               <Upload className="w-5 h-5 mr-2" />
               Documents et Photos
             </h3>
             <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
               Veuillez fournir une photo de profil et une pièce d'identité valide.
             </p>
             
             <div className="space-y-6">
               {/* Profile Photo */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo de Profil (Visage visible)</label>
                  <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-300">
                          {formData.photoUrl.startsWith('data:') ? (
                              <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                              <ImageIcon className="h-full w-full p-3 text-gray-400" />
                          )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:text-gray-300"
                      />
                  </div>
               </div>
               
               {/* ID Card */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carte d'Identité / Passeport</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Cliquez pour uploader</span></p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG (MAX. 2MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'id')} required />
                      </label>
                    </div>
                    {/* Preview for ID if image */}
                    {formData.idCardUrl && formData.idCardUrl.startsWith('data:image') && (
                        <div className="mt-2 h-32 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img src={formData.idCardUrl} alt="ID Preview" className="h-full w-full object-contain" />
                        </div>
                    )}
                    {idFile && (
                        <div className="mt-2 text-sm text-green-600 flex items-center font-semibold">
                            <FileText className="w-4 h-4 mr-1"/>
                            {idFile.name} (Prêt à l'envoi)
                        </div>
                    )}
                    {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
                  </div>
               </div>

               {/* Work Images (Portfolio) */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vos Réalisations (Photos de chantiers - Optionnel)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                      {formData.workImages.map((img, idx) => (
                          <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden group">
                              <img src={img} className="h-full w-full object-cover" alt="Realisation" />
                              <button 
                                type="button" 
                                onClick={() => removeWorkImage(idx)}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Trash2 className="w-3 h-3" />
                              </button>
                          </div>
                      ))}
                      <label className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <input type="file" className="hidden" accept="image/*" multiple onChange={handleWorkImages} />
                      </label>
                  </div>
                  <p className="text-xs text-gray-500">Ajoutez des photos de vos travaux précédents pour rassurer les clients.</p>
               </div>
             </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded">
              <AlertCircle className="w-4 h-4 mr-2" />
              Une erreur est survenue lors de l'envoi du formulaire. Vérifiez la taille des fichiers.
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Envoi en cours...' : "Soumettre mon dossier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
