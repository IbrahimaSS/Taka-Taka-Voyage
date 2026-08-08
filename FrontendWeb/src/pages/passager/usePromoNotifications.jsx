import { useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Gift, X } from 'lucide-react';
import socketService from '../../services/socketService';

// 🎁 Écoute des nouveaux Codes Promos et des changements de statut de géolocalisation en temps réel
export const usePromoNotifications = () => {
  useEffect(() => {
    const handleNewPromo = (promo) => {
      let differenceJours = 0;
      if (promo.dateExpiration) {
        differenceJours = differenceInDays(new Date(promo.dateExpiration), new Date());
      }

      const expireText = differenceJours > 0 ? `pendant ${differenceJours} jours` : `jusqu'à demain`;
      const valeurText = promo.typeReduction === 'POURCENTAGE' ? `${promo.valeur}%` : `${promo.valeur} GNF`;
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden border-2 border-primary-100 dark:border-primary-900 absolute bottom-4 left-4`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 shadow-inner flex items-center justify-center">
                    <Gift className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
                    Nouvelle Promo !!!
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    Bénéficiez de <span className="font-bold text-green-600 dark:text-green-400">{valeurText} de réduction</span> sur tous vos trajets {expireText} avec le code :
                  </p>
                  <div className="mt-3 text-2xl font-black tracking-[0.2em] text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 py-2.5 rounded-xl">
                    {promo.code}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Fermer</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        { duration: 6000, position: 'bottom-left' }
      );
    };

    const handleLocationStatusChange = (data) => {
      toast.success(data.message, {
        duration: 5000,
        position: 'top-center',
        icon: '🚗'
      });
    };

    if (socketService.socket) {
      socketService.on('promo:new', handleNewPromo);
      socketService.on('location:statut_change', handleLocationStatusChange);
    }

    return () => {
      if (socketService.socket) {
        socketService.off('promo:new', handleNewPromo);
        socketService.off('location:statut_change', handleLocationStatusChange);
      }
    };
  }, []);
};
