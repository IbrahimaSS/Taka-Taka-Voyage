import { Hash, Gift, Users } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';

const CouponStatsCards = ({ coupons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Codes</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{coupons.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Hash className="text-blue-500 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Codes Actifs</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {coupons.filter(c => c.statut === 'ACTIF').length}
              </h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Gift className="text-green-500 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-orange-500">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Utilisations Totales</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {coupons.reduce((acc, curr) => acc + (curr.utilisationsActuelles || 0), 0)}
              </h3>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <Users className="text-orange-500 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponStatsCards;
