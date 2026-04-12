/**
 * SuivisTrajets - Écran de suivi de trajet en temps réel avec carte GPS
 * Inclut : carte, infos chauffeur, progression, détails et actions
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Alert,
    Dimensions,
    Easing,
    Linking,
    Modal,
    TextInput,
    Animated,
    Vibration,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TripCancelModal from '../../Chauffeur/composants/TripCancelModal';
import { useApp } from '../../../AppContext';

const { height, width } = Dimensions.get('window');

const SuivisTrajets = ({ rideData, onRideEnd, onCancelRide, onBack, userLocation, visible = true, minimized = false, onMinimize, showToast, darkMode = false }) => {
    const { theme: appTheme } = useApp();
    const [driverLocation, setDriverLocation] = useState(null);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [rideStatus, setRideStatus] = useState('approaching'); // approaching, arrived, in_progress, completed
    const [distance, setDistance] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(3);
    const [driverInfo] = useState({
        name: 'Mamadou Diallo', rating: 4.8,
        vehicle: 'Toyota Corolla', plate: 'GK-1234',
        phone: '+224 621 00 11 22',
    });

    const mapRef = useRef(null);
    const timerRef = useRef(null);
    const rideStartTimeRef = useRef(Date.now());

    const [showSosModal, setShowSosModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [reportText, setReportText] = useState('');

    // Générer un point de départ aléatoire pour le chauffeur (à env. 500m)
    const fallbackLocation = { latitude: 9.6412, longitude: -13.5784 }; // Conakry par défaut
    const safeLoc = userLocation || fallbackLocation;

    const [driverStartPos] = useState({
        latitude: safeLoc.latitude + (Math.random() - 0.5) * 0.01,
        longitude: safeLoc.longitude + (Math.random() - 0.5) * 0.01,
    });

    // Simulation de mouvement fluide
    const simulateMovement = (start, end, onComplete, durationMs = 15000) => {
        let startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            const currentLat = start.latitude + (end.latitude - start.latitude) * progress;
            const currentLng = start.longitude + (end.longitude - start.longitude) * progress;

            setDriverLocation({ latitude: currentLat, longitude: currentLng });
            setDistance(Math.round(progress * 100));

            if (progress >= 1) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 1000);
        return interval;
    };

    const startFullSimulation = (userLoc, destLoc) => {
        setDriverLocation(driverStartPos);
        setRideStatus('approaching');
        setTimeRemaining(3);

        timerRef.current = simulateMovement(driverStartPos, userLoc, () => {
            setRideStatus('arrived');
            if (showToast) showToast('Chauffeur Arrivé', 'Votre chauffeur est au point de départ.', 'car', '#10B981');

            setTimeout(() => {
                setRideStatus('in_progress');
                setTimeRemaining(15);
                if (showToast) showToast('Trajet Démarré', 'Direction votre destination !', 'navigate', '#3B82F6');

                timerRef.current = simulateMovement(userLoc, destLoc, () => {
                    setRideStatus('completed');
                    setDistance(100);
                    if (showToast) showToast('Trajet Terminé', 'Vous êtes bien arrivé à destination.', 'checkmark-circle', '#10B981');
                    setTimeout(() => { if (onRideEnd) onRideEnd(); }, 3000);
                }, 30000);
            }, 4000);
        }, 15000);
    };

    useEffect(() => {
        if (visible && userLocation) {
            const dest = {
                latitude: userLocation.latitude + (Math.random() - 0.5) * 0.02,
                longitude: userLocation.longitude + (Math.random() - 0.5) * 0.02,
            };
            setDestinationLocation(dest);
            setRouteCoordinates([driverStartPos, userLocation, dest]);
            startFullSimulation(userLocation, dest);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [visible, userLocation]);

    useEffect(() => {
        if (mapRef.current && driverLocation && userLocation && destinationLocation) {
            mapRef.current.fitToCoordinates([driverLocation, userLocation, destinationLocation], {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [driverLocation]);

    if (!visible || minimized) return null;

    const getStatusInfo = () => {
        switch (rideStatus) {
            case 'approaching': return { text: 'Le chauffeur arrive', color: '#3B82F6', icon: 'car' };
            case 'arrived': return { text: 'Chauffeur arrivé !', color: '#10B981', icon: 'checkmark-circle' };
            case 'in_progress': return { text: 'Trajet en cours...', color: '#3B82F6', icon: 'navigate' };
            case 'completed': return { text: 'Vous êtes arrivé', color: '#10B981', icon: 'map' };
            default: return { text: 'Suivi du trajet', color: '#6366F1', icon: 'location' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <View style={[s.container, darkMode && s.containerDark]}>
            {/* Header / Top Progress Navigation */}
            <LinearGradient colors={darkMode ? ['#111827', '#1F2937'] : ['#2563EB', '#3B82F6']} style={s.header}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={onBack} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={s.headerInfo}>
                        <Text style={s.headerTitle}>{statusInfo.text}</Text>
                        <Text style={s.headerSubtitle}>{rideStatus === 'approaching' ? 'Arrivée dans ~3 min' : 'Destination : Conakry'}</Text>
                    </View>
                    <View style={s.headerActions}>
                        <TouchableOpacity style={s.minimizeBtnAction} onPress={onMinimize}>
                            <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.sosBtn} onPress={() => setShowSosModal(true)}>
                            <LinearGradient colors={['#EF4444', '#DC2626']} style={s.sosBtnGradient}>
                                <Ionicons name="warning" size={16} color="#FFFFFF" />
                                <Text style={s.sosBtnText}>SOS</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar Header */}
                <View style={s.progressBarBg}>
                    <View style={[s.progressBarFill, { width: `${distance}%` }]} />
                </View>

                {/* Cancel Button in Header (Optional/Alternative placement) */}
                <TouchableOpacity 
                    style={s.headerCancelBtn}
                    onPress={() => setShowCancelModal(true)}
                >
                    <Ionicons name="close-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={s.headerCancelText}>Annuler</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={{ flex: 1 }}>
                <ScrollView style={s.contentScroll} showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
                    {/* Carte (Partie Mobile) */}
                    <View style={s.mapBox}>
                        <MapView
                            ref={mapRef}
                            style={s.map}
                            initialRegion={{
                                latitude: safeLoc.latitude,
                                longitude: safeLoc.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            userInterfaceStyle={darkMode ? 'dark' : 'light'}
                        >
                            {driverLocation && (
                                <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
                                    <View style={s.markerDriver}>
                                        <Ionicons name="car" size={22} color="#EF4444" />
                                    </View>
                                </Marker>
                            )}
                            {userLocation && (
                                <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                                    <View style={s.markerUser}>
                                        <Ionicons name="person" size={18} color="#3B82F6" />
                                    </View>
                                </Marker>
                            )}
                            {destinationLocation && (
                                <Marker coordinate={destinationLocation} anchor={{ x: 0.5, y: 0.5 }}>
                                    <View style={s.markerDest}>
                                        <Ionicons name="flag" size={18} color="#10B981" />
                                    </View>
                                </Marker>
                            )}
                            {routeCoordinates.length > 0 && (
                                <Polyline coordinates={routeCoordinates} strokeWidth={4} strokeColor="#3B82F6" lineDashPattern={[10, 5]} />
                            )}
                        </MapView>

                        {/* Petits contrôles flottants sur carte */}
                        <View style={[s.mapControls, darkMode && s.mapControlsDark]}>
                            <TouchableOpacity style={s.mapCtrlBtn} onPress={() => mapRef.current?.animateToRegion({ latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 })}>
                                <Ionicons name="locate" size={24} color={darkMode ? "#60A5FA" : "#3B82F6"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Dashboard Suivi (Panel Infos Chauffeur) */}
                    <View style={[s.infoPanel, darkMode && s.infoPanelDark]}>
                        <View style={[s.statusBanner, rideStatus === 'arrived' || rideStatus === 'completed' ? s.statusGreen : s.statusBlue, darkMode && (rideStatus === 'arrived' || rideStatus === 'completed' ? s.statusGreenDark : s.statusBlueDark)]}>
                            <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
                            <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                        </View>

                        {/* Carte Chauffeur */}
                        <View style={[s.driverCard, darkMode && s.driverCardDark]}>
                            <View style={s.driverRow}>
                                <View style={s.driverAvatar}>
                                    <Text style={s.driverInitial}>{driverInfo.name[0]}</Text>
                                </View>
                                <View style={s.driverDetails}>
                                    <Text style={[s.driverName, darkMode && s.driverNameDark]}>{driverInfo.name}</Text>
                                    <View style={s.driverMeta}>
                                        <Ionicons name="star" size={12} color="#F59E0B" />
                                        <Text style={[s.driverRating, darkMode && s.driverRatingDark]}>{driverInfo.rating}</Text>
                                        <Text style={[s.driverVehicle, darkMode && s.driverVehicleDark]}>• {driverInfo.vehicle}</Text>
                                    </View>
                                    <Text style={[s.driverPlate, darkMode && s.driverPlateDark]}>{driverInfo.plate}</Text>
                                </View>
                                <View style={s.driverActions}>
                                    <TouchableOpacity style={[s.callBtn, darkMode && s.callBtnDark]} onPress={() => Linking.openURL(`tel:${driverInfo.phone}`)}>
                                        <Ionicons name="call" size={20} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[s.msgBtn, darkMode && s.msgBtnDark]}>
                                        <Ionicons name="chatbubble" size={20} color={darkMode ? "#94A3B8" : "#64748B"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Détails du trajet */}
                        <View style={[s.detailsCard, darkMode && s.detailsCardDark]}>
                            <Text style={[s.detailsTitle, darkMode && s.detailsTitleDark]}>Détails de la course</Text>

                            <View style={s.detailRow}>
                                <View style={[s.detailIcon, { backgroundColor: '#E0F2FE' }, darkMode && { backgroundColor: '#0C4A6E' }]}>
                                    <Ionicons name="location" size={18} color="#3B82F6" />
                                </View>
                                <View style={s.detailContent}>
                                    <Text style={[s.detailLabel, darkMode && s.detailLabelDark]}>Point de rencontre</Text>
                                    <Text style={[s.detailValue, darkMode && s.detailValueDark]}>Ma position actuelle</Text>
                                </View>
                            </View>

                            <View style={s.detailRow}>
                                <View style={[s.detailIcon, { backgroundColor: '#FEF2F2' }, darkMode && { backgroundColor: '#450A0A' }]}>
                                    <Ionicons name="flag" size={18} color="#EF4444" />
                                </View>
                                <View style={s.detailContent}>
                                    <Text style={[s.detailLabel, darkMode && s.detailLabelDark]}>Destination</Text>
                                    <Text style={[s.detailValue, darkMode && s.detailValueDark]}>Labé</Text>
                                </View>
                            </View>

                            <View style={[s.detailRow, { marginBottom: 0 }]}>
                                <View style={[s.detailIcon, { backgroundColor: '#F0FDF4' }, darkMode && { backgroundColor: '#064E3B' }]}>
                                    <Ionicons name="card" size={18} color="#10B981" />
                                </View>
                                <View style={s.detailContent}>
                                    <Text style={[s.detailLabel, darkMode && s.detailLabelDark]}>Mode de paiement</Text>
                                    <Text style={[s.detailValue, darkMode && s.detailValueDark]}>Orange Money • 15 000 GNF</Text>
                                </View>
                            </View>
                        </View>

                        {/* Boutons d'action */}
                        <View style={s.actionRow}>
                            <TouchableOpacity style={[s.reportBtn, darkMode && s.reportBtnDark]} onPress={() => setShowReportModal(true)}>
                                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                                <Text style={s.reportBtnText}>Signaler</Text>
                            </TouchableOpacity>

                            {rideStatus === 'completed' ? (
                                <TouchableOpacity style={s.endBtn} onPress={onRideEnd}>
                                    <LinearGradient colors={['#10B981', '#059669']} style={s.endBtnGradient}>
                                        <Text style={s.endBtnText}>Noter mon trajet</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={[s.endBtn, { backgroundColor: '#EF4444' }]} 
                                    onPress={() => setShowCancelModal(true)}
                                >
                                    <LinearGradient colors={['#EF4444', '#DC2626']} style={s.endBtnGradient}>
                                        <Text style={s.endBtnText}>Annuler la course</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Modal d'Annulation */}
            <TripCancelModal
                visible={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={(reason) => {
                    setShowCancelModal(false);
                    if (onCancelRide) onCancelRide(reason);
                }}
                role="PASSAGER"
                theme={appTheme}
            />

            {/* Modal de Signalement */}
            <Modal visible={showReportModal} transparent={true} animationType="slide">
                <View style={[s.modalOverlay]}>
                    <View style={[s.modalContent, darkMode && s.modalContentDark]}>
                        <View style={s.modalHeaderModal}>
                            <View style={s.modalIconReport}>
                                <Ionicons name="alert" size={24} color="#EF4444" />
                            </View>
                            <Text style={[s.modalTitle, darkMode && s.modalTitleDark]}>Signaler un litige</Text>
                        </View>
                        <Text style={[s.modalDesc, darkMode && s.modalDescDark]}>
                            Un comportement inhabituel ? Décrivez le problème pour que notre équipe intervienne.
                        </Text>
                        <TextInput
                            style={[s.reportInput, darkMode && s.reportInputDark]}
                            placeholder="Décrivez brièvement la situation..."
                            placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                            multiline
                            numberOfLines={4}
                            value={reportText}
                            onChangeText={setReportText}
                        />
                        <View style={s.modalActions}>
                            <TouchableOpacity style={[s.modalBtnCancel, darkMode && s.modalBtnCancelDark]} onPress={() => setShowReportModal(false)}>
                                <Text style={[s.modalBtnCancelText, darkMode && s.modalBtnCancelTextDark]}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={s.modalBtnConfirmReport}
                                onPress={() => { setShowReportModal(false); setReportText(''); if (showToast) showToast('Signalement reçu', 'Notre équipe va examiner le problème.', 'checkmark-circle', '#10B981'); }}
                            >
                                <Text style={s.modalBtnConfirmReportText}>Ouvrir un litige</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal SOS Urgence */}
            <Modal visible={showSosModal} transparent={true} animationType="fade">
                <View style={s.modalOverlay}>
                    <View style={[s.modalContentCenter, darkMode && s.modalContentDark]}>
                        <View style={s.modalHeaderCenter}>
                            <View style={s.modalIconSos}>
                                <Ionicons name="warning" size={32} color="#FFFFFF" />
                            </View>
                            <Text style={[s.modalTitleCenter, darkMode && s.modalTitleDark]}>SOS Urgence</Text>
                        </View>
                        <Text style={[s.modalDescCenter, darkMode && s.modalDescDark]}>
                            En cas de danger immédiat, qui souhaitez-vous contacter ?
                        </Text>

                        <TouchableOpacity style={[s.sosOptionBtn, darkMode && s.sosOptionBtnDark]} onPress={() => Linking.openURL('tel:117')}>
                            <Ionicons name="call" size={20} color="#3B82F6" />
                            <Text style={[s.sosOptionText, darkMode && s.sosOptionTextDark]}>Police (117)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[s.sosOptionBtn, darkMode && s.sosOptionBtnDark]} onPress={() => Linking.openURL('tel:+224621001122')}>
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                            <Text style={[s.sosOptionText, darkMode && s.sosOptionTextDark]}>Support Sécurité</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.sosCancelBtn} onPress={() => setShowSosModal(false)}>
                            <Text style={[s.sosCancelText, darkMode && s.sosCancelTextDark]}>Retour</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const s = StyleSheet.create({
    container: { ...StyleSheet.absoluteFillObject, zIndex: 9999, backgroundColor: '#FFFFFF' },
    containerDark: { backgroundColor: '#111827' },

    header: { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { padding: 8 },
    headerInfo: { flex: 1, marginLeft: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    headerSubtitle: { fontSize: 13, color: '#E2E8F0', marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    minimizeBtnAction: { padding: 4, marginRight: 2 },
    sosBtn: { borderRadius: 20, overflow: 'hidden' },
    sosBtnGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
    sosBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
    timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 4 },
    timerText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
    progressBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 10, borderRadius: 2, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
    headerCancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4
    },
    headerCancelText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '600'
    },

    contentScroll: { flex: 1 },
    mapBox: { height: height * 0.45, position: 'relative' },
    map: { flex: 1 },
    mapControls: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 6, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    mapControlsDark: { backgroundColor: 'rgba(31, 41, 55, 0.95)' },
    mapCtrlBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    markerUser: { backgroundColor: '#FFF', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#3B82F6', elevation: 3 },
    markerDriver: { backgroundColor: '#FFF', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#EF4444', elevation: 3 },
    markerDest: { backgroundColor: '#FFF', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#10B981', elevation: 3 },

    infoPanel: { padding: 16, backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20 },
    infoPanelDark: { backgroundColor: '#111827' },
    statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
    statusBlue: { backgroundColor: '#EFF6FF' },
    statusBlueDark: { backgroundColor: '#1E3A8A20' },
    statusGreen: { backgroundColor: '#DCFCE7' },
    statusGreenDark: { backgroundColor: '#064E3B20' },
    statusText: { fontSize: 14, fontWeight: '600' },

    driverCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    driverCardDark: { backgroundColor: '#1F2937' },
    driverRow: { flexDirection: 'row', alignItems: 'center' },
    driverAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    driverInitial: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    driverDetails: { flex: 1 },
    driverName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    driverNameDark: { color: '#F9FAFB' },
    driverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    driverRating: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    driverRatingDark: { color: '#94A3B8' },
    driverVehicle: { fontSize: 13, color: '#64748B' },
    driverVehicleDark: { color: '#94A3B8' },
    driverPlate: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '600' },
    driverPlateDark: { color: '#6B7280' },
    driverActions: { flexDirection: 'row', gap: 8 },
    callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    callBtnDark: { backgroundColor: '#1E3A8A40' },
    msgBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    msgBtnDark: { backgroundColor: '#374151' },

    detailsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
    detailsCardDark: { backgroundColor: '#1F2937' },
    detailsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
    detailsTitleDark: { color: '#F9FAFB' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    detailIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 2 },
    detailLabelDark: { color: '#6B7280' },
    detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    detailValueDark: { color: '#F9FAFB' },

    actionRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
    reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 12, flex: 1, gap: 6, borderWidth: 1, borderColor: '#FECACA' },
    reportBtnDark: { backgroundColor: '#450A0A20', borderColor: '#450A0A' },
    reportBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
    emergencyBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    emergencyBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6, flex: 1 },
    emergencyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
    endBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    endBtnGradient: { justifyContent: 'center', alignItems: 'center', paddingVertical: 14 },
    endBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    modalContentDark: { backgroundColor: '#1F2937' },
    modalContentCenter: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, alignItems: 'center' },
    modalHeaderModal: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    modalIconReport: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    modalTitleDark: { color: '#F9FAFB' },
    modalDesc: { fontSize: 14, color: '#64748B', marginBottom: 16, lineHeight: 20 },
    modalDescDark: { color: '#94A3B8' },
    reportInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, height: 100, textAlignVertical: 'top', color: '#1E293B', marginBottom: 20 },
    reportInputDark: { backgroundColor: '#374151', borderColor: '#4B5563', color: '#F9FAFB' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F1F5F9' },
    modalBtnCancelDark: { backgroundColor: '#374151' },
    modalBtnCancelText: { color: '#64748B', fontWeight: 'bold' },
    modalBtnCancelTextDark: { color: '#94A3B8' },
    modalBtnConfirmReport: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#EF4444' },
    modalBtnConfirmReportText: { color: '#FFFFFF', fontWeight: 'bold' },

    modalHeaderCenter: { alignItems: 'center', marginBottom: 16 },
    modalIconSos: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    modalTitleCenter: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    modalTitleCenterDark: { color: '#F9FAFB' },
    modalDescCenter: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 24 },
    modalDescCenterDark: { color: '#94A3B8' },
    sosOptionBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 16 },
    sosOptionBtnDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
    sosOptionText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    sosOptionTextDark: { color: '#F9FAFB' },
    sosCancelBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
    sosCancelText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
    sosCancelTextDark: { color: '#6B7280' },
});

export default SuivisTrajets;