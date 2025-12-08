
import React, { useState, useEffect } from 'react';
import { Save, Lock, DollarSign, AlertCircle, CheckCircle, MessageCircle, Send, Phone } from 'lucide-react';
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

  // Messaging State
  const [msgPhone, setMsgPhone] = useState('');
  const [msgContent, setMsgContent] = useState('');

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgPhone || !msgContent) return;

    // Remove any non-digit characters for the link
    const cleanPhone = msgPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgContent)}`;
    window.open(whatsappUrl, '_blank');
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

      {/* WhatsApp Messaging Form (Replaces Test Button) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-3">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Messagerie WhatsApp</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Envoyez un message direct à un ouvrier ou un client. Cela ouvrira l'application WhatsApp.
        </p>

        <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro du destinataire
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 22790000000"
                  value={msgPhone}
                  onChange={(e) => setMsgPhone(e.target.value)}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                placeholder="Votre message ici..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 p-2.5 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-md transition-colors font-medium shadow-sm"
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer sur WhatsApp
            </button>
        </form>
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
