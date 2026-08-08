import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const contactChannels = [
  {
    id: 1,
    name: 'Téléphone',
    description: '+224 623 09 07 41',
    availability: 'Lun-Ven, 8h-18h',
    icon: Phone,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    action: () => window.location.href = 'tel:+224623090741'
  },
  {
    id: 2,
    name: 'Email',
    description: 'support@takataka.gn',
    availability: 'Réponse sous 24h',
    icon: Mail,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    action: () => window.location.href = 'mailto:support@takataka.gn'
  },
  {
    id: 3,
    name: 'Chat en direct',
    description: 'Disponible 24/7',
    availability: 'Dans l\'application',
    icon: MessageCircle,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    action: () => toast('Le chat en direct est en cours de maintenance. Veuillez utiliser le formulaire ou l\'email.', { icon: 'ℹ️' })
  },
];

const ContactChannelsCard = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('support.other_channels')}</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('support.other_channels_subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {contactChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <motion.div
                key={channel.id}
                whileHover={{ y: -2 }}
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
                onClick={channel.action}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${channel.bgColor} rounded-full flex items-center justify-center mr-4`}>
                    <Icon className={`w-6 h-6 ${channel.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                      {channel.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">
                      {channel.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {channel.availability}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactChannelsCard;
