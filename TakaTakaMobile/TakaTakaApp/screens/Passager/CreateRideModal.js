import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Platform,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PLATFORM } from '../../constants/platform';

const DRAFT_KEY = 'appRideDraft';

function getMockEstimation(pickup, destination, rideTypeId) {
    if (!pickup?.trim() || !destination?.trim()) return null;
    const baseKm = 5 + Math.abs((pickup.length + destination.length) % 15);
    const baseMin = baseKm * 3;
    const prices = { standard: 1200, comfort: 1800, premium: 2500, shared: 800 };
    const pricePerKm = prices[rideTypeId] || 1200;
    const totalGNF = Math.round(baseKm * pricePerKm);
    return { distance: `${baseKm} km`, duration: `${baseMin} min`, price: totalGNF };
}

export default function CreateRideModal({ visible, onClose, darkMode = false }) {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [rideType, setRideType] = useState('standard');
    const [hasDraft, setHasDraft] = useState(false);

    useEffect(() => {
        if (visible) {
            AsyncStorage.getItem(DRAFT_KEY).then(raw => {
                if (raw) try {
                    const d = JSON.parse(raw);
                    if (d.pickup || d.destination) {
                        setPickup(d.pickup || '');
                        setDestination(d.destination || '');
                        setRideType(d.rideType || 'standard');
                        setHasDraft(true);
                    }
                } catch (_) { }
            });
        }
    }, [visible]);

    const saveDraft = () => {
        if (pickup.trim() || destination.trim()) {
            AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({ pickup, destination, rideType }));
        }
    };

    const clearDraft = () => {
        AsyncStorage.removeItem(DRAFT_KEY);
        setPickup('');
        setDestination('');
        setRideType('standard');
        setHasDraft(false);
    };

    const handleClose = () => {
        saveDraft();
        onClose();
    };

    const estimation = useMemo(
        () => getMockEstimation(pickup, destination, rideType),
        [pickup, destination, rideType]
    );

    const rideTypes = [
        { id: 'standard', name: 'Standard', price: '~8,000 GNF', icon: 'car', color: '#3B82F6' },
        { id: 'comfort', name: 'Confort', price: '~12,000 GNF', icon: 'car-sport', color: '#10B981' },
        { id: 'premium', name: 'Premium', price: '~18,000 GNF', icon: 'diamond', color: '#8B5CF6' },
        { id: 'shared', name: PLATFORM.rideTypes.shared.shortLabel, price: '~5,000 GNF', icon: PLATFORM.rideTypes.shared.icon, color: '#F59E0B' },
    ];

    const recentAddresses = [
        { id: 1, name: 'Maison', address: '123 Rue du Commerce, Kaloum' },
        { id: 2, name: 'Bureau', address: '456 Avenue de la République' },
        { id: 3, name: 'École', address: 'Lycée Sainte Marie, Dixinn' },
    ];

    const handleCreateRide = () => {
        if (!pickup || !destination) {
            Alert.alert('Erreur', 'Veuillez saisir les adresses de départ et d\'arrivée');
            return;
        }

        Alert.alert(
            'Confirmation',
            `Créer un trajet ${rideType} de ${pickup} à ${destination} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer',
                    onPress: () => {
                        AsyncStorage.removeItem(DRAFT_KEY);
                        setHasDraft(false);
                        Alert.alert('Succès', 'Trajet créé avec succès !');
                        onClose();
                    }
                }
            ]
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={[styles.modalContainer, darkMode && styles.modalContainerDark]}>
                <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
                    <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
                        <Text style={[styles.modalTitle, darkMode && styles.modalTitleDark]}>Nouveau trajet</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {hasDraft && (
                                <TouchableOpacity onPress={clearDraft} style={{ padding: 6 }}>
                                    <Text style={{ fontSize: 12, color: darkMode ? '#9CA3AF' : '#6B7280' }}>Effacer brouillon</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Pickup Input */}
                        <View style={[styles.inputSection, darkMode && styles.inputSectionDark]}>
                            <View style={styles.inputIcon}>
                                <Ionicons name="location" size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, darkMode && styles.inputLabelDark]}>Départ</Text>
                                <TextInput
                                    style={[styles.input, darkMode && styles.inputDark]}
                                    placeholder="Adresse de prise en charge"
                                    placeholderTextColor={darkMode ? "#9CA3AF" : "#9CA3AF"}
                                    value={pickup}
                                    onChangeText={setPickup}
                                />
                            </View>
                            <TouchableOpacity style={styles.locationButton}>
                                <Ionicons name="locate" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                            </TouchableOpacity>
                        </View>

                        {/* Destination Input */}
                        <View style={[styles.inputSection, darkMode && styles.inputSectionDark]}>
                            <View style={styles.inputIcon}>
                                <Ionicons name="flag" size={20} color="#EF4444" />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, darkMode && styles.inputLabelDark]}>Arrivée</Text>
                                <TextInput
                                    style={[styles.input, darkMode && styles.inputDark]}
                                    placeholder="Destination"
                                    placeholderTextColor={darkMode ? "#9CA3AF" : "#9CA3AF"}
                                    value={destination}
                                    onChangeText={setDestination}
                                />
                            </View>
                        </View>

                        {/* Estimation */}
                        {estimation && (
                            <View style={[styles.estimationCard, darkMode && styles.estimationCardDark]}>
                                <Text style={[styles.estimationTitle, darkMode && styles.estimationTitleDark]}>Estimation du trajet</Text>
                                <View style={styles.estimationRow}>
                                    <View style={styles.estimationItem}>
                                        <Ionicons name="navigate" size={20} color="#3B82F6" />
                                        <Text style={[styles.estimationValue, darkMode && styles.estimationValueDark]}>{estimation.distance}</Text>
                                        <Text style={[styles.estimationLabel, darkMode && styles.estimationLabelDark]}>Distance</Text>
                                    </View>
                                    <View style={styles.estimationItem}>
                                        <Ionicons name="time" size={20} color="#10B981" />
                                        <Text style={[styles.estimationValue, darkMode && styles.estimationValueDark]}>{estimation.duration}</Text>
                                        <Text style={[styles.estimationLabel, darkMode && styles.estimationLabelDark]}>Durée</Text>
                                    </View>
                                    <View style={styles.estimationItem}>
                                        <Ionicons name="wallet" size={20} color="#8B5CF6" />
                                        <Text style={[styles.estimationValue, styles.estimationPrice]}>{estimation.price.toLocaleString('fr-FR')} GNF</Text>
                                        <Text style={[styles.estimationLabel, darkMode && styles.estimationLabelDark]}>Prix estimé</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Recent Addresses */}
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Adresses récentes</Text>
                        {recentAddresses.map(address => (
                            <TouchableOpacity
                                key={address.id}
                                style={[styles.addressCard, darkMode && styles.addressCardDark]}
                                onPress={() => {
                                    setPickup(address.address);
                                    Alert.alert('Adresse', `${address.name} sélectionné`);
                                }}
                            >
                                <View style={[styles.addressIcon, darkMode && styles.addressIconDark]}>
                                    <Ionicons
                                        name={
                                            address.name === 'Maison' ? 'home' :
                                                address.name === 'Bureau' ? 'business' : 'school'
                                        }
                                        size={20}
                                        color="#3B82F6"
                                    />
                                </View>
                                <View style={styles.addressInfo}>
                                    <Text style={[styles.addressName, darkMode && styles.addressNameDark]}>{address.name}</Text>
                                    <Text style={[styles.addressText, darkMode && styles.addressTextDark]}>{address.address}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={16} color={darkMode ? "#4B5563" : "#9CA3AF"} />
                            </TouchableOpacity>
                        ))}

                        {/* Ride Types */}
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Type de véhicule</Text>
                        <View style={styles.rideTypesGrid}>
                            {rideTypes.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.rideTypeCard,
                                        darkMode && styles.rideTypeCardDark,
                                        rideType === type.id && (darkMode ? styles.rideTypeCardActiveDark : styles.rideTypeCardActive)
                                    ]}
                                    onPress={() => setRideType(type.id)}
                                >
                                    <LinearGradient
                                        colors={
                                            rideType === type.id
                                                ? [type.color, type.color]
                                                : (darkMode ? ['#374151', '#1F2937'] : ['#F9FAFB', '#F3F4F6'])
                                        }
                                        style={styles.rideTypeIcon}
                                    >
                                        <Ionicons
                                            name={type.icon}
                                            size={24}
                                            color={rideType === type.id ? '#FFFFFF' : type.color}
                                        />
                                    </LinearGradient>
                                    <Text style={[
                                        styles.rideTypeName,
                                        darkMode && styles.rideTypeNameDark,
                                        rideType === type.id && (darkMode ? styles.rideTypeNameActiveDark : styles.rideTypeNameActive)
                                    ]}>
                                        {type.name}
                                    </Text>
                                    <Text style={styles.rideTypePrice}>{type.price}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Additional Options */}
                        <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Options supplémentaires</Text>
                        <View style={styles.optionsGrid}>
                            <TouchableOpacity style={[styles.optionCard, darkMode && styles.optionCardDark]}>
                                <Ionicons name="person-add" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                                <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>Passagers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionCard, darkMode && styles.optionCardDark]}>
                                <Ionicons name="bag" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                                <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>Bagages</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionCard, darkMode && styles.optionCardDark]}>
                                <Ionicons name="card" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                                <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>Paiement</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionCard, darkMode && styles.optionCardDark]}>
                                <Ionicons name="time" size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                                <Text style={[styles.optionText, darkMode && styles.optionTextDark]}>Horaire</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.modalFooter, darkMode && styles.modalFooterDark]}>
                        <TouchableOpacity
                            style={[styles.cancelButton, darkMode && styles.cancelButtonDark]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelButtonText, darkMode && styles.cancelButtonTextDark]}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleCreateRide}
                        >
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                style={styles.createButtonGradient}
                            >
                                <Text style={styles.createButtonText}>Rechercher</Text>
                                <Ionicons name="search" size={20} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalContentDark: { backgroundColor: '#111827' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalHeaderDark: { borderBottomColor: '#1F2937' },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalTitleDark: { color: '#F9FAFB' },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputSectionDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    inputIcon: {
        marginRight: 12,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    inputLabelDark: { color: '#9CA3AF' },
    input: {
        fontSize: 16,
        color: '#1F2937',
        padding: 0,
    },
    inputDark: { color: '#F9FAFB' },
    locationButton: {
        padding: 8,
    },
    estimationCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    estimationCardDark: { backgroundColor: '#1E3A8A20', borderColor: '#1E40AF' },
    estimationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0369A1',
        marginBottom: 12,
    },
    estimationTitleDark: { color: '#60A5FA' },
    estimationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    estimationItem: {
        alignItems: 'center',
        flex: 1,
    },
    estimationValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 4,
    },
    estimationValueDark: { color: '#F9FAFB' },
    estimationPrice: {
        color: '#059669',
        fontSize: 14,
    },
    estimationLabel: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    estimationLabelDark: { color: '#9CA3AF' },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 8,
        marginBottom: 12,
    },
    sectionTitleDark: { color: '#F9FAFB' },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addressCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    addressIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addressIconDark: { backgroundColor: '#374151' },
    addressInfo: {
        flex: 1,
    },
    addressName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    addressNameDark: { color: '#F9FAFB' },
    addressText: {
        fontSize: 12,
        color: '#6B7280',
    },
    addressTextDark: { color: '#9CA3AF' },
    rideTypesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    rideTypeCard: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    rideTypeCardDark: { backgroundColor: '#1F2937' },
    rideTypeCardActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#F0F9FF',
    },
    rideTypeCardActiveDark: { borderColor: '#3B82F6', backgroundColor: '#1E3A8A40' },
    rideTypeIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    rideTypeName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    rideTypeNameDark: { color: '#F9FAFB' },
    rideTypeNameActive: {
        color: '#3B82F6',
    },
    rideTypeNameActiveDark: { color: '#60A5FA' },
    rideTypePrice: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    optionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionCard: {
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        width: '23%',
    },
    optionCardDark: { backgroundColor: '#1F2937' },
    optionText: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    optionTextDark: { color: '#9CA3AF' },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 12,
    },
    modalFooterDark: { borderTopColor: '#1F2937', backgroundColor: '#111827' },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelButtonDark: { backgroundColor: '#374151' },
    cancelButtonText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    cancelButtonTextDark: { color: '#9CA3AF' },
    createButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    createButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});