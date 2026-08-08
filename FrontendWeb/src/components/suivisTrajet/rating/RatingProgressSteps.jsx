import { Check } from 'lucide-react';

const RatingProgressSteps = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-3 sm:gap-8 mb-4">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Trajet terminé</span>
        </div>
        <div className="h-1 w-8 sm:w-16 bg-green-500" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Paiement</span>
        </div>
        <div className="h-1 w-8 sm:w-16 bg-green-500" />
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
            <span className="text-sm font-bold">3</span>
          </div>
          <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium mt-2 text-center">Évaluation</span>
        </div>
      </div>
    </div>
  );
};

export default RatingProgressSteps;
