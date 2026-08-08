import { useTranslation } from 'react-i18next';
import Card, { CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const SettingsActionsCard = ({ onDeleteAccount, onCancel, onSave }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardFooter align="between" className="flex-col sm:flex-row gap-4">
        <Button
          variant="danger"
          onClick={onDeleteAccount}
          fullWidth
          className="sm:w-auto"
        >
          {t('passenger_settings.delete_account')}
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={onCancel}
            fullWidth
            className="sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            fullWidth
            className="sm:w-auto"
          >
            {t('passenger_settings.save_changes')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SettingsActionsCard;
