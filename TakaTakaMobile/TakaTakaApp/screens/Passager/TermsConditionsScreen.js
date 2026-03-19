import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Image,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../AppContext';

export default function TermsConditionsScreen({ navigation }) {
    const { darkMode, theme } = useApp();
    const sections = [
        {
            title: '1. Acceptation des Conditions',
            content: 'En utilisant Taka Taka, vous acceptez ces conditions d\'utilisation. Si vous n\'êtes pas d\'accord avec ces conditions, veuillez ne pas utiliser notre service.',
        },
        {
            title: '2. Description du Service',
            content: 'Taka Taka est une plateforme de mobilité urbaine qui met en relation passagers et chauffeurs. Nous fournissons une plateforme technologique permettant aux utilisateurs de réserver et payer des trajets.',
        },
        {
            title: '3. Compte Utilisateur',
            content: 'Vous devez créer un compte pour utiliser nos services. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités sur votre compte.',
        },
        {
            title: '4. Paiements et Frais',
            content: 'Les prix des trajets sont calculés automatiquement et peuvent varier selon la demande, la distance et le temps. Tous les paiements sont sécurisés et traités par des fournisseurs tiers agréés.',
        },
        {
            title: '5. Politique d\'Annulation',
            content: 'Les passagers peuvent annuler sans frais jusqu\'à 5 minutes après la réservation. Les annulations tardives peuvent entraîner des frais. Les chauffeurs peuvent également annuler dans certaines conditions.',
        },
        {
            title: '6. Responsabilités',
            content: 'Taka Taka agit uniquement comme intermédiaire. Nous ne sommes pas responsables des actes des chauffeurs ou des passagers. Les utilisateurs interagissent à leurs propres risques.',
        },
        {
            title: '7. Propriété Intellectuelle',
            content: 'Tous les droits de propriété intellectuelle relatifs à l\'application Taka Taka (logos, design, code) sont la propriété exclusive de Taka Taka SA.',
        },
        {
            title: '8. Confidentialité',
            content: 'Nous protégeons vos données personnelles conformément à notre Politique de Confidentialité. Nous collectons uniquement les données nécessaires au fonctionnement du service.',
        },
        {
            title: '9. Modifications des Conditions',
            content: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements significatifs. La poursuite de l\'utilisation constitue l\'acceptation des nouvelles conditions.',
        },
        {
            title: '10. Loi Applicable',
            content: 'Ces conditions sont régies par les lois de la République de Guinée. Tout litige sera soumis aux tribunaux compétents de Conakry.',
        },
    ];

    const lastUpdated = '15 décembre 2024';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header Amélioré avec Logo Centré */}
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

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {/* Last Updated */}
                <View style={[styles.updateInfo, { backgroundColor: darkMode ? '#1F2937' : '#F3F4F6' }]}>
                    <Ionicons name="time" size={16} color={theme.textSecondary} />
                    <Text style={[styles.updateText, { color: theme.textSecondary }]}>Dernière mise à jour : {lastUpdated}</Text>
                </View>

                {/* Important Notice */}
                <View style={[styles.noticeCard, { backgroundColor: darkMode ? 'rgba(220, 38, 38, 0.1)' : '#FEF2F2', borderColor: darkMode ? 'rgba(220, 38, 38, 0.3)' : '#FECACA' }]}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="warning" size={20} color="#DC2626" />
                        <Text style={styles.noticeTitle}>Avis important</Text>
                    </View>
                    <Text style={[styles.noticeText, { color: darkMode ? '#FCA5A5' : '#DC2626' }]}>
                        Veuillez lire attentivement ces conditions avant d'utiliser Taka Taka. En utilisant notre service, vous acceptez d'être lié par ces conditions.
                    </Text>
                </View>

                {/* Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={[styles.sectionCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                        <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>{section.content}</Text>
                    </View>
                ))}

                {/* Acceptance */}
                <View style={styles.acceptanceCard}>
                    <View style={styles.acceptanceHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={styles.acceptanceTitle}>Votre acceptation</Text>
                    </View>
                    <Text style={styles.acceptanceText}>
                        En utilisant Taka Taka, vous confirmez que :
                    </Text>
                    <View style={styles.acceptanceList}>
                        <View style={styles.listItem}>
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                            <Text style={styles.listText}>Vous avez au moins 18 ans</Text>
                        </View>
                        <View style={styles.listItem}>
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                            <Text style={styles.listText}>Vous avez lu et compris ces conditions</Text>
                        </View>
                        <View style={styles.listItem}>
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                            <Text style={styles.listText}>Vous acceptez d'être lié par ces conditions</Text>
                        </View>
                    </View>
                </View>

                {/* Contact for Questions */}
                <TouchableOpacity
                    style={styles.contactCard}
                    onPress={() => navigation.navigate('ContactSupport')}
                >
                    <Ionicons name="help-circle" size={24} color="#3B82F6" />
                    <View style={styles.contactContent}>
                        <Text style={styles.contactTitle}>Des questions ?</Text>
                        <Text style={styles.contactText}>Contactez notre équipe juridique</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#3B82F6" />
                </TouchableOpacity>

                {/* Version Info */}
                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>Version 2.1</Text>
                    <Text style={styles.effectiveText}>Entrée en vigueur : 1er janvier 2025</Text>
                </View>
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
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
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
    content: {
        flex: 1,
        padding: 16,
    },
    updateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    updateText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    noticeCard: {
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC2626',
        marginLeft: 8,
    },
    noticeText: {
        fontSize: 14,
        color: '#DC2626',
        lineHeight: 20,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    acceptanceCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    acceptanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    acceptanceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginLeft: 8,
    },
    acceptanceText: {
        fontSize: 14,
        color: '#166534',
        marginBottom: 12,
    },
    acceptanceList: {
        marginLeft: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    listText: {
        fontSize: 14,
        color: '#166534',
        marginLeft: 8,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    contactContent: {
        flex: 1,
        marginLeft: 16,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    contactText: {
        fontSize: 14,
        color: '#6B7280',
    },
    versionInfo: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    versionText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    effectiveText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
};