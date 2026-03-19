import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140, // Hauteur du header gradient bleu
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 20,
        zIndex: 1000,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },

    headerLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#10B981',
        overflow: 'hidden',
    },

    loginButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    loginButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB',
    },

    // ScrollView
    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
        paddingTop: 10,
    },

    // Hero Section
    heroSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    heroGradient: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 180,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
    },

    heroContent: {
        flex: 1,
    },

    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        lineHeight: 32,
    },

    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
        lineHeight: 20,
    },

    heroStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },

    heroStat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },

    heroStatText: {
        fontSize: 11,
        color: 'white',
        fontWeight: 'bold',
    },

    heroIllustration: {
        marginLeft: 15,
    },

    heroEmoji: {
        fontSize: 44,
    },

    // Quick Register Section
    quickRegisterSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },

    quickRegisterButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },

    quickRegisterGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },

    quickRegisterText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },

    // Carousel Section
    carouselSection: {
        marginBottom: 30,
    },

    carouselHeader: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    carouselTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },

    dotsContainer: {
        flexDirection: 'row',
        gap: 6,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    dotActive: {
        backgroundColor: '#2563EB',
        width: 20,
    },

    carousel: {
        height: 240,
    },

    slideContainer: {
        width: width - 40,
        marginHorizontal: 20,
    },

    slideGradient: {
        borderRadius: 24,
        padding: 24,
        height: 220,
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        backgroundColor: '#FFFFFF',
    },

    slideIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    slideEmoji: {
        fontSize: 40,
        marginRight: 15,
    },

    slideIconBackground: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },

    slideTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    slideDescription: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Statistics Section
    statsSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        letterSpacing: -0.5,
    },

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },

    statItem: {
        width: '50%',
        padding: 6,
    },

    statCard: {
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },

    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Advantages Section
    advantagesSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },

    advantageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },

    advantageIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    advantageTextContainer: {
        flex: 1,
    },

    advantageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    advantageDescription: {
        fontSize: 13,
        lineHeight: 18,
    },

    // How it works Section
    howItWorksSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },

    stepsContainer: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },

    step: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    stepNumber: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },

    stepNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    stepContent: {
        flex: 1,
    },

    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    stepDescription: {
        fontSize: 13,
        lineHeight: 18,
    },

    stepDivider: {
        alignItems: 'center',
        paddingVertical: 10,
        marginLeft: -width + 124, // Pour centrer grossièrement sous le numéro
    },

    // CTA Section
    ctaSection: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },

    ctaGradient: {
        borderRadius: 28,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12,
    },

    ctaTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 10,
        textAlign: 'center',
    },

    ctaSubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },

    ctaButton: {
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },

    ctaButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        gap: 12,
    },

    ctaButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },

    secondaryButton: {
        paddingVertical: 12,
    },

    secondaryButtonText: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    // FAQ Section
    faqSection: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },

    faqList: {
        gap: 12,
    },

    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
    },

    faqQuestion: {
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
    },

    // Footer
    footer: {
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },

    footerText: {
        fontSize: 12,
        marginBottom: 8,
    },

    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    footerLink: {
        fontSize: 12,
        textDecorationLine: 'underline',
    },

    footerSeparator: {
        fontSize: 12,
    },
});