import { Activity } from 'lucide-react';

const DriverStatCard = ({ icon: Icon, iconBg, iconColor, badgeBg, badgeColor, badge, value, label, showActivityIcon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4 gap-2">
            <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className={`text-xs px-2 py-1 rounded-full shrink-0 ${badgeBg} ${badgeColor}`}>
                {showActivityIcon && <Activity className="w-3 h-3 inline-block mr-1" />}
                {badge}
            </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1 dark:text-white truncate">{value}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

export default DriverStatCard;
