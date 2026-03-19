import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

export default function AboutScreen({ navigation }) {
    const { darkMode, theme } = useApp();

    const [appStats, setAppStats] = useState({
        utilisateurs: 50000,
        chauffeurs: 10000,
        trajets: 100000,
        satisfaction: 4.8
    });

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const res = await apiClient('/common/stats');
                if (res && res.succes && res.stats) {
                    setAppStats(prev => ({
                        ...prev,
                        utilisateurs: res.stats.utilisateurs || prev.utilisateurs,
                        chauffeurs: res.stats.chauffeurs || prev.chauffeurs,
                        trajets: res.stats.trajets || prev.trajets,
                    }));
                }
            } catch (error) {
                console.error("Erreur de récupération des stats:", error);
            }
        };

        fetchGlobalStats();
    }, []);

    const teamMembers = [
        {
            name: 'Code Génius',
            role: 'CEO & Fondateur',
            image: require('../../assets/CodeGenius.jpg'),
        },
        {
            name: 'Mariama Diané',
            role: 'Directrice Technique',
            image: require('../../assets/diané.jpg'),
        },
        {
            name: 'Ibrahima Barry',
            role: 'Directeur des Opérations',
            image: require('../../assets/avatar.jpg'),
        },
        {
            name: 'Mamadou Fela Bah',
            role: 'Responsable Support Client',
            image: require('../../assets/fela.jpg'),
        },
    ];

    const milestones = [
        { year: '2022', event: 'Fondation de Taka Taka' },
        { year: '2023', event: 'Lancement à Conakry' },
        { year: '2024', event: 'Expansion à Kindia et Mamou' },
        { year: '2025', event: '100 000 trajets effectués' },
    ];

    const openWebsite = () => {
        Linking.openURL('https://www.takataka.gn');
    };

    const openSocialMedia = (platform) => {
        const urls = {
            facebook: 'https://facebook.com/takataka',
            twitter: 'https://twitter.com/takataka',
            instagram: 'https://instagram.com/takataka',
            linkedin: 'https://linkedin.com/company/takataka',
        };
        Linking.openURL(urls[platform]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header Amélioré avec Logo Centré */}
            <View style={[styles.header, {
                backgroundColor: theme.background,
                borderBottomColor: theme.border,
                paddingTop: Platform.OS === 'android' ? 50 : 20
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
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 50,
                                borderWidth: 3,
                                borderColor: '#10B981'
                            }}
                        />
                    </View>
                    <Text style={[styles.appName, { color: theme.text }]}>Taka Taka</Text>
                    <Text style={[styles.tagline, { color: theme.textSecondary }]}>La mobilité réinventée en Guinée</Text>
                    {/*<Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>*/}
                </View>

                {/* Mission */}
                <View style={[styles.missionCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                    <Text style={[styles.missionTitle, { color: theme.text }]}>Notre Mission</Text>
                    <Text style={[styles.missionText, { color: theme.textSecondary }]}>
                        Révolutionner la mobilité urbaine en Guinée en offrant un service de transport sûr,
                        abordable et accessible à tous. Nous connectons les communautés et créons des
                        opportunités économiques pour des milliers de Guinéens.
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{appStats.utilisateurs}</Text>
                        <Text style={styles.statLabel}>Utilisateurs</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{appStats.chauffeurs}</Text>
                        <Text style={styles.statLabel}>Chauffeurs</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{appStats.trajets}</Text>
                        <Text style={styles.statLabel}>Trajets</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{appStats.satisfaction}</Text>
                        <Text style={styles.statLabel}>Satisfaction</Text>
                    </View>
                </View>

                {/* Story */}
                <View style={styles.storySection}>
                    <Text style={styles.sectionTitle}>Notre Histoire</Text>
                    <Text style={styles.storyText}>
                        Fondée en 2022 par Moussa Camara, Taka Taka est née d'une simple observation :
                        la difficulté des Guinéens à se déplacer dans les villes.{"\n\n"}
                        Ce qui a commencé comme une petite startup avec 5 chauffeurs à Conakry est
                        devenu le leader de la mobilité en Guinée, créant des milliers d'emplois et
                        transformant la façon dont les gens se déplacent.
                    </Text>
                </View>

                {/* Milestones */}
                <View style={styles.milestonesSection}>
                    <Text style={styles.sectionTitle}>Nos Jalons</Text>
                    {milestones.map((milestone, index) => (
                        <View key={index} style={styles.milestoneItem}>
                            <View style={styles.milestoneYear}>
                                <Text style={styles.milestoneYearText}>{milestone.year}</Text>
                            </View>
                            <View style={styles.milestoneContent}>
                                <Text style={styles.milestoneEvent}>{milestone.event}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Team */}
                <View style={styles.teamSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Notre Équipe</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 10 }}
                    >
                        {teamMembers.map((member, index) => (
                            <View key={index} style={styles.teamMemberCard}>
                                <View style={styles.imageShadow}>
                                    <Image
                                        source={member.image}
                                        style={styles.memberImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                                <Text style={[styles.memberRole, { color: theme.textSecondary }]}>{member.role}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Values */}
                <View style={styles.valuesSection}>
                    <Text style={styles.sectionTitle}>Nos Valeurs</Text>
                    <View style={styles.valuesGrid}>
                        <View style={styles.valueCard}>
                            <View style={[styles.valueIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="shield-checkmark" size={24} color="#92400E" />
                            </View>
                            <Text style={styles.valueTitle}>Sécurité</Text>
                            <Text style={styles.valueText}>Chauffeurs vérifiés, trajets sécurisés</Text>
                        </View>
                        <View style={styles.valueCard}>
                            <View style={[styles.valueIcon, { backgroundColor: '#DBEAFE' }]}>
                                <Ionicons name="people" size={24} color="#1E40AF" />
                            </View>
                            <Text style={styles.valueTitle}>Communauté</Text>
                            <Text style={styles.valueText}>Nous connectons les Guinéens</Text>
                        </View>
                        <View style={styles.valueCard}>
                            <View style={[styles.valueIcon, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="rocket" size={24} color="#065F46" />
                            </View>
                            <Text style={styles.valueTitle}>Innovation</Text>
                            <Text style={styles.valueText}>Technologie au service de la mobilité</Text>
                        </View>
                        <View style={styles.valueCard}>
                            <View style={[styles.valueIcon, { backgroundColor: '#FCE7F3' }]}>
                                <Ionicons name="heart" size={24} color="#831843" />
                            </View>
                            <Text style={styles.valueTitle}>Impact</Text>
                            <Text style={styles.valueText}>Créer des opportunités économiques</Text>
                        </View>
                    </View>
                </View>

                {/* Contact & Social */}
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Restons en contact</Text>

                    <TouchableOpacity style={styles.websiteButton} onPress={openWebsite}>
                        <Ionicons name="globe" size={20} color="#3B82F6" />
                        <Text style={styles.websiteText}>www.takataka.gn</Text>
                    </TouchableOpacity>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openSocialMedia('facebook')}
                        >
                            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openSocialMedia('twitter')}
                        >
                            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openSocialMedia('instagram')}
                        >
                            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => openSocialMedia('linkedin')}
                        >
                            <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Taka Taka</Text>
                    <Text style={styles.footerSubtext}>Tous droits réservés</Text>
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
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    logoContainer: {
        marginBottom: 16,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    missionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    missionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    missionText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    storySection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    storyText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    milestonesSection: {
        marginBottom: 24,
    },
    milestoneItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    milestoneYear: {
        width: 80,
        marginRight: 16,
    },
    milestoneYearText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    milestoneContent: {
        flex: 1,
        paddingTop: 4,
    },
    milestoneEvent: {
        fontSize: 16,
        color: '#4B5563',
    },
    teamSection: {
        marginBottom: 24,
    },
    teamMemberCard: {
        width: 120,
        marginRight: 16,
        alignItems: 'center',
    },
    imageShadow: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        marginBottom: 12,
    },
    memberImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    memberName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    memberRole: {
        fontSize: 12,
        textAlign: 'center',
    },
    valuesSection: {
        marginBottom: 24,
    },
    valuesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    valueCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    valueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    valueTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    valueText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    contactSection: {
        marginBottom: 24,
    },
    websiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    websiteText: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
        marginLeft: 12,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
};