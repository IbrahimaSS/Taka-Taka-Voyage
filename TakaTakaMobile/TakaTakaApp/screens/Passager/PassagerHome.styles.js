import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    // SafeAreaView
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fond de secours
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.8, // Rend le bleu plus doux
    },

    // Header fixe
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 16,
        backgroundColor: 'transparent', // Header transparent pour le dégradé
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    headerTitleContainer: {
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },

    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // ScrollView principal
    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
        minHeight: height,
    },

    // Section Carte
    mapWrapper: {
        height: 420,
        borderRadius: 24,
        overflow: 'hidden',
        marginHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 15,
    },

    mapContainer: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    locationBtn: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },

    locationButtonInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
    },

    driverMarker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#10B981',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // Section Recherche
    searchCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },

    searchCardGradient: {
        padding: 24,
        borderRadius: 24,
    },

    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    inputIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },

    inputContent: {
        flex: 1,
    },

    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 6,
        textTransform: 'uppercase',
    },

    input: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
        padding: 0,
        paddingVertical: 8,
    },

    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 20,
        marginLeft: 60,
    },

    searchBtn: {
        marginTop: 20,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },

    searchBtnGradient: {
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },

    disabledBtn: {
        opacity: 0.6,
    },

    searchBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    // Autocomplétion
    autocompleteContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginTop: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    autocompleteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    autocompleteText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },

    // Historique
    historySection: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },

    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    historyClear: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },

    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    historyText: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        marginLeft: 12,
        fontWeight: '500',
    },

    historyTime: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },

    // Carte Résultat
    tripCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },

    tripCardGradient: {
        padding: 24,
        borderRadius: 24,
    },

    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },

    tripTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        letterSpacing: -0.5,
    },

    tripDetails: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },

    tripRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 16,
    },

    tripIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    tripInfo: {
        flex: 1,
    },

    tripLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    tripValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '600',
    },

    tripDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 24,
    },

    tripStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 28,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
    },

    tripStat: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },

    tripStatValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    tripStatLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    tripStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
    },

    priceContainer: {
        marginBottom: 24,
    },

    priceBox: {
        padding: 28,
        borderRadius: 24,
        alignItems: 'center',
        position: 'relative',
        borderWidth: 2,
        borderColor: '#D1FAE5',
    },

    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#065F46',
        marginBottom: 8,
        letterSpacing: -0.5,
    },

    priceHint: {
        fontSize: 14,
        color: '#047857',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    priceIcon: {
        position: 'absolute',
        top: 24,
        right: 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },

    driverAvailability: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 28,
        padding: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    driverInfo: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '600',
    },

    reserveButton: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },

    reserveButtonGradient: {
        paddingVertical: 22,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },

    reserveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    // Features
    features: {
        marginHorizontal: 20,
        marginBottom: 20,
    },

    featuresHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 24,
    },

    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        letterSpacing: -0.5,
    },

    stepsBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Plus discret (verre)
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    stepsBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFFFFF', // Texte blanc sur le badge transparent
        textTransform: 'none', // Plus doux que tout en majuscules
    },

    featuresScroll: {
        flexDirection: 'row',
    },

    featuresContent: {
        paddingRight: 20,
    },

    featureCard: {
        width: width * 0.8,
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        marginRight: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },

    featureIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },

    featureNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
        marginBottom: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    featureTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        letterSpacing: -0.5,
    },

    featureTextContent: {
        flex: 1,
    },

    featureDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },

    // Footer
    footerSpacer: {
        height: 120,
    },

    // MODAL FULLSCREEN DES CHAUFFEURS
    fullScreenModal: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // En-tête fixe du modal
    modalHeaderFixed: {
        backgroundColor: '#1E293B',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 10,
    },

    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },

    modalBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalHeaderInfo: {
        flex: 1,
        alignItems: 'center',
    },

    modalHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: -0.5,
        textAlign: 'center',
    },

    modalHeaderSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        textAlign: 'center',
    },

    modalFilterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalSearchContainer: {
        paddingHorizontal: 20,
    },

    modalSearchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    modalSearchText: {
        flex: 1,
        fontSize: 16,
        color: 'white',
        marginLeft: 10,
    },

    // Filtres
    filtersContainer: {
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    filtersList: {
        paddingHorizontal: 20,
    },

    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    filterItemActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563EB',
    },

    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginLeft: 6,
    },

    filterTextActive: {
        color: '#2563EB',
    },

    // Statistiques
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },

    statsGradient: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 6,
    },

    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    statItem: {
        flex: 1,
        alignItems: 'center',
    },

    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },

    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
    },

    // Liste des chauffeurs
    driversFlatList: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    driversListContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },

    driversListHeader: {
        marginBottom: 20,
    },

    driversListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },

    driversListSubtitle: {
        fontSize: 14,
        color: '#64748B',
    },

    // Carte chauffeur améliorée
    driverCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
    },

    driverCardTouchable: {
        flex: 1,
    },

    driverCardGradient: {
        padding: 20,
        borderRadius: 20,
    },

    driverCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    driverCardAvatarContainer: {
        position: 'relative',
        marginRight: 16,
    },

    driverCardAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },

    driverCardAvatarText: {
        fontSize: 28,
    },

    driverCardOnlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
    },

    driverCardInfo: {
        flex: 1,
    },

    driverCardNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    driverCardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
    },

    driverCardRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },

    driverCardRatingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        marginLeft: 4,
    },

    driverCardMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    driverCardMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },

    driverCardMetaText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        marginLeft: 4,
        textTransform: 'uppercase',
    },

    driverCardPriceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    driverCardPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#065F46',
        marginBottom: 2,
    },

    driverCardPriceLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    driverCardDetails: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },

    driverCardDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    driverCardDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    driverCardDetailText: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },

    driverCardSelectButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    driverCardSelectButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 14,
    },

    driverCardSelectButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 0.5,
        marginRight: 8,
    },

    // Liste vide
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },

    emptyListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748B',
        marginTop: 16,
        marginBottom: 8,
    },

    emptyListSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        maxWidth: '80%',
    },

    // Footer du modal
    modalFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },

    footerPriceContainer: {
        alignItems: 'center',
    },

    footerPriceLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },

    footerPriceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#065F46',
    },

    // Modal Authentification (inchangé)
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },

    blurBackground: {
        ...StyleSheet.absoluteFillObject,
    },

    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },

    modalContent: {
        width: width * 0.9,
        maxWidth: 420,
        borderRadius: 36,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 24 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
        elevation: 30,
    },

    modalGradient: {
        padding: 36,
    },

    modalHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },

    modalIconContainer: {
        width: 108,
        height: 108,
        borderRadius: 54,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 16,
    },

    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },

    modalSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '80%',
        alignSelf: 'center',
    },

    modalButtons: {
        width: '100%',
        marginBottom: 32,
        gap: 16,
    },

    modalBtnPrimary: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },

    modalBtnGradient: {
        paddingVertical: 22,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
    },

    modalBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    modalBtnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        paddingVertical: 22,
        paddingHorizontal: 32,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#2563EB',
        backgroundColor: 'white',
    },

    modalSecondaryText: {
        color: '#2563EB',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },

    socialLogin: {
        width: '100%',
        marginBottom: 28,
    },

    socialDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
        gap: 20,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },

    dividerText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 28,
    },

    socialBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10,
    },

    socialBtnGradient: {
        width: 68,
        height: 68,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    modalCloseBtn: {
        padding: 16,
    },

    modalClose: {
        color: '#64748B',
        fontSize: 15,
        textAlign: 'center',
        fontWeight: '600',
    },

    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        alignItems: 'center',
    },
    toastGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 10,
    },
});