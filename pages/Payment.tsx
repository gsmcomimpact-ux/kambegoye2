
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Smartphone, ChevronRight, AlertCircle } from 'lucide-react';
import { db } from '../services/db';

const Payment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(200);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'Mynita' | 'Amanata'>('Mynita');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    db.getSettings().then(s => setAmount(s.consultationPrice));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);

    try {
        // Calls the DB service which handles API call or falls back to Simulation
        const result = await db.initiateTransaction(method, phone);
        
        if (result.success && result.paymentUrl) {
            // Check if it is an internal simulation URL or external API URL
            if (result.paymentUrl.startsWith('/')) {
                navigate(result.paymentUrl);
            } else {
                window.location.href = result.paymentUrl;
            }
        } else {
            alert('Erreur lors de l\'initialisation du paiement');
            setLoading(false);
        }
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
                   Numéro Mobile Money
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

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Choisir l'opérateur
             </label>
             <div className="grid grid-cols-2 gap-4">
                 <div 
                    onClick={() => setMethod('Mynita')}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${
                        method === 'Mynita' 
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
                    }`}
                 >
                     <div className="h-8 w-8 bg-orange-500 rounded-full mb-2 flex items-center justify-center text-white font-bold text-xs">M</div>
                     <span className="font-semibold text-gray-900 dark:text-white">Mynita</span>
                 </div>
                 <div 
                    onClick={() => setMethod('Amanata')}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${
                        method === 'Amanata' 
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'
                    }`}
                 >
                     <div className="h-8 w-8 bg-blue-500 rounded-full mb-2 flex items-center justify-center text-white font-bold text-xs">A</div>
                     <span className="font-semibold text-gray-900 dark:text-white">Amanata</span>
                 </div>
             </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start">
             <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
             <p className="text-sm text-blue-700 dark:text-blue-300">
                Vous serez redirigé vers une page sécurisée pour valider la transaction.
             </p>
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Initialisation...' : `Payer ${amount} FCFA`}
            {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
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
