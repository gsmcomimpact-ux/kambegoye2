

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Smartphone, AlertCircle, ExternalLink, CheckCircle, Wallet, Globe } from 'lucide-react';
import { db } from '../services/db';

const Payment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(200);
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Mynita' | 'Amanata'>('Mynita');
  const [loading, setLoading] = useState(false);
  const [waitingValidation, setWaitingValidation] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    db.getSettings().then(s => setAmount(s.consultationPrice));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    try {
        // Initie la transaction en base pour avoir une référence et stocker la méthode
        const result = await db.initiateTransaction(paymentMethod, phone);
        
        if (result.success && result.paymentUrl) {
             setPaymentUrl(result.paymentUrl);
             // Ouverture dans un nouvel onglet
             window.open(result.paymentUrl, '_blank');
             // On passe en mode "Attente de validation manuelle"
             setWaitingValidation(true);
        } else {
             alert("Erreur lors de l'initialisation du paiement.");
        }
        setLoading(false);
    } catch (error) {
        console.error(error);
        alert("Une erreur inattendue est survenue.");
        setLoading(false);
    }
  };

  const handleManualValidation = async () => {
      setLoading(true);
      // Simulation de la validation réussie côté serveur
      await db.forceValidatePayment(phone);
      // Redirection immédiate
      navigate('/search');
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

        {!waitingValidation ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              
              <div className="rounded-md shadow-sm space-y-4">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Moyen de Paiement
                   </label>
                   <div className="grid grid-cols-2 gap-4">
                       <button
                         type="button"
                         onClick={() => setPaymentMethod('Mynita')}
                         className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                             paymentMethod === 'Mynita' 
                             ? 'border-brand-600 bg-brand-50 dark:bg-gray-700' 
                             : 'border-gray-200 hover:border-brand-300 dark:border-gray-600'
                         }`}
                       >
                           <Wallet className={`w-8 h-8 mb-2 ${paymentMethod === 'Mynita' ? 'text-brand-600' : 'text-gray-400'}`} />
                           <span className={`font-bold ${paymentMethod === 'Mynita' ? 'text-brand-700' : 'text-gray-500'}`}>Mynita</span>
                           <span className="text-xs text-gray-400">Moov Money</span>
                       </button>

                       <button
                         type="button"
                         onClick={() => setPaymentMethod('Amanata')}
                         className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                             paymentMethod === 'Amanata' 
                             ? 'border-red-600 bg-red-50 dark:bg-gray-700' 
                             : 'border-gray-200 hover:border-red-300 dark:border-gray-600'
                         }`}
                       >
                           <Wallet className={`w-8 h-8 mb-2 ${paymentMethod === 'Amanata' ? 'text-red-600' : 'text-gray-400'}`} />
                           <span className={`font-bold ${paymentMethod === 'Amanata' ? 'text-red-700' : 'text-gray-500'}`}>Amanata</span>
                           <span className="text-xs text-gray-400">Airtel Money</span>
                       </button>
                   </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start">
                 <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                 <p className="text-sm text-blue-700 dark:text-blue-300">
                    Une nouvelle page sécurisée va s'ouvrir pour finaliser le paiement via <strong>iPay</strong> ({paymentMethod}).
                 </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Ouverture...' : `Payer ${amount} FCFA avec iPay`}
                {!loading && <ExternalLink className="ml-2 w-5 h-5" />}
              </button>
            </form>
        ) : (
            <div className="mt-8 space-y-6 animate-fade-in">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md text-center">
                    <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                        Le lien de paiement est ouvert.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Si le paiement a été effectué avec succès, cliquez ci-dessous pour accéder immédiatement aux numéros.
                    </p>
                </div>

                {paymentUrl && (
                    <a 
                        href={paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-md text-brand-600 hover:bg-gray-50 font-medium mb-4"
                    >
                        <Globe className="w-4 h-4 mr-2" />
                        Le lien ne s'est pas ouvert ? Cliquez ici pour payer
                    </a>
                )}

                <button
                    onClick={handleManualValidation}
                    disabled={loading}
                    className="w-full flex items-center justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none shadow-lg transform hover:scale-105 transition-all"
                >
                    {loading ? 'Validation...' : 'C\'est bon, j\'ai payé !'}
                    {!loading && <CheckCircle className="ml-2 w-6 h-6" />}
                </button>
                
                <button 
                    onClick={() => setWaitingValidation(false)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                >
                    Modifier mes informations
                </button>
            </div>
        )}
        
        <p className="text-xs text-center text-gray-400 mt-4">
            En continuant, vous acceptez nos conditions générales d'utilisation.
        </p>
      </div>
    </div>
  );
};

export default Payment;
