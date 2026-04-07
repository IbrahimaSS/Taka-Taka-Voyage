import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../AppContext';

export default function HelpSupportScreen({ navigation }) {
    const { user, language, darkMode, theme } = useApp();

    const helpSections = [
        {
            id: 1,
            title: 'Centre d\'aide',
            description: 'Trouvez des réponses à vos questions fréquentes',
            icon: 'help-circle',
            color: '#3B82F6',
            screen: 'HelpCenter',
            externalLink: null,
        },
        {
            id: 2,
            title: 'Support Client',
            description: 'Contactez notre équipe de support 24/7',
            icon: 'headset',
            color: '#10B981',
            screen: 'CustomerSupport',
            externalLink: null,
        },
        {
            id: 3,
            title: 'Conditions d\'utilisation',
            description: 'Lisez nos termes et conditions de service',
            icon: 'document-text',
            color: '#F59E0B',
            screen: 'TermsConditions',
            externalLink: null,
        },
        {
            id: 4,
            title: 'À propos',
            description: 'En savoir plus sur Taka Taka',
            icon: 'information-circle',
            color: '#8B5CF6',
            screen: 'About',
            externalLink: null,
        },
        {
            id: 5,
            title: 'Politique de confidentialité',
            description: 'Comment nous protégeons vos données',
            icon: 'shield-checkmark',
            color: '#EF4444',
            screen: 'PrivacyPolicy',
            externalLink: null,
        },
        {
            id: 6,
            title: 'FAQ',
            description: 'Questions fréquemment posées',
            icon: 'chatbubble-ellipses',
            color: '#EC4899',
            screen: 'FAQ',
            externalLink: null,
        },
        {
            id: 7,
            title: 'Conditions d\'utilisation',
            description: 'Lisez nos termes et conditions de service',
            icon: 'document-text',
            color: '#F59E0B',
            screen: 'TermsConditions', // Navigation vers TermsConditionsScreen
            externalLink: null,
        },
        {
            id: 8,
            title: 'À propos',
            description: 'En savoir plus sur Taka Taka',
            icon: 'information-circle',
            color: '#8B5CF6',
            screen: 'About', // Navigation vers AboutScreen
            externalLink: null,
        },
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Appeler le support',
            icon: 'call',
            color: '#10B981',
            action: () => Linking.openURL('tel:+224621456789'),
        },
        {
            id: 2,
            title: 'Envoyer un email',
            icon: 'mail',
            color: '#3B82F6',
            action: () => Linking.openURL('mailto:support@takataka.gn'),
        },
        {
            id: 3,
            title: 'Chat en direct',
            icon: 'chatbubbles',
            color: '#8B5CF6',
            action: () => Alert.alert('Chat', 'Le chat en direct sera bientôt disponible !'),
        },
    ];

    const faqItems = [
        {
            question: 'Comment modifier mes informations de paiement ?',
            answer: 'Allez dans Profil → Méthodes de paiement → Ajouter/Modifier',
        },
        {
            question: 'Comment annuler un trajet ?',
            answer: 'Si aucun chauffeur n\'a accepté, vous pouvez annuler sans frais. Après acceptation, des frais d\'annulation de 5 000 GNF sont appliqués pour compenser le déplacement du chauffeur.',
        },
        {
            question: 'Les prix sont-ils fixes ?',
            answer: 'Oui, le prix est fixé à la réservation et ne change pas',
        },
        {
            question: 'Comment devenir chauffeur Taka Taka ?',
            answer: 'Contactez-nous via l\'option "Devenir chauffeur" dans le menu',
        },
    ];
    //HandleSection = Navigation
    const handleSectionPress = (section) => {
        if (section.externalLink) {
            Linking.openURL(section.externalLink);
        } else if (section.screen) {
            // Utilisez navigation.navigate au lieu de Alert
            switch (section.screen) {
                case 'HelpCenter':
                    navigation.navigate('HelpCenter');
                    break;
                case 'CustomerSupport':
                    // Appeler directement le support
                    Linking.openURL('tel:+224621456789');
                    break;
                case 'TermsConditions':
                    navigation.navigate('TermsConditions');
                    break;
                case 'About':
                    navigation.navigate('About');
                    break;
                case 'PrivacyPolicy':
                    // Vous pouvez créer cet écran plus tard
                    Alert.alert('Politique de confidentialité', 'Cette page sera bientôt disponible');
                    break;
                case 'FAQ':
                    navigation.navigate('HelpCenter'); // Rediriger vers le centre d'aide
                    break;
                default:
                    Alert.alert(section.title, 'Fonctionnalité en développement');
            }
        }
    };

    const openWhatsApp = () => {
        const phoneNumber = '+224621456789';
        const message = 'Bonjour, j\'ai besoin d\'aide avec l\'application Taka Taka';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Erreur', 'Impossible d\'ouvrir WhatsApp');
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>Aide & Support</Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => navigation.navigate('Language')}>
                        <Ionicons name="language" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={[styles.content, { backgroundColor: theme.background }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact rapide</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.quickActionButton}
                                onPress={action.action}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={styles.quickActionText}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Help Sections */}
                <View style={styles.sectionsGrid}>
                    {helpSections.map((section) => (
                        <TouchableOpacity
                            key={section.id}
                            style={[styles.sectionCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                            onPress={() => handleSectionPress(section)}
                        >
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIcon, { backgroundColor: `${section.color}15` }]}>
                                    <Ionicons name={section.icon} size={24} color={section.color} />
                                </View>
                                <Text style={[styles.sectionCardTitle, { color: theme.text }]}>{section.title}</Text>
                            </View>
                            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>{section.description}</Text>
                            <View style={styles.sectionFooter}>
                                <Text style={styles.learnMoreText}>En savoir plus</Text>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Questions fréquentes</Text>
                    {faqItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            onPress={() => Alert.alert(item.question, item.answer)}
                        >
                            <View style={styles.faqQuestion}>
                                <Text style={styles.faqQuestionText}>{item.question}</Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Emergency Contact */}
                <View style={styles.emergencySection}>
                    <View style={styles.emergencyHeader}>
                        <Ionicons name="warning" size={24} color="#EF4444" />
                        <Text style={styles.emergencyTitle}>Contact d'urgence</Text>
                    </View>
                    <Text style={styles.emergencyText}>
                        En cas d'urgence pendant un trajet, contactez immédiatement :
                    </Text>

                    <TouchableOpacity
                        style={styles.emergencyButton}
                        onPress={() => Linking.openURL('tel:+224621456789')}
                    >
                        <Ionicons name="call" size={20} color="#FFFFFF" />
                        <Text style={styles.emergencyButtonText}>Appeler le support d'urgence</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.emergencyButton, styles.whatsappButton]}
                        onPress={openWhatsApp}
                    >
                        <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                        <Text style={styles.emergencyButtonText}>WhatsApp d'urgence</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Informations de l'application</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Dernière mise à jour</Text>
                        <Text style={styles.infoValue}>18 décembre 2024</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Langue actuelle</Text>
                        <Text style={styles.infoValue}>
                            {language === 'fr' ? 'Français' :
                                language === 'en' ? 'Anglais' :
                                    language === 'ml' ? 'Malinké' :
                                        language === 'sus' ? 'Sousous' : 'Pular'}
                        </Text>
                    </View>
                </View>

                {/* Feedback */}
                <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() => Alert.alert(
                        'Feedback',
                        'Merci pour votre retour ! Nous améliorons constamment l\'application.'
                    )}
                >
                    <Ionicons name="star" size={20} color="#FFFFFF" />
                    <Text style={styles.feedbackText}>Donner votre avis</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
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
    headerRight: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    quickActionsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        alignItems: 'center',
        width: '30%',
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
    sectionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    sectionCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    sectionDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    sectionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    learnMoreText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
    faqSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    faqItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestionText: {
        fontSize: 14,
        color: '#1F2937',
        flex: 1,
        fontWeight: '500',
    },
    emergencySection: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC2626',
        marginLeft: 8,
    },
    emergencyText: {
        fontSize: 14,
        color: '#DC2626',
        marginBottom: 16,
        lineHeight: 20,
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    whatsappButton: {
        backgroundColor: '#10B981',
    },
    emergencyButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 12,
    },
    infoSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    feedbackText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 12,
    },
};