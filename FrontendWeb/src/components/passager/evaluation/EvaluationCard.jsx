import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Badge from '../../admin/ui/Badge';
import StarRating from './StarRating';

const EvaluationCard = ({ evaluation, index }) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card hoverable={true}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center">
                {evaluation.driver.avatar ? (
                  <img src={evaluation.driver.avatar} alt={evaluation.driver.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">{evaluation.driver.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {evaluation.date} • {evaluation.driver.vehicle}
                </p>
              </div>
            </div>
            <div><StarRating rating={evaluation.rating} /></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{evaluation.comment || t('evaluations.no_comment')}</p>
          {evaluation.tags && evaluation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evaluation.tags.map((tag, i) => (
                <Badge key={i} variant="success" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EvaluationCard;
