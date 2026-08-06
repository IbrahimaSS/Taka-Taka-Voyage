import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Key, Calendar, Power } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Card, { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import Button from '../../ui/Bttn';
import { getStatusBadge } from './couponHelpers';

const CouponsTable = ({ coupons, loading, onToggleStatut, onCreateClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Codes Promotionnels Récents</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Gift className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Aucun code promo créé pour le moment.</p>
            <Button variant="outline" className="mt-4" onClick={onCreateClick}>Créer le premier code</Button>
          </div>
        ) : isMobile ? (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg mr-3">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white font-mono tracking-wide">{coupon.code}</p>
                      {coupon.conditions?.montantMinimumCourse > 0 && (
                        <p className="text-xs text-gray-500">Min. {coupon.conditions.montantMinimumCourse} GNF</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(coupon.statut)}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {coupon.typeReduction === 'POURCENTAGE'
                      ? <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">{coupon.valeur}%</span>
                      : <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">{coupon.valeur} GNF</span>
                    }
                  </p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 opacity-50" />
                    {format(new Date(coupon.dateExpiration), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                      <div
                        className={`h-2.5 rounded-full ${coupon.utilisationsActuelles >= (coupon.limiteUtilisationsGlobales || 9999) ? 'bg-red-500' : 'bg-primary-600'}`}
                        style={{ width: `${coupon.limiteUtilisationsGlobales ? Math.min((coupon.utilisationsActuelles / coupon.limiteUtilisationsGlobales) * 100, 100) : 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {coupon.utilisationsActuelles} {coupon.limiteUtilisationsGlobales ? `/ ${coupon.limiteUtilisationsGlobales}` : ''}
                    </span>
                  </div>
                  {coupon.statut !== 'EXPIRE' && (
                    <button
                      onClick={() => onToggleStatut(coupon._id, coupon.statut)}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl transition ${coupon.statut === 'ACTIF'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                        }`}
                      title={coupon.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-4 font-semibold">Code Promo</th>
                  <th className="py-4 px-4 font-semibold">Réduction</th>
                  <th className="py-4 px-4 font-semibold">Expiration</th>
                  <th className="py-4 px-4 font-semibold">Utilisations</th>
                  <th className="py-4 px-4 font-semibold text-center">Statut</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {coupons.map((coupon) => (
                  <motion.tr
                    key={coupon._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg mr-3">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white font-mono tracking-wide">{coupon.code}</p>
                          {coupon.conditions?.montantMinimumCourse > 0 && (
                            <p className="text-xs text-gray-500">Min. {coupon.conditions.montantMinimumCourse} GNF</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {coupon.typeReduction === 'POURCENTAGE'
                          ? <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">{coupon.valeur}%</span>
                          : <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">{coupon.valeur} GNF</span>
                        }
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 mr-2 opacity-50" />
                        {format(new Date(coupon.dateExpiration), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div
                            className={`h-2.5 rounded-full ${coupon.utilisationsActuelles >= (coupon.limiteUtilisationsGlobales || 9999) ? 'bg-red-500' : 'bg-primary-600'}`}
                            style={{ width: `${coupon.limiteUtilisationsGlobales ? Math.min((coupon.utilisationsActuelles / coupon.limiteUtilisationsGlobales) * 100, 100) : 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {coupon.utilisationsActuelles} {coupon.limiteUtilisationsGlobales ? `/ ${coupon.limiteUtilisationsGlobales}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(coupon.statut)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {coupon.statut !== 'EXPIRE' && (
                        <button
                          onClick={() => onToggleStatut(coupon._id, coupon.statut)}
                          className={`w-11 h-11 inline-flex items-center justify-center rounded-xl transition ${coupon.statut === 'ACTIF'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                            }`}
                          title={coupon.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponsTable;
