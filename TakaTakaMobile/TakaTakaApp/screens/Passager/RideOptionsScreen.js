import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Modal,
    TextInput,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import { PLATFORM } from '../../constants/platform';

export default function RideOptionsScreen({ navigation, route }) {
    const { paymentMethods, darkMode, theme } = useApp();

    // États pour les options
    const [passengerCount, setPassengerCount] = useState(1);
    const [hasLuggage, setHasLuggage] = useState(false);
    const [luggageSize, setLuggageSize] = useState('small'); // small, medium, large
    const [selectedPayment, setSelectedPayment] = useState(1); // ID de la méthode de paiement
    const [rideType, setRideType] = useState('now'); // 'now' ou 'later'
    const [scheduleDate, setScheduleDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Récupérer les données du trajet si disponibles
    const { pickup, destination, rideType: initialRideType } = route.params || {};

    // Options pour les bagages
    const luggageOptions = [
        { id: 'small', label: 'Petit', icon: 'briefcase', description: 'Sac à dos, petit sac' },
        { id: 'medium', label: 'Moyen', icon: 'bag', description: 'Valise cabine' },
        { id: 'large', label: 'Grand', icon: 'archive', description: 'Grande valise' },
    ];

    // Types de trajet (alignés doc web : Course immédiate, planifiée, Taxi-partage)
    const rideTypes = [
        { id: 'now', label: PLATFORM.rideTypes.immediate.shortLabel, icon: PLATFORM.rideTypes.immediate.icon, description: 'Départ maintenant' },
        { id: 'later', label: PLATFORM.rideTypes.scheduled.shortLabel, icon: PLATFORM.rideTypes.scheduled.icon, description: 'Planifier un horaire' },
        { id: 'shared', label: PLATFORM.rideTypes.shared.shortLabel, icon: PLATFORM.rideTypes.shared.icon, description: 'Partager les frais' },
    ];

    // Méthodes de paiement (doc web : Espèces + Paiement digital)
    const cashOption = { id: 0, type: 'cash', name: PLATFORM.paymentModes.cash.label, isDefault: false };
    const digitalOptions = paymentMethods.length > 0
        ? paymentMethods.map(p => ({ ...p, name: PLATFORM.paymentModes.digital.label }))
        : [{ id: 1, type: 'digital', name: PLATFORM.paymentModes.digital.label, isDefault: true }];
    const availablePayments = [cashOption, ...digitalOptions];

    const handleScheduleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setScheduleDate(selectedDate);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculatePriceMultiplier = () => {
        let multiplier = 1.0;

        // Multiplicateur pour le nombre de passagers
        if (passengerCount > 3) multiplier += 0.3;
        else if (passengerCount > 1) multiplier += 0.15;

        // Multiplicateur pour les bagages
        if (hasLuggage) {
            if (luggageSize === 'medium') multiplier += 0.1;
            else if (luggageSize === 'large') multiplier += 0.2;
        }

        // Surcharge pour les trajets programmés
        if (rideType === 'later') multiplier += 0.15;

        return multiplier;
    };

    const getEstimatedPrice = () => {
        const basePrice = 5000; // Prix de base en GNF
        const multiplier = calculatePriceMultiplier();
        return Math.round(basePrice * multiplier);
    };

    const handleConfirm = () => {
        const rideData = {
            pickup,
            destination,
            passengerCount,
            hasLuggage,
            luggageSize,
            paymentMethod: availablePayments.find(p => p.id === selectedPayment),
            rideType,
            scheduledTime: rideType === 'later' ? scheduleDate : null,
            estimatedPrice: getEstimatedPrice(),
        };

        console.log('Trajet configuré:', rideData);

        // Naviguer vers l'écran de confirmation
        navigation.navigate('ConfirmRide', rideData);
    };

    const renderPassengerSelector = () => (
        <View style={[styles.optionSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
                <Ionicons name="people" size={24} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Passagers</Text>
            </View>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Nombre de personnes voyageant avec vous
            </Text>

            <View style={styles.passengerSelector}>
                {[1, 2, 3, 4].map((count) => (
                    <TouchableOpacity
                        key={count}
                        style={[
                            styles.passengerOption,
                            passengerCount === count && styles.passengerOptionSelected,
                        ]}
                        onPress={() => setPassengerCount(count)}
                    >
                        <View style={[
                            styles.passengerIcon,
                            passengerCount === count && styles.passengerIconSelected,
                            { backgroundColor: darkMode ? '#374151' : '#EFF6FF' }
                        ]}>
                            <Ionicons
                                name="person"
                                size={20}
                                color={passengerCount === count ? '#FFFFFF' : theme.primary}
                            />
                            {count > 1 && (
                                <Text style={[
                                    styles.passengerCountText,
                                    passengerCount === count && styles.passengerCountTextSelected,
                                ]}>
                                    {count}
                                </Text>
                            )}
                        </View>
                        <Text style={[
                            styles.passengerLabel,
                            passengerCount === count && styles.passengerLabelSelected,
                            { color: passengerCount === count ? theme.primary : theme.textSecondary }
                        ]}>
                            {count} {count === 1 ? 'personne' : 'personnes'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.passengerInfo, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name="information-circle" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Maximum 4 passagers par trajet pour votre sécurité
                </Text>
            </View>
        </View>
    );

    const renderLuggageOptions = () => (
        <View style={[styles.optionSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
                <Ionicons name="bag" size={24} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Bagages</Text>

                <TouchableOpacity
                    style={styles.toggleSwitch}
                    onPress={() => setHasLuggage(!hasLuggage)}
                >
                    <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>
                        {hasLuggage ? 'Avec bagages' : 'Sans bagages'}
                    </Text>
                    <View style={[
                        styles.toggleTrack,
                        hasLuggage && styles.toggleTrackActive,
                    ]}>
                        <View style={[
                            styles.toggleThumb,
                            hasLuggage && styles.toggleThumbActive,
                        ]} />
                    </View>
                </TouchableOpacity>
            </View>

            {hasLuggage && (
                <>
                    <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                        Sélectionnez la taille de vos bagages
                    </Text>

                    <View style={styles.luggageGrid}>
                        {luggageOptions.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.luggageOption,
                                    luggageSize === item.id && styles.luggageOptionSelected,
                                ]}
                                onPress={() => setLuggageSize(item.id)}
                            >
                                <View style={[
                                    styles.luggageIcon,
                                    luggageSize === item.id && styles.luggageIconSelected,
                                    { backgroundColor: darkMode ? '#451a03' : '#FEF3C7' }
                                ]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color={luggageSize === item.id ? '#FFFFFF' : '#F59E0B'}
                                    />
                                </View>
                                <Text style={[styles.luggageLabel, { color: theme.text }]}>{item.label}</Text>
                                <Text style={[styles.luggageDescription, { color: theme.textSecondary }]}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.luggageInfo, { backgroundColor: darkMode ? '#451a03' : '#FEF3C7' }]}>
                        <Ionicons name="car" size={16} color={darkMode ? '#F59E0B' : '#6B7280'} />
                        <Text style={[styles.infoText, { color: darkMode ? '#FEF3C7' : '#6B7280' }]}>
                            Les grands bagages peuvent nécessiter un véhicule plus spacieux
                        </Text>
                    </View>
                </>
            )}
        </View>
    );

    const renderPaymentOptions = () => (
        <View style={[styles.optionSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
                <Ionicons name="card" size={24} color={theme.success} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Paiement</Text>
            </View>

            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Choisissez votre méthode de paiement
            </Text>

            <View style={styles.paymentList}>
                {availablePayments.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.paymentOption,
                            selectedPayment === method.id && styles.paymentOptionSelected,
                            { borderColor: selectedPayment === method.id ? theme.success : theme.border, backgroundColor: selectedPayment === method.id ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4') : 'transparent' }
                        ]}
                        onPress={() => setSelectedPayment(method.id)}
                    >
                        <View style={styles.paymentLeft}>
                            <View style={styles.paymentIcon}>
                                <Ionicons
                                    name={method.type === 'credit_card' ? 'card' :
                                        method.type === 'mobile_money' ? 'phone-portrait' :
                                            'cash'}
                                    size={20}
                                    color={theme.primary}
                                />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={[styles.paymentName, { color: theme.text }]}>{method.name}</Text>
                                {method.number && (
                                    <Text style={[styles.paymentNumber, { color: theme.textSecondary }]}>{method.number}</Text>
                                )}
                                {method.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>Par défaut</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.paymentRight}>
                            {selectedPayment === method.id ? (
                                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                            ) : (
                                <Ionicons name="radio-button-off" size={24} color={theme.border} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.addPaymentButton}
                onPress={() => navigation.navigate('PaymentMethods')}
            >
                <Ionicons name="add-circle" size={20} color={theme.primary} />
                <Text style={[styles.addPaymentText, { color: theme.primary }]}>Ajouter une méthode de paiement</Text>
            </TouchableOpacity>
        </View>
    );

    const renderScheduleOptions = () => (
        <View style={[styles.optionSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
                <Ionicons name="time" size={24} color="#8B5CF6" />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Horaire</Text>
            </View>

            <View style={styles.rideTypeSelector}>
                {rideTypes.map((type) => (
                    <TouchableOpacity
                        key={type.id}
                        style={[
                            styles.rideTypeButton,
                            rideType === type.id && styles.rideTypeButtonSelected,
                        ]}
                        onPress={() => setRideType(type.id)}
                    >
                        <View style={[
                            styles.rideTypeIcon,
                            rideType === type.id && styles.rideTypeIconSelected,
                            { backgroundColor: darkMode ? '#2d1b5e' : '#ede9fe' }
                        ]}>
                            <Ionicons
                                name={type.icon}
                                size={24}
                                color={rideType === type.id ? '#FFFFFF' : '#8B5CF6'}
                            />
                        </View>
                        <Text style={[
                            styles.rideTypeLabel,
                            rideType === type.id && styles.rideTypeLabelSelected,
                            { color: rideType === type.id ? '#8B5CF6' : theme.text }
                        ]}>
                            {type.label}
                        </Text>
                        <Text style={[styles.rideTypeDescription, { color: theme.textSecondary }]}>{type.description}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {rideType === 'later' && (
                <>
                    <TouchableOpacity
                        style={[styles.datePickerButton, { backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: theme.border }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <View style={styles.datePickerLeft}>
                            <Ionicons name="calendar" size={20} color="#8B5CF6" />
                            <View style={styles.datePickerInfo}>
                                <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Date et heure</Text>
                                <Text style={[styles.dateValue, { color: theme.text }]}>
                                    {formatDate(scheduleDate)}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <View style={[styles.scheduleInfo, { backgroundColor: darkMode ? '#2d1b5e' : '#F3F4F6' }]}>
                        <Ionicons name="information-circle" size={16} color={darkMode ? '#8B5CF6' : '#6B7280'} />
                        <Text style={[styles.infoText, { color: darkMode ? '#ede9fe' : '#6B7280' }]}>
                            Le chauffeur sera notifié 15 minutes avant l'heure choisie
                        </Text>
                    </View>
                </>
            )}
        </View>
    );

    const renderPriceSummary = () => (
        <View style={[styles.priceSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
            <Text style={[styles.priceTitle, { color: theme.text }]}>Estimation du prix</Text>

            <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Prix de base</Text>
                    <Text style={[styles.priceValue, { color: theme.text }]}>5 000 GNF</Text>
                </View>

                {passengerCount > 1 && (
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>{passengerCount} passagers</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>
                            +{Math.round(5000 * (calculatePriceMultiplier() - 1) * 0.4)} GNF
                        </Text>
                    </View>
                )}

                {hasLuggage && (
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Bagages ({luggageSize})</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>
                            +{Math.round(5000 * (calculatePriceMultiplier() - 1) * 0.3)} GNF
                        </Text>
                    </View>
                )}

                {rideType === 'later' && (
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Trajet programmé</Text>
                        <Text style={[styles.priceValue, { color: theme.text }]}>
                            +{Math.round(5000 * (calculatePriceMultiplier() - 1) * 0.3)} GNF
                        </Text>
                    </View>
                )}

                <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.border }]}>
                    <Text style={[styles.totalLabel, { color: theme.text }]}>Total estimé</Text>
                    <Text style={[styles.totalValue, { color: theme.primary }]}>
                        {getEstimatedPrice().toLocaleString('fr-FR')} GNF
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>Options supplémentaires</Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {/* Point de départ et destination */}
                {(pickup || destination) && (
                    <View style={[styles.routeSection, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <View style={styles.routePoint}>
                            <View style={styles.routeDot} />
                            <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                                {pickup || 'Point de départ'}
                            </Text>
                        </View>
                        <View style={[styles.routeLine, { backgroundColor: theme.border }]} />
                        <View style={styles.routePoint}>
                            <View style={[styles.routeDot, styles.routeDotDestination]} />
                            <Text style={[styles.routeText, { color: theme.text }]} numberOfLines={1}>
                                {destination || 'Destination'}
                            </Text>
                        </View>
                    </View>
                )}

                {renderPassengerSelector()}
                {renderLuggageOptions()}
                {renderPaymentOptions()}
                {renderScheduleOptions()}
                {renderPriceSummary()}

                {/* Bouton de confirmation */}
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={styles.confirmButtonGradient}
                    >
                        <Text style={styles.confirmButtonText}>
                            Confirmer les options
                        </Text>
                        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Choisir la date et l'heure</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={scheduleDate}
                                mode="datetime"
                                display="spinner"
                                onChange={handleScheduleDateChange}
                                minimumDate={new Date()}
                                minuteInterval={15}
                                locale="fr-FR"
                            />

                            <TouchableOpacity
                                style={styles.modalConfirmButton}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.modalConfirmText}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
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
        padding: 16,
    },
    routeSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    routeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981',
        marginRight: 12,
    },
    routeDotDestination: {
        backgroundColor: '#EF4444',
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#E5E7EB',
        marginLeft: 5,
        marginBottom: 8,
    },
    routeText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    optionSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 12,
        flex: 1,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    toggleSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginRight: 8,
    },
    toggleTrack: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#D1D5DB',
        padding: 2,
    },
    toggleTrackActive: {
        backgroundColor: '#3B82F6',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        transform: [{ translateX: 0 }],
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    passengerSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    passengerOption: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    passengerOptionSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#F0F9FF',
    },
    passengerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    passengerIconSelected: {
        backgroundColor: '#3B82F6',
    },
    passengerCountText: {
        position: 'absolute',
        top: -5,
        right: -5,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    passengerCountTextSelected: {
        color: '#FFFFFF',
    },
    passengerLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    passengerLabelSelected: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    passengerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
        flex: 1,
    },
    luggageGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    luggageOption: {
        width: '30%',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    luggageOptionSelected: {
        borderColor: '#F59E0B',
        backgroundColor: '#FEF3C7',
    },
    luggageIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    luggageIconSelected: {
        backgroundColor: '#F59E0B',
    },
    luggageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    luggageDescription: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'center',
    },
    luggageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
    },
    paymentList: {
        marginBottom: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 8,
    },
    paymentOptionSelected: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    paymentNumber: {
        fontSize: 12,
        color: '#6B7280',
    },
    defaultBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    defaultText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    paymentRight: {
        marginLeft: 12,
    },
    addPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3B82F6',
        borderStyle: 'dashed',
    },
    addPaymentText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        marginLeft: 8,
    },
    rideTypeSelector: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    rideTypeButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        marginHorizontal: 4,
    },
    rideTypeButtonSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F5F3FF',
    },
    rideTypeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    rideTypeIconSelected: {
        backgroundColor: '#8B5CF6',
    },
    rideTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    rideTypeLabelSelected: {
        color: '#8B5CF6',
    },
    rideTypeDescription: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F3FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    datePickerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    datePickerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    scheduleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F3FF',
        padding: 12,
        borderRadius: 8,
    },
    priceSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    priceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    priceBreakdown: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    priceLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    priceValue: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingTop: 12,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    confirmButton: {
        marginBottom: 32,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        padding: 20,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalConfirmButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    modalConfirmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
};