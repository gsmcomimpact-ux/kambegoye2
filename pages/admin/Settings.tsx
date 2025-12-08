
import React, { useState, useEffect } from 'react';
import { Save, Lock, DollarSign, AlertCircle, CheckCircle, MessageCircle, Send } from 'lucide-react';
import { db } from '../../services/db';

const Settings = () => {
  // Price State
  const [price, setPrice] = useState<number>(200);
  const [priceStatus, setPriceStatus] = useState<'idle' | 'success' | 'loading'>('idle');

  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    db.getSettings().then(s => setPrice(s.consultationPrice));
  }, []);

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPriceStatus('loading');
    await db.updateSettings({ consultationPrice: price });
    setPriceStatus('success');
    setTimeout(() => setPriceStatus('idle'), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 4) {
      setPasswordStatus('error');
      setPasswordMsg('Le mot de passe est trop court.');
      return;
    }

    await db.updateAdminPassword(password);
    setPasswordStatus('success');
    setPasswordMsg('Mot de passe mis à jour avec succès.');
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus('idle'), 3000);
  };

  const sendTestWhatsApp = () => {
    const phone = '22797390569';
    const message = encodeURIComponent("🔔 TEST SYSTEME KAMBEGOYE\nCeci est un message de vérification des notifications.");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Paramètres de la plateforme</h2>

      {/* Pricing Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2 bg-green-100 text-green-600 rounded-full mr-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coût de la consultation</h3>
        </div>
        
        <form onSubmit={handlePriceUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Montant par consultation (FCFA)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={priceStatus === 'loading'}
              className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {priceStatus === 'loading' ? 'Enregistrement...' : 'Mettre à jour le prix'}
            </button>
            {priceStatus === 'success' && (
              <span className="text-green-600 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Mis à jour !
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Notification Tests */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tests de Notification</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Vérifiez que le numéro administrateur (+227 97 39 05 69) est bien configuré pour recevoir les alertes.
        </p>

        <button
          onClick={sendTestWhatsApp}
          className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md transition-colors"
        >
          <Send className="w-4 h-4 mr-2" />
          Envoyer un message WhatsApp de test
        </button>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-full mr-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sécurité Admin</h3>
        </div>

        <form onSubmit={handlePasswordUpdate}>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="********"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="********"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Changer le mot de passe
            </button>
            {passwordStatus === 'success' && (
              <span className="text-green-600 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> {passwordMsg}
              </span>
            )}
            {passwordStatus === 'error' && (
              <span className="text-red-600 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> {passwordMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
