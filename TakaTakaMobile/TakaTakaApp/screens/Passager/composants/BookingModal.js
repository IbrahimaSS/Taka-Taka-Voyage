import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { PLATFORM } from '../../../constants/platform';
import { useApp } from '../../../AppContext';
import { apiClient } from '../../../services/apiClient';

const VEHICLE_MAP = {
    'moto': 'MOTO',
    'taxi': 'TAXI',
    'voiture': 'VOITURE'
};

const BookingModal = ({ visible, onClose, onConfirm, initialPickup = '', initialDestination = '', darkMode = false }) => {
    const { theme, t } = useApp();
    // --- ÉTATS ---
    const [step, setStep] = useState(1);
    const [pickup, setPickup] = useState(initialPickup);
    const [destination, setDestination] = useState(initialDestination);
    const [isLocating, setIsLocating] = useState(false);

    // Étape 2 Options
    const [selectedVehicleId, setSelectedVehicleId] = useState('taxi');
    const [rideType, setRideType] = useState(PLATFORM.rideTypes.immediate.label);
    const [paymentMoment, setPaymentMoment] = useState('Anticipé');
    const [rideDate, setRideDate] = useState('');
    const [rideTime, setRideTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());

    // Pickers
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('date');

    // Estimation réelle
    const [estimationData, setEstimationData] = useState(null);
    const [loadingEstimation, setLoadingEstimation] = useState(false);
    const [loadingReservation, setLoadingReservation] = useState(false);

    // Étape 3 Paiement
    const [paymentMethod, setPaymentMethod] = useState('orange');
    const [phoneNumber, setPhoneNumber] = useState('621001122');
    const [otpCode, setOtpCode] = useState('');
    const [timer, setTimer] = useState(101);

    // Données Véhicules
    const vehicles = [
        { id: 'moto', name: 'Moto - taxi', price: '5 000 GNF', icon: 'bicycle', time: '5 min' },
        { id: 'taxi', name: 'Taxi partagé', price: '15 000 GNF', icon: 'car', time: '3 min' },
        { id: 'voiture', name: 'Voiture privée', price: '25 000 GNF', icon: 'car-sport', time: '2 min' },
    ];

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    // Sync avec les props initiales
    useEffect(() => {
        setPickup(initialPickup);
        setDestination(initialDestination);
    }, [initialPickup, initialDestination]);

    // Recalculer l'estimation quand le trajet ou le véhicule change
    useEffect(() => {
        const fetchEstimation = async () => {
            if (pickup.length > 3 && destination.length > 3) {
                setLoadingEstimation(true);
                try {
                    const response = await apiClient('/estimations/estimer', {
                        method: 'POST',
                        body: {
                            depart: pickup,
                            destination: destination,
                            typeVehicule: VEHICLE_MAP[selectedVehicleId] || 'TAXI'
                        }
                    });
                    if (response.succes) {
                        setEstimationData(response.estimation);
                    }
                } catch (error) {
                    console.error('Estimation error:', error);
                } finally {
                    setLoadingEstimation(false);
                }
            }
        };

        const timer = setTimeout(fetchEstimation, 1000);
        return () => clearTimeout(timer);
    }, [pickup, destination, selectedVehicleId]);

    // Timer pour le code OTP
    useEffect(() => {
        let interval;
        if (step === 3 && paymentMoment === 'Anticipé' && paymentMethod !== 'cash' && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) { clearInterval(interval); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, paymentMoment, paymentMethod]);

    // --- NAVIGATION ---
    const handleSeePrice = () => {
        if (!pickup || !destination) {
            Alert.alert('Attention', 'Veuillez remplir le départ et la destination.');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        if (step === 3) setStep(2);
        else if (step === 2) setStep(1);
    };

    const handleProceedToConfirmation = () => {
        if (rideType === PLATFORM.rideTypes.scheduled.label && (!rideDate || !rideTime)) {
            Alert.alert('Information manquante', 'Veuillez sélectionner une date et une heure.');
            return;
        }
        // Pas besoin d'étape 3 séparée, on reste en étape 2 pour la confirmation finale ou on lance la recherche
        handleFinalConfirm();
    };

    const handleFinalConfirm = async () => {
        if (paymentMoment === 'Anticipé') {
            if (paymentMethod !== 'cash') {
                if (!phoneNumber || phoneNumber.replace(/\s/g, '').length < 9) {
                    Alert.alert('Numéro requis', 'Veuillez entrer un numéro valide (9 chiffres).');
                    return;
                }
                if (otpCode.length < 8) {
                    Alert.alert('Code requis', 'Veuillez entrer le code à 8 chiffres.');
                    return;
                }
                if (timer === 0) {
                    Alert.alert('Code expiré', 'Le code a expiré. Demandez un nouveau code.');
                    return;
                }
            }
        }

        setLoadingReservation(true);
        try {
            // Geocoding pour les coordonnées requises par le backend
            let departLat = 9.5091, departLng = -13.7121; // Defaults: Conakry
            let destLat = 9.5370, destLng = -13.6773;

            try {
                const depGeo = await Location.geocodeAsync(pickup);
                if (depGeo.length > 0) {
                    departLat = depGeo[0].latitude;
                    departLng = depGeo[0].longitude;
                }
                const destGeo = await Location.geocodeAsync(destination);
                if (destGeo.length > 0) {
                    destLat = destGeo[0].latitude;
                    destLng = destGeo[0].longitude;
                }
            } catch (geoErr) {
                console.warn('Geocoding error, using defaults:', geoErr);
            }

            const isScheduled = rideType === PLATFORM.rideTypes.scheduled.label;
            const endpoint = isScheduled 
                ? '/passager/reservations-planifiees/planifier' 
                : '/reservations-immediate/confirmer-immediate';

            // Préparation des données pour le backend
            const commonBody = {
                depart: pickup,
                destination: destination,
                departLat,
                departLng,
                destinationLat,
                destinationLng,
                typeVehicule: VEHICLE_MAP[selectedVehicleId] || 'TAXI',
                momentPaiement: paymentMoment === 'Anticipé' ? 'MAINTENANT' : 'FIN',
                paymentResult: paymentMoment === 'Anticipé' && paymentMethod !== 'cash' ? {
                    success: true,
                    paymentMethod: paymentMethod.toUpperCase(),
                    phoneNumber
                } : null
            };

            const body = isScheduled ? {
                ...commonBody,
                prixEstime: estimationData?.prix || 0,
                dateDepart: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), selectedTime.getHours(), selectedTime.getMinutes()).toISOString(),
            } : {
                ...commonBody,
                prix: estimationData?.prix || 0,
                distanceKm: estimationData?.distanceKm || 0,
                dureeMin: estimationData?.dureeMin || 0,
            };

            const response = await apiClient(endpoint, {
                method: 'POST',
                body
            });

            if (response.succes) {
                onConfirm({
                    ...response.reservation,
                    pickup, destination,
                    vehicleType: selectedVehicle.name,
                    rideType, paymentMoment, paymentMethod,
                    phoneNumber: paymentMethod !== 'cash' ? phoneNumber : null,
                    price: estimationData?.prix ? `${estimationData.prix.toLocaleString()} GNF` : selectedVehicle.price,
                    rideDate: isScheduled ? rideDate : null,
                    rideTime: isScheduled ? rideTime : null,
                    paymentDone: paymentMoment === 'Anticipé' && paymentMethod !== 'cash',
                });
                resetModal();
                onClose();
            } else {
                Alert.alert('Erreur', response.message || 'Impossible de créer la réservation');
            }
        } catch (error) {
            console.error('Reservation error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la réservation.');
        } finally {
            setLoadingReservation(false);
        }
    };

    const resetModal = () => {
        setStep(1);
        setPickup(initialPickup);
        setDestination(initialDestination);
        setRideType(PLATFORM.rideTypes.immediate.label);
        setPaymentMoment('Anticipé');
        setRideDate('');
        setRideTime('');
        setSelectedDate(new Date());
        setSelectedTime(new Date());
        setOtpCode('');
        setTimer(101);
    };

    const handleResendCode = () => {
        setTimer(101);
        Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé.');
    };

    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,2})(\d{0,2})$/);
        if (match) return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
        return value;
    };
    const handlePhoneChange = (text) => setPhoneNumber(formatPhoneNumber(text));

    // Date/Time
    const handleSelectDate = () => { setDatePickerMode('date'); setShowDatePicker(true); };
    const handleSelectTime = () => { setDatePickerMode('time'); setShowDatePicker(true); };

    const onDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selected) {
            if (datePickerMode === 'date') {
                setSelectedDate(selected);
                const d = selected.getDate().toString().padStart(2, '0');
                const m = (selected.getMonth() + 1).toString().padStart(2, '0');
                setRideDate(`${d}/${m}/${selected.getFullYear()}`);
            } else {
                setSelectedTime(selected);
                const h = selected.getHours().toString().padStart(2, '0');
                const min = selected.getMinutes().toString().padStart(2, '0');
                setRideTime(`${h}:${min}`);
            }
        }
    };

    const handleLocate = async () => {
        setIsLocating(true);
        setPickup('Recherche de position...');
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setPickup('Permission refusée');
                setIsLocating(false);
                return;
            }
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const [geocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (geocode) {
                const safePart = (part) => {
                    if (!part || part.includes('+') || part.includes('Unnamed')) return null;
                    return part;
                };

                const street = safePart(geocode.street);
                const district = safePart(geocode.district);
                const name = safePart(geocode.name);
                const city = safePart(geocode.city);
                const subregion = safePart(geocode.subregion);

                // Priorité au nom de rue ou de quartier, avant le nom générique
                let quartier = street || district || name;

                // Si on tombe sur un nom générique ou administratif, on tente d'être plus précis
                if (quartier && quartier.toLowerCase().includes('préfecture')) {
                    quartier = street || district || null;
                }

                // Construire une adresse propre
                const bestParts = [quartier, city || subregion].filter(Boolean);
                let address = bestParts.join(', ').trim();

                // Enlever les doublons (ex: "Mamou, Mamou")
                const uniques = address.split(', ').filter((item, pos, self) => self.indexOf(item) == pos);
                address = uniques.join(', ');

                // Si toujours vide, mettre une mention
                if (!address) address = 'Position exacte détectée';

                setPickup(address);
            } else {
                setPickup('Position introuvable');
            }
        } catch (error) {
            setPickup('Erreur de localisation');
        } finally {
            setIsLocating(false);
        }
    };

    // ========== ÉTAPE 1 : RECHERCHE ==========
    const renderStep1 = () => (
        <View style={s.stepContainer}>
            <View style={s.step1Hero}>
                <LinearGradient colors={['#10B981', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.step1HeroGradient}>
                    <Ionicons name="location-outline" size={32} color="#FFFFFF" />
                    <Text style={s.step1HeroTitle}>{t('home_where_to') || 'Où allez-vous ?'}</Text>
                    <Text style={s.step1HeroSubtitle}>{t('planning_subtitle') || 'Planifiez votre trajet'}</Text>
                </LinearGradient>
            </View>

            <View style={[s.inputGroup, darkMode && s.inputGroupDark]}>
                <View style={s.inputRow}>
                    <View style={s.inputDot}>
                        <View style={s.dotGreen} />
                    </View>
                    <TextInput
                        style={[s.input, darkMode && s.inputDark]}
                        placeholder={t('ride_pickup') || 'Point de départ'}
                        placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                        value={pickup}
                        onChangeText={setPickup}
                    />
                    <TouchableOpacity onPress={handleLocate} style={s.locateBtn} disabled={isLocating}>
                        {isLocating ? (
                            <ActivityIndicator size="small" color="#3B82F6" />
                        ) : (
                            <Ionicons name="locate" size={18} color="#3B82F6" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[s.inputDivider, darkMode && s.inputDividerDark]}>
                    <View style={s.inputDividerLine} />
                </View>

                <View style={s.inputRow}>
                    <View style={s.inputDot}>
                        <View style={s.dotRed} />
                    </View>
                    <TextInput
                        style={[s.input, darkMode && s.inputDark]}
                        placeholder={t('ride_destination') || 'Destination'}
                        placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                        value={destination}
                        onChangeText={setDestination}
                    />
                </View>
            </View>

            {pickup.length > 3 && destination.length > 3 && (
                <View style={[s.estimationCard, darkMode && s.estimationCardDark]}>
                    <View style={s.estimationPriceRow}>
                        <View style={s.estimationPriceLabelCol}>
                            <Text style={[s.estimationPriceLabel, darkMode && s.estimationPriceLabelDark]}>Prix estimé</Text>
                            <Text style={s.estimationPriceValue}>
                                {loadingEstimation ? 'Calcule...' : (estimationData?.prix ? `${estimationData.prix.toLocaleString()} GNF` : selectedVehicle.price)}
                            </Text>
                        </View>
                        <View style={[s.estimationIconCircle, darkMode && s.estimationIconCircleDark]}>
                            <Ionicons name="wallet" size={20} color="#10B981" />
                        </View>
                    </View>

                    <View style={[s.estimationDivider, darkMode && s.estimationDividerDark]} />

                    <View style={s.estimationStatsRow}>
                        <View style={s.estimationStatItem}>
                            <Ionicons name="car" size={16} color="#10B981" />
                            <Text style={[s.estimationStatText, darkMode && s.estimationStatTextDark]}>
                                {loadingEstimation ? '...' : `${estimationData?.distanceKm || '4.6'} km`}
                            </Text>
                        </View>
                        <View style={[s.estimationVerticalDivider, darkMode && s.estimationVerticalDividerDark]} />
                        <View style={s.estimationStatItem}>
                            <Ionicons name="time" size={16} color="#10B981" />
                            <Text style={[s.estimationStatText, darkMode && s.estimationStatTextDark]}>
                                {loadingEstimation ? '...' : `${estimationData?.dureeMin || '12'} min`}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <TouchableOpacity style={s.primaryButton} onPress={() => setStep(2)} activeOpacity={0.85}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={s.primaryButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={s.primaryButtonText}>{t('next') || 'Suivant'}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    // ========== ÉTAPE 2 : DÉTAILS & PAIEMENT ==========
    const renderStep2 = () => (
        <View style={s.stepContainer}>
            <View style={s.stepHeader}>
                <TouchableOpacity onPress={handleBack} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={darkMode ? "#F9FAFB" : "#1E293B"} />
                </TouchableOpacity>
                <Text style={[s.stepHeaderTitle, darkMode && s.stepHeaderTitleDark]}>Détails & Paiement</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Véhicules */}
                <Text style={[s.sectionLabel, darkMode && s.sectionLabelDark]}>Choisissez votre véhicule</Text>
                <View style={s.vehicleList}>
                    {vehicles.map((vehicle, index) => {
                        const isSelected = selectedVehicleId === vehicle.id;
                        return (
                            <TouchableOpacity
                                key={vehicle.id}
                                style={[
                                    s.vehicleCard,
                                    index < vehicles.length - 1 && { marginBottom: 12 },
                                    isSelected && s.vehicleCardSelected,
                                    darkMode && s.vehicleCardDark,
                                    darkMode && isSelected && s.vehicleCardSelectedDark
                                ]}
                                onPress={() => setSelectedVehicleId(vehicle.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[s.vehicleIconBox, isSelected && s.vehicleIconBoxSelected]}>
                                    <Ionicons name={vehicle.icon} size={28} color={isSelected ? '#FFFFFF' : '#3B82F6'} />
                                </View>
                                <View style={s.vehicleInfo}>
                                    <Text style={[
                                        s.vehicleName,
                                        isSelected && s.vehicleNameSelected,
                                        darkMode && s.vehicleNameDark,
                                        darkMode && isSelected && s.vehicleNameSelectedDark
                                    ]}>{vehicle.name}</Text>
                                    <Text style={[s.vehicleTime, darkMode && s.vehicleTimeDark]}>~ {vehicle.time}</Text>
                                </View>
                                <Text style={[
                                    s.vehiclePrice,
                                    isSelected && s.vehiclePriceSelected,
                                    darkMode && s.vehiclePriceDark,
                                    darkMode && isSelected && s.vehiclePriceSelectedDark
                                ]}>
                                    {isSelected && estimationData?.prix && index === vehicles.findIndex(v => v.id === selectedVehicleId) 
                                        ? `${estimationData.prix.toLocaleString()} GNF` 
                                        : vehicle.price}
                                </Text>
                                {isSelected && (
                                    <View style={s.checkmark}>
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Type de Course */}
                <View style={s.sectionSpacer} />
                <Text style={[s.sectionLabel, darkMode && s.sectionLabelDark]}>Type de course</Text>
                <View style={[s.toggleContainer, darkMode && s.toggleContainerDark]}>
                    <TouchableOpacity
                        style={[s.toggleTab, rideType === PLATFORM.rideTypes.immediate.label && s.toggleTabActive, darkMode && s.toggleTabDark, darkMode && rideType === PLATFORM.rideTypes.immediate.label && s.toggleTabActiveDark]}
                        onPress={() => setRideType(PLATFORM.rideTypes.immediate.label)}
                    >
                        <Ionicons name={PLATFORM.rideTypes.immediate.icon} size={16} color={rideType === PLATFORM.rideTypes.immediate.label ? '#3B82F6' : '#64748B'} />
                        <Text style={[s.toggleText, rideType === PLATFORM.rideTypes.immediate.label && s.toggleTextActive, darkMode && s.toggleTextDark, darkMode && rideType === PLATFORM.rideTypes.immediate.label && s.toggleTextActiveDark]}>{PLATFORM.rideTypes.immediate.shortLabel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.toggleTab, rideType === PLATFORM.rideTypes.scheduled.label && s.toggleTabActive, darkMode && s.toggleTabDark, darkMode && rideType === PLATFORM.rideTypes.scheduled.label && s.toggleTabActiveDark]}
                        onPress={() => setRideType(PLATFORM.rideTypes.scheduled.label)}
                    >
                        <Ionicons name={PLATFORM.rideTypes.scheduled.icon} size={16} color={rideType === PLATFORM.rideTypes.scheduled.label ? '#3B82F6' : '#64748B'} />
                        <Text style={[s.toggleText, rideType === PLATFORM.rideTypes.scheduled.label && s.toggleTextActive, darkMode && s.toggleTextDark, darkMode && rideType === PLATFORM.rideTypes.scheduled.label && s.toggleTextActiveDark]}>{PLATFORM.rideTypes.scheduled.shortLabel}</Text>
                    </TouchableOpacity>
                </View>

                {/* Date/Heure pour course planifiée */}
                {rideType === PLATFORM.rideTypes.scheduled.label && (
                    <View style={s.datetimeBox}>
                        <View style={s.datetimeRow}>
                            <TouchableOpacity style={[s.datetimeBtn, darkMode && s.datetimeBtnDark]} onPress={handleSelectDate}>
                                <View style={[s.datetimeIcon, darkMode && s.datetimeIconDark]}><Ionicons name="calendar-outline" size={20} color="#3B82F6" /></View>
                                <View style={s.datetimeTextBox}>
                                    <Text style={[s.datetimeLabel, darkMode && s.datetimeLabelDark]}>Date</Text>
                                    <Text style={[s.datetimeValue, darkMode && s.datetimeValueDark]}>{rideDate || 'Choisir'}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.datetimeBtn, darkMode && s.datetimeBtnDark]} onPress={handleSelectTime}>
                                <View style={[s.datetimeIcon, darkMode && s.datetimeIconDark]}><Ionicons name="time-outline" size={20} color="#3B82F6" /></View>
                                <View style={s.datetimeTextBox}>
                                    <Text style={[s.datetimeLabel, darkMode && s.datetimeLabelDark]}>Heure</Text>
                                    <Text style={[s.datetimeValue, darkMode && s.datetimeValueDark]}>{rideTime || 'Choisir'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Moment de Paiement */}
                <View style={s.sectionSpacer} />
                <Text style={[s.sectionLabel, darkMode && s.sectionLabelDark]}>Moment du paiement</Text>
                <View style={[s.toggleContainer, darkMode && s.toggleContainerDark]}>
                    <TouchableOpacity style={[s.toggleTab, paymentMoment === 'Anticipé' && s.toggleTabActive, darkMode && s.toggleTabDark, darkMode && paymentMoment === 'Anticipé' && s.toggleTabActiveDark]} onPress={() => setPaymentMoment('Anticipé')}>
                        <Ionicons name="card" size={16} color={paymentMoment === 'Anticipé' ? '#10B981' : '#64748B'} />
                        <Text style={[s.toggleText, paymentMoment === 'Anticipé' && s.toggleTextActive, darkMode && s.toggleTextDark, darkMode && paymentMoment === 'Anticipé' && s.toggleTextActiveDark]}>Anticipé</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.toggleTab, paymentMoment === 'Fin' && s.toggleTabActive, darkMode && s.toggleTabDark, darkMode && paymentMoment === 'Fin' && s.toggleTabActiveDark]} onPress={() => setPaymentMoment('Fin')}>
                        <Ionicons name="time" size={16} color={paymentMoment === 'Fin' ? '#10B981' : '#64748B'} />
                        <Text style={[s.toggleText, paymentMoment === 'Fin' && s.toggleTextActive, darkMode && s.toggleTextDark, darkMode && paymentMoment === 'Fin' && s.toggleTextActiveDark]}>Fin de course</Text>
                    </TouchableOpacity>
                </View>

                {/* Mode de Paiement (Orange & MTN) */}
                <View style={s.sectionSpacer} />
                <Text style={[s.sectionLabel, darkMode && s.sectionLabelDark]}>Mode de paiement</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.paymentWays}>
                    <TouchableOpacity
                        style={[s.payWayBtn, paymentMethod === 'cash' && s.payWayBtnActive, paymentMethod === 'cash' && { borderColor: '#10B981' }, darkMode && s.payWayBtnDark, darkMode && paymentMethod === 'cash' && s.payWayBtnActiveDark]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={[s.logoMini, { backgroundColor: '#10B981' }]}><Ionicons name="cash" size={14} color="#FFFFFF" /></View>
                        <Text style={[s.payWayText, paymentMethod === 'cash' && { color: '#10B981', fontWeight: 'bold' }, darkMode && s.payWayTextDark]}>Espèces</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.payWayBtn, paymentMethod === 'orange' && s.payWayBtnActive, paymentMethod === 'orange' && { borderColor: '#FF6600' }, darkMode && s.payWayBtnDark, darkMode && paymentMethod === 'orange' && s.payWayBtnActiveDark]}
                        onPress={() => setPaymentMethod('orange')}
                    >
                        <View style={[s.logoMini, { backgroundColor: '#FF6600' }]}><Text style={s.logoMiniText}>O</Text></View>
                        <Text style={[s.payWayText, paymentMethod === 'orange' && { color: '#FF6600', fontWeight: 'bold' }, darkMode && s.payWayTextDark]}>Orange Money</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.payWayBtn, paymentMethod === 'mtn' && s.payWayBtnActive, paymentMethod === 'mtn' && { borderColor: '#EAB308' }, darkMode && s.payWayBtnDark, darkMode && paymentMethod === 'mtn' && s.payWayBtnActiveDark]}
                        onPress={() => setPaymentMethod('mtn')}
                    >
                        <View style={[s.logoMini, { backgroundColor: '#EAB308' }]}><Text style={[s.logoMiniText, { color: '#000' }]}>M</Text></View>
                        <Text style={[s.payWayText, paymentMethod === 'mtn' && { color: '#EAB308', fontWeight: 'bold' }, darkMode && s.payWayTextDark]}>MTN MoMo</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Formulaire de paiement Digital si Anticipé */}
                {paymentMoment === 'Anticipé' && paymentMethod !== 'cash' && (
                    <View style={[s.paymentMiniForm, darkMode && s.paymentMiniFormDark]}>
                        <View style={s.fieldGroupMini}>
                            <Text style={[s.fieldLabelMini, darkMode && s.fieldLabelMiniDark]}>Numéro {paymentMethod === 'orange' ? 'Orange' : 'MTN'}</Text>
                            <View style={[s.phoneInputBoxMini, darkMode && s.phoneInputBoxMiniDark]}>
                                <Text style={s.countryCodeMini}>+224</Text>
                                <TextInput
                                    style={[s.phoneInputMini, darkMode && s.phoneInputMiniDark]}
                                    placeholder="000 00 00 00"
                                    placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={handlePhoneChange}
                                />
                            </View>
                        </View>
                        <View style={s.fieldGroupMini}>
                            <Text style={[s.fieldLabelMini, darkMode && s.fieldLabelMiniDark]}>Code OTP</Text>
                            <TextInput
                                style={[s.otpInputMini, darkMode && s.otpInputMiniDark]}
                                placeholder="8 chiffres"
                                placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                                keyboardType="number-pad"
                                maxLength={8}
                                value={otpCode}
                                onChangeText={setOtpCode}
                            />
                            <Text style={[s.timerMini, darkMode && s.timerMiniDark]}>Expire dans <Text style={{ color: '#EF4444' }}>{timer}s</Text></Text>
                        </View>
                    </View>
                )}

                {/* Récapitulatif Rapide */}
                <LinearGradient
                    colors={['#3B82F6', '#10B981']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.summaryCard}
                >
                    <View style={s.summaryHeader}>
                        <Ionicons name="receipt" size={18} color="rgba(255,255,255,0.8)" />
                        <Text style={s.summaryTitle}>Estimation Finale</Text>
                    </View>
                    <Text style={s.summaryPrice}>
                        {loadingEstimation ? '...' : (estimationData?.prix ? `${estimationData.prix.toLocaleString()} GNF` : selectedVehicle.price)}
                    </Text>
                    <Text style={s.summaryRoute} numberOfLines={1}>{pickup} → {destination}</Text>
                </LinearGradient>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[s.bottomBar, darkMode && s.bottomBarDark]}>
                <TouchableOpacity
                    style={[s.confirmBtn, rideType === PLATFORM.rideTypes.scheduled.label && (!rideDate || !rideTime) && s.confirmBtnDisabled]}
                    onPress={handleFinalConfirm}
                    disabled={rideType === PLATFORM.rideTypes.scheduled.label && (!rideDate || !rideTime)}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={s.confirmBtnGradient}
                    >
                        {loadingReservation ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                <Text style={s.confirmBtnText}>Confirmer la réservation</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ========== RENDER PRINCIPAL ==========
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[s.modalContent, darkMode && s.modalContentDark]}>
                    {/* Header */}
                    <View style={[s.modalHeader, darkMode && s.modalHeaderDark]}>
                        <View style={[s.handleBar, darkMode && s.handleBarDark]} />
                        <View style={s.modalHeaderRow}>
                            <Text style={[s.modalTitle, darkMode && s.modalTitleDark]}>
                                {step === 1 ? 'Nouveau Trajet' : 'Détails & Paiement'}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={[s.closeBtn, darkMode && s.closeBtnDark]}>
                                <Ionicons name="close" size={22} color={darkMode ? "#94A3B8" : "#64748B"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {step === 1 ? renderStep1() : renderStep2()}
                </View>
            </View>

            {/* DateTimePicker FIX */}
            {showDatePicker && (
                <DateTimePicker
                    value={datePickerMode === 'date' ? selectedDate : selectedTime}
                    mode={datePickerMode}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={new Date()}
                    locale="fr-FR"
                />
            )}
        </Modal>
    );
};

// ========== STYLES ==========
const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    backdrop: { flex: 1 },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '88%',
        overflow: 'hidden',
    },
    modalContentDark: { backgroundColor: '#111827' },
    modalHeader: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalHeaderDark: { borderBottomColor: '#1F2937' },
    handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 12 },
    handleBarDark: { backgroundColor: '#374151' },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    modalTitleDark: { color: '#F9FAFB' },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    closeBtnDark: { backgroundColor: '#1F2937' },

    // Step 1
    stepContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
    step1Hero: { marginBottom: 24, borderRadius: 16, overflow: 'hidden' },
    step1HeroGradient: { paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
    step1HeroTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
    step1HeroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },
    inputGroup: {
        backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
        paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24,
    },
    inputGroupDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    inputDot: { marginRight: 12 },
    dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981' },
    dotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },
    input: { flex: 1, fontSize: 16, color: '#1E293B' },
    inputDark: { color: '#F9FAFB' },
    locateBtn: { padding: 8 },
    inputDivider: { height: 1, backgroundColor: '#E2E8F0', marginLeft: 24 },
    inputDividerDark: { backgroundColor: '#374151' },
    primaryButton: { borderRadius: 14, overflow: 'hidden', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    primaryButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

    // Nouveaux styles pour la carte d'estimation professionnelle avec la couleur verte originale
    estimationCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 24, // Bordure très adoucie pour le look pro
        padding: 18,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#BBF7D0',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    estimationCardDark: { backgroundColor: '#0D2818', borderColor: '#166534' },
    estimationPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    estimationPriceLabelCol: { flexDirection: 'column' },
    estimationPriceLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
    estimationPriceLabelDark: { color: '#A7F3D0' },
    estimationPriceValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' }, // Prix en vert
    estimationIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center' },
    estimationIconCircleDark: { backgroundColor: '#166534' },
    estimationDivider: { height: 1, backgroundColor: '#DCFCE7', marginVertical: 14 }, // Ligne de séparation verte
    estimationDividerDark: { backgroundColor: '#166534' },
    estimationStatsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    estimationStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    estimationVerticalDivider: { width: 1, height: 16, backgroundColor: '#DCFCE7' }, // Ligne verticale verte
    estimationVerticalDividerDark: { backgroundColor: '#166534' },
    estimationStatText: { fontSize: 14, color: '#475569', fontWeight: '600' },
    estimationStatTextDark: { color: '#A7F3D0' },

    // Step 2
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    backBtn: { padding: 8, marginRight: 8 },
    stepHeaderTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
    stepHeaderTitleDark: { color: '#F9FAFB' },
    vehicleList: {},
    vehicleCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    vehicleCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    vehicleCardSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF', borderWidth: 2 },
    vehicleCardSelectedDark: { borderColor: '#3B82F6', backgroundColor: '#1E3A8A40' },
    vehicleIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    vehicleIconBoxSelected: { backgroundColor: '#3B82F6' },
    vehicleInfo: { flex: 1 },
    vehicleName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    vehicleNameDark: { color: '#F9FAFB' },
    vehicleNameSelected: { color: '#1D4ED8' },
    vehicleNameSelectedDark: { color: '#60A5FA' },
    vehicleTime: { fontSize: 13, color: '#64748B', marginTop: 2 },
    vehicleTimeDark: { color: '#94A3B8' },
    vehiclePrice: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    vehiclePriceDark: { color: '#F9FAFB' },
    vehiclePriceSelectedDark: { color: '#60A5FA' },
    checkmark: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
    sectionSpacer: { height: 20 },
    sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 10 },
    sectionLabelDark: { color: '#94A3B8' },
    toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, padding: 4 },
    toggleContainerDark: { backgroundColor: '#1F2937' },
    toggleTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, gap: 6 },
    toggleTabDark: { backgroundColor: 'transparent' },
    toggleTabActive: { backgroundColor: '#FFFFFF', elevation: 2 },
    toggleTabActiveDark: { backgroundColor: '#374151', elevation: 0 },
    toggleText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    toggleTextDark: { color: '#94A3B8' },
    toggleTextActive: { color: '#1E293B', fontWeight: 'bold' },
    toggleTextActiveDark: { color: '#F9FAFB', fontWeight: 'bold' },

    // DateTime
    datetimeBox: { marginTop: 10 },
    datetimeRow: { flexDirection: 'row', gap: 10 },
    datetimeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    datetimeBtnDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    datetimeIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    datetimeIconDark: { backgroundColor: '#374151' },
    datetimeTextBox: { flex: 1 },
    datetimeLabel: { fontSize: 11, color: '#64748B' },
    datetimeLabelDark: { color: '#94A3B8' },
    datetimeValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
    datetimeValueDark: { color: '#F9FAFB' },

    // Payment Ways
    paymentWays: { paddingBottom: 5, gap: 10 },
    payWayBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    payWayBtnDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    payWayBtnActive: { backgroundColor: '#F8FAFC', elevation: 1 },
    payWayBtnActiveDark: { backgroundColor: '#374151' },
    payWayText: { fontSize: 14, color: '#64748B' },
    payWayTextDark: { color: '#94A3B8' },
    logoMini: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logoMiniText: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },

    // Payment Form Mini
    paymentMiniForm: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginTop: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    paymentMiniFormDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    fieldGroupMini: { marginBottom: 12 },
    fieldLabelMini: { fontSize: 12, fontWeight: 'bold', color: '#64748B', marginBottom: 6 },
    fieldLabelMiniDark: { color: '#94A3B8' },
    phoneInputBoxMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', overflow: 'hidden' },
    phoneInputBoxMiniDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
    countryCodeMini: { paddingHorizontal: 12, fontWeight: 'bold', color: '#64748B' },
    phoneInputMini: { flex: 1, padding: 12, fontSize: 15, color: '#1E293B' },
    phoneInputMiniDark: { color: '#F9FAFB' },
    otpInputMini: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', padding: 12, fontSize: 18, fontWeight: 'bold', letterSpacing: 4, textAlign: 'center' },
    otpInputMiniDark: { backgroundColor: '#374151', borderColor: '#4B5563', color: '#F9FAFB' },
    timerMini: { fontSize: 12, color: '#64748B', marginTop: 6, textAlign: 'center' },
    timerMiniDark: { color: '#94A3B8' },

    // Summary
    summaryCard: { borderRadius: 16, padding: 18, marginTop: 24 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    summaryTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' },
    summaryPrice: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
    summaryRoute: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
    bottomBarDark: { backgroundColor: '#111827', borderTopColor: '#1F2937' },
    confirmBtn: { borderRadius: 14, overflow: 'hidden' },
    confirmBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default BookingModal;