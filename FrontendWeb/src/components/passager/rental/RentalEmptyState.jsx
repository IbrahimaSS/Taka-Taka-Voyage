import { History } from 'lucide-react';
import Button from '../../admin/ui/Bttn';

const RentalEmptyState = () => (
  <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-xl">
    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
      <History className="w-12 h-12 text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune location trouvée</h3>
    <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">Vous n'avez pas encore effectué de location de véhicule sur TakaTaka.</p>
    <Button variant="primary" size="large" className="px-8 shadow-lg shadow-emerald-500/30">
      Louer un véhicule maintenant
    </Button>
  </div>
);

export default RentalEmptyState;
