import { useTranslation } from 'react-i18next';
import { Clock, MessageSquare, Handshake, Star } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const TravelTipsCard = () => {
  const { t } = useTranslation();

  const tips = [
    { icon: Clock, title: t('evaluations.tips.punctual_title'), description: t('evaluations.tips.punctual_desc') },
    { icon: MessageSquare, title: t('evaluations.tips.communication_title'), description: t('evaluations.tips.communication_desc') },
    { icon: Handshake, title: t('evaluations.tips.respectful_title'), description: t('evaluations.tips.respectful_desc') },
    { icon: Star, title: t('evaluations.tips.objective_title'), description: t('evaluations.tips.objective_desc') }
  ];

  return (
    <Card>
      <CardHeader><CardTitle>{t('evaluations.travel_tips')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{tip.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelTipsCard;
