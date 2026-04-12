import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    Image,
    ActivityIndicator,
    Animated,
    Easing,
    Switch,
    Modal,
    RefreshControl,
    TextInput,
    ImageBackground
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './DriverDashboard.styles';
import { PLATFORM } from '../../constants/platform';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';
import { socketService } from '../../services/socketService';
import { authService } from '../../services/authService';
import { authService as authSvc } from '../../services/authService';

// Nouveaux composants extraits
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import DriverNotificationsModal from './composants/DriverNotificationsModal';
import RideAcceptModal from './composants/RideAcceptModal';
import DriverPlanningModal from './composants/DriverPlanningModal';
import AddPlanningSlotModal from './composants/AddPlanningSlotModal';
import TransactionDetailModal from './composants/TransactionDetailModal';
import QRScannerModal from './composants/QRScannerModal';
import TripCancelModal from './composants/TripCancelModal';
import { MonProfil, Documents, AideSupport, Parametres } from './composants/DriverProfileSubScreens';
import { CurrentRideCard, MainDashboardHeaderCombined, AcceptedMissionsList } from './composants/DashboardComposants';
import { RidesHistoryTab, EarningsTab } from './composants/RidesAndEarningsTabs';
import AvailableRidesList from './composants/AvailableRidesList';
import TakaAlertModal from './composants/TakaAlertModal';

const { width, height } = Dimensions.get('window');

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#cbd5e1" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#475569" }] },
    { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#334155" }] }
];

export default function DriverDashboard({ onLogout, setCurrentScreen }) {
    const { maintenanceMode, darkMode, theme, toggleDarkMode, user, navigationIntent, setNavigationIntent } = useApp();
    const [isOnline, setIsOnline] = useState(true);
    const [currentRide, setCurrentRide] = useState(null);
    const [availableRides, setAvailableRides] = useState([]);
    const [earnings, setEarnings] = useState({
        today: 0,
        weekly: 0,
        monthly: 0,
        total: 0
    });
    const [stats, setStats] = useState({
        totalRides: 0,
        rating: 0,
        acceptanceRate: 0,
        cancellationRate: 0
    });
    const [driverLocation, setDriverLocation] = useState(null);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // ÉCOUTEUR D'INTENTIONS DE NAVIGATION (IA / EXTERNE)
    useEffect(() => {
        if (navigationIntent) {
            const { tab, subTab } = navigationIntent;
            console.log('🚗 Navigation Intent received (Driver):', navigationIntent);

            if (tab) {
                const validTabs = ['home', 'rides', 'earnings', 'profile'];
                if (validTabs.includes(tab)) {
                    setActiveTab(tab);
                    if (tab === 'profile' && subTab) {
                        setActiveProfileSubTab(subTab);
                    }
                }
            }

            setNavigationIntent(null);
        }
    }, [navigationIntent]);

    // État pour les sous-onglets du profil
    const [activeProfileSubTab, setActiveProfileSubTab] = useState('main');

    // États pour les modals et notifications
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showRideAcceptModal, setShowRideAcceptModal] = useState(false);
    const [showPlanningModal, setShowPlanningModal] = useState(false);
    const [showAddSlotModal, setShowAddSlotModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
        onConfirm: null
    });

    const showAlert = (title, message, type = 'success', onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, type, onConfirm });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const [plannings, setPlannings] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    const [userData, setUserData] = useState(user || {
        name: 'Chauffeur',
        phone: '',
        email: '',
        car: '',
        plate: '',
        rating: 5.0,
        address: '',
        joinDate: '',
    });

    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    // États pour le temps réel
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    // Photo de profil : utiliser la photo réelle de l'utilisateur (depuis la base de données)
    const [profileImage, setProfileImage] = useState(null);

    // Fonction pour formater l'URL de l'image (copiée de authService)
    const formatImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        let BASE = 'https://taka-taka-voyage.onrender.com';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BASE}${cleanPath}`;
    };

    // 1. Initialisation des Sockets et Mise en Ligne
    useEffect(() => {
        const initSocket = async () => {
            const socket = await socketService.connect();
            if (socket) {
                // Rejoindre la salle de l'utilisateur
                socket.emit('join', user.id);

                // Écouter les nouvelles demandes
                socket.on('course:demande', (data) => {
                    console.log('🚕 Nouvelle demande reçue (course:demande)!', data);

                    const formattedRide = {
                        id: data.reservationId || data._id || data.id,
                        passengerName: data.passengerName || 'Passager',
                        passengerRating: data.passengerRating || 4.5,
                        pickup: data.pickupAddress || data.depart?.adresse || 'Position actuelle',
                        destination: data.destinationAddress || data.destination?.adresse || 'Destination',
                        distance: typeof data.distance === 'number' ? `${data.distance} km` : (data.distance || '? km'),
                        duration: data.estimatedTime || `${data.dureeMin || '?'} min`,
                        price: `${data.estimatedFare || data.prix || '0'} GNF`,
                        passengerCount: data.nombrePassagers || 1,
                        paymentMethod: data.paiement?.methode || 'Cash',
                        timeAgo: 'À l\'instant',
                        raw: data
                    };

                    setAvailableRides(prev => [formattedRide, ...prev]);
                    setSelectedRide(formattedRide);
                    setShowRideAcceptModal(true);
                    playNotificationSound();
                });
            }
        };

        if (user) initSocket();
        return () => socketService.disconnect();
    }, [user]);

    // 2. Mise à jour de la position GPS quand en ligne
    useEffect(() => {
        let interval;
        if (isOnline && user) {
            interval = setInterval(async () => {
                try {
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    const { latitude, longitude } = location.coords;

                    socketService.emit('mettreAJourPosition', {
                        chauffeurId: user.id,
                        position: { latitude, longitude }
                    });
                } catch (err) {
                    console.error('GPS Update error:', err);
                }
            }, 15000); // 15 sec
        }
        return () => clearInterval(interval);
    }, [isOnline, user]);

    // 3. Charger les données initiales
    useEffect(() => {
        const fetchDriverDashboardData = async () => {
            try {
                // 1. Appel au dashboard
                const dashRes = await apiClient('/chauffeur/dashboard');
                if (dashRes && dashRes.succes && dashRes.data) {
                    const { stats: serverStats } = dashRes.data;
                    setEarnings(prev => ({
                        ...prev,
                        today: serverStats.revenusJournaliers || 0,
                    }));

                    // Par défaut, l'utilisateur a demandé d'être en ligne
                    setIsOnline(true);
                }

                // 2. Appel au profil
                const profileRes = await apiClient('/chauffeur/profile');
                if (profileRes && profileRes.succes && profileRes.profil) {
                    const p = profileRes.profil;
                    if (p.photoUrl) setProfileImage(formatImageUrl(p.photoUrl));

                    setUserData(prev => ({
                        ...prev,
                        name: `${p.prenom || ''} ${p.nom || ''}`.trim() || prev.name,
                        phone: p.telephone || prev.phone,
                        email: p.email || prev.email,
                        address: p.localisation || prev.address,
                        car: p.vehicule?.marque && p.vehicule?.modele ? `${p.vehicule.marque} ${p.vehicule.modele}` : p.vehicule?.marque || p.vehicule?.modele || prev.car,
                        plate: p.vehicule?.plaque || prev.plate,
                    }));

                    setStats(prev => ({
                        ...prev,
                        totalRides: p.stats?.trajetsCompletes || 0,
                        rating: p.stats?.noteMoyenne || 5.0,
                    }));
                    setEarnings(prev => ({
                        ...prev,
                        total: p.stats?.revenusTotaux || 0,
                    }));

                    const typeLabels = {
                        'PERMIS': 'Permis de conduire',
                        'ASSURANCE': 'Assurance véhicule',
                        'CARTE_GRISE': 'Carte grise',
                        'IDENTITE': 'Pièce d\'identité',
                        'PHOTO_VEHICULE': 'Photo du véhicule'
                    };

                    const formattedDocs = (p.documents || []).map(doc => ({
                        id: doc._id || Math.random().toString(),
                        name: typeLabels[doc.type] || doc.type,
                        status: doc.statut === 'VERIFIER' ? 'en attente' : doc.statut === 'VALIDE' ? 'validé' : 'refusé',
                        expiry: doc.dateExpiration ? new Date(doc.dateExpiration).toISOString().split('T')[0] : (doc.updatedAt ? new Date(doc.updatedAt).toISOString().split('T')[0] : 'Non défini'),
                        url: doc.fichier
                    }));
                    console.log("🔑 Profil keys:", Object.keys(p));
                    console.log("📄 p.documents brut:", JSON.stringify(p.documents?.length ?? 'undefined'));
                    console.log("📄 Documents reçus:", formattedDocs.length);
                    setDocuments(formattedDocs);
                }

                // 3. Charger les demandes déjà en attente via l'API existante
                const availableRes = await apiClient('/chauffeur/disponibles');
                if (availableRes && availableRes.succes && availableRes.courses) {
                    const formatted = availableRes.courses.map(data => ({
                        id: data._id,
                        passengerName: `${data.passager?.prenom || ''} ${data.passager?.nom || 'Passager'}`.trim(),
                        passengerRating: data.passager?.noteMoyenne || 4.5,
                        pickup: data.depart?.adresse || 'Position actuelle',
                        destination: data.destination?.adresse || 'Destination',
                        distance: `${data.distanceKm || '?'} km`,
                        duration: `${data.dureeMin || '?'} min`,
                        price: `${data.prix ? data.prix.toLocaleString() : '0'} GNF`,
                        passengerCount: data.nombrePassagers || 1,
                        paymentMethod: data.paiement?.methode || 'Cash',
                        timeAgo: 'Récemment'
                    }));
                    setAvailableRides(formatted);
                }

                // 4. Charger les revenus et transactions
                loadRevenus();
                loadRecentTransactions();

            } catch (error) {
                console.log("Erreur chargement dashboard chauffeur:", error);
            }
        };

        fetchDriverDashboardData();
        loadRidesHistory(); // Charger l'historique
        loadPlannings();
    }, []);

    const [documents, setDocuments] = useState([]);

    const [settings, setSettings] = useState({
        darkMode: false,
        notifications: true,
        sound: true,
        vibration: true,
        language: 'fr',
        currency: 'GNF',
        autoAccept: false
    });

    const [refreshing, setRefreshing] = useState(false);
    const [ridesHistory, setRidesHistory] = useState([]);

    const [notifications, setNotifications] = useState([]);

    // 📩 Persister les notifications localement
    useEffect(() => {
        const saveNotifs = async () => {
            try {
                await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
            } catch (e) {
                console.error("Erreur sauvegarde notifs:", e);
            }
        };
        if (notifications.length > 0) saveNotifs();
    }, [notifications]);

    // 📩 Charger les notifications locales (approche similaire au web via localStorage)
    const loadAllNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem(`notifications_${user?.id}`);
            if (stored) {
                setNotifications(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Erreur chargement notifs:", e);
        }
    };

    const [acceptedMissions, setAcceptedMissions] = useState([]);

    // Fonction pour jouer le bip sonore
    const playNotificationSound = async () => {
        try {
            await setAudioModeAsync({ playsInSilentMode: true });
            const player = createAudioPlayer(require('../../assets/sounds/notification.mp3'));
            player.play();
        } catch (error) {
            console.log("Erreur lors de la lecture du son", error);
        }
    };

    // Simuler la réception d'une nouvelle course
    const receiveNewMission = (ride) => {
        setSelectedRide(ride);
        setShowRideAcceptModal(true);
        playNotificationSound();

        // Ajouter à la liste des courses disponibles si pas déjà présente
        setAvailableRides(prev => {
            if (prev.find(r => r.id === ride.id)) return prev;
            return [ride, ...prev];
        });

        // Ajouter une notification
        const newNotif = {
            id: Date.now(),
            title: 'Nouvelle demande',
            message: `Trajet vers ${ride.destination}`,
            time: 'À l\'instant',
            type: 'ride',
            read: false,
            rideId: ride.id
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    // Animations
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const mapRef = useRef(null);

    // Calculer le nombre de notifications non lues
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    // Effets initiaux
    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            })
        ]).start();

        requestLocationPermission();
        loadMockData();
        loadRidesHistory();
    }, []);

    // ========== FONCTIONS DE GESTION ==========

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            const [dashRes, profileRes, availableRes] = await Promise.all([
                apiClient('/chauffeur/dashboard'),
                apiClient('/chauffeur/profile'),
                apiClient('/chauffeur/disponibles'),
            ]);

            if (dashRes?.succes && dashRes.data) {
                const { stats: serverStats } = dashRes.data;
                setEarnings(prev => ({
                    ...prev,
                    today: serverStats.revenusJournaliers || 0,
                }));
                setIsOnline(dashRes.data.disponibilite === "EN_LIGNE");

                if (serverStats.demandesRecuesAujourdHui > 0) {
                    const rate = Math.round((serverStats.coursesEffectueesAujourdHui / serverStats.demandesRecuesAujourdHui) * 100);
                    setStats(prev => ({ ...prev, acceptanceRate: rate > 100 ? 100 : rate }));
                }
            }

            if (profileRes?.succes && profileRes.profil) {
                const p = profileRes.profil;
                if (p.photoUrl) setProfileImage(formatImageUrl(p.photoUrl));

                setUserData(prev => ({
                    ...prev,
                    name: `${p.prenom || ''} ${p.nom || ''}`.trim() || prev.name,
                    phone: p.telephone || prev.phone,
                    email: p.email || prev.email,
                    address: p.localisation || prev.address,
                    car: p.vehicule?.marque && p.vehicule?.modele ? `${p.vehicule.marque} ${p.vehicule.modele}` : p.vehicule?.marque || p.vehicule?.modele || prev.car,
                    plate: p.vehicule?.plaque || prev.plate,
                }));

                setStats(prev => ({
                    ...prev,
                    totalRides: p.stats?.trajetsCompletes || 0,
                    rating: p.stats?.noteMoyenne || 5.0,
                }));
                setEarnings(prev => ({ ...prev, total: p.stats?.revenusTotaux || 0 }));

                // Mettre à jour les documents aussi au rafraîchissement
                const typeLabels = {
                    'PERMIS': 'Permis de conduire',
                    'ASSURANCE': 'Assurance véhicule',
                    'CARTE_GRISE': 'Carte grise',
                    'IDENTITE': 'Pièce d\'identité',
                    'PHOTO_VEHICULE': 'Photo du véhicule'
                };

                const formattedDocs = (p.documents || []).map(doc => ({
                    id: doc._id || Math.random().toString(),
                    name: typeLabels[doc.type] || doc.type,
                    status: doc.statut === 'VERIFIER' ? 'en attente' : doc.statut === 'VALIDE' ? 'validé' : 'refusé',
                    expiry: doc.dateExpiration ? new Date(doc.dateExpiration).toISOString().split('T')[0] : (doc.updatedAt ? new Date(doc.updatedAt).toISOString().split('T')[0] : 'Non défini'),
                    url: doc.fichier
                }));
                setDocuments(formattedDocs);
            }

            if (availableRes?.succes && availableRes.courses) {
                const formatted = availableRes.courses.map(data => ({
                    id: data._id,
                    passengerName: `${data.passager?.prenom || ''} ${data.passager?.nom || 'Passager'}`.trim(),
                    passengerRating: data.passager?.noteMoyenne || 4.5,
                    pickup: data.depart?.adresse || 'Position actuelle',
                    destination: data.destination?.adresse || 'Destination',
                    distance: `${data.distanceKm || '?'} km`,
                    duration: `${data.dureeMin || '?'} min`,
                    price: `${data.prix ? data.prix.toLocaleString() : '0'} GNF`,
                    passengerCount: data.nombrePassagers || 1,
                    paymentMethod: data.paiement?.methode || 'Cash',
                    timeAgo: 'Récemment'
                }));
                setAvailableRides(formatted);
            }

            loadMockData();
            loadRidesHistory();
            loadPlannings();
            loadRevenus();
            loadRecentTransactions();
        } catch (e) {
            console.log('Erreur refresh:', e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const requestLocationPermission = async () => {
        try {
            setLoadingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                const { latitude, longitude } = location.coords;
                const region = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                };
                setDriverLocation(region);
                setCurrentRegion(region);
            } else {
                Alert.alert('Permission refusée', 'La localisation est nécessaire pour fonctionner');
            }
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert('Erreur', 'Impossible d\'accéder à la localisation');
        } finally {
            setLoadingLocation(false);
        }
    };

    const pickProfileImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à vos photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
                Alert.alert('Succès', 'Photo de profil mise à jour');
            }
        } catch (error) {
            console.error('Erreur lors de la sélection de l\'image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const loadMockData = () => {
        // Données simulées de courses disponibles
        const mockAvailableRides = [
            {
                id: 1,
                passengerName: 'Fatou Diallo',
                passengerRating: 4.9,
                pickup: 'Kaloum, Conakry',
                destination: 'Aéroport Gbessia',
                distance: '12 km',
                duration: '25 min',
                price: '15,000 GNF',
                passengerCount: 1,
                paymentMethod: 'Cash',
                timeAgo: '2 min'
            },
            {
                id: 2,
                passengerName: 'Abdoulaye Bah',
                passengerRating: 4.7,
                pickup: 'Matam',
                destination: 'Dixinn',
                distance: '8 km',
                duration: '18 min',
                price: '9,500 GNF',
                passengerCount: 2,
                paymentMethod: 'Mobile Money',
                timeAgo: '5 min'
            }
        ];

        setAvailableRides(mockAvailableRides);

        setAvailableRides(mockAvailableRides);
    };

    const loadRidesHistory = async () => {
        try {
            const res = await apiClient('/chauffeur/trajets/historique');
            if (res && res.succes && res.data) {
                const formattedHistory = res.data.map(t => {
                    const dateObj = new Date(t.requestedTime);
                    const now = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(now.getDate() - 1);

                    let dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    if (dateObj.toDateString() === now.toDateString()) {
                        dateStr = "Aujourd'hui";
                    } else if (dateObj.toDateString() === yesterday.toDateString()) {
                        dateStr = "Hier";
                    }

                    return {
                        id: t.id,
                        passengerName: t.passengerName,
                        passengerRating: t.passengerRating,
                        pickup: t.depart || 'Position actuelle',
                        destination: t.destination || 'Destination',
                        distance: `${t.distanceKm || 0} km`,
                        duration: `${t.dureeMin || 0} min`,
                        price: `${t.estimatedFare ? t.estimatedFare.toLocaleString() : 0} GNF`,
                        paymentMethod: 'Espèces',
                        date: `${dateStr}, ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                        status: t.status, // 'completed' or 'cancelled'
                        rating: t.passengerRating
                    };
                });
                setRidesHistory(formattedHistory);
            }
        } catch (error) {
            console.log("Erreur chargement historique chauffeur:", error);
        }
    };

    const loadPlannings = async () => {
        try {
            const res = await apiClient('/chauffeur/plannings');
            if (res && res.succes && res.plannings) {
                const formatted = res.plannings.map(p => {
                    const dateObj = new Date(p.datePlanifiee);

                    // Format pour l'affichage (ex: "Demain, 10 Mars" ou "12 Mars")
                    const now = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(now.getDate() + 1);

                    let dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    if (dateObj.toDateString() === tomorrow.toDateString()) {
                        dateStr = `Demain, ${dateObj.getDate()} ${dateObj.toLocaleDateString('fr-FR', { month: 'short' })}`;
                    }

                    return {
                        id: p._id,
                        passengerName: `${p.passager?.prenom || ''} ${p.passager?.nom || 'Passager'}`.trim(),
                        passengerRating: p.passager?.noteMoyenne || 4.5,
                        date: dateStr,
                        time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        pickup: p.depart || 'Point de départ',
                        destination: p.destination || 'Destination',
                        price: `${p.prix ? p.prix.toLocaleString() : '0'} GNF`,
                        paymentMethod: p.paiement?.methode || 'Espèces',
                        status: 'scheduled',
                        raw: p
                    };
                });
                setPlannings(formatted);
            }
        } catch (error) {
            console.log("Erreur chargement plannings:", error);
        }
    };

    const loadRevenus = async () => {
        try {
            const res = await apiClient('/chauffeur/revenus');
            if (res && res.succes && res.data) {
                setEarnings(prev => ({
                    ...prev,
                    today: res.data.revenusJour || 0,
                    weekly: res.data.revenusSemaine || 0,
                    monthly: res.data.revenusMois || 0,
                }));
            }
        } catch (error) {
            console.log("Erreur chargement revenus:", error);
        }
    };

    const loadRecentTransactions = async () => {
        try {
            const res = await apiClient('/chauffeur/revenus/liste');
            if (res && res.succes && res.data) {
                const formatted = res.data.map(t => {
                    const dateObj = new Date(t.date);

                    // Formatter le mode de paiement proprement
                    let methodLabel = 'Espèces';
                    const m = t.modePaiement?.toUpperCase();
                    if (m === 'ORANGE_MONEY') methodLabel = 'Orange Money';
                    if (m === 'MOBILE_MONEY' || m === 'MTN') methodLabel = 'Mobile Money (MTN)';
                    if (m === 'CASH') methodLabel = 'Espèces';

                    return {
                        id: t.id,
                        passengerName: t.passager?.nom || 'Client TakaTaka',
                        amount: t.gainNet,
                        date: `${dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}, ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                        status: t.verse ? 'versé' : 'en attente',
                        pickup: t.depart,
                        destination: t.destination,
                        paymentMethod: methodLabel,
                        raw: t
                    };
                });
                setRecentTransactions(formatted);
            }
        } catch (error) {
            console.log("Erreur chargement transactions:", error);
        }
    };

    const handleToggleOnline = () => {
        if (!isOnline) {
            if (!driverLocation) {
                showAlert('Localisation requise', 'Activez votre localisation pour vous mettre en ligne', 'warning', () => requestLocationPermission());
                return;
            }

            setIsOnline(true);
            showAlert('🎉 Vous êtes en ligne !', 'Les passagers peuvent maintenant vous voir et réserver vos services.', 'success');
        } else {
            showAlert(
                'Mettre hors ligne',
                'Êtes-vous sûr de vouloir vous mettre hors ligne ?',
                'warning',
                () => {
                    setIsOnline(false);
                    setAvailableRides([]);
                }
            );
        }
    };

    const showRideDetailsModal = (ride) => {
        setSelectedRide(ride);
        setShowRideAcceptModal(true);
    };

    const handleAddPlanningSlot = () => {
        setShowAddSlotModal(true);
    };

    const handleAcceptNewRide = async (ride) => {
        try {
            setLoading(true);
            const response = await apiClient(`/chauffeur/mes-courses/${ride.id}/accepter`, { method: 'POST' });

            if (response.succes) {
                setNotifications(prev => prev.map(notif =>
                    notif.rideId === ride.id ? { ...notif, read: true } : notif
                ));

                const newMission = { ...ride, status: 'accepted', isClose: false };
                if (!currentRide) {
                    setCurrentRide(newMission);
                    showAlert('✅ Mission acceptée !', `Rendez-vous à ${ride.pickup}`, 'success');
                } else {
                    setAcceptedMissions(prev => [...prev.filter(m => m.id !== newMission.id), newMission]);
                    showAlert('📅 Mission planifiée', `Course ajoutée à votre file d'attente.`);
                }
                setAvailableRides(prev => prev.filter(r => r.id !== ride.id));
                setShowRideAcceptModal(false);
            } else {
                showAlert('Erreur', response.message || "Impossible d'accepter la course", 'error');
            }
        } catch (error) {
            console.error('Accept ride error:', error);
            showAlert('Erreur', 'Une erreur est survenue lors de l\'acceptation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const savePlanningSlot = (newSlot) => {
        setPlannings([...plannings, newSlot]);
        Alert.alert('Succès', 'Créneau ajouté à votre planning !');
    };

    const handleRejectRide = async (rideArg, reason = null) => {
        const ride = rideArg || selectedRide || currentRide;
        if (!ride) return;

        // Si pas de raison fournie, on ouvre le modal
        if (!reason && ride.status !== 'pending') {
            setSelectedRide(ride);
            setShowCancelModal(true);
            return;
        }

        try {
            setLoading(true);
            const cancelReason = reason || "Refusé par le chauffeur";

            const res = await apiClient(`/chauffeur/mes-courses/${ride.id}/refuser`, {
                method: 'POST',
                body: { raison: cancelReason }
            });

            if (res.succes) {
                setShowCancelModal(false);
                setShowRideAcceptModal(false);
                setNotifications(prev => prev.map(notif => notif.rideId === ride.id ? { ...notif, read: true } : notif));

                if (currentRide && currentRide.id === ride.id) setCurrentRide(null);
                setAcceptedMissions(prev => prev.filter(m => m.id !== ride.id));
                setAvailableRides(prev => prev.filter(r => r.id !== ride.id));

                showAlert('Course Annulée', 'La course a été annulée avec succès.', 'info');
            } else {
                showAlert('Erreur', res.message || 'Impossible d\'annuler la course', 'error');
            }
        } catch (error) {
            console.error('Reject error:', error);
            showAlert('Erreur', 'Une erreur est survenue lors de l\'annulation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleHeadingToPickup = async (rideArg) => {
        const ride = rideArg || currentRide;
        if (!ride) return;
        try {
            setLoading(true);
            const res = await apiClient(`/chauffeur/mes-courses/${ride.id}/rejoindre`, { method: 'POST' });
            if (res.succes) {
                if (currentRide?.id === ride.id) setCurrentRide(prev => ({ ...prev, status: 'heading' }));
                else {
                    if (currentRide && currentRide.status !== 'completed') return showAlert('⚠️ Attention', "Terminez d'abord votre course en cours.");
                    setCurrentRide({ ...ride, status: 'heading' });
                    setAcceptedMissions(prev => prev.filter(m => m.id !== ride.id));
                }
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleArrivedAtPickup = async (rideArg) => {
        const ride = rideArg || currentRide;
        if (!ride) return;

        // Si l'utilisateur a cliqué sur le bouton SCAN, on ouvre le scanner
        if (rideArg && rideArg.scan) {
            setSelectedRide(ride);
            setShowScannerModal(true);
            return;
        }

        try {
            setLoading(true);
            const res = await apiClient(`/chauffeur/mes-courses/${ride.id}/signaler-arrivee`, { method: 'POST' });
            if (res.succes) {
                if (currentRide?.id === ride.id) setCurrentRide(prev => ({ ...prev, status: 'arrived' }));
                else {
                    setAcceptedMissions(prev => prev.map(m => m.id === ride.id ? { ...m, status: 'arrived' } : m));
                    // Si on était dans la liste, on peut promouvoir cette course en course principale
                    setCurrentRide({ ...ride, status: 'arrived' });
                    setAcceptedMissions(prev => prev.filter(m => m.id !== ride.id));
                }
                showAlert('✅ Signalé', 'Le passager a été informé de votre présence.', 'success');
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleQRScanSuccess = async (data) => {
        if (!selectedRide) return;

        try {
            setShowScannerModal(false);
            setLoading(true);
            // On peut appeler un endpoint dédié ou réutiliser signaler-arrivée avec le code
            const res = await apiClient(`/tickets/scanner`, {
                method: 'POST',
                body: { codeUnique: data, reservationId: selectedRide.id }
            });

            if (res.succes) {
                // Le scan valide l'arrivée ET la présence du passager (selon besoin)
                // Ici on marque au moins l'arrivée comme demandé par l'user
                if (currentRide?.id === selectedRide.id) setCurrentRide(prev => ({ ...prev, status: 'arrived' }));
                else {
                    setCurrentRide({ ...selectedRide, status: 'arrived' });
                    setAcceptedMissions(prev => prev.filter(m => m.id !== selectedRide.id));
                }
                showAlert('✅ Ticket Validé', 'Passager identifié. Vous pouvez démarrer la course.', 'success');
            } else {
                showAlert('❌ Erreur Scan', res.message || 'Ticket invalide ou expiré', 'error');
            }
        } catch (e) {
            console.error('Scan Error:', e);
            showAlert('Erreur', 'Impossible de valider le ticket', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStartRide = async (rideArg) => {
        const ride = rideArg || currentRide;
        if (!ride) return;
        try {
            setLoading(true);
            const res = await apiClient(`/chauffeur/mes-courses/${ride.id}/demarrer`, { method: 'POST' });
            if (res.succes) {
                if (currentRide?.id === ride.id) {
                    setCurrentRide(prev => ({ ...prev, status: 'en_route', isClose: false }));
                    showAlert('🚗 Course démarrée', 'Trajet en cours.', 'info');
                } else {
                    if (currentRide && currentRide.status !== 'completed') showAlert('⚠️ Attention', 'Terminez d\'abord votre course en cours.', 'warning');
                    else {
                        setCurrentRide({ ...ride, status: 'en_route', isClose: false });
                        setAcceptedMissions(prev => prev.filter(m => m.id !== ride.id));
                    }
                }
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCompleteRide = async () => {
        const ride = currentRide;
        if (!ride) return;

        showAlert(
            'Terminer la course',
            'Confirmez-vous la fin de la course ?',
            'info',
            async () => {
                try {
                    setLoading(true);
                    const res = await apiClient(`/chauffeur/mes-courses/${ride.id}/terminer`, { method: 'POST' });
                    if (res.succes) {
                        setEarnings(prev => ({ ...prev, today: prev.today + parseInt(ride.price.replace(/[^0-9]/g, '')) || 0 }));
                        setCurrentRide(null);
                        loadRidesHistory();
                        if (acceptedMissions.length > 0) showAlert('🏁 Mission suivante', `Direction ${acceptedMissions[0].pickup}`, 'info');
                        else showAlert('🏁 Course terminée !', 'Votre solde a été mis à jour.', 'success');
                    }
                } catch (e) { console.error(e); } finally { setLoading(false); }
            }
        );
    };

    const handleNavigateToPickup = () => {
        if (currentRide?.pickupLocation) {
            Alert.alert(
                'Navigation',
                'Ouvrir la navigation vers le point de prise en charge ?',
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: 'Ouvrir', onPress: () => {
                            Alert.alert('Navigation', 'Ouverture de l\'application de navigation...');
                        }
                    }
                ]
            );
        }
    };

    const handleUpdateProfile = async (updatedData) => {
        try {
            // Utiliser updatedData s'il est fourni, sinon userData
            const data = updatedData || userData;

            // 1. Préparer les données personnelles
            const nameParts = data.name.trim().split(' ');
            const prenom = nameParts[0] || '';
            const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (prenom ? ' ' : ''); // Éviter le vide si possible

            const profileBody = {
                prenom,
                nom,
                email: data.email,
                telephone: data.phone,
                localisation: data.address
            };

            // 2. Préparer les données véhicule
            const carParts = data.car.trim().split(' ');
            const marque = carParts[0] || 'Véhicule';
            const modele = carParts.length > 1 ? carParts.slice(1).join(' ') : '';

            const vehiculeBody = {
                marque,
                modele,
                plaque: data.plate,
                // On peut ajouter des valeurs par défaut si nécessaire
                typeVehicule: 'TAXI'
            };

            // 3. Appels API en parallèle
            const [profRes, vehRes] = await Promise.all([
                apiClient('/chauffeur/profile', { method: 'PUT', body: profileBody }),
                apiClient('/chauffeur/vehicule', { method: 'PUT', body: vehiculeBody })
            ]);

            if ((profRes && profRes.succes) || (vehRes && vehRes.succes)) {
                setUserData(data);
                showAlert('Succès', 'Votre profil a été synchronisé avec la plateforme.', 'success');
                setActiveProfileSubTab('main');
            } else {
                showAlert('Erreur', profRes.error || vehRes.error || 'Impossible de mettre à jour le profil', 'error');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showAlert('Erreur', 'Une erreur est survenue lors de la synchronisation', 'error');
        }
    };

    const handleUploadDocument = (docId) => {
        Alert.alert(
            'Télécharger un document',
            'Voulez-vous télécharger un nouveau document ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Télécharger',
                    onPress: () => {
                        Alert.alert(
                            'Document téléchargé',
                            'Votre document a été soumis pour vérification.',
                            [{ text: 'OK' }]
                        );
                    }
                }
            ]
        );
    };

    const handleToggleSetting = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleChangeLanguage = () => {
        Alert.alert(
            'Changer la langue',
            'Sélectionnez votre langue préférée :',
            [
                { text: 'Français', onPress: () => setSettings(prev => ({ ...prev, language: 'fr' })) },
                { text: 'Anglais', onPress: () => setSettings(prev => ({ ...prev, language: 'en' })) },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleChangeCurrency = () => {
        Alert.alert(
            'Changer la devise',
            'Sélectionnez votre devise préférée :',
            [
                { text: 'GNF', onPress: () => setSettings(prev => ({ ...prev, currency: 'GNF' })) },
                { text: 'USD', onPress: () => setSettings(prev => ({ ...prev, currency: 'USD' })) },
                { text: 'EUR', onPress: () => setSettings(prev => ({ ...prev, currency: 'EUR' })) },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleWithdrawFunds = () => {
        Alert.alert(
            'Retrait de fonds',
            'Choisissez votre méthode de retrait :',
            [
                { text: 'Orange Money', onPress: () => handleWithdrawMethod('orange') },
                { text: 'MTN Mobile Money', onPress: () => handleWithdrawMethod('mtn') },
                { text: 'Compte bancaire', onPress: () => handleWithdrawMethod('bank') },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleWithdrawMethod = (method) => {
        Alert.alert(
            'Retrait via ' + method,
            'Entrez le montant à retirer :',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Continuer',
                    onPress: () => {
                        Alert.alert(
                            'Retrait initié',
                            'Votre demande de retrait a été envoyée. Les fonds seront disponibles dans 24-48h.',
                            [{ text: 'OK' }]
                        );
                    }
                }
            ]
        );
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(notifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
        ));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const handleNotificationPress = (notification) => {
        markNotificationAsRead(notification.id);

        if (notification.type === 'ride' && notification.rideId) {
            const ride = availableRides.find(r => r.id === notification.rideId);
            if (ride) {
                setSelectedRide(ride);
                setShowRideAcceptModal(true);
                setShowNotificationsModal(false);
            }
        }
    };

    const handleClearAllNotifications = () => {
        setNotifications([]);
    };

    // ========== MODALS ==========

    // ========== ÉCRANS ET COMPOSANTS EXTRAITS (Utilisent les props) ==========

    // ========== COMPOSANTS DE RENDU ==========

    const renderHeader = () => null;

    // ========== RENDU DES SOUS-ONGLETS DU PROFIL (Géré dans DriverProfileSubScreens.js) ==========

    // ========== COMPOSANTS COMMUNS ==========

    // ========== COMPOSANTS DE RENDU DU DASHBOARD (Extraits) ==========

    // ========== RENDU DES ONGLETS PRINCIPAUX ==========

    const renderMainContent = () => {
        const commonProps = { theme, darkMode, refreshing, onRefresh };

        switch (activeTab) {
            case 'home':
                return (
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}>
                        <MainDashboardHeaderCombined
                            userData={userData}
                            profileImage={profileImage}
                            isOnline={isOnline}
                            handleToggleOnline={handleToggleOnline}
                            earnings={earnings}
                            stats={stats}
                            theme={theme}
                            darkMode={darkMode}
                            unreadNotificationsCount={unreadNotificationsCount}
                            onNotificationsPress={(data) => {
                                if (data?.type === 'simulate') {
                                    receiveNewMission({
                                        id: Date.now(),
                                        passengerName: 'Mamadou Diallo',
                                        passengerRating: '4.9',
                                        pickup: 'Kipe, Centre Émetteur',
                                        destination: 'Kaloum, Port Autonome',
                                        price: '65,000 GNF',
                                        distance: '12 km',
                                        duration: '25 min',
                                        paymentMethod: 'Espèces',
                                        timeAgo: 'À l\'instant',
                                        passengerCount: 1,
                                        status: 'pending'
                                    });
                                } else {
                                    setShowNotificationsModal(true);
                                }
                            }}
                            onProfilePress={() => {
                                setActiveTab('profile');
                                setActiveProfileSubTab('main');
                            }}
                        />

                        <View style={styles.mapSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Zone d'activité</Text>
                                <TouchableOpacity onPress={requestLocationPermission}><Ionicons name="locate" size={20} color={theme.primary} /></TouchableOpacity>
                            </View>
                            <View style={[styles.mapContainer, { height: height * 0.45, backgroundColor: theme.card, borderColor: theme.border, borderWidth: darkMode ? 1 : 0 }]}>
                                {driverLocation ? (
                                    <>
                                        <MapView
                                            ref={mapRef}
                                            style={styles.map}
                                            provider={PROVIDER_GOOGLE}
                                            initialRegion={driverLocation}
                                            showsUserLocation={true}
                                            customMapStyle={[]}
                                            onRegionChangeComplete={(region) => setCurrentRegion(region)}
                                        >
                                            <Marker coordinate={driverLocation} title="Vous">
                                                <View style={styles.driverMarker}><Ionicons name="car" size={24} color="#3B82F6" /></View>
                                            </Marker>
                                        </MapView>

                                        {/* Contrôles de Zoom */}
                                        <View style={styles.mapControls}>
                                            <TouchableOpacity
                                                style={[styles.mapControlButton, { backgroundColor: theme.card }]}
                                                onPress={() => {
                                                    if (currentRegion) {
                                                        const newRegion = {
                                                            ...currentRegion,
                                                            latitudeDelta: currentRegion.latitudeDelta / 2,
                                                            longitudeDelta: currentRegion.longitudeDelta / 2,
                                                        };
                                                        mapRef.current?.animateToRegion(newRegion);
                                                    }
                                                }}
                                            >
                                                <Ionicons name="add" size={24} color={theme.text} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.mapControlButton, { backgroundColor: theme.card }]}
                                                onPress={() => {
                                                    if (currentRegion) {
                                                        const newRegion = {
                                                            ...currentRegion,
                                                            latitudeDelta: currentRegion.latitudeDelta * 2,
                                                            longitudeDelta: currentRegion.longitudeDelta * 2,
                                                        };
                                                        mapRef.current?.animateToRegion(newRegion);
                                                    }
                                                }}
                                            >
                                                <Ionicons name="remove" size={24} color={theme.text} />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : <ActivityIndicator style={{ marginTop: 150 }} />}
                            </View>
                        </View>


                        <AcceptedMissionsList
                            missions={acceptedMissions}
                            onRejoindre={handleHeadingToPickup}
                            onArrived={handleArrivedAtPickup}
                            onStart={handleStartRide}
                            onCall={(r) => Alert.alert('Contact', `Appel de ${r.passengerName}...`)}
                            theme={theme}
                            darkMode={darkMode}
                        />

                        <AvailableRidesList isOnline={isOnline} availableRides={availableRides} currentRide={currentRide} onRideSelect={showRideDetailsModal} theme={theme} darkMode={darkMode} />

                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                );
            case 'rides':
                return <RidesHistoryTab stats={stats} ridesHistory={ridesHistory} onRidePress={showRideDetailsModal} onPlanningPress={() => setShowPlanningModal(true)} refreshing={refreshing} onRefresh={onRefresh} theme={theme} darkMode={darkMode} />;
            case 'earnings':
                return (
                    <EarningsTab
                        earnings={earnings}
                        transactions={recentTransactions}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        handleWithdrawFunds={handleWithdrawFunds}
                        onTransactionPress={(t) => {
                            setSelectedTransaction(t);
                            setShowTransactionModal(true);
                        }}
                        theme={theme}
                        darkMode={darkMode}
                    />
                );
            case 'profile':
                switch (activeProfileSubTab) {
                    case 'mon-profil': return <MonProfil userData={userData} setUserData={setUserData} pickProfileImage={pickProfileImage} profileImage={profileImage} handleUpdateProfile={handleUpdateProfile} setActiveProfileSubTab={setActiveProfileSubTab} theme={theme} darkMode={darkMode} showAlert={showAlert} />;
                    case 'documents': return <Documents documents={documents} handleUploadDocument={handleUploadDocument} setActiveProfileSubTab={setActiveProfileSubTab} theme={theme} darkMode={darkMode} showAlert={showAlert} />;
                    case 'aide': return <AideSupport setActiveProfileSubTab={setActiveProfileSubTab} theme={theme} darkMode={darkMode} showAlert={showAlert} />;
                    case 'parametres': return <Parametres settings={settings} handleToggleSetting={handleToggleSetting} darkMode={darkMode} toggleDarkMode={toggleDarkMode} setActiveProfileSubTab={setActiveProfileSubTab} theme={theme} showAlert={showAlert} />;
                    default:
                        return (
                            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                                <LinearGradient colors={theme.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.profileHeader}>
                                    <TouchableOpacity style={styles.profileAvatarContainer} onPress={pickProfileImage}>
                                        <View style={[styles.profileAvatar, { backgroundColor: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', borderWidth: 4 }]}>
                                            {profileImage ? (
                                                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                                            ) : (
                                                <Text style={[styles.profileAvatarText, { color: theme.primary }]}>{userData.name.charAt(0)}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.profileName}>{userData.name}</Text>
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                            <Text style={styles.verifiedText}>Chauffeur certifié</Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                <View style={styles.menuSection}>
                                    {[
                                        { id: 'mon-profil', label: 'Mon profil', icon: 'person', color: theme.primary, bg: '#E6F3EA' },
                                        { id: 'documents', label: 'Documents', icon: 'document-text', color: '#F59E0B', bg: '#FEF3C7' },
                                        { id: 'aide', label: 'Aide & Support', icon: 'help-circle', color: '#10B981', bg: '#D1FAE5' },
                                        { id: 'parametres', label: 'Paramètres', icon: 'settings', color: '#6B7280', bg: '#F3F4F6' },
                                    ].map(item => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.menuItem, { backgroundColor: theme.card, borderColor: darkMode ? theme.border : '#F1F5F9' }]}
                                            onPress={() => setActiveProfileSubTab(item.id)}
                                        >
                                            <View style={[styles.menuIcon, { backgroundColor: darkMode ? theme.menuItemIconBg || '#1F2937' : item.bg }]}>
                                                <Ionicons name={item.icon} size={22} color={item.color} />
                                            </View>
                                            <Text style={[styles.menuText, { color: theme.text, flex: 1 }]}>{item.label}</Text>
                                            <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity
                                        style={[styles.menuItem, { backgroundColor: theme.card, borderColor: darkMode ? theme.border : '#F1F5F9', marginTop: 10 }]}
                                        onPress={onLogout}
                                    >
                                        <View style={[styles.menuIcon, { backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }]}>
                                            <Ionicons name="log-out" size={22} color="#EF4444" />
                                        </View>
                                        <Text style={[styles.menuText, { color: '#EF4444', flex: 1 }]}>Déconnexion</Text>
                                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        );
                }
            default: return null;
        }
    };

    const renderBottomNavigation = () => (
        <View style={[styles.bottomNavigation, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeTab === 'home' && styles.navItemActive
                ]}
                onPress={() => {
                    setActiveTab('home');
                    setActiveProfileSubTab('main');
                }}
            >
                <Ionicons
                    name={activeTab === 'home' ? 'home' : 'home-outline'}
                    size={24}
                    color={activeTab === 'home' ? theme.primary : theme.textSecondary}
                />
                <Text style={[
                    styles.navText,
                    { color: activeTab === 'home' ? theme.primary : theme.textSecondary },
                    activeTab === 'home' && styles.navTextActive
                ]}>Accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeTab === 'rides' && styles.navItemActive
                ]}
                onPress={() => {
                    setActiveTab('rides');
                    setActiveProfileSubTab('main');
                }}
            >
                <Ionicons
                    name={activeTab === 'rides' ? 'car' : 'car-outline'}
                    size={24}
                    color={activeTab === 'rides' ? theme.primary : theme.textSecondary}
                />
                <Text style={[
                    styles.navText,
                    { color: activeTab === 'rides' ? theme.primary : theme.textSecondary },
                    activeTab === 'rides' && styles.navTextActive
                ]}>Courses</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeTab === 'earnings' && styles.navItemActive
                ]}
                onPress={() => {
                    setActiveTab('earnings');
                    setActiveProfileSubTab('main');
                }}
            >
                <Ionicons
                    name={activeTab === 'earnings' ? 'wallet' : 'wallet-outline'}
                    size={24}
                    color={activeTab === 'earnings' ? theme.primary : theme.textSecondary}
                />
                <Text style={[
                    styles.navText,
                    { color: activeTab === 'earnings' ? theme.primary : theme.textSecondary },
                    activeTab === 'earnings' && styles.navTextActive
                ]}>Gains</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.navItem,
                    activeTab === 'profile' && styles.navItemActive
                ]}
                onPress={() => {
                    setActiveTab('profile');
                    setActiveProfileSubTab('main');
                }}
            >
                <Ionicons
                    name={activeTab === 'profile' ? 'person' : 'person-outline'}
                    size={24}
                    color={activeTab === 'profile' ? theme.primary : theme.textSecondary}
                />
                <Text style={[
                    styles.navText,
                    { color: activeTab === 'profile' ? theme.primary : theme.textSecondary },
                    activeTab === 'profile' && styles.navTextActive
                ]}>Profil</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={darkMode ? '#111827' : '#1E40AF'} />

            {maintenanceMode && (
                <View style={{ backgroundColor: '#FEF2F2', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="construct" size={20} color="#DC2626" />
                    <Text style={{ color: '#B91C1C', fontWeight: '600', flex: 1 }}>Maintenance en cours. Le service est temporairement suspendu.</Text>
                </View>
            )}

            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}
            >
                {/* Header */}
                {renderHeader()}

                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {renderMainContent()}
                </View>

                {/* Bottom Navigation */}
                {renderBottomNavigation()}
            </Animated.View>

            {/* Modals */}
            <DriverNotificationsModal
                visible={showNotificationsModal}
                onClose={() => setShowNotificationsModal(false)}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllNotificationsAsRead}
                onClearAll={handleClearAllNotifications}
                onNotificationPress={handleNotificationPress}
                theme={theme}
                darkMode={darkMode}
            />

            <RideAcceptModal
                visible={showRideAcceptModal}
                onClose={() => setShowRideAcceptModal(false)}
                ride={selectedRide}
                onAccept={handleAcceptNewRide}
                onReject={() => handleRejectRide(selectedRide)}
                onCall={() => Alert.alert('Contact', 'Appel du passager...')}
                theme={theme}
                darkMode={darkMode}
            />

            <DriverPlanningModal
                visible={showPlanningModal}
                onClose={() => setShowPlanningModal(false)}
                plannings={plannings}
                onAddSlot={handleAddPlanningSlot}
                onPlanningDetails={(item) => {
                    // Si la date est passée ou si c'est marqué fini (simulation)
                    const isFinished = item.status === 'completed';
                    setSelectedRide({ ...item, status: isFinished ? 'completed' : 'scheduled' });
                    setShowPlanningModal(false);
                    setShowRideAcceptModal(true);
                }}
                theme={theme}
                darkMode={darkMode}
            />

            <AddPlanningSlotModal
                visible={showAddSlotModal}
                onClose={() => setShowAddSlotModal(false)}
                onSave={savePlanningSlot}
                theme={theme}
                darkMode={darkMode}
            />

            <TakaAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={hideAlert}
                onConfirm={alertConfig.onConfirm ? () => {
                    alertConfig.onConfirm();
                    hideAlert();
                } : null}
                theme={theme}
                darkMode={darkMode}
            />

            <TransactionDetailModal
                visible={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                transaction={selectedTransaction}
                theme={theme}
                darkMode={darkMode}
            />

            <QRScannerModal
                visible={showScannerModal}
                onClose={() => setShowScannerModal(false)}
                onScan={handleQRScanSuccess}
                theme={theme}
            />

            <TripCancelModal
                visible={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={(reason) => handleRejectRide(selectedRide, reason)}
                role="CHAUFFEUR"
                theme={theme}
            />
        </SafeAreaView>
    );
}