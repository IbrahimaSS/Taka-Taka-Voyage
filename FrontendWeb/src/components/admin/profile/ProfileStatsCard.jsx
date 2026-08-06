import { User, Shield, Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

const ProfileStatsCard = ({ stats }) => {
  const items = [
    { label: 'Actions aujourd\'hui', value: stats.actions, icon: User, color: 'green' },
    { label: 'Validations en attente', value: stats.validations, icon: Shield, color: 'blue' },
    { label: 'Notifications', value: stats.notifications, icon: Bell, color: 'purple' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}-500`} />
                </div>
                <span className="text-gray-700 dark:text-gray-200">{stat.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStatsCard;
