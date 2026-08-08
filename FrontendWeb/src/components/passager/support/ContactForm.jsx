import { useTranslation } from 'react-i18next';
import { Upload, FileText, Send } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const ContactForm = ({
  formData, setFormData, uploadedFiles, onFileUpload, onRemoveFile, isSubmitting, onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('support.contact_title')}</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('support.contact_subtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              {t('support.subject_label')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              required
            >
              <option value="">{t('support.subject_placeholder')}</option>
              <option value="trip_problem">{t('support.subjects.trip_problem')}</option>
              <option value="payment_problem">{t('support.subjects.payment_problem')}</option>
              <option value="driver_problem">{t('support.subjects.driver_problem')}</option>
              <option value="account_question">{t('support.subjects.account_question')}</option>
              <option value="suggestion">{t('support.subjects.suggestion')}</option>
              <option value="other">{t('support.subjects.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              {t('support.description_label')} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
              placeholder={t('support.description_placeholder')}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              {t('support.attachments_label')}
            </label>
            <div className="space-y-4">
              <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={onFileUpload}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                />
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('support.upload_drop_msg')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{t('support.upload_click_msg')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t('support.upload_extra_msg')}</p>
              </label>

              {/* Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 shrink-0 w-11 h-11 flex items-center justify-center text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attachDetails}
                onChange={(e) => setFormData({ ...formData, attachDetails: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded border-gray-300 dark:border-gray-700 focus:ring-green-500/20"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {t('support.attach_last_trip')}
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            icon={Send}
          >
            {t('support.send_btn')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
