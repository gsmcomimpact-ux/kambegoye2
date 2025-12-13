import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, FileJson, Trash2, RefreshCw, Database } from 'lucide-react';
import { db } from '../../services/db';

const DataManagement = () => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [purgeStatus, setPurgeStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleExport = async () => {
    const data = await db.exportData();
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `kambegoye_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const parsedData = JSON.parse(e.target.result as string);
            const success = await db.importData(parsedData);
            if (success) {
              setImportStatus('success');
              setMessage('Données importées avec succès ! La page va se recharger.');
              setTimeout(() => window.location.reload(), 2000);
            } else {
              setImportStatus('error');
              setMessage('Erreur lors de la sauvegarde des données.');
            }
          } catch (err) {
            setImportStatus('error');
            setMessage('Fichier JSON invalide.');
          }
        }
      };
    }
  };

  const handleClearTransactions = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUT l'historique des transactions ? Cette action est irréversible.")) {
      setPurgeStatus('processing');
      await db.clearTransactions();
      setPurgeStatus('success');
      setMessage('Historique des transactions effacé.');
      setTimeout(() => setPurgeStatus('idle'), 3000);
    }
  };

  const handleFactoryReset = async () => {
    if (window.confirm("ATTENTION : Cette action va effacer tous les ouvriers ajoutés, les modifications et remettre la base de données à zéro (données de démonstration). Êtes-vous sûr ?")) {
      setPurgeStatus('processing');
      await db.resetDatabase();
      setPurgeStatus('success');
      setMessage('Base de données réinitialisée aux valeurs par défaut.');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleSeedDatabase = async () => {
      if (window.confirm("Voulez-vous générer 50+ ouvriers et transactions fictifs pour tester l'application ?")) {
          setPurgeStatus('processing');
          await db.seedDatabase();
          setPurgeStatus('success');
          setMessage('Base de données peuplée avec succès ! La page va se recharger.');
          setTimeout(() => window.location.reload(), 1500);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gestion des Données</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Export Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Exporter les données</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Téléchargez une sauvegarde complète de la base de données (Ouvriers, Transactions, Spécialités) au format JSON.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger la sauvegarde
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Importer des données</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Restaurez une sauvegarde ou importez de nouvelles données en téléversant un fichier JSON valide.
              <br />
              <span className="text-red-500 text-xs font-bold">Attention : Cela écrasera les données actuelles.</span>
            </p>
            
            <label className="w-full flex flex-col items-center px-4 py-4 bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-brand-50 dark:hover:bg-gray-600">
                <FileJson className="w-8 h-8" />
                <span className="mt-2 text-base leading-normal">Sélectionner un fichier JSON</span>
                <input type='file' accept=".json" className="hidden" onChange={handleImport} />
            </label>

            {importStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-md flex items-center text-sm ${
                importStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {importStatus === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Tools */}
      <div className="border border-indigo-200 rounded-lg overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 border-b border-indigo-200">
           <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 flex items-center">
             <Database className="w-5 h-5 mr-2" />
             Outils de Base de Données
           </h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
               Utilisez cet outil pour peupler votre base de données locale avec des données fictives réalistes (Ouvriers, Transactions) pour tester l'affichage.
            </p>
            <button 
              onClick={handleSeedDatabase}
              disabled={purgeStatus === 'processing'}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              Générer 50 Ouvriers & Transactions (Seed)
            </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Zone de Danger
          </h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ces actions sont destructrices et irréversibles.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <button 
              onClick={handleClearTransactions}
              disabled={purgeStatus === 'processing'}
              className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Vider l'historique des transactions
            </button>
            
            <button 
              onClick={handleFactoryReset}
              disabled={purgeStatus === 'processing'}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser toute la plateforme
            </button>
          </div>

          {purgeStatus === 'success' && (
             <div className="p-3 bg-green-100 text-green-800 rounded-md flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2" /> {message}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;