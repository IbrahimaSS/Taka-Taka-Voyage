import { Car } from 'lucide-react';
import { cn } from '../../../../utils/cn';

const SidebarLogo = ({ compact = false, platform, title, t }) => (
  <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-sm overflow-hidden">
      {platform.logo ? (
        <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
      ) : (
        <Car className="h-7 w-7 text-white" />
      )}
    </div>
    {!compact && (
      <div className="leading-tight min-w-0 flex-1">
        <div className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
          {platform.name || 'Taka Taka'}
        </div>
        <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 uppercase">
          {t(`nav.${title.toLowerCase()}`, title)}
        </div>
      </div>
    )}
  </div>
);

export default SidebarLogo;
