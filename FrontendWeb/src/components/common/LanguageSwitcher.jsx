import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
    { code: 'fr', name: 'French (Français)', flag: 'fr' },
    { code: 'en', name: 'English (English)', flag: 'gb' },
    { code: 'pular', name: 'Pular (Fula) (Pulaar)', flag: 'gn' },
    { code: 'soussou', name: 'Soussou (Susu)', flag: 'gn' },
    { code: 'malinke', name: 'Malinké (Maninka)', flag: 'gn' }
];

const LanguageSwitcher = ({ position = 'bottom', variant = 'full' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    // Shared styles for the dropdown - Ultra-compact
    const dropdownStyles = "absolute right-0 w-max min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-[1000] overflow-hidden p-1";

    const getFlagUrl = (code) => `https://flagcdn.com/w20/${code}.png`;

    return (
        <div className="relative" ref={dropdownRef}>
            {variant === 'simple' ? (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl surface hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ring-primary shrink-0"
                    aria-label="Changer de langue"
                    title={currentLang.name.split(' (')[0]}
                >
                    <img
                        src={getFlagUrl(currentLang.flag)}
                        alt={currentLang.name}
                        className="w-5 h-4 object-cover rounded-[2px]"
                    />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                    <img
                        src={getFlagUrl(currentLang.flag)}
                        alt={currentLang.name}
                        className="w-4 h-3 object-cover rounded-[1px]"
                    />
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {currentLang.name.split(' (')[0]}
                    </span>
                    <ChevronDown
                        size={10}
                        className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        className={`${dropdownStyles} ${position === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'}`}
                    >
                        <div className="flex flex-col gap-0.5">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full flex items-center gap-2 px-2 py-1 text-left transition-all rounded-md ${i18n.language === lang.code
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                        }`}
                                >
                                    <img
                                        src={getFlagUrl(lang.flag)}
                                        alt={lang.name}
                                        className="w-4 h-3 object-cover rounded-[1px]"
                                    />
                                    <span className="text-[11px] font-medium whitespace-nowrap">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
