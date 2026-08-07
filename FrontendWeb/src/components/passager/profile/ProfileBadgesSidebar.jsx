import { useTranslation } from 'react-i18next';
import { Crown, Award, Star, Clock, Users } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Badge from '../../admin/ui/Badge';
import Button from '../../admin/ui/Bttn';

const ProfileBadgesSidebar = () => {
  const { t } = useTranslation();

  const badges = [
    { id: 1, name: t('profile.badges.gold_member'), icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', earned: true },
    { id: 2, name: t('profile.badges.trips_10'), icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 3, name: t('profile.badges.rating_5'), icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', earned: true },
    { id: 4, name: t('profile.badges.fast'), icon: Clock, color: 'text-red-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 5, name: t('profile.badges.loyal'), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', earned: false },
    { id: 6, name: t('profile.badges.vip'), icon: Award, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', earned: false },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>{t('profile.badges.title')}</CardTitle>
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="sm">
            {t('profile.badges.obtained', { count: 4, total: 10 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`text-center p-3 ${!badge.earned && 'opacity-50'}`}
              >
                <div className={`w-16 h-16 rounded-full ${badge.bgColor} dark:bg-opacity-20 flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                  <Icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{badge.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{badge.earned ? t('profile.badges.status_obtained') : t('profile.badges.status_to_earn')}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" fullWidth>
          {t('profile.badges.view_all')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileBadgesSidebar;
