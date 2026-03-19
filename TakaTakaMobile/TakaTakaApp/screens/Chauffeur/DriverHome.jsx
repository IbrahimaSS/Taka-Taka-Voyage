import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Easing,
    Dimensions,
    StatusBar,
    Platform,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../AppContext';
import { styles } from './DriverHome.styles';
import LogoTT from '../../assets/logo/LogoTT.jpeg';

const { width, height } = Dimensions.get('window');

export default function DriverHome({ onBack, onRegister, onLogin }) {
    const { darkMode, theme } = useApp();
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    // Données des slides
    const slides = [
        {
            id: 1,
            title: "Gagnez plus avec votre voiture",
            description: "Transformez votre véhicule en source de revenus supplémentaires. Travaillez quand vous voulez, où vous voulez.",
            icon: "cash",
            color: "#10B981",
            image: "💰",
        },
        {
            id: 2,
            title: "Paiements sécurisés",
            description: "Recevez vos paiements instantanément après chaque course. Pas d'attente, pas de frais cachés.",
            icon: "shield-checkmark",
            color: "#2563EB",
            image: "💳",
        },
        {
            id: 3,
            title: "Support 24/7",
            description: "Notre équipe est disponible à tout moment pour vous assister. Vous n'êtes jamais seul sur la route.",
            icon: "headset",
            color: "#8B5CF6",
            image: "👨‍💻",
        },
        {
            id: 4,
            title: "Clients notés",
            description: "Choisissez vos passagers grâce à notre système de notation mutuelle pour des trajets agréables.",
            icon: "star",
            color: "#F59E0B",
            image: "⭐",
        },
    ];

    // Statistiques
    const stats = [
        { value: "4.8", label: "Note moyenne", icon: "star", color: "#F59E0B" },
        { value: "2 500+", label: "Chauffeurs actifs", icon: "people", color: "#2563EB" },
        { value: "45%", label: "Revenu supplémentaire", icon: "trending-up", color: "#10B981" },
        { value: "24/7", label: "Support disponible", icon: "time", color: "#8B5CF6" },
    ];

    // Avantages
    const advantages = [
        {
            title: "Flexibilité totale",
            description: "Travaillez selon votre emploi du temps, pas de contraintes horaires",
            icon: "time",
            color: "#10B981",
        },
        {
            title: "Gains attractifs",
            description: "Jusqu'à 45% de plus que les tarifs standards",
            icon: "cash",
            color: "#F59E0B",
        },
        {
            title: "Sécurité garantie",
            description: "Tous les passagers sont vérifiés et notés",
            icon: "shield-checkmark",
            color: "#2563EB",
        },
        {
            title: "Formation offerte",
            description: "Guide complet pour maximiser vos revenus",
            icon: "school",
            color: "#8B5CF6",
        },
    ];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const handleScrollEnd = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveSlide(Math.round(index));
    };

    const renderSlide = ({ item, index }) => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={[
                    styles.slideContainer,
                    { transform: [{ scale }], opacity },
                ]}
            >
                <LinearGradient
                    colors={darkMode ? [`${item.color}20`, '#1F2937'] : ['#FFFFFF', '#F8FAFC']}
                    style={[styles.slideGradient, { borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.slideIconContainer}>
                        <Text style={styles.slideEmoji}>{item.image}</Text>
                        <LinearGradient
                            colors={[item.color, `${item.color}CC`]}
                            style={styles.slideIconBackground}
                        >
                            <Ionicons name={item.icon} size={32} color="white" />
                        </LinearGradient>
                    </View>

                    <Text style={[styles.slideTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>{item.description}</Text>
                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.safeArea, { backgroundColor: darkMode ? '#111827' : '#FFFFFF' }]}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={theme.gradientPrimary}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                {/* HEADER - même style que PassagerHome */}
                <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerLogo}>
                            <Image
                                source={LogoTT}
                                style={{ width: 45, height: 45, resizeMode: 'contain' }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={onLogin}
                    >
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* CONTENU SCROLLABLE */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { backgroundColor: darkMode ? '#111827' : '#F8FAFC' }]}
                >
                    {/* Hero Section - Gradient vert pour chauffeur */}
                    <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <LinearGradient
                            colors={['#2563EB', '#10B981']}
                            style={styles.heroGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>
                                    Devenez chauffeur partenaire
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Rejoignez la plateforme la plus flexible et rémunératrice de Conakry
                                </Text>
                                <View style={styles.heroStats}>
                                    <View style={styles.heroStat}>
                                        <Ionicons name="star" size={16} color="white" />
                                        <Text style={styles.heroStatText}>4.8/5 satisfaction</Text>
                                    </View>
                                    <View style={styles.heroStat}>
                                        <Ionicons name="cash" size={16} color="white" />
                                        <Text style={styles.heroStatText}>+45% revenus</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.heroIllustration}>
                                <Text style={styles.heroEmoji}>🚗💨</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Bouton S'inscrire rapide */}
                    <Animated.View style={[styles.quickRegisterSection, { opacity: fadeAnim }]}>
                        <TouchableOpacity
                            style={styles.quickRegisterButton}
                            onPress={onRegister}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#2563EB', '#3B82F6']}
                                style={styles.quickRegisterGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="person-add" size={22} color="white" />
                                <Text style={styles.quickRegisterText}>S'inscrire maintenant</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Slides Carousel */}
                    <View style={styles.carouselSection}>
                        <View style={styles.carouselHeader}>
                            <Text style={[styles.carouselTitle, { color: theme.text }]}>Pourquoi nous choisir ?</Text>
                            <View style={styles.dotsContainer}>
                                {slides.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            { backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : '#E2E8F0' },
                                            activeSlide === index && styles.dotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        <Animated.FlatList
                            data={slides}
                            renderItem={renderSlide}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            onMomentumScrollEnd={handleScrollEnd}
                            style={styles.carousel}
                        />
                    </View>

                    {/* Statistics */}
                    <View style={styles.statsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Chiffres clés</Text>
                        <View style={styles.statsGrid}>
                            {stats.map((item, index) => (
                                <View key={index} style={styles.statItem}>
                                    <View style={[styles.statCard, {
                                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                        borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                                    }]}>
                                        <View style={[styles.statIconBg, { backgroundColor: `${item.color}20` }]}>
                                            <Ionicons name={item.icon} size={22} color={item.color} />
                                        </View>
                                        <Text style={[styles.statValue, { color: theme.text }]}>{item.value}</Text>
                                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Advantages */}
                    <View style={styles.advantagesSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Avantages exclusifs</Text>
                        {advantages.map((item, index) => (
                            <View key={index} style={[styles.advantageItem, {
                                backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                            }]}>
                                <View style={[styles.advantageIconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <View style={styles.advantageTextContainer}>
                                    <Text style={[styles.advantageTitle, { color: theme.text }]}>{item.title}</Text>
                                    <Text style={[styles.advantageDescription, { color: theme.textSecondary }]}>{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* How it works */}
                    <View style={styles.howItWorksSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Comment ça marche ?</Text>

                        <View style={[styles.stepsContainer, {
                            backgroundColor: darkMode ? '#1F2937' : '#F8FAFC',
                            borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                        }]}>
                            {[
                                { num: "1", title: "Inscription rapide", desc: "Créez votre compte en 5 minutes avec vos documents", colors: ['#EEF2FF', '#E0E7FF'], darkColors: ['#2563EB30', '#2563EB20'] },
                                { num: "2", title: "Validation du profil", desc: "Notre équipe valide vos informations sous 24h", colors: ['#F0FDF4', '#DCFCE7'], darkColors: ['#10B98130', '#10B98120'] },
                                { num: "3", title: "Commencez à gagner", desc: "Recevez vos premières courses et encaissez vos gains", colors: ['#FFFBEB', '#FEF3C7'], darkColors: ['#F59E0B30', '#F59E0B20'] },
                            ].map((step, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && (
                                        <View style={styles.stepDivider}>
                                            <Ionicons name="arrow-down" size={20} color={darkMode ? 'rgba(255,255,255,0.2)' : '#CBD5E1'} />
                                        </View>
                                    )}
                                    <View style={styles.step}>
                                        <LinearGradient
                                            colors={darkMode ? step.darkColors : step.colors}
                                            style={styles.stepNumber}
                                        >
                                            <Text style={[styles.stepNumberText, { color: theme.text }]}>{step.num}</Text>
                                        </LinearGradient>
                                        <View style={styles.stepContent}>
                                            <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
                                            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>{step.desc}</Text>
                                        </View>
                                    </View>
                                </React.Fragment>
                            ))}
                        </View>
                    </View>

                    {/* CTA Section */}
                    <View style={styles.ctaSection}>
                        <LinearGradient
                            colors={darkMode ? ['#1E293B', '#111827'] : ['#EFF6FF', '#DBEAFE']}
                            style={[styles.ctaGradient, !darkMode && { borderWidth: 1, borderColor: '#BFDBFE' }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
                            <Text style={styles.ctaSubtitle}>
                                Rejoignez notre communauté de chauffeurs satisfaits
                            </Text>

                            <TouchableOpacity
                                style={styles.ctaButton}
                                onPress={onRegister}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#34D399']}
                                    style={styles.ctaButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Ionicons name="car" size={22} color="white" />
                                    <Text style={styles.ctaButtonText}>Devenir chauffeur</Text>
                                    <Ionicons name="arrow-forward" size={22} color="white" />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={onLogin}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    J'ai déjà un compte
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* FAQ */}
                    <View style={styles.faqSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Questions fréquentes</Text>

                        <View style={styles.faqList}>
                            {[
                                "Quels documents sont nécessaires ?",
                                "Comment sont calculés mes gains ?",
                                "Puis-je travailler à temps partiel ?",
                            ].map((question, index) => (
                                <TouchableOpacity key={index} style={[styles.faqItem, {
                                    backgroundColor: darkMode ? '#1F2937' : '#F8FAFC',
                                    borderColor: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                                }]}>
                                    <Text style={[styles.faqQuestion, { color: theme.text }]}>
                                        {question}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            © 2024 Taka Taka. Tous droits réservés.
                        </Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity>
                                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Conditions d'utilisation</Text>
                            </TouchableOpacity>
                            <Text style={[styles.footerSeparator, { color: theme.textSecondary }]}>•</Text>
                            <TouchableOpacity>
                                <Text style={[styles.footerLink, { color: theme.textSecondary }]}>Politique de confidentialité</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}