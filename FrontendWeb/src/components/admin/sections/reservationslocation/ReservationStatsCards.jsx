import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

const ReservationStatsCards = ({ reservations, nbEnAttente }) => {
  const stats = [
    { label: 'Total', value: reservations.length, color: 'bg-blue-500', icon: Calendar },
    { label: 'En attente', value: nbEnAttente, color: 'bg-yellow-500', icon: Clock },
    { label: 'Approuvées', value: reservations.filter(r => r.statut === 'APPROUVÉE' || r.statut === 'EN_COURS').length, color: 'bg-green-500', icon: CheckCircle2 },
    { label: 'Refusées', value: reservations.filter(r => r.statut === 'ANNULÉE').length, color: 'bg-red-500', icon: XCircle },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
          <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservationStatsCards;
