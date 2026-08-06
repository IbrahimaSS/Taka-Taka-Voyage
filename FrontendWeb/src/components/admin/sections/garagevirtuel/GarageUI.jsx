export const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
    <div className={`h-12 w-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
      <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

export const StatusBadge = ({ status }) => {
  const styles = {
    DISPONIBLE: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    EN_LOCATION: 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    MAINTENANCE: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
    RETIRE: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export const Field = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <input
      className="w-full border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-2 outline-none focus:border-primary-500 transition-colors text-slate-900 dark:text-white"
      {...props}
    />
  </div>
);

export const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
    </div>
    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{label}</span>
  </div>
);
