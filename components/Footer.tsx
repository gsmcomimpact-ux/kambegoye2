import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">KAMBEGOYE</h3>
            <p className="text-gray-400">
              La référence pour trouver des artisans qualifiés à Niamey.
              Qualité, confiance et proximité.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Utiles</h3>
            <ul className="space-y-2">
              <li><Link to="/search" className="text-gray-400 hover:text-white">Trouver un ouvrier</Link></li>
              <li><Link to="/admin/login" className="text-gray-400 hover:text-white">Espace Professionnel</Link></li>
              <li><Link to="/cgu" className="text-gray-400 hover:text-white">Conditions Générales (CGU)</Link></li>
              <li><Link to="/mentions-legales" className="text-gray-400 hover:text-white">Mentions Légales</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">Siège social : Quartier Poudrière, Niamey</p>
            <a 
              href="https://wa.me/22797390569" 
              target="_blank" 
              rel="noreferrer"
              className="text-gray-400 hover:text-green-400 flex items-center gap-2 mt-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp : +227 97 39 05 69
            </a>
            <p className="text-gray-400 mt-2">Email : contact@kambegoye.com</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} KAMBEGOYE. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;