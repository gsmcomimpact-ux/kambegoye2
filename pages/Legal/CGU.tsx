

import React from 'react';

const CGU = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Conditions Générales d'Utilisation (CGU)</h1>
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Objet</h2>
          <p>
            Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services du site KAMBEGOYE, 
            permettant la mise en relation entre des particuliers (Clients) et des professionnels du bâtiment (Ouvriers) à Niamey.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Responsabilités</h2>
          <p>
            KAMBEGOYE agit uniquement en tant qu'intermédiaire. Nous ne sommes pas responsables de la qualité des travaux réalisés, 
            des délais, ou des litiges pouvant survenir entre le client et l'ouvrier. Il appartient au client de vérifier les 
            compétences de l'ouvrier avant le début des travaux.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Paiement</h2>
          <p>
            L'accès aux coordonnées complètes des ouvriers nécessite un paiement forfaitaire de 100 FCFA via Mobile Money. 
            Ce paiement donne accès à une liste de contacts pour une durée limitée. Ce montant est non remboursable, même si 
            l'utilisateur ne conclut aucun contrat avec les ouvriers proposés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Données Personnelles</h2>
          <p>
            Les données collectées (numéro de téléphone, localisation) sont utilisées uniquement pour le fonctionnement du service. 
            Conformément à la réglementation, vous disposez d'un droit d'accès et de suppression de vos données sur simple demande à 
            notre support.
          </p>
        </section>

         <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">5. Sécurité</h2>
          <p>
            Les pièces d'identité des ouvriers "Vérifiés" sont stockées de manière sécurisée et ne sont jamais partagées publiquement.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CGU;