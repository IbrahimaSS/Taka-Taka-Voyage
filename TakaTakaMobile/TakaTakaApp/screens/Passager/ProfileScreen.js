import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Image,
    Switch,
    Linking,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import PersonalInfoScreen from './PersonalInfoScreen';
import PaymentMethodsScreen from './PaymentMethodsScreen';
import BenefitsScreen from './BenefitsScreen';
import LanguageScreen from './LanguageScreen';
import HelpCenterScreen from './HelpCenterScreen';
import TermsConditionsScreen from './TermsConditionsScreen';
import AboutScreen from './AboutScreen';

export default function ProfileScreen({ navigation, onLogout, onOpenAssistant }) {
    const {
        user,
        darkMode,
        theme,
        toggleDarkMode,
        language,
        languages,
        t
    } = useApp();

    const [currentScreen, setCurrentScreen] = useState('main');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);

    const menuSections = [
        {
            title: t('profile_section_account') || 'Mon compte',
            items: [
                { icon: 'person', label: t('profile_item_personal_info') || 'Infos Professionnelles', action: 'personal-info' },
                // { icon: 'card', label: 'Moyens de paiement', action: 'payment-methods' },
                { icon: 'gift', label: t('profile_item_benefits') || 'Mes avantages', action: 'benefits' },
                // { icon: 'trophy', label: 'Programme de fidélité', action: 'loyalty' },
            ]
        },
        {
            title: t('profile_section_preferences') || 'Préférences',
            items: [
                {
                    icon: 'notifications',
                    label: t('profile_item_notifications') || 'Notifications',
                    action: 'notifications',
                    hasSwitch: true,
                    switchValue: notificationsEnabled,
                    onSwitchChange: setNotificationsEnabled
                },
                {
                    icon: 'moon',
                    label: t('profile_item_darkmode') || 'Mode sombre',
                    action: 'dark-mode',
                    hasSwitch: true,
                    switchValue: darkMode,
                    onSwitchChange: toggleDarkMode
                },
                //Suivi de position désactivé pour le moment, à réactiver plus tard
                // { 
                //     icon: 'location', 
                //     label: 'Suivi de position', 
                //     action: 'location-tracking',
                //     hasSwitch: true,
                //     switchValue: locationTrackingEnabled,
                //     onSwitchChange: setLocationTrackingEnabled
                // },
                {
                    icon: 'language',
                    label: t('profile_item_language') || 'Langue',
                    action: 'language',
                    value: languages[language]?.name || 'Français'
                },
                // { icon: 'shield', label: 'Confidentialité', action: 'privacy' },
            ]
        },
        {
            title: t('profile_section_support') || 'Aide & Support',
            items: [
                { icon: 'help-circle', label: t('profile_item_help_center') || "Centre d'aide", action: 'help' },
                { icon: 'chatbubbles', label: t('profile_item_customer_support') || 'Support client', action: 'support' },
                { icon: 'document-text', label: t('profile_item_terms') || "Conditions d'utilisation", action: 'terms' },
                { icon: 'information-circle', label: t('profile_item_about') || 'À propos', action: 'about' },
            ]
        }
    ];

    const handleAction = (action) => {
        switch (action) {
            case 'personal-info':
                setCurrentScreen('personal-info');
                break;
            case 'payment-methods':
                setCurrentScreen('payment-methods');
                break;
            case 'benefits':
                setCurrentScreen('benefits');
                break;
            case 'loyalty':
                Alert.alert('Programme de fidélité', 'Cette fonctionnalité sera bientôt disponible !');
                break;
            case 'language':
                setCurrentScreen('language');
                break;
            case 'privacy':
                Alert.alert('Confidentialité', 'Cette fonctionnalité sera bientôt disponible !');
                break;
            case 'assistant':
                onOpenAssistant?.();
                break;
            case 'help':
                setCurrentScreen('help-center');
                break;
            case 'support':
                // Numéro de support client
                Linking.openURL('tel:+224621456789');
                break;
            case 'terms':
                setCurrentScreen('terms-conditions');
                break;
            case 'about':
                setCurrentScreen('about');
                break;
            default:
                Alert.alert('Fonctionnalité', 'Cette fonctionnalité sera bientôt disponible !');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('profile_logout'),
            t('profile_logout_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('profile_logout'), style: 'destructive', onPress: onLogout }
            ]
        );
    };

    const renderMainScreen = () => (
        <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <LinearGradient
                colors={theme.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.profileHeader}
            >
                <View style={styles.profileInfo}>
                    <LinearGradient
                        colors={['#FFFFFF', '#F0F9FF']}
                        style={styles.profileAvatar}
                    >
                        {user && (user.photo || user.photoUrl || user.avatar) ? (
                            <Image
                                source={{ 
                                    uri: (user.photo || user.photoUrl || user.avatar).startsWith('http')
                                        ? (user.photo || user.photoUrl || user.avatar)
                                        : `https://taka-taka-voyage.onrender.com${user.photo || user.photoUrl || user.avatar}`
                                }}
                                style={{ width: 60, height: 60, borderRadius: 30 }}
                                onError={() => updateUser({ ...user, photo: null, photoUrl: null, avatar: null })}
                            />
                        ) : (
                            <Text style={[styles.profileInitial, { color: '#10B981' }]}>
                                {user && (user.prenom || user.name) ? (user.prenom || user.name).charAt(0) : 'U'}
                            </Text>
                        )}
                    </LinearGradient>

                    <View style={styles.profileText}>
                        <Text style={styles.profileName}>{user.name}</Text>
                        <Text style={styles.profileEmail}>{user.email}</Text>
                        <View style={styles.profileStats}>
                            <View style={styles.statBadge}>
                                <Ionicons name="star" size={14} color="#FBBF24" />
                                <Text style={styles.statBadgeText}>{user.rating}</Text>
                            </View>
                            <View style={styles.statBadge}>
                                <Ionicons name="car" size={14} color="#FFFFFF" />
                                <Text style={styles.statBadgeText}>{user.trips} trajets</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => handleAction('personal-info')}
                >
                    <Ionicons name="create" size={20} color="#10B981" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Menu Sections */}
            {menuSections.map((section, index) => (
                <View key={index} style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    {section.items.map((item, itemIndex) => (
                        <TouchableOpacity
                            key={itemIndex}
                            style={[styles.menuItem, { backgroundColor: theme.card, borderColor: darkMode ? theme.border : '#F1F5F9' }]}
                            onPress={() => !item.hasSwitch && handleAction(item.action)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[styles.menuIcon, { backgroundColor: darkMode ? theme.menuItemIconBg : '#E6F3EA' }]}>
                                    <Ionicons name={item.icon} size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                            </View>

                            <View style={styles.menuItemRight}>
                                {item.value && (
                                    <Text style={styles.menuValue}>{item.value}</Text>
                                )}

                                {item.hasSwitch ? (
                                    <Switch
                                        value={item.switchValue}
                                        onValueChange={item.onSwitchChange}
                                        trackColor={{ false: theme.switchTrackFalse, true: theme.switchTrackTrue }}
                                        thumbColor={item.switchValue ? theme.switchThumbTrue : theme.switchThumbFalse}
                                    />
                                ) : (
                                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out" size={20} color="#EF4444" />
                <Text style={styles.logoutText}>{t('profile_logout')}</Text>
            </TouchableOpacity>

            {/* App Version */}
            <Text style={styles.versionText}>Taka Taka v1.0.0</Text>
        </ScrollView>
    );

    const subNavigation = {
        goBack: () => setCurrentScreen('main'),
        navigate: (screenName) => {
            if (screenName === 'ContactSupport') Linking.openURL('tel:+224621456789');
            else if (screenName === 'main') setCurrentScreen('main');
            // Ajoutez d'autres mapping si nécessaire
        }
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'personal-info':
                return <PersonalInfoScreen navigation={subNavigation} />;
            case 'payment-methods':
                return <PaymentMethodsScreen navigation={subNavigation} />;
            case 'benefits':
                return <BenefitsScreen navigation={subNavigation} />;
            case 'language':
                return <LanguageScreen navigation={subNavigation} />;
            case 'help-center':
                return <HelpCenterScreen navigation={subNavigation} />;
            case 'terms-conditions':
                return <TermsConditionsScreen navigation={subNavigation} />;
            case 'about':
                return <AboutScreen navigation={subNavigation} />;
            case 'main':
            default:
                return renderMainScreen();
        }
    };

    const renderHeader = () => {
        if (currentScreen !== 'main') {
            // Pour les sous-écrans, nous laissons leur propre header
            return null;
        }

        return (
            <View style={[styles.header, {
                backgroundColor: theme.background,
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
                    onPress={() => {
                        if (navigation?.navigate) {
                            navigation.navigate('ContactSupport');
                        } else {
                            Linking.openURL('tel:+224621456789');
                        }
                    }}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={darkMode ? "light-content" : "dark-content"}
                backgroundColor={darkMode ? "#111827" : "#FFFFFF"}
            />

            {renderHeader()}
            {renderScreen()}
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
    settingsButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    profileHeader: {
        borderRadius: 20,
        padding: 20,
        marginTop: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInitial: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    profileText: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    profileStats: {
        flexDirection: 'row',
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    editProfileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    balanceCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    balanceInfo: {
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    balanceActions: {
        flexDirection: 'row',
        gap: 12,
    },
    balanceActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    balanceActionText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E6F3EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        fontSize: 16,
        color: '#1F2937',
        flex: 1,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FECACA',
        marginBottom: 24,
        gap: 12,
    },
    logoutText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 32,
    },
};