import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';

const SecurityHeader = ({ onCheckSecurity }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('security.security_center') || 'Centre de sécurité'}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('security.security_center_desc') || 'Configurez et surveillez la sécurité de votre plateforme'}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">87%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('security.security_score') || 'Score de sécurité'}</div>
            </div>
            <Button
              variant="primary"
              className="bg-gradient-to-r from-blue-700 to-teal-700"
              icon={Shield}
              onClick={onCheckSecurity}
            >
              {t('security.check_security') || 'Vérifier la sécurité'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityHeader;
