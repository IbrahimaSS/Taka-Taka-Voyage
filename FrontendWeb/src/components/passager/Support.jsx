import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, MessageSquare } from 'lucide-react';

import Tabs from '../admin/ui/Tabs';

import { useSupportForm } from './support/useSupportForm';
import SupportHeader from './support/SupportHeader';
import FaqSection from './support/FaqSection';
import ContactForm from './support/ContactForm';
import ContactChannelsCard from './support/ContactChannelsCard';
import DocumentationCard from './support/DocumentationCard';
import SupportSuccessModal from './support/SupportSuccessModal';

const Support = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('faq');

  const {
    formData, setFormData,
    showSuccessModal, setShowSuccessModal,
    isSubmitting,
    uploadedFiles,
    handleFileUpload,
    removeFile,
    handleSubmit,
  } = useSupportForm();

  const tabs = [
    { id: 'faq', label: t('support.faq_title'), icon: HelpCircle },
    { id: 'contact', label: t('support.contact_title'), icon: MessageSquare },
  ];

  return (
    <>
      <div className="space-y-8">
        <SupportHeader />

        {/* Tabs de navigation */}
        <div className="bg-white dark:bg-gray-800/40 rounded-xl p-1 border border-gray-100 dark:border-gray-700/50">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-none"
          />
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'faq' && <FaqSection />}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactForm
              formData={formData}
              setFormData={setFormData}
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeFile}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />

            <div className="space-y-8">
              <ContactChannelsCard />
              <DocumentationCard />
            </div>
          </div>
        )}
      </div>

      <SupportSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default Support;
