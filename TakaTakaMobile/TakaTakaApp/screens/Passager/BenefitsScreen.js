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
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';

export default function BenefitsScreen({ navigation }) {
    const { benefits, darkMode, theme } = useApp();

    const getIconName = (icon) => {
        switch (icon) {
            case 'percent': return 'pricetag';
            case 'close-circle': return 'close-circle';
            case 'headset': return 'headset';
            case 'gift': return 'gift';
            default: return 'star';
        }
    };

    const getIconColor = (index) => {
        const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
        return colors[index % colors.length];
    };

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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Welcome Banner */}
                <LinearGradient
                    colors={theme.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.welcomeBanner}
                >
                    <View style={styles.welcomeContent}>
                        <View>
                            <Text style={styles.welcomeTitle}>Avantages Taka Taka</Text>
                            <Text style={styles.welcomeSubtitle}>
                                Profitez de tous vos avantages en tant que membre fidèle
                            </Text>
                        </View>
                        <Ionicons name="sparkles" size={40} color="#FFFFFF" />
                    </View>
                </LinearGradient>

                {/* Active Benefits */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Avantages actifs</Text>

                    {benefits.map((benefit, index) => (
                        <TouchableOpacity
                            key={benefit.id}
                            style={[styles.benefitCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                        >
                            <LinearGradient
                                colors={darkMode ? ['#374151', '#1F2937'] : ['#FFFFFF', '#F8FAFC']}
                                style={[styles.benefitIconContainer, { borderColor: theme.border }]}
                            >
                                <Ionicons
                                    name={getIconName(benefit.icon)}
                                    size={24}
                                    color={getIconColor(index)}
                                />
                            </LinearGradient>

                            <View style={styles.benefitInfo}>
                                <Text style={[styles.benefitTitle, { color: theme.text }]}>{benefit.title}</Text>
                                <Text style={[styles.benefitDescription, { color: theme.textSecondary }]}>{benefit.description}</Text>

                                <View style={styles.benefitMeta}>
                                    {benefit.progress !== undefined ? (
                                        <>
                                            <View style={[styles.progressContainer, { backgroundColor: darkMode ? '#374151' : '#E5E7EB' }]}>
                                                <View
                                                    style={[
                                                        styles.progressBar,
                                                        { width: `${(benefit.progress / 10) * 100}%`, backgroundColor: theme.primary }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                                {benefit.progress}/10 trajets
                                            </Text>
                                        </>
                                    ) : (
                                        <Text style={[styles.expiryText, { color: theme.textSecondary }]}>
                                            {benefit.expiry === 'Indéfini' ? 'Permanent' : `Valable jusqu'au ${benefit.expiry}`}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {benefit.isActive && (
                                <View style={[styles.activeBadge, { backgroundColor: theme.success }]}>
                                    <Text style={styles.activeText}>ACTIF</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Loyalty Program */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Programme de fidélité</Text>

                    <LinearGradient
                        colors={darkMode ? ['#1F2937', '#111827'] : ['#FEF3C7', '#FDE68A']}
                        style={[styles.loyaltyCard, { borderColor: darkMode ? theme.border : '#FDE68A' }]}
                    >
                        <View style={styles.loyaltyHeader}>
                            <Ionicons name="trophy" size={24} color={darkMode ? '#FBBF24' : '#D97706'} />
                            <Text style={[styles.loyaltyTitle, { color: darkMode ? theme.text : '#92400E' }]}>Niveau Gold</Text>
                        </View>

                        <View style={styles.loyaltyProgress}>
                            <View style={styles.progressLabels}>
                                <Text style={[styles.progressLabel, { color: darkMode ? theme.textSecondary : '#92400E' }]}>Silver</Text>
                                <Text style={[styles.progressLabel, { color: darkMode ? theme.textSecondary : '#92400E' }]}>Gold</Text>
                                <Text style={[styles.progressLabel, { color: darkMode ? theme.textSecondary : '#92400E' }]}>Platinum</Text>
                            </View>

                            <View style={[styles.progressTrack, { backgroundColor: darkMode ? '#374151' : '#FDE68A' }]}>
                                <LinearGradient
                                    colors={['#FBBF24', '#F59E0B']}
                                    style={[styles.progressFill, { width: '65%' }]}
                                />
                            </View>

                            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                65% vers le niveau Platinum
                            </Text>
                        </View>

                        <View style={styles.loyaltyStats}>
                            <View style={styles.stat}>
                                <Text style={[styles.statValue, { color: darkMode ? theme.text : '#92400E' }]}>47</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Trajets</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statValue, { color: darkMode ? theme.text : '#92400E' }]}>2,350</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Points</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={[styles.statValue, { color: darkMode ? theme.text : '#92400E' }]}>5</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avantages</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* How to Earn More */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Comment gagner plus ?</Text>

                    <View style={[styles.tipsList, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}>
                        <View style={styles.tipItem}>
                            <Ionicons name="star" size={20} color="#F59E0B" />
                            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Notez vos chauffeurs (10 points par note)</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="share-social" size={20} color="#3B82F6" />
                            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Parrainez un ami (500 points)</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="calendar" size={20} color={theme.success} />
                            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Utilisez Taka Taka chaque jour (50 points/jour)</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="card" size={20} color="#8B5CF6" />
                            <Text style={[styles.tipText, { color: theme.textSecondary }]}>Paiement via l'application (20 points/trajet)</Text>
                        </View>
                    </View>
                </View>

                {/* Coming Soon */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Bientôt disponible</Text>

                    <View style={[styles.comingSoonCard, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}>
                        <Ionicons name="time" size={24} color={theme.textSecondary} />
                        <View style={styles.comingSoonInfo}>
                            <Text style={[styles.comingSoonTitle, { color: theme.text }]}>Taka Taka Premium</Text>
                            <Text style={[styles.comingSoonDescription, { color: theme.textSecondary }]}>
                                Accédez à des avantages exclusifs : trajets illimités, support VIP, réductions supplémentaires
                            </Text>
                        </View>
                        <TouchableOpacity style={[styles.notifyButton, { backgroundColor: theme.primary }]}>
                            <Text style={styles.notifyText}>Me prévenir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    loyaltyButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    welcomeBanner: {
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        marginBottom: 24,
    },
    welcomeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        maxWidth: '70%',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    benefitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    benefitIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    benefitInfo: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    benefitDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    benefitMeta: {
        marginTop: 4,
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#6B7280',
    },
    expiryText: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    activeText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    loyaltyCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    loyaltyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    loyaltyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#92400E',
        marginLeft: 8,
    },
    loyaltyProgress: {
        marginBottom: 20,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        color: '#92400E',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#FDE68A',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    loyaltyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#92400E',
    },
    tipsList: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
    },
    comingSoonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    comingSoonInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    comingSoonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    comingSoonDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    notifyButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#10B981', // Passage du bleu au vert Taka Taka
    },
    notifyText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
};