import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';

const faqs = [
  {
    id: 1,
    question: "Comment annuler un trajet ?",
    answer: "L'annulation est gratuite tant qu'aucun chauffeur n'a accepté la course. Une fois le chauffeur en route, des frais d'annulation de 5 000 GNF sont appliqués pour compenser son déplacement. Le reste de votre paiement est remboursé sur votre portefeuille TakaTaka.",
    category: "trajets"
  },
  {
    id: 2,
    question: "Comment signaler un problème ?",
    answer: "Utilisez le bouton 'Signaler un problème' dans les détails du trajet ou contactez directement le support via ce formulaire.",
    category: "problèmes"
  },
  {
    id: 3,
    question: "Comment fonctionne le paiement ?",
    answer: "Nous acceptons Mobile Money, espèces, cartes bancaires et portefeuille Taka Taka. Le paiement est sécurisé via notre plateforme.",
    category: "paiement"
  },
  {
    id: 4,
    question: "Comment devenir chauffeur ?",
    answer: "Rendez-vous dans la section 'Devenir chauffeur' de notre application principale et suivez le processus d'inscription.",
    category: "chauffeurs"
  }
];

const FaqSection = () => {
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('support.faq_title')}</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('support.faq_subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-green-500 dark:hover:border-green-400 transition-colors"
            >
              <button
                className="w-full p-4 flex justify-between items-center text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                    <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === faq.id ? 'transform rotate-180' : ''
                    }`}
                />
              </button>
              {expandedFaq === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <div className="pl-11 pt-3">
                    <Badge variant="secondary" size="xs" className="mb-3">
                      {faq.category}
                    </Badge>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    <Button
                      variant="ghost"
                      size="small"
                      className="mt-3"
                      onClick={() => window.open(`/faq#${faq.id}`, '_blank')}
                    >
                      {t('support.view_more')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter align="center">
        <Button variant="outline" onClick={() => window.open('/faq', '_blank')}>
          {t('support.view_all_faq')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FaqSection;
