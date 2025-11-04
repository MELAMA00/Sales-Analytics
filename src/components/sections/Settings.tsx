import React from 'react';
import { Settings as SettingsIcon, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h2>
          <p className="text-gray-600 dark:text-slate-300">Cette application ne stocke aucune donnée.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mode sans sauvegarde</h3>
        </div>
        <p className="text-gray-700 dark:text-slate-200">
          Vos fichiers importés et les filtres restent uniquement en mémoire
          pendant la session du navigateur. En fermant ou en rechargeant la page,
          toutes les données sont perdues.
        </p>
        <ul className="list-disc ml-6 mt-4 text-gray-700 dark:text-slate-200">
          <li>Aucun enregistrement dans le navigateur (pas de localStorage).</li>
          <li>Aucune synchronisation réseau.</li>
          <li>Export possible via téléchargement des rapports (images/PDF) si nécessaire.</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
