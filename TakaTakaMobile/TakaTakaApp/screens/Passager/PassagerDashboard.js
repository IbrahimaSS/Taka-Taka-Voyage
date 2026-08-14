import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    Dimensions,
    Linking,
    Vibration,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoAudio from 'expo-audio';
import { passagerDashboardStyles as styles } from './PassagerDashboard.styles';
import PlanningScreen from './PlanningScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';
import CreateRideModal from './CreateRideModal';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';
import { socketService } from '../../services/socketService';
import { authService } from '../../services/authService';
import { PLATFORM } from '../../constants/platform';
import { SCREENS } from '../../constants/screens';

// --- Composants extraits et mis à jour ---
import BookingModal from './composants/BookingModal';
import DriverSearchModal from './composants/DriverSearchModal';
import RideTrackingScreen from './composants/SuivisTrajets';
import RideCompletionModal from './composants/RideModalCompletion';
import PaymentScreen from './composants/PaiementScreen';
import RatingScreen from './composants/ÉvaluationScreen';
import NotificationModal from './composants/NotificationModal';

const { width, height } = Dimensions.get('window');

const recentRidesStyles = StyleSheet.create({
    recentRidesSection: {
        marginTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    recentRidesContainer: {
        gap: 12,
    },
    recentRideCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    recentRideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    driverInfoMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    driverAvatarMini: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    driverInitialMini: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
    driverDetails: {
        gap: 2,
    },
    driverNameMini: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    vehicleTypeMini: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#DCFCE7',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#166534',
    },
    rideBody: {
        gap: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    destinationText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        flex: 1,
        lineHeight: 20,
    },
    rideFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    priceTag: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    priceText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#10B981',
    }
});

export default function PassagerDashboard({ onBack, onLogout, setCurrentScreen, setPreviousScreen }) {
    const {
        maintenanceMode,
        darkMode,
        theme,
        user,
        updateUser,
        pendingRideIntent,
        setPendingRideIntent,
        navigationIntent,
        setNavigationIntent,
        rideDraft,
        setRideDraft,
        t
    } = useApp();

    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [activeSubTab, setActiveSubTab] = useState(null);

    // ÉCOUTEUR D'INTENTIONS DE NAVIGATION (IA / EXTERNE)
    useEffect(() => {
        if (navigationIntent) {
            const { tab, subTab } = navigationIntent;
            console.log('🚀 Navigation Intent received:', navigationIntent);

            if (tab) {
                // S'assurer que l'onglet existe
                const validTabs = ['home', 'planning', 'history', 'profile'];
                if (validTabs.includes(tab)) {
                    setActiveTab(tab);
                    if (subTab) {
                        setActiveSubTab(subTab);
                    }
                }
            }

            // Réinitialiser l'intent après traitement
            setNavigationIntent(null);
        }
    }, [navigationIntent]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showDriverSearchModal, setShowDriverSearchModal] = useState(false);
    const [currentBookingData, setCurrentBookingData] = useState(null);
    const [rideStarted, setRideStarted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

    useEffect(() => {
        const syncBalance = async () => {
            try {
                const res = await apiClient('/wallet/solde');
                if (res && res.solde !== undefined) {
                    updateUser({ ...user, solde: res.solde });
                }
            } catch (e) {
                console.log("Sync balance error");
            }
        };

        const syncNotifications = async () => {
            try {
                const res = await apiClient('/passager/notifications');
                if (res.succes) {
                    const unread = res.donnees.filter(n => !n.lue).length;
                    setUnreadNotificationsCount(unread);
                }
            } catch (e) {
                console.log("Sync notifications error");
            }
        };

        syncBalance();
        syncNotifications();
    }, []);

    // ÉTATS POUR GÉRER LA FIN DU TRAJET
    const [showRideCompletion, setShowRideCompletion] = useState(false);
    const [showPaymentScreen, setShowPaymentScreen] = useState(false);
    const [showRatingScreen, setShowRatingScreen] = useState(false);
    const [completedRideData, setCompletedRideData] = useState(null);

    const [recentRides, setRecentRides] = useState([]);
    const [userData, setUserData] = useState(user || {
        name: 'Utilisateur',
        rating: 5.0,
        trips: 0,
        memberSince: '2024',
    });
    const [rideData, setRideData] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [showRideTracking, setShowRideTracking] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // --- SOCKET ET TEMPS RÉEL ---
    useEffect(() => {
        let socket;
        const initSocket = async () => {
            socket = await socketService.connect();
            if (socket) {
                socket.emit('join', user.id);

                // 1. Chauffeur trouvé
                socket.on('course:chauffeur_trouve', (data) => {
                    console.log('🚗 Chauffeur trouvé!', data);
                    setRideData(prev => ({ ...prev, ...data, status: 'ACCEPTEE' }));
                    setShowDriverSearchModal(false);
                });

                // 2. Chauffeur en route
                socket.on('course:chauffeur_en_route', (data) => {
                    console.log('📍 Chauffeur en route!', data);
                    setRideData(prev => ({ ...prev, ...data, status: 'ASSIGNEE' }));
                    setShowRideTracking(true);
                });

                // 3. Trajet démarré
                socket.on('course:demarre', (data) => {
                    console.log('🚀 Trajet démarré!', data);
                    setRideData(prev => ({ ...prev, ...data, status: 'EN_COURS' }));
                    setShowRideTracking(true);
                });

                // 4. Trajet terminé
                socket.on('course:finit_avec_paiement', (data) => {
                    console.log('🏁 Trajet terminé!', data);
                    setRideData(prev => ({ ...prev, ...data, status: 'TERMINEE' }));
                    setShowRideTracking(false);
                    setShowRideCompletion(true);
                });

                // 5. Position chauffeur (streaming)
                socket.on('miseAJourPositionChauffeur', (data) => {
                    if (rideData && data.chauffeurId === rideData.chauffeurId) {
                        setDriverLocation(data.position);
                    }
                });
            }
        };

        if (user) initSocket();
        
        return () => {
            if (socket) {
                socket.off('course:chauffeur_trouve');
                socket.off('course:chauffeur_en_route');
                socket.off('course:demarre');
                socket.off('course:finit_avec_paiement');
                socket.off('miseAJourPositionChauffeur');
            }
            socketService.disconnect();
        };
    }, [user, rideData]);

    useEffect(() => {
        if (user) {
            setUserData(user);
        }

        const refreshProfile = async () => {
            try {
                // 1. Refresh global user data (stats etc)
                const refreshed = await authService.getCurrentUser();
                if (refreshed) updateUser(refreshed);

                // 2. Fetch the 3 most recent rides
                const ridesRes = await apiClient('/passager/trajets?limit=3');
                if (ridesRes.succes && ridesRes.trajets) {
                    setRecentRides(ridesRes.trajets);
                    // Mettre à jour le nombre total de trajets dans l'état global
                    if (ridesRes.pagination && ridesRes.pagination.total !== undefined) {
                        updateUser({ trips: ridesRes.pagination.total });
                    }
                }
            } catch (e) {
                console.error('Fetch recent rides error:', e);
            }
        };

        // Always refresh on mount to ensure we have the latest rides and stats
        refreshProfile();
    }, []);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const mapRef = useRef(null);

    // Toast Global
    const [toastConfig, setToastConfig] = useState(null);
    const toastAnim = useRef(new Animated.Value(-150)).current;
    const audioPlayer = ExpoAudio.useAudioPlayer(require('../../assets/sounds/notification.mp3'));

    const showGlobalToast = (title, message, icon, color) => {
        setToastConfig({ title, message, icon, color });
        try { if (audioPlayer) { audioPlayer.seekTo(0); audioPlayer.play(); } } catch (e) { }
        Vibration.vibrate([0, 200, 100, 200]);
        toastAnim.stopAnimation();
        toastAnim.setValue(-150);

        Animated.sequence([
            Animated.timing(toastAnim, { toValue: Platform.OS === 'ios' ? 60 : 40, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.delay(3500),
            Animated.timing(toastAnim, { toValue: -150, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ]).start(({ finished }) => { if (finished) setToastConfig(null); });
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
        ]).start();

        requestLocationPermission();
    }, []);

    // RÉCUPÉRATION DU TRAJET SAISI DANS L'ACCUEIL
    useEffect(() => {
        if (pendingRideIntent && rideDraft.pickup && rideDraft.destination) {
            setPickup(rideDraft.pickup);
            setDestination(rideDraft.destination);

            const timer = setTimeout(() => {
                setPendingRideIntent(false);
                setBookingModalVisible(true);
                setRideDraft({ pickup: '', destination: '' });
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [pendingRideIntent, rideDraft]);

    const requestLocationPermission = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Refus de permission : message clair plutôt que de rester silencieux,
                // avec un raccourci direct vers les réglages de l'app.
                Alert.alert(
                    'Localisation désactivée',
                    'Pour afficher votre position sur la carte, autorisez l\'accès à la localisation dans les paramètres de l\'application.',
                    [
                        { text: 'Plus tard', style: 'cancel' },
                        { text: 'Ouvrir les paramètres', onPress: () => Linking.openSettings() },
                    ]
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude, longitude } = location.coords;
            setUserLocation({ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 });
        } catch (error) {
            // Permission accordée mais position indisponible (service de localisation/GPS
            // désactivé au niveau de l'appareil, ou signal introuvable) : message
            // d'information à l'utilisateur plutôt qu'une erreur technique silencieuse.
            // "console.log" et pas "console.error" : ça évite le bandeau d'erreur
            // intrusif de LogBox pour un cas déjà géré proprement par l'alerte ci-dessous.
            console.log('Location error:', error.message);
            Alert.alert(
                'Position indisponible',
                'Impossible d\'obtenir votre position actuelle. Vérifiez que la localisation est activée sur votre appareil, puis réessayez.',
                [
                    { text: 'OK', style: 'cancel' },
                    { text: 'Réessayer', onPress: () => requestLocationPermission() },
                ]
            );
        }
    };


    const handleZoom = (type) => {
        if (!mapRef.current) return;

        mapRef.current.getCamera().then((camera) => {
            const newZoom = type === 'in' ? camera.zoom + 1 : camera.zoom - 1;
            mapRef.current.animateCamera({ zoom: newZoom }, { duration: 300 });
        });
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'emergency': Alert.alert('Urgence', 'Appel d\'urgence activé.'); break;
            case 'share': Alert.alert('Partager', 'Partage de votre trajet activé.'); break;
            case 'sos': Alert.alert('SOS', 'Message SOS envoyé.'); break;
        }
    };

    const handleConfirmRide = (rideData) => {
        setRideData(rideData);
        if (rideData.rideType === PLATFORM.rideTypes.immediate.label || !rideData.rideType) {
            setShowDriverSearchModal(true);
        } else {
            setToast({
                visible: true,
                message: "Trajet planifié avec succès !",
                type: 'success'
            });
        }
    };

    const handleDriverFound = () => {
        setShowDriverSearchModal(false);
        // Transition directe vers le suivi pour un effet plus fluide
        setRideStarted(true);
    };

    const handleRideEnd = () => {
        setRideStarted(false);

        const completedRide = {
            ...currentBookingData,
            distance: '124.6 km',
            duration: '374 min',
            departureTime: '23:38',
            arrivalTime: '00:00',
            driver: 'Mamadou Diallo',
            basePrice: '249 235',
            serviceFee: '100',
            trafficSurcharge: '0',
            total: '349'
        };

        setCompletedRideData(completedRide);
        setShowRideCompletion(true);
    };

    const renderRecentRides = () => (
        <View style={recentRidesStyles.recentRidesSection}>
            <View style={recentRidesStyles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: darkMode ? '#F9FAFB' : '#FFFFFF' }]}>{t('home_recent_rides')}</Text>
                <TouchableOpacity onPress={() => handleTabChange('history')}>
                    <Text style={recentRidesStyles.seeAllText}>{t('home_see_all')}</Text>
                </TouchableOpacity>
            </View>

            <View style={recentRidesStyles.recentRidesContainer}>
                {recentRides.length === 0 ? (
                    <View style={{ padding: 24, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
                        <Ionicons name="car-outline" size={40} color="rgba(255,255,255,0.3)" />
                        <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 13 }}>{t('home_no_rides')}</Text>
                    </View>
                ) : (
                    recentRides.map((ride) => {
                        const driverName = ride.chauffeur ? `${ride.chauffeur.prenom} ${ride.chauffeur.nom.charAt(0)}.` : 'En cours...';
                        const vehicleType = ride.chauffeur?.profilVehicule?.type || ride.chauffeur?.vehicule?.type || 'Véhicule';
                        const vehicleLabel = vehicleType.replace('_', ' ');

                        // Date formatting
                        const dateObj = new Date(ride.createdAt);
                        const day = dateObj.getDate();
                        const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
                        const month = months[dateObj.getMonth()];
                        const hours = dateObj.getHours().toString().padStart(2, '0');
                        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                        const formattedDate = `${day} ${month}, ${hours}:${minutes}`;

                        return (
                            <TouchableOpacity
                                key={ride._id || ride.id}
                                style={[recentRidesStyles.recentRideCard, { backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}
                                activeOpacity={0.7}
                            >
                                <View style={recentRidesStyles.recentRideHeader}>
                                    <View style={recentRidesStyles.driverInfoMini}>
                                        <View style={[recentRidesStyles.driverAvatarMini, { backgroundColor: darkMode ? '#374151' : '#F0FDF4' }]}>
                                            <Text style={[recentRidesStyles.driverInitialMini, { color: '#10B981' }]}>
                                                {driverName.charAt(0)}
                                            </Text>
                                        </View>
                                        <View style={recentRidesStyles.driverDetails}>
                                            <Text style={[recentRidesStyles.driverNameMini, { color: theme.text }]}>{driverName}</Text>
                                            <Text style={recentRidesStyles.vehicleTypeMini}>{vehicleLabel}</Text>
                                        </View>
                                    </View>
                                    <View style={[recentRidesStyles.statusBadge, { backgroundColor: ride.statut === 'TERMINEE' ? '#DCFCE7' : '#FEF3C7' }]}>
                                        <Text style={[recentRidesStyles.statusText, { color: ride.statut === 'TERMINEE' ? '#166534' : '#D97706' }]}>
                                            {ride.statut === 'TERMINEE' ? 'Terminé' : 'En cours'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={recentRidesStyles.rideBody}>
                                    <View style={recentRidesStyles.locationContainer}>
                                        <View style={{ marginTop: 2 }}>
                                            <Ionicons name="location" size={18} color="#EF4444" />
                                        </View>
                                        <Text style={[recentRidesStyles.destinationText, { color: theme.textSecondary }]} numberOfLines={2}>
                                            {ride.destination}
                                        </Text>
                                    </View>

                                    <View style={recentRidesStyles.rideFooter}>
                                        <View style={recentRidesStyles.metaInfo}>
                                            <Ionicons name="time-outline" size={14} color="#94A3B8" />
                                            <Text style={recentRidesStyles.dateText}>{formattedDate}</Text>
                                        </View>
                                        <View style={[recentRidesStyles.priceTag, { backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
                                            <Text style={recentRidesStyles.priceText}>
                                                {ride.prix ? Number(ride.prix).toLocaleString('fr-FR') : '0'} GNF
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </View>
    );

    const renderHeader = () => (
        <LinearGradient
            colors={theme.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumHeader}
        >
            <View style={styles.userInfoRow}>
                {/* Gauche : Photo + Nom de l'utilisateur */}
                <TouchableOpacity
                    style={styles.headerLeft}
                    onPress={() => handleTabChange('profile')}
                >
                    <View style={styles.miniAvatar}>
                        {user && (user.photo || user.photoUrl || user.avatar) ? (
                            <Image
                                source={{ 
                                    uri: (user.photo || user.photoUrl || user.avatar).startsWith('http')
                                        ? (user.photo || user.photoUrl || user.avatar)
                                        : `https://taka-taka-voyage.onrender.com${user.photo || user.photoUrl || user.avatar}`
                                }}
                                style={styles.miniAvatarImage}
                                onError={() => updateUser({ ...user, photo: null, photoUrl: null, avatar: null })}
                            />
                        ) : (
                            <Text style={styles.miniAvatarText}>
                                {user && (user.prenom || user.name) ? (user.prenom || user.name).charAt(0) : 'U'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerUserInfo}>
                        <Text style={styles.miniUserName}>{user.name || `${user.prenom} ${user.nom}`}</Text>
                        <View style={styles.miniStats}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={styles.miniStatText}>{userData.rating}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Droite : Wallet et Notifications */}
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        style={styles.walletHeaderBadge}
                        onPress={() => {
                            setPreviousScreen(SCREENS.PASSAGER_DASHBOARD);
                            setCurrentScreen(SCREENS.WALLET);
                        }}
                    >
                        <Ionicons name="wallet" size={16} color="#10B981" />
                        <Text style={styles.walletHeaderText}>
                            {user?.solde?.toLocaleString('fr-FR') || 0}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => setShowNotificationModal(true)}
                    >
                        <Ionicons name="notifications" size={26} color="#FFFFFF" />
                        {unreadNotificationsCount > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.searchContainer} onPress={() => setBookingModalVisible(true)}>
                <View style={styles.searchIcon}>
                    <Ionicons name="search" size={20} color="#6B7280" />
                </View>
                <Text style={styles.searchPlaceholder}>{t('home_where_to')}</Text>
                <View style={styles.searchOptions}>
                    <Ionicons name="options" size={20} color="#3B82F6" />
                </View>
            </TouchableOpacity>
        </LinearGradient>
    );

    const renderHomeContent = () => (
        <>
            <View style={styles.mapSection}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={userLocation}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    {userLocation && (
                        <Marker coordinate={userLocation} title="Votre position">
                            <View style={styles.userMarker}>
                                <Ionicons name="location" size={24} color="#3B82F6" />
                            </View>
                        </Marker>
                    )}
                </MapView>
                <View style={styles.floatingButtons}>
                    {/* Contrôles de Zoom */}
                    <View style={styles.zoomControls}>
                        <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('in')}>
                            <Ionicons name="add" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <View style={styles.zoomDivider} />
                        <TouchableOpacity style={styles.zoomBtn} onPress={() => handleZoom('out')}>
                            <Ionicons name="remove" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.floatingButton} onPress={() => handleQuickAction('share')}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.shareButton}>
                            <Ionicons name="share-social" size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
            {renderRecentRides()}
        </>
    );

    const renderMainContent = () => {
        switch (activeTab) {
            case 'planning': return <PlanningScreen onClose={() => setActiveTab('home')} onNewTrip={() => setBookingModalVisible(true)} />;
            case 'history': return <HistoryScreen navigation={{ goBack: () => setActiveTab('home') }} initialTab={activeSubTab} />;
            case 'profile': 
                return <ProfileScreen 
                    navigation={{ 
                        goBack: () => setActiveTab('home'),
                        navigate: (screen) => {
                            if (screen === 'forum') {
                                setPreviousScreen(SCREENS.PASSAGER_DASHBOARD);
                                setCurrentScreen(SCREENS.FORUM);
                            }
                        }
                    }} 
                    onLogout={onLogout} 
                    onOpenAssistant={setCurrentScreen ? () => setCurrentScreen('assistant') : undefined} 
                />;
            case 'home': default: return renderHomeContent();
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setActiveSubTab(null); // Réinitialiser le sous-onglet lors d'un changement manuel
    };

    const renderBottomNavigation = () => {
        if (activeTab !== 'home' && activeTab !== 'planning') return null;
        return (
            <LinearGradient colors={darkMode ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F8FAFC']} style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('home')}>
                    <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={24} color={activeTab === 'home' ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive, { color: activeTab === 'home' ? theme.primary : theme.textSecondary }]}>{t('nav_home')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('planning')}>
                    <Ionicons name={activeTab === 'planning' ? 'calendar' : 'calendar-outline'} size={24} color={activeTab === 'planning' ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.navText, activeTab === 'planning' && styles.navTextActive, { color: activeTab === 'planning' ? theme.primary : theme.textSecondary }]}>{t('nav_planning')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navCenterItem} onPress={() => setBookingModalVisible(true)}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.centerButton}>
                        <Ionicons name="add" size={28} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('history')}>
                    <Ionicons name={activeTab === 'history' ? 'time' : 'time-outline'} size={24} color={activeTab === 'history' ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.navText, activeTab === 'history' && styles.navTextActive, { color: activeTab === 'history' ? theme.primary : theme.textSecondary }]}>{t('nav_history')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleTabChange('profile')}>
                    <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={24} color={activeTab === 'profile' ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive, { color: activeTab === 'profile' ? theme.primary : theme.textSecondary }]}>{t('nav_profile')}</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    };

    const handleRestore = () => setIsMinimized(false);
    const handleMinimize = () => setIsMinimized(true);

    const renderFloatingStatus = () => {
        if (!isMinimized || (!showDriverSearchModal && !rideStarted)) return null;

        return (
            <TouchableOpacity
                style={styles.floatingStatus}
                onPress={handleRestore}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#2563EB', '#1D4ED8']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.floatingGradient}
                >
                    <View style={styles.floatingIconBox}>
                        <Ionicons name={showDriverSearchModal ? "search" : "car"} size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.floatingText}>
                        {showDriverSearchModal ? t('home_searching_driver') : t('home_ride_in_progress')}
                    </Text>
                    <Ionicons name="chevron-up" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.premiumContainer}>
            <LinearGradient
                colors={darkMode ? ['#047857', '#1E3A8A'] : ['#10B981', '#2563EB']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
                {maintenanceMode && (
                    <View style={{ backgroundColor: '#FEF2F2', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="construct" size={20} color="#DC2626" />
                        <Text style={{ color: '#B91C1C', fontWeight: '600', flex: 1 }}>Maintenance en cours. Les réservations sont temporairement suspendues.</Text>
                    </View>
                )}
                {activeTab === 'home' ? (
                    <View style={{ flex: 1 }}>
                        <Animated.View style={[styles.contentContainer, { flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            {renderHeader()}
                            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {renderHomeContent()}
                            </ScrollView>
                            {renderBottomNavigation()}
                        </Animated.View>
                    </View>
                ) : activeTab === 'planning' ? (
                    <View style={{ flex: 1, backgroundColor: darkMode ? '#111827' : '#F8FAFC' }}>
                        <LinearGradient
                            colors={['#10B981', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
                                paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 20,
                                borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 10, zIndex: 100,
                            }}
                        >
                            <TouchableOpacity onPress={() => setActiveTab('home')} style={{ padding: 8 }}>
                                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{
                                    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFFFFF',
                                    alignItems: 'center', justifyContent: 'center', elevation: 5, overflow: 'hidden',
                                    borderWidth: 1.5, borderColor: '#10B981'
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
                                <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </LinearGradient>
                        {renderMainContent()}
                        {renderBottomNavigation()}
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>{renderMainContent()}</View>
                )}

                <CreateRideModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} darkMode={darkMode} />
                <BookingModal
                    visible={bookingModalVisible}
                    onClose={() => setBookingModalVisible(false)}
                    onConfirm={handleConfirmRide}
                    initialPickup={pickup}
                    initialDestination={destination}
                    darkMode={darkMode}
                />

                <NotificationModal
                    visible={showNotificationModal}
                    onClose={() => setShowNotificationModal(false)}
                    darkMode={darkMode}
                />

                <DriverSearchModal
                    visible={showDriverSearchModal}
                    minimized={isMinimized}
                    onMinimize={handleMinimize}
                    onCancel={() => {
                        setShowDriverSearchModal(false);
                        setCurrentBookingData(null);
                        setIsMinimized(false);
                    }}
                    onDriverFound={handleDriverFound}
                    darkMode={darkMode}
                />

                {rideStarted && (
                    <RideTrackingScreen
                        rideData={currentBookingData}
                        onRideEnd={handleRideEnd}
                        onBack={() => {
                            setRideStarted(false);
                            setIsMinimized(false);
                        }}
                        userLocation={userLocation}
                        minimized={isMinimized}
                        onMinimize={handleMinimize}
                        showToast={showGlobalToast}
                        darkMode={darkMode}
                    />
                )}

                {renderFloatingStatus()}



                <RideCompletionModal
                    visible={showRideCompletion}
                    onClose={() => {
                        setShowRideCompletion(false);
                        setCurrentBookingData(null);
                    }}
                    bookingData={completedRideData}
                    onPaymentRequired={() => {
                        setShowRideCompletion(false);
                        setShowPaymentScreen(true);
                    }}
                    onRatingRequired={() => {
                        setShowRideCompletion(false);
                        setShowRatingScreen(true);
                    }}
                    darkMode={darkMode}
                />

                <PaymentScreen
                    visible={showPaymentScreen}
                    onClose={() => setShowPaymentScreen(false)}
                    onPaymentSuccess={() => {
                        setShowPaymentScreen(false);
                        setShowRatingScreen(true);
                    }}
                    rideData={completedRideData}
                />

                <RatingScreen
                    visible={showRatingScreen}
                    onClose={() => {
                        setShowRatingScreen(false);
                        setCurrentBookingData(null);
                    }}
                    onSubmit={(ratingData) => {
                        console.log('Évaluation soumise:', ratingData);
                        Alert.alert('Merci !', 'Votre évaluation a été enregistrée.');
                        setShowRatingScreen(false);
                        setCurrentBookingData(null);
                    }}
                    rideData={completedRideData}
                />

                <TouchableOpacity
                    style={{
                        position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 90,
                        right: 20, width: 60, height: 60, borderRadius: 30,
                        backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center',
                        elevation: 6, zIndex: 9999
                    }}
                    onPress={() => Alert.alert('Taka-Assistant', "L'Assistant IA sera bientôt disponible sur mobile!")}
                >
                    <LinearGradient
                        colors={['#10B981', '#2563EB']}
                        style={{ width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <MaterialCommunityIcons name="robot-outline" size={30} color="#FFFFFF" />
                        <View style={{
                            position: 'absolute', top: 12, right: 12, width: 12, height: 12,
                            borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF'
                        }} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Global Toast - Rendered last to be on top */}
                {toastConfig && (
                    <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                        <View style={styles.toastContent}>
                            <View style={[styles.toastIconBox, { backgroundColor: `${toastConfig.color}15` }]}>
                                <Ionicons name={toastConfig.icon} size={24} color={toastConfig.color} />
                            </View>
                            <View style={styles.toastTextContent}>
                                <Text style={styles.toastTitle}>{toastConfig.title}</Text>
                                <Text style={styles.toastMessage}>{toastConfig.message}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>
        </View>
    );
}