import React, { createContext, useContext } from 'react';
import { useSettings as useSettingsHook } from '../hooks/useSettings';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const settingsData = useSettingsHook();

    return (
        <SettingsContext.Provider value={settingsData}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
