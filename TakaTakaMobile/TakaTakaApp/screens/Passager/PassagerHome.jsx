import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    FlatList,
    Animated,
    Easing,
    Dimensions,
    StatusBar,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { styles } from './PassagerHome.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext'; // AJOUTÉ
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoTT from '../../assets/logo/LogoTT.jpeg';

const { width, height } = Dimensions.get('window');

// Composant DriverItem séparé - Version améliorée
const DriverItem = React.memo(({ item, index, onSelectDriver }) => {
    const driverAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(driverAnim, {
            toValue: 1,
            delay: index * 80,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const driverStyle = {
        opacity: driverAnim,
        transform: [
            {
                translateY: driverAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                })
            },
            { scale: scaleAnim }
        ]
    };

    return (
        <Animated.View style={[styles.driverCard, driverStyle]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => onSelectDriver(item)}
                activeOpacity={0.9}
                style={styles.driverCardTouchable}
            >
                <LinearGradient
                    colors={['#FFFFFF', '#F8FAFC']}
                    style={styles.driverCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Header avec avatar et info rapide */}
                    <View style={styles.driverCardHeader}>
                        <View style={styles.driverCardAvatarContainer}>
                            <LinearGradient
                                colors={['#2563EB', '#3B82F6']}
                                style={styles.driverCardAvatar}
                            >
                                <Text style={styles.driverCardAvatarText}>{item.avatar}</Text>
                            </LinearGradient>
                            <View style={[styles.driverCardOnlineIndicator, { backgroundColor: item.available ? '#10B981' : '#EF4444' }]} />
                        </View>

                        <View style={styles.driverCardInfo}>
                            <View style={styles.driverCardNameContainer}>
                                <Text style={styles.driverCardName} numberOfLines={1}>{item.name}</Text>
                                <View style={[styles.driverCardRatingContainer, { backgroundColor: item.rating >= 4.8 ? '#FFFBEB' : '#F0F9FF' }]}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={styles.driverCardRatingText}>{item.rating}</Text>
                                </View>
                            </View>

                            <View style={styles.driverCardMeta}>
                                <View style={styles.driverCardMetaItem}>
                                    <Ionicons name="car-sport" size={12} color="#64748B" />
                                    <Text style={styles.driverCardMetaText} numberOfLines={1}>{item.carType}</Text>
                                </View>
                                <View style={styles.driverCardMetaItem}>
                                    <Ionicons name="time" size={12} color="#64748B" />
                                    <Text style={styles.driverCardMetaText}>{item.arrivalTime}</Text>
                                </View>
                                <View style={styles.driverCardMetaItem}>
                                    <Ionicons name="shield-checkmark" size={12} color="#64748B" />
                                    <Text style={styles.driverCardMetaText} numberOfLines={1}>{item.plate}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.driverCardPriceContainer}>
                            <Text style={styles.driverCardPrice}>{item.price}</Text>
                            <Text style={styles.driverCardPriceLabel}>Prix fixe</Text>
                        </View>
                    </View>

                    {/* Détails supplémentaires */}
                    <View style={styles.driverCardDetails}>
                        <View style={styles.driverCardDetailRow}>
                            <View style={styles.driverCardDetailItem}>
                                <Ionicons name="car-outline" size={16} color="#2563EB" />
                                <Text style={styles.driverCardDetailText} numberOfLines={1}>{item.car}</Text>
                            </View>
                            <View style={styles.driverCardDetailItem}>
                                <Ionicons name="people-outline" size={16} color="#2563EB" />
                                <Text style={styles.driverCardDetailText}>4 places</Text>
                            </View>
                        </View>

                        <View style={styles.driverCardDetailRow}>
                            <View style={styles.driverCardDetailItem}>
                                <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                                <Text style={styles.driverCardDetailText}>{item.trips.toLocaleString()} courses</Text>
                            </View>
                            <View style={styles.driverCardDetailItem}>
                                <Ionicons name="flash-outline" size={16} color="#F59E0B" />
                                <Text style={styles.driverCardDetailText}>{item.distance} • {item.time}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bouton d'action */}
                    <TouchableOpacity
                        style={styles.driverCardSelectButton}
                        onPress={() => onSelectDriver(item)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#10B981', '#34D399']}
                            style={styles.driverCardSelectButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.driverCardSelectButtonText}>Choisir ce chauffeur</Text>
                            <Ionicons name="chevron-forward" size={18} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default function PassagerHome({ onBack, onRegister, onLogin }) {
    const { setPendingRideIntent, setRideDraft, darkMode, theme } = useApp();
    const [departure, setDeparture] = useState(''); // Changé de pickup pour correspondre à ton existant
    const [destination, setDestination] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showDriversModal, setShowDriversModal] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [activeInput, setActiveInput] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showToast, setShowToast] = useState(false);
    const toastAnim = useRef(new Animated.Value(-100)).current;

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const mapScale = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;

    // Animation pour le modal des chauffeurs (fullscreen)
    const driversModalAnim = useRef(new Animated.Value(0)).current;
    const authModalAnim = useRef(new Animated.Value(0)).current;

    const mapRef = useRef(null);
    const scrollRef = useRef(null);

    const [region, setRegion] = useState({
        latitude: 9.6412,
        longitude: -13.5784,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [markers, setMarkers] = useState([
        {
            id: 'departure',
            coordinate: { latitude: 9.6412, longitude: -13.5784 },
            title: 'Départ',
            pinColor: '#2563EB',
            visible: false
        },
        {
            id: 'destination',
            coordinate: { latitude: 9.5412, longitude: -13.4784 },
            title: 'Destination',
            pinColor: '#10B981',
            visible: false
        },
    ]);

    // Données des chauffeurs disponibles
    const driversData = [
        {
            id: 1,
            name: "Mohamed Diallo",
            rating: 4.8,
            car: "Toyota Corolla 2022",
            plate: "AB-123-CD",
            distance: "0.8 km",
            time: "3 min",
            price: "2 800 GNF",
            avatar: "🚗",
            stars: 4.8,
            trips: 1247,
            carColor: "#000000",
            arrivalTime: "2-4 min",
            available: true,
            carType: "Confort",
            carImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400"
        },
        {
            id: 2,
            name: "Fatoumata Bamba",
            rating: 4.9,
            car: "Honda Civic 2023",
            plate: "EF-456-GH",
            distance: "1.2 km",
            time: "5 min",
            price: "3 000 GNF",
            avatar: "🚙",
            stars: 4.9,
            trips: 892,
            carColor: "#FFFFFF",
            arrivalTime: "4-6 min",
            available: true,
            carType: "Premium",
            carImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w-400"
        },
        {
            id: 3,
            name: "Ibrahim Bah",
            rating: 4.7,
            car: "Peugeot 208 2021",
            plate: "IJ-789-KL",
            distance: "0.5 km",
            time: "2 min",
            price: "2 500 GNF",
            avatar: "🚕",
            stars: 4.7,
            trips: 1563,
            carColor: "#FF0000",
            arrivalTime: "1-3 min",
            available: true,
            carType: "Économique",
            carImage: "https://images.unsplash.com/photo-1555212697-194d092e3b8f?w-400"
        },
        {
            id: 4,
            name: "Aissatou Camara",
            rating: 4.6,
            car: "Dacia Logan 2020",
            plate: "MN-012-OP",
            distance: "1.5 km",
            time: "6 min",
            price: "2 900 GNF",
            avatar: "🚖",
            stars: 4.6,
            trips: 723,
            carColor: "#808080",
            arrivalTime: "5-7 min",
            available: true,
            carType: "Confort",
            carImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w-400"
        },
        {
            id: 5,
            name: "Mamadou Keita",
            rating: 4.5,
            car: "Kia Picanto 2020",
            plate: "QR-345-ST",
            distance: "0.9 km",
            time: "3 min",
            price: "2 300 GNF",
            avatar: "🚘",
            stars: 4.5,
            trips: 456,
            carColor: "#0000FF",
            arrivalTime: "2-4 min",
            available: true,
            carType: "Économique",
            carImage: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w-400"
        },
        {
            id: 6,
            name: "Kadiatou Sylla",
            rating: 4.9,
            car: "Hyundai Tucson 2023",
            plate: "UV-678-WX",
            distance: "1.8 km",
            time: "7 min",
            price: "3 500 GNF",
            avatar: "🚙",
            stars: 4.9,
            trips: 1023,
            carColor: "#800080",
            arrivalTime: "6-8 min",
            available: true,
            carType: "SUV Premium",
            carImage: "https://images.unsplash.com/photo-1563720223484-21c6c2d3c487?w-400"
        }
    ];

    // Filtres disponibles
    const filters = [
        { id: 'all', label: 'Tous', icon: 'grid' },
        { id: 'confort', label: 'Confort', icon: 'car-sport' },
        { id: 'premium', label: 'Premium', icon: 'diamond' },
        { id: 'economique', label: 'Éco', icon: 'cash' },
        { id: 'proche', label: 'Proche', icon: 'locate' },
    ];

    // Initialisation
    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();

        // Animation pulsante pour le bouton de localisation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                })
            ])
        ).start();

        setAvailableDrivers(driversData);

        // Générer des coordonnées pour le tracé du trajet
        const generateRoute = () => {
            const route = [
                { latitude: 9.6412, longitude: -13.5784 },
                { latitude: 9.6462, longitude: -13.5734 },
                { latitude: 9.6512, longitude: -13.5684 },
                { latitude: 9.6562, longitude: -13.5634 },
                { latitude: 9.6612, longitude: -13.5584 },
                { latitude: 9.6662, longitude: -13.5534 },
                { latitude: 9.6712, longitude: -13.5484 },
                { latitude: 9.5412, longitude: -13.4784 },
            ];
            setRouteCoordinates(route);
        };

        generateRoute();

        // --- NOUVEAU : GÉOLOCALISATION AUTOMATIQUE AU MONTAGE ---
        const initLocation = async () => {
            await getCurrentLocation();
        };
        initLocation();
    }, []);

    // Animation du bouton pressé
    const animatePress = useCallback(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
    }, [scaleAnim]);

    // Ouvrir le modal des chauffeurs avec animation fullscreen
    const openDriversModal = useCallback(() => {
        setShowDriversModal(true);
        // Animation d'entrée du modal (fade in)
        Animated.timing(driversModalAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic)
        }).start();
    }, [driversModalAnim]);

    // Fermer le modal des chauffeurs avec animation
    const closeDriversModal = useCallback(() => {
        Animated.timing(driversModalAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.cubic)
        }).start(() => {
            setShowDriversModal(false);
        });
    }, [driversModalAnim]);

    // Ouvrir le modal d'auth avec animation
    const openAuthModal = useCallback(() => {
        setShowAuthModal(true);
        Animated.timing(authModalAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [authModalAnim]);

    // Fermer le modal d'auth avec animation
    const closeAuthModal = useCallback(() => {
        Animated.timing(authModalAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShowAuthModal(false);
        });
    }, [authModalAnim]);

    // Position actuelle avec optimisation de la vitesse
    const getCurrentLocation = async () => {
        setIsLocating(true);
        animatePress();

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission", "Position requise pour Taka Taka.");
                return;
            }

            // --- OPTIMISATION : On récupère la dernière position connue pour plus de vitesse ---
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                updatePosition(lastKnown);
            }

            // Puis on affine avec une précision équilibrée (plus rapide que High)
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 5000 // On ne l'attend pas indéfiniment
            });

            updatePosition(location);

        } catch (error) {
            console.log("Erreur localisation:", error);
            // On peut tenter un dernier essai si le premier a échoué (parfois le timeout arrive trop vite)
        } finally {
            setIsLocating(false);
        }
    };

    const updatePosition = (location) => {
        const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005, // Zoom plus proche (On passe de 0.012 à 0.005)
            longitudeDelta: 0.005,
        };

        setRegion(newRegion);
        setMarkers(prev => prev.map(marker =>
            marker.id === 'departure' ? { ...marker, coordinate: newRegion } : marker
        ));

        if (mapRef.current) {
            mapRef.current.animateToRegion(newRegion, 1000);
        }

        // On tente de trouver l'adresse textuelle correspondante (Plus lisible)
        Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        }).then(res => {
            if (res && res[0]) {
                const item = res[0];
                // On privilégie : Quartier > Rue > Ville
                const neighborhood = item.district || item.subregion || item.city;
                const street = item.street;

                let readableAddress = "";
                if (neighborhood && street && !street.includes('+')) {
                    readableAddress = `${street}, ${neighborhood}`;
                } else if (neighborhood) {
                    readableAddress = neighborhood;
                } else {
                    readableAddress = item.name && !item.name.includes('+') ? item.name : "Ma position";
                }

                setDeparture(readableAddress);

                // On met à jour le marqueur de départ
                setMarkers(prev => prev.map(m =>
                    m.id === 'departure' ? { ...m, coordinate: location.coords, visible: true } : m
                ));
            }
        });
    };

    // Validation des champs
    const validateSearch = () => {
        if (!departure.trim() || !destination.trim()) {
            Alert.alert(
                "Champs requis",
                "Veuillez renseigner le lieu de départ et la destination",
                [{ text: "OK", style: "cancel" }]
            );
            return false;
        }
        return true;
    };

    // Gestion de la recherche avec animation
    const handleSearch = () => {
        animatePress();
        if (!validateSearch()) return;

        setSearchLoading(true);

        // Simulation de chargement
        setTimeout(() => {
            const newSearch = {
                id: Date.now(),
                departure,
                destination,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setSearchHistory(prev => [newSearch, ...prev.slice(0, 3)]);
            setShowResult(true);
            setSearchLoading(false);

            // Scroll vers les résultats
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ y: 400, animated: true });
            }

            // On laisse l'itinéraire être géré par le useEffect des marqueurs pour plus de fluidité
        }, 800);
    };

    // Calcul dynamique
    const calculateDistance = useCallback(() => {
        const distances = ['5.2 km', '8.5 km', '12.3 km', '3.7 km', '6.9 km'];
        return distances[Math.floor(Math.random() * distances.length)];
    }, []);

    const calculatePrice = useCallback(() => {
        const min = Math.floor(Math.random() * 2000) + 2000;
        const max = min + Math.floor(Math.random() * 1000) + 500;
        return { min, max };
    }, []);

    const calculateDuration = useCallback(() => {
        const durations = ['15 min', '18 min', '22 min', '25 min', '30 min'];
        return durations[Math.floor(Math.random() * durations.length)];
    }, []);

    // Sélectionner un chauffeur avec animation
    const handleSelectDriver = useCallback((driver) => {
        setSelectedDriver(driver);
        animatePress();

        closeDriversModal();
        setTimeout(() => {
            openAuthModal();
        }, 300);
    }, [animatePress, closeDriversModal, openAuthModal]);

    // Fonction pour afficher le toast
    const triggerToast = useCallback(() => {
        setShowToast(true);
        Animated.sequence([
            Animated.spring(toastAnim, {
                toValue: 50,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.delay(2500),
            Animated.timing(toastAnim, {
                toValue: -100,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => setShowToast(false));
    }, [toastAnim]);

    // --- NOUVEAU : AUTOCOMPLÉTION RÉELLE VIA CARTE (OSM) ---
    const [suggestions, setSuggestions] = useState([]);
    const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

    useEffect(() => {
        const searchInput = activeInput === 'departure' ? departure : destination;

        if (searchInput.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingPlaces(true);
            try {
                // Recherche via Nominatim (OpenStreetMap) filtrée sur la Guinée
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&addressdetails=1&limit=5&countrycodes=gn`,
                    { headers: { 'Accept-Language': 'fr', 'User-Agent': 'TakaTakaMobileApp' } }
                );
                const data = await response.json();

                const formatted = data.map(item => ({
                    id: item.place_id,
                    name: item.display_name.split(',')[0], // On prend le nom principal
                    fullname: item.display_name,
                    lat: parseFloat(item.lat),
                    lon: parseFloat(item.lon)
                }));

                setSuggestions(formatted);
            } catch (err) {
                console.log("Erreur recherche places:", err);
            } finally {
                setIsSearchingPlaces(false);
            }
        }, 600); // Debounce de 600ms

        return () => clearTimeout(timer);
    }, [departure, destination, activeInput]);

    // Filtrer les chauffeurs initialement présents
    const filteredDrivers = useCallback(() => {
        if (selectedFilter === 'all') return driversData;

        switch (selectedFilter) {
            case 'confort':
                return driversData.filter(d => d.carType === 'Confort');
            case 'premium':
                return driversData.filter(d => d.carType === 'Premium' || d.carType === 'SUV Premium');
            case 'economique':
                return driversData.filter(d => d.carType === 'Économique');
            case 'proche':
                return [...driversData].sort((a, b) =>
                    parseFloat(a.distance) - parseFloat(b.distance)
                );
            default:
                return driversData;
        }
    }, [selectedFilter]);

    // Rendu d'un item de la liste des chauffeurs
    const renderDriverItem = useCallback(({ item, index }) => (
        <DriverItem
            item={item}
            index={index}
            onSelectDriver={handleSelectDriver}
        />
    ), [handleSelectDriver]);

    // Rendu d'un filtre
    const renderFilterItem = useCallback(({ item }) => {
        const isActive = selectedFilter === item.id;
        return (
            <TouchableOpacity
                style={[styles.filterItem, isActive && styles.filterItemActive]}
                onPress={() => setSelectedFilter(item.id)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={item.icon}
                    size={16}
                    color={isActive ? '#2563EB' : '#64748B'}
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    }, [selectedFilter]);

    useEffect(() => {
        const dep = markers.find(m => m.id === 'departure');
        const dest = markers.find(m => m.id === 'destination');

        if (dep?.visible && dest?.visible) {
            // On trace une ligne directe (ou courbe simulée)
            setRouteCoordinates([dep.coordinate, dest.coordinate]);

            // On ajuste la vue pour voir les deux
            if (mapRef.current) {
                mapRef.current.fitToCoordinates([dep.coordinate, dest.coordinate], {
                    edgePadding: { top: 100, right: 80, bottom: 100, left: 80 },
                    animated: true,
                });
            }
        }
    }, [markers]);

    // --- NOUVEAU : CALCUL DE DISPERSION DES VOITURES POUR ÉVITER L'EMPILAGE ---
    const getDriverCoords = useCallback((index) => {
        // On crée un cercle autour de la position actuelle
        const angle = (index * 2 * Math.PI) / availableDrivers.length;
        const radius = 0.008; // Environ 800m - 1km de distance
        return {
            latitude: region.latitude + radius * Math.cos(angle),
            longitude: region.longitude + radius * Math.sin(angle),
        };
    }, [region, availableDrivers]);

    // Styles animés
    const animatedHeaderStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
    };

    const animatedLocationBtnStyle = {
        transform: [{ scale: pulseAnim }]
    };

    const animatedPressStyle = {
        transform: [{ scale: scaleAnim }]
    };

    // Style animé pour le modal des chauffeurs
    const driversModalStyle = {
        opacity: driversModalAnim,
        transform: [{
            scale: driversModalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
            })
        }]
    };

    // Style animé pour le modal d'auth
    const authModalStyle = {
        opacity: authModalAnim,
        transform: [{
            scale: authModalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
            })
        }]
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

                {/* HEADER FIXE */}
                <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                    <Animated.View style={animatedPressStyle}>
                        <TouchableOpacity
                            onPress={() => {
                                animatePress();
                                onBack();
                            }}
                            style={styles.backButton}
                        >
                            <Ionicons name="chevron-back" size={24} color="#111827" />
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.headerTitleContainer}>
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: '#FFFFFF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 5,
                            borderWidth: 2.5,
                            borderColor: '#10B981',
                            overflow: 'hidden'
                        }}>
                            <Image
                                source={LogoTT}
                                style={{
                                    width: 45,
                                    height: 45,
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => {
                            animatePress();
                            onLogin?.();
                        }}
                    >
                        <Ionicons name="person-circle" size={28} color="#2563EB" />
                    </TouchableOpacity>
                </Animated.View>

                {/* CONTENU SCROLLABLE */}
                <ScrollView
                    ref={scrollRef}
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* GOOGLE MAP */}
                    <Animated.View style={[styles.mapWrapper, animatedHeaderStyle]}>
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                region={region}
                                showsUserLocation={true}
                                showsMyLocationButton={false}
                                showsCompass={true}
                                showsScale={true}
                                rotateEnabled={false}
                                loadingEnabled={true}
                            >
                                {markers.filter(m => m.visible).map((marker) => (
                                    <Marker
                                        key={marker.id}
                                        coordinate={marker.coordinate}
                                        title={marker.title}
                                        pinColor={marker.pinColor}
                                    />
                                ))}

                                {routeCoordinates.length > 0 && (
                                    <Polyline
                                        coordinates={routeCoordinates}
                                        strokeColor="#2563EB"
                                        strokeWidth={4}
                                        lineDashPattern={[0]}
                                    />
                                )}

                                {availableDrivers.map((driver, index) => (
                                    <Marker
                                        key={`driver-${driver.id}`}
                                        coordinate={getDriverCoords(index)}
                                    >
                                        <Animated.View style={[styles.driverMarker, animatedPressStyle]}>
                                            <Ionicons name="car" size={20} color="#10B981" />
                                        </Animated.View>
                                    </Marker>
                                ))}
                            </MapView>
                        </View>

                        <Animated.View style={[styles.locationBtn, animatedLocationBtnStyle]}>
                            <TouchableOpacity
                                onPress={getCurrentLocation}
                                disabled={isLocating}
                                style={styles.locationButtonInner}
                            >
                                {isLocating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="locate" size={20} color="white" />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    {/* INPUTS */}
                    <Animated.View style={[styles.searchCard, animatedHeaderStyle]}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F8FAFC']}
                            style={styles.searchCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.inputContainer}>
                                <View style={styles.inputRow}>
                                    <LinearGradient
                                        colors={['#2563EB', '#3B82F6']}
                                        style={styles.inputIconContainer}
                                    >
                                        <Ionicons name="radio-button-on" size={16} color="white" />
                                    </LinearGradient>
                                    <View style={styles.inputContent}>
                                        <Text style={styles.inputLabel}>DÉPART</Text>
                                        <TextInput
                                            placeholder="Lieu de prise en charge"
                                            value={departure}
                                            onChangeText={setDeparture}
                                            style={styles.input}
                                            placeholderTextColor="#94A3B8"
                                            onFocus={() => setActiveInput('departure')}
                                        />
                                    </View>
                                </View>

                                <View style={styles.separator} />

                                <View style={styles.inputRow}>
                                    <LinearGradient
                                        colors={['#10B981', '#34D399']}
                                        style={styles.inputIconContainer}
                                    >
                                        <Ionicons name="location" size={16} color="white" />
                                    </LinearGradient>
                                    <View style={styles.inputContent}>
                                        <Text style={styles.inputLabel}>DESTINATION</Text>
                                        <TextInput
                                            placeholder="Où allez-vous ?"
                                            value={destination}
                                            onChangeText={setDestination}
                                            style={styles.input}
                                            placeholderTextColor="#94A3B8"
                                            onFocus={() => setActiveInput('destination')}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Suggestions dynamiques récupérées de la carte */}
                            {activeInput && suggestions.length > 0 && (
                                <View style={styles.autocompleteContainer}>
                                    {isSearchingPlaces && <ActivityIndicator size="small" color="#2563EB" style={{ margin: 10 }} />}
                                    {suggestions.map((place) => (
                                        <TouchableOpacity
                                            key={place.id}
                                            style={styles.autocompleteItem}
                                            onPress={() => {
                                                if (activeInput === 'departure') {
                                                    setDeparture(place.name);
                                                    setMarkers(prev => prev.map(m =>
                                                        m.id === 'departure' ? { ...m, coordinate: { latitude: place.lat, longitude: place.lon }, visible: true } : m
                                                    ));
                                                } else {
                                                    setDestination(place.name);
                                                    setMarkers(prev => prev.map(m =>
                                                        m.id === 'destination' ? { ...m, coordinate: { latitude: place.lat, longitude: place.lon }, visible: true } : m
                                                    ));
                                                }
                                                setRegion({
                                                    latitude: place.lat,
                                                    longitude: place.lon,
                                                    latitudeDelta: 0.015,
                                                    longitudeDelta: 0.015,
                                                });
                                                setActiveInput(null);
                                            }}
                                        >
                                            <Ionicons name="location" size={16} color="#2563EB" />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.autocompleteText}>{place.name}</Text>
                                                <Text style={{ fontSize: 10, color: '#94A3B8' }} numberOfLines={1}>{place.fullname}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Animated.View style={[animatedPressStyle]}>
                                <TouchableOpacity
                                    style={[styles.searchBtn, (!departure || !destination) && styles.disabledBtn]}
                                    onPress={handleSearch}
                                    disabled={!departure || !destination || searchLoading}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={!departure || !destination ? ['#CBD5E1', '#94A3B8'] : ['#4F46E5', '#2563EB']}
                                        style={styles.searchBtnGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {searchLoading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <>
                                                <Text style={styles.searchBtnText}>Voir les prix</Text>
                                                <Ionicons name="arrow-forward" size={20} color="white" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </LinearGradient>
                    </Animated.View>

                    {/* HISTORIQUE DES RECHERCHES */}
                    {searchHistory.length > 0 && (
                        <Animated.View style={[styles.historySection, animatedHeaderStyle]}>
                            <View style={styles.historyHeader}>
                                <Text style={styles.historyTitle}>Recherches récentes</Text>
                                <TouchableOpacity onPress={() => setSearchHistory([])}>
                                    <Text style={styles.historyClear}>Effacer</Text>
                                </TouchableOpacity>
                            </View>
                            {searchHistory.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.historyItem}
                                    onPress={() => {
                                        setDeparture(item.departure);
                                        setDestination(item.destination);
                                    }}
                                >
                                    <Ionicons name="time-outline" size={16} color="#2563EB" />
                                    <Text style={styles.historyText} numberOfLines={1}>
                                        {item.departure} → {item.destination}
                                    </Text>
                                    <Text style={styles.historyTime}>{item.date}</Text>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    )}

                    {/* RESULT CARD */}
                    {showResult && (
                        <Animated.View style={[styles.tripCard, animatedHeaderStyle]}>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.tripCardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.tripHeader}>
                                    <Text style={styles.tripTitle}>Résumé du trajet</Text>
                                    <TouchableOpacity onPress={() => setShowResult(false)}>
                                        <Ionicons name="close" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.tripDetails}>
                                    <View style={styles.tripRow}>
                                        <View style={styles.tripIcon}>
                                            <Ionicons name="radio-button-on" size={16} color="#2563EB" />
                                        </View>
                                        <View style={styles.tripInfo}>
                                            <Text style={styles.tripLabel}>Départ</Text>
                                            <Text style={styles.tripValue}>{departure || 'Non spécifié'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.tripRow}>
                                        <View style={styles.tripIcon}>
                                            <Ionicons name="location" size={16} color="#10B981" />
                                        </View>
                                        <View style={styles.tripInfo}>
                                            <Text style={styles.tripLabel}>Destination</Text>
                                            <Text style={styles.tripValue}>{destination || 'Non spécifié'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.tripDivider} />

                                    <View style={styles.tripStats}>
                                        <View style={styles.tripStat}>
                                            <Ionicons name="analytics" size={20} color="#8B5CF6" />
                                            <Text style={styles.tripStatValue}>{calculateDistance()}</Text>
                                            <Text style={styles.tripStatLabel}>Distance</Text>
                                        </View>
                                        <View style={styles.tripStatDivider} />
                                        <View style={styles.tripStat}>
                                            <Ionicons name="time" size={20} color="#F59E0B" />
                                            <Text style={styles.tripStatValue}>{calculateDuration()}</Text>
                                            <Text style={styles.tripStatLabel}>Durée</Text>
                                        </View>
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <LinearGradient
                                            colors={['#ECFDF5', '#D1FAE5']}
                                            style={styles.priceBox}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Text style={styles.price}>
                                                {calculatePrice().min.toLocaleString()} – {calculatePrice().max.toLocaleString()} GNF
                                            </Text>
                                            <Text style={styles.priceHint}>Prix estimé</Text>
                                            <View style={styles.priceIcon}>
                                                <Ionicons name="cash" size={16} color="#047857" />
                                            </View>
                                        </LinearGradient>
                                    </View>

                                    <View style={styles.driverAvailability}>
                                        <Ionicons name="car" size={20} color="#2563EB" />
                                        <Text style={styles.driverInfo}>
                                            {availableDrivers.length} chauffeurs disponibles
                                        </Text>
                                    </View>

                                    <Animated.View style={[animatedPressStyle]}>
                                        <TouchableOpacity
                                            style={styles.priceButton}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                // SI LE DÉPART ET LA DESTINATION NE SONT PAS VIDES, ON LES MÉMORISE
                                                if (departure && destination) {
                                                    setRideDraft({ pickup: departure, destination: destination });
                                                }
                                                setPendingRideIntent(true);
                                                triggerToast(); // Affiche le toast
                                                setTimeout(() => onLogin?.(), 1500); // Délai pour laisser le toast être vu
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#10B981', '#34D399']}
                                                style={styles.reserveButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Text style={styles.reserveText}>Réserver maintenant</Text>
                                                <Ionicons name="arrow-forward" size={20} color="white" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )}

                    {/* HOW IT WORKS */}
                    <View style={[styles.features, { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 20, padding: 10, marginHorizontal: 15 }]}>
                        <View style={styles.featuresHeader}>
                            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Comment ça marche ?</Text>
                            <View style={styles.stepsBadge}>
                                <Text style={styles.stepsBadgeText}>3 étapes simples</Text>
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.featuresScroll}
                            contentContainerStyle={styles.featuresContent}
                            decelerationRate="fast"
                            snapToInterval={width * 0.8 + 20}
                        >
                            <View style={styles.featureCard}>
                                <LinearGradient
                                    colors={['#EEF2FF', '#E0E7FF']}
                                    style={styles.featureIconContainer}
                                >
                                    <Ionicons name="location" size={32} color="#4F46E5" />
                                </LinearGradient>
                                <View style={styles.featureTextContent}>
                                    <Text style={styles.featureNumber}>01</Text>
                                    <Text style={styles.featureTitle}>Indiquez le trajet</Text>
                                    <Text style={styles.featureDescription}>
                                        Saisissez vos adresses de départ et de destination pour voir les tarifs.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <LinearGradient
                                    colors={['#F0FDF4', '#DCFCE7']}
                                    style={styles.featureIconContainer}
                                >
                                    <Ionicons name="flash" size={32} color="#16A34A" />
                                </LinearGradient>
                                <View style={styles.featureTextContent}>
                                    <Text style={styles.featureNumber}>02</Text>
                                    <Text style={styles.featureTitle}>Mise en relation</Text>
                                    <Text style={styles.featureDescription}>
                                        Notre système alerte automatiquement le chauffeur le plus proche de vous.
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <LinearGradient
                                    colors={['#FFFBEB', '#FEF3C7']}
                                    style={styles.featureIconContainer}
                                >
                                    <Ionicons name="shield-checkmark" size={32} color="#D97706" />
                                </LinearGradient>
                                <View style={styles.featureTextContent}>
                                    <Text style={styles.featureNumber}>03</Text>
                                    <Text style={styles.featureTitle}>Voyagez en</Text>
                                    <Text style={styles.featureDescription}>
                                        Une fois connecté, profitez de votre trajet avec un suivi GPS en temps réel.
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    {/* ESPACE FINAL POUR SCROLL */}
                    <View style={styles.footerSpacer} />
                </ScrollView>

                {/* MODAL DES CHAUFFEURS DISPONIBLES - FULLSCREEN */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showDriversModal}
                    onRequestClose={closeDriversModal}
                    statusBarTranslucent={true}
                >
                    <SafeAreaView style={styles.fullScreenModal}>
                        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

                        {/* En-tête fixe */}
                        <View style={styles.modalHeaderFixed}>
                            <View style={styles.modalHeaderContent}>
                                <TouchableOpacity
                                    onPress={closeDriversModal}
                                    style={styles.modalBackButton}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="chevron-back" size={28} color="white" />
                                </TouchableOpacity>

                                <View style={styles.modalHeaderInfo}>
                                    <Text style={styles.modalHeaderTitle}>Chauffeurs disponibles</Text>
                                    <Text style={styles.modalHeaderSubtitle}>
                                        {filteredDrivers().length} conducteurs près de vous
                                    </Text>
                                </View>

                                <TouchableOpacity style={styles.modalFilterButton}>
                                    <Ionicons name="filter" size={22} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Barre de recherche */}
                            <View style={styles.modalSearchContainer}>
                                <View style={styles.modalSearchInput}>
                                    <Ionicons name="search" size={20} color="#94A3B8" />
                                    <TextInput
                                        placeholder="Rechercher un chauffeur..."
                                        placeholderTextColor="#94A3B8"
                                        style={styles.modalSearchText}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Filtres */}
                        <View style={styles.filtersContainer}>
                            <FlatList
                                data={filters}
                                renderItem={renderFilterItem}
                                keyExtractor={item => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filtersList}
                            />
                        </View>

                        {/* Statistiques */}
                        <View style={styles.statsContainer}>
                            <LinearGradient
                                colors={['#F8FAFC', '#F1F5F9']}
                                style={styles.statsGradient}
                            >
                                <View style={styles.statsGrid}>
                                    <View style={styles.statItem}>
                                        <View style={styles.statIconContainer}>
                                            <Ionicons name="car" size={20} color="#2563EB" />
                                        </View>
                                        <Text style={styles.statValue}>{availableDrivers.length}</Text>
                                        <Text style={styles.statLabel}>Disponibles</Text>
                                    </View>

                                    <View style={styles.statDivider} />

                                    <View style={styles.statItem}>
                                        <View style={styles.statIconContainer}>
                                            <Ionicons name="time" size={20} color="#10B981" />
                                        </View>
                                        <Text style={styles.statValue}>2-6 min</Text>
                                        <Text style={styles.statLabel}>Temps d'attente</Text>
                                    </View>

                                    <View style={styles.statDivider} />

                                    <View style={styles.statItem}>
                                        <View style={styles.statIconContainer}>
                                            <Ionicons name="star" size={20} color="#F59E0B" />
                                        </View>
                                        <Text style={styles.statValue}>4.8</Text>
                                        <Text style={styles.statLabel}>Note moyenne</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Liste des chauffeurs */}
                        <FlatList
                            data={filteredDrivers()}
                            renderItem={renderDriverItem}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            style={styles.driversFlatList}
                            contentContainerStyle={styles.driversListContainer}
                            ListHeaderComponent={
                                <View style={styles.driversListHeader}>
                                    <Text style={styles.driversListTitle}>Meilleurs chauffeurs</Text>
                                    <Text style={styles.driversListSubtitle}>Triés par pertinence</Text>
                                </View>
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyListContainer}>
                                    <Ionicons name="car-outline" size={64} color="#CBD5E1" />
                                    <Text style={styles.emptyListTitle}>Aucun chauffeur disponible</Text>
                                    <Text style={styles.emptyListSubtitle}>
                                        Réessayez dans quelques minutes
                                    </Text>
                                </View>
                            }
                        />

                        {/* Footer avec prix moyen */}
                        <View style={styles.modalFooter}>
                            <View style={styles.footerPriceContainer}>
                                <Text style={styles.footerPriceLabel}>Prix moyen pour ce trajet</Text>
                                <Text style={styles.footerPriceValue}>2 800 GNF</Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </Modal>

                {/* AUTH MODAL */}
                <Modal
                    transparent
                    animationType="fade"
                    visible={showAuthModal}
                    statusBarTranslucent={true}
                >
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={20} style={styles.blurBackground} />
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeAuthModal}
                        />

                        <Animated.View style={[styles.modalContent, authModalStyle]}>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.modalGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.modalHeader}>
                                    <LinearGradient
                                        colors={['#2563EB', '#3B82F6']}
                                        style={styles.modalIconContainer}
                                    >
                                        <Ionicons name="person-circle" size={60} color="white" />
                                    </LinearGradient>
                                    <Text style={styles.modalTitle}>Connexion requise</Text>
                                    <Text style={styles.modalSubtitle}>
                                        Pour réserver, connectez-vous ou créez un compte
                                    </Text>
                                </View>

                                <View style={styles.modalButtons}>
                                    {/* Pour l'Inscription */}
                                    <Animated.View style={[animatedPressStyle]}>
                                        <TouchableOpacity
                                            style={styles.modalBtnPrimary}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                closeAuthModal();
                                                // Appeler onRegister après un court délai pour fermer le modal d'abord
                                                setTimeout(() => {
                                                    if (onRegister) {
                                                        onRegister();
                                                    }
                                                }, 300);
                                            }}
                                        >
                                            <LinearGradient
                                                colors={['#4F46E5', '#2563EB']}
                                                style={styles.modalBtnGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Ionicons name="person-add" size={20} color="white" />
                                                <Text style={styles.modalBtnText}>S'inscrire gratuitement</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Animated.View>
                                    {/* Pour la Connexion */}
                                    <Animated.View style={[animatedPressStyle]}>
                                        <TouchableOpacity
                                            style={styles.modalBtnSecondary}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                closeAuthModal();
                                                setTimeout(() => {
                                                    if (onLogin) {
                                                        onLogin();
                                                    }
                                                }, 300);
                                            }}
                                        >
                                            <Ionicons name="log-in" size={20} color="#2563EB" />
                                            <Text style={styles.modalSecondaryText}>Se connecter</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>

                                <View style={styles.socialLogin}>
                                    <View style={styles.socialDivider}>
                                        <View style={styles.dividerLine} />
                                        <Text style={styles.dividerText}>Ou continuer avec</Text>
                                        <View style={styles.dividerLine} />
                                    </View>

                                    <View style={styles.socialButtons}>
                                        <TouchableOpacity style={styles.socialBtn}>
                                            <LinearGradient
                                                colors={['#FFFFFF', '#F8FAFC']}
                                                style={styles.socialBtnGradient}
                                            >
                                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.socialBtn}>
                                            <LinearGradient
                                                colors={['#FFFFFF', '#F8FAFC']}
                                                style={styles.socialBtnGradient}
                                            >
                                                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCloseBtn}
                                    onPress={closeAuthModal}
                                >
                                    <Text style={styles.modalClose}>Continuer sans compte</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </Animated.View>
                    </View>
                </Modal>
            </SafeAreaView>

            {/* Toast Notification */}
            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                <LinearGradient
                    colors={['#1E293B', '#0F172A']}
                    style={styles.toastGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text style={styles.toastText}>Veuillez vous connecter afin de réserver votre trajet</Text>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}
