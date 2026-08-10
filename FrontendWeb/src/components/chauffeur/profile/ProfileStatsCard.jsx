import { Radar, TrendingUp, Star, Clock } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Progress from '../../admin/ui/Progress';

// Classes Tailwind statiques et completes (indispensable : les classes
// construites dynamiquement via template string, ex. `bg-${color}-500/10`,
// ne sont pas detectees par le scanner JIT de Tailwind et disparaissent du
// CSS compile - verifie : bg-*-500/10 etait absent du bundle de production)
const COLOR_CLASSES = {
    green: { iconBg: 'bg-green-500/10', iconText: 'text-green-600 dark:text-green-400' },
    blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-600 dark:text-blue-400' },
    yellow: { iconBg: 'bg-yellow-500/10', iconText: 'text-yellow-600 dark:text-yellow-400' },
    purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-600 dark:text-purple-400' },
};

const ProfileStatsCard = ({ realStats }) => {
    const stats = [
        {
            label: 'Trajets complétés',
            value: realStats.trajetsCompletes.toLocaleString(),
            icon: Radar,
            color: 'green',
            progress: Math.min(100, (realStats.trajetsCompletes / 500) * 100) // Progress relative à 500 trajets
        },
        {
            label: 'Revenus totaux',
            value: `${realStats.revenusTotaux.toLocaleString()} GNF`,
            icon: TrendingUp,
            color: 'blue',
            progress: Math.min(100, (realStats.revenusTotaux / 5000000) * 100) // Progress relative à 5M GNF
        },
        {
            label: 'Note Chauffeur',
            value: realStats.noteMoyenne.toFixed(1),
            icon: Star,
            color: 'yellow',
            progress: (realStats.noteMoyenne / 5) * 100
        },
        {
            label: 'Heures en ligne',
            value: `${realStats.heuresEnLigne.toLocaleString()}h`,
            icon: Clock,
            color: 'purple',
            progress: Math.min(100, (realStats.heuresEnLigne / 1000) * 100)
        },
    ];

    return (
        <Card className="surface border-none shadow-lg">
            <CardHeader><CardTitle>Indicateurs Clés</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {stats.map((stat, index) => {
                        const colorClasses = COLOR_CLASSES[stat.color];
                        return (
                            <div key={index} className="space-y-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{stat.value}</p>
                                    </div>
                                    <div className={`p-2.5 rounded-xl shrink-0 ${colorClasses.iconBg}`}>
                                        <stat.icon className={`w-5 h-5 ${colorClasses.iconText}`} />
                                    </div>
                                </div>
                                <Progress
                                    value={stat.progress}
                                    className="progress-fill dark:bg-gray-700"
                                    showLabel={false}
                                    animated={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileStatsCard;
