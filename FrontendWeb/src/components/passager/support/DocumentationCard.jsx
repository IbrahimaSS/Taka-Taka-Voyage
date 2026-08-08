import { useTranslation } from 'react-i18next';
import { FileText, FileDown, HelpCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const documentation = [
  {
    id: 1,
    title: "Guide d'utilisation",
    description: "Apprenez à utiliser toutes les fonctionnalités",
    icon: FileText,
    action: () => window.open('/guides/utilisation.pdf', '_blank')
  },
  {
    id: 2,
    title: "Politique de sécurité",
    description: "Comment nous protégeons vos données",
    icon: FileDown,
    action: () => window.open('/policies/securite.pdf', '_blank')
  },
  {
    id: 3,
    title: "Conditions d'utilisation",
    description: "Règles et conditions du service",
    icon: FileText,
    action: () => window.open('/policies/conditions.pdf', '_blank')
  },
  {
    id: 4,
    title: "FAQ complète",
    description: "Toutes les questions fréquentes",
    icon: HelpCircle,
    action: () => window.open('/faq', '_blank')
  }
];

const DocumentationCard = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('support.documentation')}</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('support.documentation_subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {documentation.map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors text-left"
                onClick={doc.action}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 shrink-0">
                  <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {doc.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {doc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationCard;
