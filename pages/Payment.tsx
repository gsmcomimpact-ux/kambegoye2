

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Smartphone, AlertCircle, ExternalLink } from 'lucide-react';
import { db } from '../services/db';

const Payment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(100);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.getSettings().then(s => setAmount(s.consultationPrice));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    try {
        // Logique de paiement externe via lien direct
        const paymentUrl = 'https://i-pay.money/external_payments/85a858866600/preview';
        
        // Ouverture dans un nouvel onglet
        window.open(paymentUrl, '_blank');
        
        setLoading(false);
    } catch (error) {
        console.error(error);
        alert("Une erreur inattendue est survenue.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900">
            <Lock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Paiement Sécurisé
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Accédez aux contacts pour <span className="font-bold text-accent-600 text-lg">{amount} FCFA</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Votre Numéro (Pour le suivi)
               </label>
               <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="tel"
                        required
                        className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-lg border-gray-300 rounded-md py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="90 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
               </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start">
             <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
             <p className="text-sm text-blue-700 dark:text-blue-300">
                Une nouvelle page sécurisée va s'ouvrir pour finaliser le paiement.
             </p>
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Ouverture...' : `Payer ${amount} FCFA`}
            {!loading && <ExternalLink className="ml-2 w-5 h-5" />}
          </button>
        </form>
        
        <p className="text-xs text-center text-gray-400 mt-4">
            En continuant, vous acceptez nos conditions générales d'utilisation.
        </p>
      </div>
    </div>
  );
};

export default Payment;