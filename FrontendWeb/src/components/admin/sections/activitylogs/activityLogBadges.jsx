import { Lock, LogIn, User, MapPin, CreditCard, Shield, Globe, History } from 'lucide-react';

export const getModuleBadge = (module) => {
  const styles = {
    AUTH: { color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400', icon: Lock },
    CONNEXION: { color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400', icon: LogIn },
    UTILISATEURS: { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', icon: User },
    TRAJETS: { color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', icon: MapPin },
    PAIEMENTS: { color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', icon: CreditCard },
    PROFIL: { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', icon: User },
    SYSTEME: { color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400', icon: Shield },
    SUPPORT: { color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400', icon: Globe }
  };

  const config = styles[module] || { color: 'bg-slate-50 text-slate-600', icon: History };
  const IconComponent = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${config.color}`}>
      <IconComponent size={12} />
      {module}
    </span>
  );
};
