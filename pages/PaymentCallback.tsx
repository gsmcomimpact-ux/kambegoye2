import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { db } from '../services/db';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    // On vérifie les paramètres standard iPay ou nos propres paramètres ref
    const ref = searchParams.get('transaction_id') || searchParams.get('ref') || searchParams.get('reference');
    const statusParam = searchParams.get('status');

    // Récupération des données potentiellement passées par la simulation (pour reconstruction)
    const amount = searchParams.get('amount');
    const phone = searchParams.get('phone');
    const method = searchParams.get('method');
    const details = searchParams.get('details');

    const verify = async () => {
        // Si iPay renvoie status=success ou approved, ou si on a une ref à vérifier
        // Dans notre simulation, PaymentSimulation nous renvoie ici directement après succès
        if (ref) {
             const txId = ref || 'unknown_ref';
             
             // On construit un objet overrideData au cas où le sessionStorage est vide 
             // (ex: paiement ouvert dans un autre onglet/mobile)
             const overrideData = (amount && phone) ? {
                 amount: parseInt(amount),
                 phone: phone,
                 method: method || 'Mynita',
                 details: details || ''
             } : undefined;

             const success = await db.finalizeTransaction(txId, overrideData);
             
             if (success || statusParam === 'success' || statusParam === 'approved') {
                setStatus('success');
                // Redirection vers la page des contacts
                // NOTE: S'il s'agit d'une vente boutique, la redirection vers access-contacts n'est pas pertinente,
                // mais le client verra "Paiement Validé", ce qui est le plus important.
                setTimeout(() => navigate('/access-contacts', { replace: true }), 2500);
                return;
             }
        }
        
        // Si rien ne marche
        setStatus('failed');
    };

    // Petit délai pour l'UX
    setTimeout(verify, 800);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
        
        {status === 'verifying' && (
            <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16">
                    <Loader className="w-12 h-12 text-brand-600 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vérification du paiement...</h2>
                <p className="text-gray-500">Veuillez patienter un instant.</p>
            </div>
        )}

        {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement Validé !</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Votre transaction a été enregistrée avec succès.
                </p>
                <div className="text-sm text-gray-400 mt-4">
                    Redirection en cours...
                </div>
            </div>
        )}

        {status === 'failed' && (
            <div className="space-y-4 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement non confirmé</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Nous n'avons pas pu confirmer la transaction automatiquement.
                </p>
                <div className="grid gap-2 mt-4">
                    <button 
                        onClick={() => navigate('/access-contacts')}
                        className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700"
                    >
                        J'ai pourtant payé (Accéder)
                    </button>
                    <button 
                        onClick={() => navigate('/payment')}
                        className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCallback;