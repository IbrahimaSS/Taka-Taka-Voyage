import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    // Conteneur principal
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },

    // Header
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
    },
    welcomeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    adminName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    adminRole: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },

    // Statistiques
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 20,
    },
    statCard: {
        width: (width - 60) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Section générale
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    viewAllText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
    },

    // Actions rapides
    quickActionsSection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: (width - 60) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
        textAlign: 'center',
    },

    // Chauffeurs en attente
    pendingSection: {
        marginBottom: 25,
    },
    pendingDriverCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pendingDriverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    pendingDriverAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pendingDriverInitial: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    pendingDriverDetails: {
        flex: 1,
    },
    pendingDriverName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    pendingDriverCar: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 5,
    },
    pendingDriverDocs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    docBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 5,
        marginBottom: 5,
    },
    docBadgeValid: {
        backgroundColor: '#D1FAE5',
    },
    docBadgePending: {
        backgroundColor: '#FEF3C7',
    },
    docBadgeText: {
        fontSize: 10,
        color: '#4B5563',
    },
    reviewButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 10,
    },
    reviewButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },

    // Litiges
    disputesSection: {
        marginBottom: 25,
    },
    disputeCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    disputeTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    disputeStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    disputeStatusPending: {
        backgroundColor: '#FEF3C7',
    },
    disputeStatusInProgress: {
        backgroundColor: '#DBEAFE',
    },
    disputeStatusText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#92400E',
    },
    disputeDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 10,
        lineHeight: 16,
    },
    disputeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disputeDate: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    disputeAmount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },

    // Recherche
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1F2937',
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Filtres
    filterSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    filterTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#3B82F6',
    },
    filterTabText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },

    // Liste des chauffeurs
    driversList: {
        paddingHorizontal: 20,
    },
    driverCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    driverCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    driverAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    driverInitial: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    driverPhone: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 5,
    },
    driverMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverCar: {
        fontSize: 11,
        color: '#4B5563',
    },
    driverPlate: {
        fontSize: 11,
        color: '#4B5563',
    },
    driverRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    driverRatingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
        marginLeft: 4,
    },
    driverDocuments: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 8,
    },
    documentText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 6,
    },
    driverActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    driverActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    driverActionText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 4,
    },
    manageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#DBEAFE',
    },
    manageButtonText: {
        fontSize: 12,
        color: '#1E40AF',
        marginLeft: 4,
    },
    approveDriverButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#10B981',
    },
    approveDriverText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
        marginLeft: 4,
    },

    // Badge de statut
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 10,
    },
    statusActive: {
        backgroundColor: '#D1FAE5',
    },
    statusSuspended: {
        backgroundColor: '#FEF3C7',
    },
    statusBlocked: {
        backgroundColor: '#FEE2E2',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#065F46',
    },

    // Trajets
    ridesHeader: {
        paddingHorizontal: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ridesCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    trackingSection: {
        height: 200,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    activeRidesList: {
        paddingHorizontal: 20,
    },
    activeRideCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeRideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rideInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rideDriver: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    ridePassenger: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 5,
    },
    rideStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rideStatusActive: {
        backgroundColor: '#D1FAE5',
    },
    rideStatusPickup: {
        backgroundColor: '#DBEAFE',
    },
    rideStatusText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#065F46',
    },
    rideRoute: {
        marginBottom: 12,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 8,
        flex: 1,
    },
    rideFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rideMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    metaText: {
        fontSize: 11,
        color: '#4B5563',
        marginLeft: 4,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#DBEAFE',
    },
    trackButtonText: {
        fontSize: 12,
        color: '#1E40AF',
        marginLeft: 4,
    },

    // Litiges - Statistiques
    disputesStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    disputeStatCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disputeStatValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 5,
    },
    disputeStatLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },

    // Litiges - Liste
    disputesList: {
        paddingHorizontal: 20,
    },
    disputeCardLarge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disputeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    disputeCardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    disputeCardSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    disputeCardStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    disputeCardStatusPending: {
        backgroundColor: '#FEF3C7',
    },
    disputeCardStatusInProgress: {
        backgroundColor: '#DBEAFE',
    },
    disputeCardStatusResolved: {
        backgroundColor: '#D1FAE5',
    },
    disputeCardStatusText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#92400E',
    },
    disputeCardDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 16,
    },
    disputeCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disputeCardInfo: {
        flex: 1,
    },
    disputeCardDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    disputeCardAmount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    resolveNowButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    resolveNowText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },

    // Tarification
    pricingSection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    pricingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pricingItem: {
        marginBottom: 15,
    },
    pricingLabel: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    pricingInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1F2937',
    },
    updatePricingButton: {
        marginTop: 10,
    },
    updatePricingGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    updatePricingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },

    // Commission
    commissionSection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    commissionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    commissionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    commissionTitle: {
        fontSize: 14,
        color: '#4B5563',
    },
    commissionValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#3B82F6',
    },
    commissionSlider: {
        marginBottom: 20,
    },
    sliderTrack: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginBottom: 10,
    },
    sliderProgress: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderLabel: {
        fontSize: 11,
        color: '#6B7280',
    },
    adjustCommissionButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    adjustCommissionText: {
        color: '#4B5563',
        fontSize: 14,
        fontWeight: '500',
    },

    // Paramètres
    settingsSection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
        marginLeft: 12,
    },
    settingDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 12,
    },

    // Gestion des données
    dataManagementSection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    dataActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dataActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dataActionInfo: {
        flex: 1,
    },
    dataActionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    dataActionDescription: {
        fontSize: 12,
        color: '#6B7280',
    },

    // Réinitialisation
    resetSettingsButton: {
        backgroundColor: '#FEE2E2',
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    resetSettingsText: {
        color: '#DC2626',
        fontSize: 16,
        fontWeight: '600',
    },

    // Navigation du bas
    bottomNavigation: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navItemActive: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
    },
    navText: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 4,
    },
    navTextActive: {
        color: '#1E3A8A',
        fontWeight: '500',
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.85,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Modal Détails Chauffeur
    driverModalContent: {
        padding: 20,
    },
    driverModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    driverModalAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    driverModalInitial: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '600',
    },
    driverModalInfo: {
        flex: 1,
    },
    driverModalName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    driverModalPhone: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    driverModalRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    driverModalRatingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginLeft: 4,
    },
    driverModalSection: {
        marginBottom: 25,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 15,
    },
    driverModalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    driverModalLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    driverModalValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        flex: 2,
        textAlign: 'right',
    },
    documentStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    documentStatusValid: {
        backgroundColor: '#D1FAE5',
    },
    documentStatusPending: {
        backgroundColor: '#FEF3C7',
    },
    documentStatusText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#065F46',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#DBEAFE',
        marginRight: 10,
    },
    rejectButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        marginRight: 10,
        flex: 1,
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '500',
    },
    approveButton: {
        flex: 1,
    },
    approveButtonGradient: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },

    // Modal Actions Utilisateur
    userActionModalContent: {
        padding: 20,
    },
    actionButtonsContainer: {
        marginTop: 20,
    },
    suspendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF3C7',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    blockButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    activateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D1FAE5',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    cancelButton: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },

    // Modal Suivi de course
    trackingModalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: height * 0.85,
    },
    trackingModalContent: {
        flex: 1,
    },
    rideTrackingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    rideTrackingInfo: {
        flex: 1,
    },
    rideTrackingTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    rideTrackingSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    rideStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginLeft: 10,
    },
    rideStatusActive: {
        backgroundColor: '#D1FAE5',
    },
    rideStatusPending: {
        backgroundColor: '#DBEAFE',
    },
    rideStatusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#065F46',
    },
    trackingMapContainer: {
        height: 300,
    },
    trackingMap: {
        flex: 1,
    },
    driverMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    passengerMarker: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    rideTrackingDetails: {
        padding: 20,
    },
    rideDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    rideDetailContent: {
        marginLeft: 12,
        flex: 1,
    },
    rideDetailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    rideDetailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },

    // Modal Litige
    disputeModalContent: {
        padding: 20,
    },
    disputeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    disputeBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    disputeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    disputeStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    disputeStatusPending: {
        backgroundColor: '#FEF3C7',
    },
    disputeStatusInProgress: {
        backgroundColor: '#DBEAFE',
    },
    disputeStatusResolved: {
        backgroundColor: '#D1FAE5',
    },
    disputeStatusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#065F46',
    },
    disputeSection: {
        marginBottom: 25,
    },
    disputeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    disputeLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    disputeValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        flex: 2,
        textAlign: 'right',
    },
    disputeDescription: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 8,
        marginTop: 5,
    },
    resolveButton: {
        flex: 1,
    },
    resolveButtonGradient: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resolveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});