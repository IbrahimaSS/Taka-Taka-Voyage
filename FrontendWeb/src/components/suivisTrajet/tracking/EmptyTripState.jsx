import { Car } from 'lucide-react';

const EmptyTripState = ({ onBack }) => (
  <div className="min-h-screen mt-4  bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucun trajet en cours</h2>
      <p className="text-gray-600 mb-6">Commencez un nouveau trajet pour utiliser le suivi en temps réel</p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium hover:opacity-90"
      >
        Retour à l'accueil
      </button>
    </div>
  </div>
);

export default EmptyTripState;
