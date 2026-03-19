import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Alert,
    Platform,
    Modal,
    StyleSheet
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useApp } from '../../AppContext';

const { width, height } = Dimensions.get('window');

export default function SearchScreen({ navigation, route }) {
    const { darkMode, theme } = useApp();
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [activeField, setActiveField] = useState('pickup');
    const [searchText, setSearchText] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);

    const [showRideOptionsModal, setShowRideOptionsModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [rideDetails, setRideDetails] = useState({
        pickup: '',
        destination: '',
        estimatedTime: '5-7 min',
        driverETA: '4 min'
    });

    const [recentSearches, setRecentSearches] = useState([
        'Aéroport Gbessia',
        'Marché Madina',
        'Palais du Peuple',
        'Hôpital Ignace Deen',
        'Université Gamal'
    ]);

    const popularPlaces = [
        {
            id: 1,
            name: 'Aéroport Gbessia',
            address: 'Conakry, Guinée',
            type: 'airport',
            distance: '12 km',
            time: '25 min'
        },
        {
            id: 2,
            name: 'Marché Madina',
            address: 'Madina, Conakry',
            type: 'market',
            distance: '8 km',
            time: '18 min'
        },
        {
            id: 3,
            name: 'Palais du Peuple',
            address: 'Kaloum, Conakry',
            type: 'landmark',
            distance: '6 km',
            time: '15 min'
        },
        {
            id: 4,
            name: 'Hôpital Ignace Deen',
            address: 'Kaloum, Conakry',
            type: 'hospital',
            distance: '5 km',
            time: '12 min'
        },
        {
            id: 5,
            name: 'Plage de Rogbané',
            address: 'Rogbané, Conakry',
            type: 'beach',
            distance: '18 km',
            time: '35 min'
        },
    ];

    const categories = [
        { id: 1, name: 'Aéroport', icon: 'airplane', count: 3 },
        { id: 2, name: 'Hôpital', icon: 'hospital', count: 12 },
        { id: 3, name: 'Marché', icon: 'storefront', count: 8 },
        { id: 4, name: 'Université', icon: 'school', count: 5 },
        { id: 5, name: 'Restaurant', icon: 'restaurant', count: 25 },
        { id: 6, name: 'Hôtel', icon: 'bed', count: 18 },
    ];

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            setLoadingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'La permission de localisation est requise');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation(location.coords);

            let geocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (geocode.length > 0) {
                const address = `${geocode[0].street || ''}, ${geocode[0].city || 'Conakry'}`;
                setPickup(`Ma position actuelle - ${address}`);
            } else {
                setPickup('Ma position actuelle');
            }
        } catch (error) {
            console.error('Erreur localisation:', error);
            setPickup('Conakry, Guinée');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleFieldFocus = (field) => {
        setActiveField(field);
        setShowSearchResults(true);
        if (field === 'pickup') {
            setSearchText(pickup);
        } else {
            setSearchText(destination);
        }
    };

    const handlePlaceSelect = (place) => {
        if (activeField === 'pickup') {
            setPickup(place.name);
        } else {
            setDestination(place.name);
        }
        setShowSearchResults(false);

        if (!recentSearches.includes(place.name)) {
            setRecentSearches([place.name, ...recentSearches.slice(0, 4)]);
        }
    };

    const handleSearch = () => {
        if (searchText.trim()) {
            if (activeField === 'pickup') {
                setPickup(searchText);
            } else {
                setDestination(searchText);
            }
            setShowSearchResults(false);

            if (!recentSearches.includes(searchText)) {
                setRecentSearches([searchText, ...recentSearches.slice(0, 4)]);
            }
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
    };

    const handleUseCurrentLocation = () => {
        if (currentLocation) {
            setPickup('Ma position actuelle');
        } else {
            Alert.alert('Localisation', 'Impossible de déterminer votre position');
        }
    };

    const swapLocations = () => {
        const temp = pickup;
        setPickup(destination);
        setDestination(temp);
    };

    const handleContinue = () => {
        if (!pickup || !destination) {
            Alert.alert('Information', 'Veuillez renseigner le point de départ et la destination');
            return;
        }

        if (navigation && navigation.navigate) {
            navigation.navigate('RideOptions', {
                pickup,
                destination,
                coordinates: currentLocation
            });
        } else {
            setRideDetails({
                pickup,
                destination,
                estimatedTime: '5-7 min',
                driverETA: '4 min'
            });
            setShowRideOptionsModal(true);
        }
    };

    const filteredPlaces = popularPlaces.filter(place =>
        place.name.toLowerCase().includes(searchText.toLowerCase()) ||
        place.address.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleConfirmRide = () => {
        if (!selectedOption) {
            Alert.alert('Sélection requise', 'Veuillez sélectionner une option de trajet');
            return;
        }

        setShowRideOptionsModal(false);

        Alert.alert(
            '✅ Course confirmée !',
            `Votre trajet ${selectedOption} a été réservé.\n\n` +
            '🔵 Conducteur assigné : Mamadou D.\n' +
            '⭐ Note : 4.9/5.0\n' +
            '⏱️ Temps d\'arrivée : 4 minutes\n' +
            '💰 Prix : ' + (selectedOption === 'standard' ? '15,000 GNF' :
                selectedOption === 'comfort' ? '20,000 GNF' : '25,000 GNF'),
            [
                {
                    text: 'Suivre mon trajet',
                    onPress: () => {
                        if (navigation && navigation.goBack) {
                            navigation.goBack();
                        }
                    }
                }
            ]
        );
    };

    const renderRideOptionsModal = () => (
        <Modal
            animationType="slide"
            transparent={false}
            visible={showRideOptionsModal}
            onRequestClose={() => setShowRideOptionsModal(false)}
        >
            <SafeAreaView style={styles.fullScreenModalContainer}>
                {/* Header fixe en haut */}
                <View style={styles.fullScreenModalHeader}>
                    <TouchableOpacity
                        style={styles.fullScreenModalBackButton}
                        onPress={() => setShowRideOptionsModal(false)}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.fullScreenModalHeaderContent}>
                        <Text style={[styles.fullScreenModalTitle, { color: theme.text }]}>Options de trajet</Text>
                        <Text style={[styles.fullScreenModalSubtitle, { color: theme.textSecondary }]}>Sélectionnez votre préférence</Text>
                    </View>

                    <View style={{ width: 40 }} />
                </View>

                {/* Contenu défilable au milieu */}
                <ScrollView
                    style={[styles.fullScreenModalContent, { backgroundColor: theme.background }]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.fullScreenModalScrollContent}
                >
                    {/* Détails du trajet */}
                    <View style={[styles.rideDetailsCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <View style={styles.rideDetailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="location" size={20} color={theme.success} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Départ</Text>
                                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2}>
                                    {rideDetails.pickup}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.rideDetailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="flag" size={20} color="#EF4444" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Destination</Text>
                                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={2}>
                                    {rideDetails.destination}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.rideMetaInfo}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time" size={16} color={theme.textSecondary} />
                                <Text style={[styles.metaText, { color: theme.textSecondary }]}>Temps estimé: {rideDetails.estimatedTime}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="car" size={16} color={theme.textSecondary} />
                                <Text style={[styles.metaText, { color: theme.textSecondary }]}>Conducteur dispo: {rideDetails.driverETA}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Options de trajet */}
                    <View style={styles.optionsContainer}>
                        <Text style={[styles.optionsTitle, { color: theme.text }]}>Choisissez votre option</Text>

                        {/* Option Standard */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border },
                                selectedOption === 'standard' && { borderColor: theme.primary, backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF' }
                            ]}
                            onPress={() => setSelectedOption('standard')}
                        >
                            <View style={styles.optionHeader}>
                                <View style={styles.optionIcon}>
                                    <Ionicons name="car" size={24} color={theme.primary} />
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={[styles.optionName, { color: theme.text }]}>Standard</Text>
                                    <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                                        Idéal pour les trajets courts, confort basique
                                    </Text>
                                </View>
                                <View style={styles.optionPriceTag}>
                                    <Text style={[styles.optionPrice, { color: theme.primary }]}>15,000</Text>
                                    <Text style={[styles.optionCurrency, { color: theme.primary }]}>GNF</Text>
                                </View>
                            </View>

                            <View style={styles.optionFeatures}>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>Jusqu'à 3 passagers</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>Climatisation</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>Paiement flexible</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Option Confort */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedOption === 'comfort' && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedOption('comfort')}
                        >
                            <View style={styles.optionHeader}>
                                <View style={[styles.optionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                    <Ionicons name="car-sport" size={24} color="#8B5CF6" />
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionName}>Confort</Text>
                                    <Text style={styles.optionDescription}>
                                        Plus d'espace, voitures récentes, service premium
                                    </Text>
                                </View>
                                <View style={styles.optionPriceTag}>
                                    <Text style={styles.optionPrice}>20,000</Text>
                                    <Text style={styles.optionCurrency}>GNF</Text>
                                </View>
                            </View>

                            <View style={styles.optionFeatures}>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Jusqu'à 4 passagers</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Wi-Fi gratuit</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Eau offerte</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Option Premium */}
                        <TouchableOpacity
                            style={[
                                styles.optionCard,
                                selectedOption === 'premium' && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedOption('premium')}
                        >
                            <View style={styles.optionHeader}>
                                <View style={[styles.optionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Ionicons name="diamond" size={24} color="#F59E0B" />
                                </View>
                                <View style={styles.optionInfo}>
                                    <Text style={styles.optionName}>Premium</Text>
                                    <Text style={styles.optionDescription}>
                                        Luxe, haute gamme, conducteurs expérimentés
                                    </Text>
                                </View>
                                <View style={styles.optionPriceTag}>
                                    <Text style={styles.optionPrice}>25,000</Text>
                                    <Text style={styles.optionCurrency}>GNF</Text>
                                </View>
                            </View>

                            <View style={styles.optionFeatures}>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Jusqu'à 4 passagers</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Service VIP</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                    <Text style={styles.featureText}>Annulation gratuite</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Bouton de confirmation fixe en bas */}
                <View style={styles.fullScreenConfirmButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.fullScreenConfirmButton,
                            !selectedOption && styles.fullScreenConfirmButtonDisabled
                        ]}
                        onPress={handleConfirmRide}
                        disabled={!selectedOption}
                    >
                        <LinearGradient
                            colors={selectedOption ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#9CA3AF']}
                            style={styles.fullScreenConfirmButtonGradient}
                        >
                            <Text style={styles.fullScreenConfirmButtonText}>
                                {selectedOption ? `Confirmer ${selectedOption}` : 'Sélectionnez une option'}
                            </Text>
                            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );

    const renderSearchModal = () => (
        <Modal
            animationType="slide"
            transparent={false}
            visible={showSearchResults}
            onRequestClose={() => setShowSearchResults(false)}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        style={styles.modalBackButton}
                        onPress={() => setShowSearchResults(false)}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {activeField === 'pickup' ? 'Point de départ' : 'Destination'}
                    </Text>

                    <View style={{ width: 40 }} />
                </View>

                <View style={[styles.modalSearchBar, { backgroundColor: darkMode ? '#1F2937' : '#F3F4F6' }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.modalSearchInput, { color: theme.text }]}
                        placeholder={
                            activeField === 'pickup'
                                ? "Rechercher un point de départ..."
                                : "Rechercher une destination..."
                        }
                        placeholderTextColor={theme.textSecondary}
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        autoFocus
                    />
                </View>

                <ScrollView style={styles.modalContent}>
                    {searchText === '' && recentSearches.length > 0 && (
                        <View style={styles.modalSection}>
                            <View style={styles.modalSectionHeader}>
                                <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>Recherches récentes</Text>
                                <TouchableOpacity onPress={clearRecentSearches}>
                                    <Text style={[styles.clearText, { color: theme.primary }]}>Effacer</Text>
                                </TouchableOpacity>
                            </View>
                            {recentSearches.map((search, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.modalItem, { borderBottomColor: theme.border }]}
                                    onPress={() => {
                                        if (activeField === 'pickup') {
                                            setPickup(search);
                                        } else {
                                            setDestination(search);
                                        }
                                        setShowSearchResults(false);
                                    }}
                                >
                                    <Ionicons name="time" size={20} color={theme.textSecondary} />
                                    <Text style={[styles.modalItemText, { color: theme.text }]}>{search}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {filteredPlaces.length > 0 && (
                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>
                                {searchText === '' ? 'Lieux populaires' : 'Résultats'}
                            </Text>
                            {filteredPlaces.map(place => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={[styles.modalItem, { borderBottomColor: theme.border }]}
                                    onPress={() => handlePlaceSelect(place)}
                                >
                                    <View style={[styles.placeIcon, { backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF' }]}>
                                        <Ionicons
                                            name={
                                                place.type === 'airport' ? 'airplane' :
                                                    place.type === 'market' ? 'cart' :
                                                        place.type === 'landmark' ? 'flag' :
                                                            place.type === 'hospital' ? 'medkit' : 'beach'
                                            }
                                            size={20}
                                            color="#3B82F6"
                                        />
                                    </View>
                                    <View style={styles.modalItemInfo}>
                                        <Text style={[styles.modalItemTitle, { color: theme.text }]}>{place.name}</Text>
                                        <Text style={[styles.modalItemSubtitle, { color: theme.textSecondary }]}>{place.address}</Text>
                                        <Text style={[styles.modalItemMeta, { color: theme.primary }]}>{place.distance} • {place.time}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {searchText !== '' && filteredPlaces.length === 0 && (
                        <View style={styles.noResults}>
                            <Ionicons name="search" size={48} color="#D1D5DB" />
                            <Text style={styles.noResultsText}>
                                Aucun résultat pour "{searchText}"
                            </Text>
                            <Text style={styles.noResultsSubtext}>
                                Essayez avec d'autres mots-clés
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (navigation && navigation.goBack) {
                            navigation.goBack();
                        }
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>Nouveau trajet</Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.searchFields}>
                    <View style={styles.searchFieldContainer}>
                        <View style={styles.fieldIndicator}>
                            <View style={[styles.startDot, { backgroundColor: theme.success }]} />
                            <View style={[styles.verticalLine, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity
                            style={[styles.searchField, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}
                            onPress={() => handleFieldFocus('pickup')}
                        >
                            <View style={styles.fieldContent}>
                                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>De</Text>
                                {pickup ? (
                                    <Text style={[styles.fieldValue, { color: theme.text }]} numberOfLines={1}>
                                        {pickup}
                                    </Text>
                                ) : (
                                    <Text style={[styles.fieldPlaceholder, { color: theme.textSecondary }]}>
                                        Point de départ...
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.useLocationButton}
                                onPress={handleUseCurrentLocation}
                                disabled={loadingLocation}
                            >
                                <Ionicons
                                    name={loadingLocation ? "refresh" : "navigate"}
                                    size={20}
                                    color={loadingLocation ? "#9CA3AF" : "#3B82F6"}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchFieldContainer}>
                        <View style={styles.fieldIndicator}>
                            <View style={styles.endDot} />
                        </View>

                        <TouchableOpacity
                            style={[styles.searchField, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}
                            onPress={() => handleFieldFocus('destination')}
                        >
                            <View style={styles.fieldContent}>
                                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>À</Text>
                                {destination ? (
                                    <Text style={[styles.fieldValue, { color: theme.text }]} numberOfLines={1}>
                                        {destination}
                                    </Text>
                                ) : (
                                    <Text style={[styles.fieldPlaceholder, { color: theme.textSecondary }]}>
                                        Destination...
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.swapButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={swapLocations}
                    >
                        <Ionicons name="swap-vertical" size={20} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!pickup || !destination) && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={!pickup || !destination}
                >
                    <LinearGradient
                        colors={pickup && destination ? ['#3B82F6', '#2563EB'] : ['#D1D5DB', '#9CA3AF']}
                        style={styles.continueButtonGradient}
                    >
                        <Text style={styles.continueButtonText}>
                            Continuer
                        </Text>
                        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Destinations populaires</Text>

                    {popularPlaces.map(place => (
                        <TouchableOpacity
                            key={place.id}
                            style={[styles.placeCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                            onPress={() => {
                                setDestination(place.name);
                                if (!recentSearches.includes(place.name)) {
                                    setRecentSearches([place.name, ...recentSearches.slice(0, 4)]);
                                }
                            }}
                        >
                            <View style={[styles.placeIcon, { backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#F0F9FF' }]}>
                                <Ionicons
                                    name={
                                        place.type === 'airport' ? 'airplane' :
                                            place.type === 'market' ? 'cart' :
                                                place.type === 'landmark' ? 'flag' :
                                                    place.type === 'hospital' ? 'medkit' : 'beach'
                                    }
                                    size={20}
                                    color="#3B82F6"
                                />
                            </View>

                            <View style={styles.placeInfo}>
                                <Text style={[styles.placeName, { color: theme.text }]}>{place.name}</Text>
                                <Text style={[styles.placeAddress, { color: theme.textSecondary }]}>{place.address}</Text>
                            </View>

                            <View style={styles.placeMeta}>
                                <Text style={[styles.placeDistance, { color: theme.primary }]}>{place.distance}</Text>
                                <Text style={[styles.placeTime, { color: theme.textSecondary }]}>{place.time}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Parcourir par catégorie</Text>

                    <View style={styles.categoriesGrid}>
                        {categories.map(category => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                                onPress={() => {
                                    setActiveField('destination');
                                    setSearchText(category.name);
                                    setShowSearchResults(true);
                                }}
                            >
                                <LinearGradient
                                    colors={darkMode ? ['#1e3a8a', '#1e40af'] : ['#F0F9FF', '#E0F2FE']}
                                    style={styles.categoryIcon}
                                >
                                    <MaterialIcons
                                        name={category.icon}
                                        size={24}
                                        color={darkMode ? '#60a5fa' : '#0EA5E9'}
                                    />
                                </LinearGradient>
                                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                                <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>{category.count} lieux</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {renderSearchModal()}
            {renderRideOptionsModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        paddingHorizontal: 16,
    },
    searchFields: {
        marginTop: 20,
        position: 'relative',
    },
    searchFieldContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    fieldIndicator: {
        alignItems: 'center',
        width: 24,
        marginRight: 12,
    },
    startDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
    },
    endDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
    },
    verticalLine: {
        width: 2,
        height: 40,
        backgroundColor: '#D1D5DB',
        marginTop: 4,
    },
    searchField: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    fieldPlaceholder: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    useLocationButton: {
        padding: 8,
    },
    swapButton: {
        position: 'absolute',
        right: 16,
        top: 40,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    continueButton: {
        marginTop: 16,
        marginBottom: 32,
    },
    continueButtonDisabled: {
        opacity: 0.6,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 20,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 12,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    clearText: {
        fontSize: 14,
        color: '#3B82F6',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 48) / 3,
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 2,
    },
    categoryCount: {
        fontSize: 11,
        color: '#6B7280',
    },
    placeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    placeIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    placeInfo: {
        flex: 1,
    },
    placeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    placeAddress: {
        fontSize: 14,
        color: '#6B7280',
    },
    placeMeta: {
        alignItems: 'flex-end',
    },
    placeDistance: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    placeTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalBackButton: {
        padding: 8,
        marginRight: 12,
    },
    modalTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    modalSection: {
        marginBottom: 24,
    },
    modalSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalItemText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    modalItemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    modalItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    modalItemSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    modalItemMeta: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    noResults: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    // NOUVEAUX STYLES POUR LE MODAL EN PLEIN ÉCRAN
    fullScreenModalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    fullScreenModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    fullScreenModalBackButton: {
        padding: 8,
        marginRight: 12,
    },
    fullScreenModalHeaderContent: {
        flex: 1,
    },
    fullScreenModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    fullScreenModalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    fullScreenModalContent: {
        flex: 1,
    },
    fullScreenModalScrollContent: {
        paddingBottom: 100, // Espace pour le bouton fixe
    },
    // Styles existants réutilisés
    rideDetailsCard: {
        margin: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    rideDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    rideMetaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 6,
    },
    optionsContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    optionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    optionCardSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#F0F9FF',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionInfo: {
        flex: 1,
    },
    optionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    optionPriceTag: {
        alignItems: 'flex-end',
    },
    optionPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    optionCurrency: {
        fontSize: 12,
        color: '#6B7280',
    },
    optionFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    // Conteneur pour le bouton fixe en bas
    fullScreenConfirmButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    fullScreenConfirmButton: {
        width: '100%',
    },
    fullScreenConfirmButtonDisabled: {
        opacity: 0.6,
    },
    fullScreenConfirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 20,
    },
    fullScreenConfirmButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 12,
    },
});