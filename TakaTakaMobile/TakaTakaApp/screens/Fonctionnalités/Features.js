import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../App.styles';
import { SCREENS } from '../../constants/screens';

const { width } = Dimensions.get('window');

export default function FeaturesScreen({ setCurrentScreen }) {
    const [showAllFeatures, setShowAllFeatures] = useState(false);
    const [rotateAnim] = useState(new Animated.Value(0));

    const toggleFeatures = () => {
        Animated.timing(rotateAnim, {
            toValue: showAllFeatures ? 0 : 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
        setShowAllFeatures(!showAllFeatures);
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const baseFeatures = [
        {
            id: 1,
            icon: 'car-sport',
            title: 'Réservation Instantanée',
            description: 'Réservez un trajet en quelques secondes, 24h/24 et 7j/7',
            color: '#3B82F6',
            details: [
                'Interface intuitive et rapide',
                'Estimation de prix en temps réel',
                'Historique des trajets',
            ]
        },
        {
            id: 2,
            icon: 'shield-checkmark',
            title: 'Sécurité Garantie',
            description: 'Votre sécurité est notre priorité absolue',
            color: '#10B981',
            details: [
                'Conducteurs vérifiés',
                'Partage de trajet en temps réel',
                'Bouton d\'urgence',
                'Évaluation mutuelle',
            ]
        },
        {
            id: 3,
            icon: 'cash',
            title: 'Paiements Flexibles',
            description: 'Plusieurs moyens de paiement sécurisés',
            color: '#8B5CF6',
            details: [
                'Paiement mobile (Orange Money, MTN)',
                'Carte bancaire',
                'Espèces',
                'Facturation électronique',
            ]
        },
        {
            id: 4,
            icon: 'timer',
            title: 'Suivi en Temps Réel',
            description: 'Suivez votre course minute par minute',
            color: '#F59E0B',
            details: [
                'GPS précis',
                'Temps d\'attente estimé',
                'Notifications push',
                'Itinéraire optimisé',
            ]
        },
        {
            id: 5,
            icon: 'people',
            title: 'Covoiturage Urbain',
            description: 'Économisez en partageant vos trajets',
            color: '#EC4899',
            details: [
                'Réduction des coûts',
                'Trajets réguliers',
                'Communauté fiable',
                'Réduction écologique',
            ]
        },
        {
            id: 6,
            icon: 'star',
            title: 'Service Premium',
            description: 'Options supplémentaires pour plus de confort',
            color: '#EF4444',
            details: [
                'Voitures haut de gamme',
                'Conducteurs professionnels',
                'Réservation à l\'avance',
                'Service VIP',
            ]
        },
    ];

    const additionalFeatures = [
        {
            id: 7,
            icon: 'globe',
            title: 'MultiLingue',
            description: 'Application disponible en plusieurs langues',
            color: '#06B6D4',
            details: [
                'Français, Anglais, Arabe',
                'Interface adaptée',
                'Support multilingue',
            ]
        },
        {
            id: 8,
            icon: 'phone-portrait',
            title: 'Mode USSD',
            description: 'Réservation sans internet via code USSD',
            color: '#8B5CF6',
            details: [
                'Accessible sans smartphone',
                'Code USSD dédié',
                'Réservation par téléphone',
                'SMS de confirmation',
            ]
        },
        {
            id: 9,
            icon: 'school',
            title: 'Transport Scolaire',
            description: 'Service dédié pour le transport des élèves',
            color: '#10B981',
            details: [
                'Trajets sécurisés pour enfants',
                'Surveillance en temps réel',
                'Alertes aux parents',
                'Conducteurs agréés',
            ]
        },
        {
            id: 10,
            icon: 'business',
            title: 'Service Entreprise',
            description: 'Solutions de mobilité pour entreprises',
            color: '#8B5CF6',
            details: [
                'Comptes professionnels',
                'Facturation mensuelle',
                'Gestion des dépenses',
                'Rapports détaillés',
            ]
        },
        {
            id: 11,
            icon: 'calendar',
            title: 'Réservation à l\'Avance',
            description: 'Planifiez vos trajets à l\'avance',
            color: '#F59E0B',
            details: [
                'Réservez jusqu\'à 7 jours à l\'avance',
                'Confirmation immédiate',
                'Rappels automatiques',
                'Modification flexible',
            ]
        },
        {
            id: 12,
            icon: 'bag-handle',
            title: 'Livraison Express',
            description: 'Service de livraison rapide',
            color: '#EC4899',
            details: [
                'Livraison en moins de 2h',
                'Suivi en temps réel',
                'Multiples tailles de colis',
                'Assurance incluse',
            ]
        },
    ];

    const allFeatures = [...baseFeatures, ...additionalFeatures];
    const displayedFeatures = showAllFeatures ? allFeatures : baseFeatures;

    const avantages = [
        {
            title: 'Économique',
            description: 'Jusqu\'à 30% moins cher que les taxis traditionnels',
            icon: 'trending-down'
        },
        {
            title: 'Écologique',
            description: 'Réduction de votre empreinte carbone avec le covoiturage',
            icon: 'leaf'
        },
        {
            title: 'Fiable',
            description: 'Taux de ponctualité de 98%',
            icon: 'time'
        },
        {
            title: 'Support 24/7',
            description: 'Assistance client disponible à tout moment',
            icon: 'headset'
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.featuresHeader}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => setCurrentScreen(SCREENS.HOME)}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.featuresTitle}>Fonctionnalités</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.featuresScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Hero Section */}
                <View style={[styles.heroSectionFeatures, { paddingVertical: 40 }]}>
                    <Ionicons name="car-sport" size={60} color="#FFFFFF" style={{ marginBottom: 16 }} />
                    <Text style={[styles.heroTitleFeatures, { marginBottom: 12 }]}>
                        Découvrez l'excellence du transport
                    </Text>
                    <Text style={[styles.heroSubtitleFeatures, { maxWidth: width * 0.8 }]}>
                        Une expérience de transport urbain et interurbain révolutionnaire
                    </Text>
                </View>

                {/* Fonctionnalités Principales */}
                <View style={[styles.sectionContainer, { paddingTop: 30 }]}>
                    <Text style={[styles.sectionTitleFeatures, { fontSize: 24, marginBottom: 8 }]}>
                        Nos Fonctionnalités
                    </Text>
                    <Text style={[styles.sectionDescription, { marginBottom: 30 }]}>
                        Tout ce dont vous avez besoin pour vos déplacements
                    </Text>

                    <View style={styles.featuresGrid}>
                        {displayedFeatures.map((feature) => (
                            <View key={feature.id} style={[
                                styles.featureCard, 
                                { 
                                    width: (width - 60) / 2,
                                    marginBottom: 16,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }
                            ]}>
                                <View style={[
                                    styles.featureIconContainer, 
                                    { 
                                        backgroundColor: `${feature.color}15`,
                                        width: 56,
                                        height: 56,
                                        borderRadius: 16,
                                        marginBottom: 16
                                    }
                                ]}>
                                    <Ionicons name={feature.icon} size={28} color={feature.color} />
                                </View>
                                
                                <Text style={[
                                    styles.featureCardTitle, 
                                    { 
                                        fontSize: 16, 
                                        fontWeight: '700',
                                        marginBottom: 8 
                                    }
                                ]}>
                                    {feature.title}
                                </Text>
                                
                                <Text style={[
                                    styles.featureCardDescription,
                                    { 
                                        fontSize: 13,
                                        lineHeight: 18,
                                        marginBottom: 12 
                                    }
                                ]}>
                                    {feature.description}
                                </Text>
                                
                                <View style={styles.featureDetails}>
                                    {feature.details.map((detail, index) => (
                                        <View key={index} style={[
                                            styles.detailItem,
                                            { 
                                                marginBottom: 6,
                                                alignItems: 'flex-start'
                                            }
                                        ]}>
                                            <Ionicons 
                                                name="checkmark-circle" 
                                                size={16} 
                                                color={feature.color} 
                                                style={{ marginTop: 2 }}
                                            />
                                            <Text style={[
                                                styles.detailText,
                                                { 
                                                    fontSize: 12,
                                                    lineHeight: 16,
                                                    marginLeft: 8
                                                }
                                            ]}>
                                                {detail}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Bouton Voir Plus/Voir Moins */}
                    <TouchableOpacity 
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#8B5CF6',
                            paddingVertical: 14,
                            paddingHorizontal: 24,
                            borderRadius: 12,
                            alignSelf: 'center',
                            marginTop: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 4,
                        }}
                        onPress={toggleFeatures}
                        activeOpacity={0.8}
                    >
                        <Text style={{
                            color: '#FFFFFF',
                            fontSize: 16,
                            fontWeight: '600',
                            marginRight: 8,
                        }}>
                            {showAllFeatures ? 'Voir moins de fonctionnalités' : 'Voir plus de fonctionnalités'}
                        </Text>
                        
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                            <Ionicons 
                                name="chevron-down" 
                                size={20} 
                                color="#FFFFFF"
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Message d'information */}
                    <View style={{
                        backgroundColor: '#F0F9FF',
                        padding: 16,
                        borderRadius: 12,
                        marginTop: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: '#3B82F6',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                            <Text style={{ 
                                fontSize: 14, 
                                color: '#1E40AF',
                                flex: 1,
                                lineHeight: 20
                            }}>
                                Découvrez nos {additionalFeatures.length} fonctionnalités supplémentaires incluant MultiLingue, Mode USSD, Transport Scolaire et bien d'autres !
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Nos Avantages */}
                <View style={[
                    styles.sectionContainer, 
                    { 
                        backgroundColor: '#FFFFFF',
                        marginHorizontal: 20,
                        borderRadius: 20,
                        marginTop: 10,
                        padding: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                    }
                ]}>
                    <Text style={[
                        styles.sectionTitleFeatures, 
                        { 
                            fontSize: 24,
                            marginBottom: 8,
                            textAlign: 'left',
                            alignSelf: 'flex-start'
                        }
                    ]}>
                        Nos Avantages
                    </Text>
                    
                    <Text style={[
                        styles.sectionDescription,
                        { 
                            textAlign: 'left',
                            alignSelf: 'flex-start',
                            marginBottom: 24
                        }
                    ]}>
                        Pourquoi choisir Taka Taka ?
                    </Text>

                    <View style={styles.avantagesContainer}>
                        {avantages.map((avantage, index) => (
                            <View key={index} style={[
                                styles.avantageCard,
                                { 
                                    backgroundColor: '#F9FAFB',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    marginBottom: 12,
                                    padding: 16,
                                    borderRadius: 12,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }
                            ]}>
                                <View style={[
                                    styles.avantageIconContainer,
                                    { 
                                        marginRight: 0,
                                        marginBottom: 12,
                                        width: 48,
                                        height: 48
                                    }
                                ]}>
                                    <Ionicons name={avantage.icon} size={24} color="#8B5CF6" />
                                </View>
                                
                                <View style={{ flex: 1, width: '100%' }}>
                                    <Text style={[
                                        styles.avantageTitle,
                                        { 
                                            fontSize: 16,
                                            fontWeight: '700',
                                            marginBottom: 6,
                                            color: '#1F2937'
                                        }
                                    ]}>
                                        {avantage.title}
                                    </Text>
                                    
                                    <Text style={[
                                        styles.avantageDescription,
                                        { 
                                            fontSize: 14,
                                            lineHeight: 20,
                                            color: '#6B7280'
                                        }
                                    ]}>
                                        {avantage.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Appel à l'action */}
                <View style={[
                    styles.ctaContainer, 
                    { 
                        marginTop: 30,
                        marginBottom: 30,
                        paddingVertical: 32,
                        paddingHorizontal: 24
                    }
                ]}>
                    <Ionicons name="people-circle-outline" size={60} color="#FFFFFF" style={{ marginBottom: 16 }} />
                    
                    <Text style={[
                        styles.ctaTitle,
                        { 
                            fontSize: 24,
                            marginBottom: 12
                        }
                    ]}>
                        Prêt à commencer ?
                    </Text>
                    
                    <Text style={[
                        styles.ctaDescription,
                        { 
                            fontSize: 16,
                            lineHeight: 24,
                            marginBottom: 32
                        }
                    ]}>
                        Commencez votre voyage dès maintenant et profitez de nos services premium
                    </Text>
                    
                    <TouchableOpacity 
                        style={[
                            styles.ctaButton,
                            { 
                                backgroundColor: '#FFFFFF',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 16,
                                paddingHorizontal: 24,
                                borderRadius: 12,
                                marginBottom: 16,
                                width: '100%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }
                        ]}
                        onPress={() => setCurrentScreen(SCREENS.LOGIN)}
                    >
                        <Ionicons name="log-in" size={24} color="#8B5CF6" />
                        <Text style={[
                            styles.ctaButtonText,
                            { 
                                fontSize: 18,
                                fontWeight: '700',
                                marginLeft: 10
                            }
                        ]}>
                            Se connecter
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => setCurrentScreen(SCREENS.HOME)}
                    >
                        <Text style={[
                            styles.secondaryButtonText,
                            { 
                                fontSize: 14,
                                fontWeight: '500'
                            }
                        ]}>
                            Retour à l'accueil
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}