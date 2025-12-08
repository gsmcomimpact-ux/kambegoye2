import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smartphone, Lock, AlertCircle, Loader, Info, ExternalLink } from 'lucide-react';
import { db } from '../services/db';

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [method, setMethod] = useState<'Mynita' | 'Amanata' | null>(null);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(200);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    db.getSettings().then(s => setAmount(s.consultationPrice));
    
    // Handle error return from gateway
    if (searchParams.get('error') === 'cancel') {
        setError("Vous avez annulé le paiement.");
    }
  }, [searchParams]);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !phone) {
      setError("Veuillez choisir une méthode et entrer votre numéro.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Initiate Payment: This now returns a URL to redirect to
      const result = await db.initiateTransaction(method, phone);
      
      if (result.success && result.paymentUrl) {
          // Redirect the user to the Payment Gateway (or simulation)
          console.log("Redirecting to:", result.paymentUrl);
          
          // If the URL is relative (simulation), use navigate. If absolute (real API), use window.location
          if (result.paymentUrl.startsWith('/')) {
              navigate(result.paymentUrl);
          } else {
              window.location.href = result.paymentUrl;
          }
      } else {
          setError("Impossible d'initialiser le paiement. Veuillez réessayer.");
          setLoading(false);
      }
    } catch (err) {
      setError("Erreur de connexion au service de paiement.");
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
            Débloquer les contacts
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Montant unique : <span className="font-bold text-accent-600 text-lg">{amount} FCFA</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleInitiatePayment}>
            <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                disabled={loading}
                onClick={() => setMethod('Amanata')}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
                method === 'Amanata' 
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                }`}
            >
                <span className="font-bold">Amanata</span>
            </button>
            <button
                type="button"
                disabled={loading}
                onClick={() => setMethod('Mynita')}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
                method === 'Mynita' 
                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300'
                }`}
            >
                <span className="font-bold">Mynita</span>
            </button>
            </div>

            <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Numéro de téléphone
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ex: 90000000"
                />
            </div>
            </div>

            {error && (
            <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
            </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    Vous allez être redirigé vers l'interface sécurisée de <strong>i-pay.money</strong> pour valider la transaction.
                </p>
            </div>

            <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all shadow-md"
            >
            {loading ? (
                <span className="flex items-center">
                <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Redirection en cours...
                </span>
            ) : (
                <span className="flex items-center font-bold text-lg">
                Payer {amount} F <ExternalLink className="ml-2 w-4 h-4" />
                </span>
            )}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;