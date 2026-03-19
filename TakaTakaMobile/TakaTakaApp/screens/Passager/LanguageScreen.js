import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../AppContext';

export default function LanguageScreen({ navigation }) {
    const { languages, language: currentLanguage, changeLanguage, darkMode, theme, t } = useApp();
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

    const languageList = [
        { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'Anglais', nativeName: 'English', flag: '🇬🇧' },
        { code: 'ml', name: 'Malinké', nativeName: 'Mandenkan', flag: '🇬🇳' },
        { code: 'sus', name: 'Sousous', nativeName: 'Sosoxui', flag: '🇬🇳' },
        { code: 'pul', name: 'Pular', nativeName: 'Pular', flag: '🇬🇳' },
    ];

    const handleLanguageSelect = async (langCode) => {
        setSelectedLanguage(langCode);

        try {
            // Sauvegarder dans AsyncStorage
            await AsyncStorage.setItem('appLanguage', langCode);

            // Mettre à jour le contexte
            changeLanguage(langCode);

            Alert.alert(
                t('lang_change_success'),
                t('lang_restart_note'),
                [
                    { text: t('ok'), onPress: () => navigation.goBack() }
                ]
            );
        } catch (error) {
            Alert.alert(t('error'), t('error_save_pref') || 'Impossible de sauvegarder');
        }
    };

    const resetToDefault = () => {
        Alert.alert(
            'Réinitialiser',
            'Revenir au français par défaut ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Réinitialiser',
                    onPress: () => handleLanguageSelect('fr')
                }
            ]
        );
    };

    const getLanguageDescription = (code) => {
        const descriptions = {
            fr: 'Langue par défaut de l\'application',
            en: 'International language, widely spoken',
            ml: 'Langue locale la plus parlée en Guinée',
            sus: 'Langue locale de la région côtière',
            pul: 'Langue parlée par les Peuls',
        };
        return descriptions[code] || '';
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header Amélioré avec Logo Centré */}
            <View style={[styles.header, {
                borderBottomColor: theme.border,
                paddingTop: Platform.OS === 'android' ? 50 : 20,
                paddingBottom: 20
            }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                        overflow: 'hidden',
                        borderWidth: 1.5,
                        borderColor: '#10B981'
                    }}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{ width: 35, height: 35, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={resetToDefault}
                    style={{ padding: 8 }}
                >
                    <Text style={[styles.resetText, { color: theme.primary, fontWeight: 'bold' }]}>Reset</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {/* Current Language */}
                <View style={styles.currentLanguageSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('lang_current')}</Text>
                    <LinearGradient
                        colors={darkMode ? ['#1F2937', '#111827'] : ['#F0F9FF', '#E0F2FE']}
                        style={[styles.currentLanguageCard, { borderColor: darkMode ? theme.border : '#BAE6FD' }]}
                    >
                        <Text style={styles.currentFlag}>
                            {languageList.find(l => l.code === currentLanguage)?.flag}
                        </Text>
                        <View style={styles.currentLanguageInfo}>
                            <Text style={[styles.currentLanguageName, { color: darkMode ? theme.text : '#0C4A6E' }]}>
                                {languageList.find(l => l.code === currentLanguage)?.name}
                            </Text>
                            <Text style={[styles.currentNativeName, { color: theme.textSecondary }]}>
                                {languageList.find(l => l.code === currentLanguage)?.nativeName}
                            </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                    </LinearGradient>
                </View>

                {/* Available Languages */}
                <View style={styles.languagesSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('lang_choose')}</Text>

                    {languageList.map(lang => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageOption,
                                { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border },
                                selectedLanguage === lang.code && [styles.languageOptionSelected, { backgroundColor: darkMode ? '#1E3A8A' : '#F0F9FF', borderColor: theme.primary }]
                            ]}
                            onPress={() => handleLanguageSelect(lang.code)}
                        >
                            <View style={styles.languageLeft}>
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <View style={styles.languageInfo}>
                                    <Text style={[styles.languageName, { color: theme.text }]}>{lang.name}</Text>
                                    <Text style={[styles.languageNative, { color: theme.textSecondary }]}>{lang.nativeName}</Text>
                                    <Text style={[styles.languageDescription, { color: theme.textSecondary }]}>
                                        {getLanguageDescription(lang.code)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.languageRight}>
                                {selectedLanguage === lang.code ? (
                                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                ) : (
                                    <Ionicons name="radio-button-off" size={24} color={theme.textSecondary} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Translation Info */}
                <View style={[styles.infoSection, { backgroundColor: darkMode ? '#1F2937' : '#F0F9FF', borderColor: darkMode ? theme.border : '#BAE6FD' }]}>
                    <View style={styles.infoHeader}>
                        <Ionicons name="information-circle" size={20} color={theme.primary} />
                        <Text style={[styles.infoTitle, { color: darkMode ? theme.text : '#0C4A6E' }]}>À propos des traductions</Text>
                    </View>
                    <Text style={[styles.infoText, { color: darkMode ? theme.textSecondary : '#0C4A6E' }]}>
                        • Les langues locales (Malinké, Sousous, Pular) sont traduites par notre équipe locale
                    </Text>
                    <Text style={[styles.infoText, { color: darkMode ? theme.textSecondary : '#0C4A6E' }]}>
                        • Certaines fonctionnalités peuvent ne pas être disponibles dans toutes les langues
                    </Text>
                    <Text style={[styles.infoText, { color: darkMode ? theme.textSecondary : '#0C4A6E' }]}>
                        • Vous pouvez contribuer à améliorer les traductions en nous contactant
                    </Text>
                </View>

                {/* Auto-Detect Option */}
                <View style={[styles.autoDetectSection, { backgroundColor: darkMode ? '#1F2937' : '#F0FDF4', borderColor: darkMode ? theme.border : '#BBF7D0' }]}>
                    <View style={styles.autoDetectHeader}>
                        <Ionicons name="globe" size={20} color={theme.success} />
                        <Text style={[styles.autoDetectTitle, { color: darkMode ? theme.text : '#166534' }]}>Détection automatique</Text>
                        <View style={styles.switchContainer}>
                            {/* Switch serait implémenté ici */}
                            <Text style={[styles.switchLabel, { color: theme.success }]}>Activé</Text>
                        </View>
                    </View>
                    <Text style={[styles.autoDetectText, { color: darkMode ? theme.textSecondary : '#166534' }]}>
                        L'application détecte automatiquement la langue de votre appareil et s'adapte en conséquence.
                    </Text>
                </View>

                {/* Contribute */}
                <TouchableOpacity
                    style={styles.contributeButton}
                    onPress={() => Alert.alert('Contribuer', 'Merci pour votre intérêt ! Contactez-nous à support@takataka.com')}
                >
                    <Ionicons name="people" size={20} color="#FFFFFF" />
                    <Text style={styles.contributeText}>Contribuer aux traductions</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    resetText: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    currentLanguageSection: {
        marginTop: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    currentLanguageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    currentFlag: {
        fontSize: 32,
        marginRight: 16,
    },
    currentLanguageInfo: {
        flex: 1,
    },
    currentLanguageName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0C4A6E',
        marginBottom: 2,
    },
    currentNativeName: {
        fontSize: 14,
        color: '#6B7280',
    },
    languagesSection: {
        marginBottom: 24,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    languageOptionSelected: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
    },
    languageLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageFlag: {
        fontSize: 28,
        marginRight: 16,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    languageNative: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    languageDescription: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    languageRight: {
        marginLeft: 12,
    },
    infoSection: {
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0C4A6E',
        marginLeft: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#0C4A6E',
        marginBottom: 8,
    },
    autoDetectSection: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    autoDetectHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    autoDetectTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
        marginLeft: 8,
        flex: 1,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '600',
        marginRight: 8,
    },
    autoDetectText: {
        fontSize: 14,
        color: '#166534',
    },
    contributeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    contributeText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 12,
    },
};