import React from 'react';
import { MessageCircle } from 'lucide-react';

const Mentions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Mentions Légales</h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Éditeur du site</h3>
          <p className="text-gray-600 dark:text-gray-400">KAMBEGOYE SARL</p>
          <p className="text-gray-600 dark:text-gray-400">Siège social : Quartier Poudrière, Niamey, Niger</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact</h3>
          <div className="flex flex-col gap-2 mt-2">
            <a 
              href="https://wa.me/22797390569" 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center w-fit"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp / Téléphone : +227 97 39 05 69
            </a>
            <p className="text-gray-600 dark:text-gray-400">Email : contact@kambegoye.com</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hébergement</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Ce site est hébergé par Vercel Inc.<br/>
            340 S Lemon Ave #4133 Walnut, CA 91789, USA
          </p>
        </div>
      </div>
    </div>
  );
};

export default Mentions;