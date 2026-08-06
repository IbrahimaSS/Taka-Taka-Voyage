// src/components/settings/components/ApiSettings.jsx
// pour les paramètres des API et intégrations.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainApiKeyCard from './apisettings/MainApiKeyCard';
import ExternalIntegrationsCard from './apisettings/ExternalIntegrationsCard';
import WebhookAndSecurityCards from './apisettings/WebhookAndSecurityCards';

const ApiSettings = ({ settings, updateNestedSetting, showToast }) => {
    const { t } = useTranslation();
    const [showApiKeys, setShowApiKeys] = useState({});
    const [copiedKey, setCopiedKey] = useState(null);

    const handleToggleApi = (apiId) => {
        const currentValue = settings.api?.[apiId]?.enabled || false;
        updateNestedSetting('api', apiId, 'enabled', !currentValue);
    };

    const handleApiKeyChange = (apiId, field, value) => {
        updateNestedSetting('api', apiId, field, value);
    };

    const handleCopyApiKey = (key, value) => {
        if (!value) {
            showToast(t('common.error'), t('api.copy_error'), 'error');
            return;
        }
        navigator.clipboard.writeText(value);
        setCopiedKey(key);
        showToast(t('common.success'), t('api.copy_success'), 'success');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const generateApiKey = () => {
        const key = `ttk_${Array.from({ length: 32 }, () =>
            Math.random().toString(36)[2]
        ).join('')}`;
        updateNestedSetting('api', 'takataka', 'apiKey', key);
        showToast(t('common.success'), t('api.key_generated'), 'success');
    };

    const toggleKeyVisibility = (key) => {
        setShowApiKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-8">
            <MainApiKeyCard
                t={t}
                settings={settings}
                updateNestedSetting={updateNestedSetting}
                showApiKeys={showApiKeys}
                copiedKey={copiedKey}
                toggleKeyVisibility={toggleKeyVisibility}
                onCopyApiKey={handleCopyApiKey}
                onGenerateApiKey={generateApiKey}
            />

            <ExternalIntegrationsCard
                t={t}
                settings={settings}
                showToast={showToast}
                showApiKeys={showApiKeys}
                copiedKey={copiedKey}
                toggleKeyVisibility={toggleKeyVisibility}
                onCopyApiKey={handleCopyApiKey}
                onApiKeyChange={handleApiKeyChange}
                onToggleApi={handleToggleApi}
            />

            <WebhookAndSecurityCards
                t={t}
                settings={settings}
                updateNestedSetting={updateNestedSetting}
            />
        </div>
    );
};

export default ApiSettings;
