import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

const PaymentSimulation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);

  const amount = searchParams.get('amount');
  const method = searchParams.get('method');
  const phone = searchParams.get('phone');
  const ref = searchParams.get('ref');

  const handleConfirm = () => {
      setProcessing(true);
      setTimeout(() => {
        // Mocking the success state in session so validation passes on callback
        sessionStorage.setItem(`sim_status_${ref}`, 'success');
        navigate(`/payment/callback?ref=${ref}`);
      }, 2000);
  };

  const handleCancel = () => {
      sessionStorage.setItem(`sim_status_${ref}`, 'failed');
      navigate('/payment?error=cancel');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
       <div className="bg-white max-w-sm w-full rounded-lg shadow-2xl overflow-hidden border-t-8 border-blue-600">
          <div className="p-6 text-center border-b border-gray-200">
             <h1 className="text-2xl font-black text-gray-800 italic">i-pay<span className="text-blue-600">.money</span></h1>
             <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Passerelle de Paiement Sécurisée</p>
          </div>
          
          <div className="p-6 space-y-4">
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Marchand</span>
                 <span className="font-semibold">KAMBEGOYE</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Montant</span>
                 <span className="font-bold text-xl text-blue-600">{amount} FCFA</span>
             </div>
             <div className="bg-gray-50 p-3 rounded text-sm flex justify-between">
                 <span>Compte {method}</span>
                 <span className="font-mono">{phone}</span>
             </div>

             <div className="mt-6">
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Entrez votre code PIN (Simulation)</label>
                 <div className="flex items-center border rounded bg-white p-2">
                     <Lock className="w-4 h-4 text-gray-400 mr-2" />
                     <input 
                       type="password" 
                       className="w-full outline-none"
                       placeholder="****"
                       maxLength={4}
                       value={pin}
                       onChange={e => setPin(e.target.value)}
                     />
                 </div>
                 <p className="text-xs text-gray-400 mt-1">Tapez n'importe quel code pour la démo.</p>
             </div>
          </div>

          <div className="p-6 bg-gray-50 flex gap-3">
             <button 
                onClick={handleCancel}
                className="flex-1 py-3 text-sm font-bold text-red-600 border border-red-200 bg-white rounded hover:bg-red-50"
             >
                 ANNULER
             </button>
             <button 
                onClick={handleConfirm}
                disabled={processing || pin.length < 1}
                className="flex-1 py-3 text-sm font-bold text-white bg-green-500 rounded hover:bg-green-600 shadow-lg disabled:opacity-50 disabled:shadow-none flex justify-center"
             >
                 {processing ? 'VALIDATION...' : 'CONFIRMER'}
             </button>
          </div>
          
          <div className="py-2 text-center bg-gray-200 text-xs text-gray-500 flex justify-center items-center">
             <ShieldCheck className="w-3 h-3 mr-1" /> Paiement chiffré SSL 256-bit
          </div>
       </div>
    </div>
  );
};

export default PaymentSimulation;