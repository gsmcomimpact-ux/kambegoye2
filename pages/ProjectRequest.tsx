
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { db } from '../services/db';
import { Specialty } from '../types';

const ProjectRequestPage = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: ''
  });

  useEffect(() => {
    db.getSpecialties().then(setSpecialties);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // @ts-ignore
    const success = await db.saveProjectRequest(formData);

    if (success) {
      setStatus('success');
    } else {
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
            Votre projet a bien été transmis. Un administrateur KAMBEGOYE va étudier votre demande et vous recontacter très rapidement pour un devis.
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
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Soumettre un Projet</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Besoin d'un devis pour des travaux importants ? Décrivez votre projet et nous trouverons les meilleurs experts pour vous.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
        <div className="bg-accent-600 px-6 py-4 flex items-center text-white">
          <FileText className="w-6 h-6 mr-3" />
          <h2 className="text-xl font-bold">Détails du projet</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Votre Nom</label>
              <input
                type="text"
                name="clientName"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone / WhatsApp</label>
              <input
                type="tel"
                name="clientPhone"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre du projet</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Ex: Rénovation complète de salle de bain"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie principale</label>
            <select
                name="category"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              >
                <option value="">Choisir...</option>
                {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                <option value="Autre">Autre / Général</option>
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description détaillée</label>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Décrivez les travaux à réaliser, les matériaux souhaités, les contraintes..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Estimé (FCFA)</label>
              <input
                type="text"
                name="budget"
                placeholder="Ex: 500 000"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délai souhaité</label>
              <input
                type="text"
                name="deadline"
                placeholder="Ex: Dans 2 semaines"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent-500 focus:ring-accent-500 p-2.5 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange}
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded">
              <AlertCircle className="w-4 h-4 mr-2" />
              Une erreur est survenue lors de l'envoi.
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50"
            >
              <Send className="w-5 h-5 mr-2" />
              {status === 'submitting' ? 'Envoi en cours...' : "Envoyer ma demande de devis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectRequestPage;
