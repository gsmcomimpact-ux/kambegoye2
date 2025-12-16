import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { db } from '../services/db';

const Reclamation = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [ticketNumber, setTicketNumber] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    workerName: '',
    workerPhone: '',
    reason: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Enregistrement dans la DB
    const dispute = await db.saveDispute(formData);
    
    if (dispute) {
        setTicketNumber(dispute.ticketNumber);
        setStatus('success');
    } else {
        alert("Erreur lors de l'envoi. Veuillez réessayer.");
        setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Réclamation reçue</h2>
          <p className="text-xl font-bold text-brand-600 mb-4">Ticket : {ticketNumber}</p>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            Nous avons bien reçu votre signalement. Notre équipe de médiation va analyser la situation et vous recontacter sous 48h ouvrables.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-3 rounded-md hover:bg-black font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-gray-500 hover:text-brand-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-500 mb-4 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 mr-3" />
            Déclarer un Litige
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Vous rencontrez un problème avec un ouvrier ou une prestation ? Remplissez ce formulaire pour ouvrir un dossier de réclamation.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-red-100 dark:border-red-900/30">
        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4">
           <p className="text-sm text-red-800 dark:text-red-300 font-medium">
               Note importante : KAMBEGOYE agit en tant que médiateur. Nous ne sommes pas responsables des travaux mais nous ferons tout notre possible pour résoudre le conflit à l'amiable.
           </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Nom</label>
              <input
                type="text"
                name="clientName"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Téléphone</label>
              <input
                type="tel"
                name="clientPhone"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'ouvrier (Si connu)</label>
                <input
                type="text"
                name="workerName"
                placeholder="Ex: Moussa Ibrahim"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone de l'ouvrier (Si connu)</label>
                <input
                type="text"
                name="workerPhone"
                placeholder="Ex: 90 00 00 00"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif de la réclamation</label>
            <select
                name="reason"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
            >
                <option value="">Sélectionnez un motif...</option>
                <option value="Travail non terminé">Travail non terminé</option>
                <option value="Malfaçon / Mauvaise qualité">Malfaçon / Mauvaise qualité</option>
                <option value="Absence / Retard excessif">Absence / Retard excessif</option>
                <option value="Problème de comportement">Problème de comportement</option>
                <option value="Escroquerie / Vol">Escroquerie / Vol</option>
                <option value="Autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description détaillée du problème</label>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Expliquez la situation avec le plus de détails possible (dates, montants versés, accords oraux...)"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleChange}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5 mr-2" />
              {status === 'submitting' ? 'Envoi en cours...' : "Soumettre la réclamation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reclamation;