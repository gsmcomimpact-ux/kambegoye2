
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { db } from '../services/db';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    // We check for 'transaction_id' (standard) or 'ref' (our previous logic)
    const ref = searchParams.get('transaction_id') || searchParams.get('ref') || searchParams.get('reference');
    
    if (!ref) {
        console.warn("No reference found in callback");
    }

    const verify = async () => {
        // If we have a ref, try to verify it
        if (ref) {
             const success = await db.finalizeTransaction(ref);
             if (success) {
                setStatus('success');
                // Redirect almost immediately to show workers
                setTimeout(() => navigate('/search', { replace: true }), 1500);
                return;
             }
        }
        
        // If finalize failed or no ref, mark as failed
        setStatus('failed');
    };

    // Fast verification start
    setTimeout(verify, 500);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
        
        {status === 'verifying' && (
            <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                    <Loader className="w-12 h-12 text-brand-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Validation en cours...</h2>
                <p className="text-gray-500">Veuillez patienter.</p>
            </div>
        )}

        {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement Réussi !</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Redirection vers les ouvriers...
                </p>
            </div>
        )}

        {status === 'failed' && (
            <div className="space-y-4 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Échec du Paiement</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    La transaction n'a pas pu être validée.
                </p>
                <button 
                    onClick={() => navigate('/payment')}
                    className="mt-4 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900"
                >
                    Réessayer
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCallback;
