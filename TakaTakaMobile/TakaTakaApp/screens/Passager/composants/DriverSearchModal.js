/**
 * DriverSearchModal - Animation de recherche de chauffeur
 * Affiche une progression, le nombre de chauffeurs proches et le temps estimé.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Modal,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverSearchModal = ({ visible, minimized, onMinimize, onCancel, onDriverFound, darkMode = false }) => {
    const [searchProgress, setSearchProgress] = useState(0);
    const [searching, setSearching] = useState(true);
    const [timer, setTimer] = useState(0);
    const [driversAvailable, setDriversAvailable] = useState(3);
    const [estimatedTime, setEstimatedTime] = useState(2);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeInAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return; // Si c'est complètement fermé (pas juste réduit), on reset.

        // Fade in
        Animated.timing(fadeInAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

        // Si on vient juste de l'ouvrir (timer === 0), on démarre tout
        if (timer === 0) {
            setSearchProgress(0);
            setSearching(true);
            setDriversAvailable(3);
            setEstimatedTime(2);
        }

        // Pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        pulse.start();

        // Rotation animation
        const rotate = Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
        );
        rotate.start();

        // Progress
        const progressInterval = setInterval(() => {
            setSearchProgress(prev => {
                const newProgress = prev + Math.random() * 15;
                if (newProgress >= 100) { setSearching(false); return 100; }
                return newProgress;
            });
        }, 800);

        // Timer
        const timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000);

        // Drivers
        const driverInterval = setInterval(() => {
            setDriversAvailable(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                return Math.max(1, Math.min(5, prev + change));
            });
        }, 3000);

        // Estimated time
        const timeInterval = setInterval(() => {
            setEstimatedTime(prev => Math.max(0, prev - 0.1));
        }, 10000);

        // Auto-find driver
        const searchTimeout = setTimeout(() => {
            setSearching(false);
            clearInterval(progressInterval);
            clearInterval(timerInterval);
            clearInterval(driverInterval);
            clearInterval(timeInterval);
            setTimeout(() => { if (onDriverFound) onDriverFound(); }, 1500);
        }, 15000);

        return () => {
            pulse.stop();
            rotate.stop();
            clearInterval(progressInterval);
            clearInterval(timerInterval);
            clearInterval(driverInterval);
            clearInterval(timeInterval);
            clearTimeout(searchTimeout);
        };
    }, [visible]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCancel = () => {
        Alert.alert(
            'Annuler la recherche',
            'Êtes-vous sûr de vouloir annuler ?',
            [
                { text: 'Non', style: 'cancel' },
                { text: 'Oui', onPress: onCancel },
            ]
        );
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible && !minimized) return null; // Unmounted !

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 10000, display: minimized ? 'none' : 'flex' }]}>
            <View style={s.overlay}>
                <Animated.View style={[s.content, darkMode && s.contentDark, { opacity: fadeInAnim }]}>
                    {/* Header */}
                    <LinearGradient
                        colors={searching ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={s.header}
                    >
                        {/* Minimize Button */}
                        <TouchableOpacity style={s.minimizeBtn} onPress={onMinimize}>
                            <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={s.headerTitle}>
                            {searching ? 'Recherche en cours...' : '🎉 Chauffeur trouvé !'}
                        </Text>
                        <Text style={s.headerSubtitle}>
                            {searching
                                ? 'Nous trouvons le meilleur chauffeur pour vous'
                                : 'Préparation de votre trajet'}
                        </Text>
                    </LinearGradient>

                    {/* Animation Circle */}
                    <View style={s.progressSection}>
                        {searching ? (
                            <Animated.View style={[s.pulseRing, darkMode && s.pulseRingDark, { transform: [{ scale: pulseAnim }] }]}>
                                <View style={[s.progressCircle, darkMode && s.progressCircleDark]}>
                                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                        <Ionicons name="car-sport" size={40} color="#3B82F6" />
                                    </Animated.View>
                                    <Text style={[s.progressPercent, darkMode && s.progressPercentDark]}>{Math.round(searchProgress)}%</Text>
                                </View>
                            </Animated.View>
                        ) : (
                            <View style={s.foundCircle}>
                                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                            </View>
                        )}

                        {/* Progress Bar */}
                        <View style={[s.progressBarBg, darkMode && s.progressBarBgDark]}>
                            <LinearGradient
                                colors={searching ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={[s.progressBarFill, { width: `${Math.min(searchProgress, 100)}%` }]}
                            />
                        </View>
                    </View>

                    {/* Info Grid */}
                    <View style={s.infoGrid}>
                        {[
                            { icon: 'time-outline', value: formatTime(timer), label: 'Temps écoulé', color: '#3B82F6' },
                            { icon: 'car-outline', value: `${driversAvailable}`, label: 'Chauffeurs proches', color: '#10B981' },
                            { icon: 'navigate-outline', value: `~${estimatedTime.toFixed(1)} min`, label: 'Temps estimé', color: '#8B5CF6' },
                        ].map((item, idx) => (
                            <View key={idx} style={s.infoItem}>
                                <View style={[s.infoIconBox, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <Text style={[s.infoValue, darkMode && s.infoValueDark]}>{item.value}</Text>
                                <Text style={[s.infoLabel, darkMode && s.infoLabelDark]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Status */}
                    <View style={[s.statusBox, darkMode && s.statusBoxDark]}>
                        {searching ? (
                            <>
                                <Text style={[s.statusTitle, darkMode && s.statusTitleDark]}>Recherche des chauffeurs disponibles</Text>
                                <View style={s.statusItem}><Ionicons name="search" size={14} color="#3B82F6" /><Text style={[s.statusText, darkMode && s.statusTextDark]}>Vérification des chauffeurs à proximité</Text></View>
                                <View style={s.statusItem}><Ionicons name="analytics" size={14} color="#3B82F6" /><Text style={[s.statusText, darkMode && s.statusTextDark]}>Analyse du trafic en temps réel</Text></View>
                                <View style={s.statusItem}><Ionicons name="ribbon" size={14} color="#3B82F6" /><Text style={[s.statusText, darkMode && s.statusTextDark]}>Sélection du chauffeur optimal</Text></View>
                            </>
                        ) : (
                            <>
                                <Text style={[s.statusTitle, { color: '#10B981' }]}>Chauffeur assigné !</Text>
                                <View style={[s.driverCard, darkMode && s.driverCardDark]}>
                                    <View style={s.driverAvatar}>
                                        <Text style={s.driverInitial}>M</Text>
                                    </View>
                                    <View style={s.driverInfo}>
                                        <Text style={[s.driverName, darkMode && s.driverNameDark]}>Mamadou Diallo</Text>
                                        <Text style={[s.driverVehicle, darkMode && s.driverVehicleDark]}>Toyota Corolla · GK-1234</Text>
                                        <Text style={s.driverEta}>Arrive dans ~3 minutes</Text>
                                    </View>
                                    <View style={s.driverRating}>
                                        <Ionicons name="star" size={14} color="#FBBF24" />
                                        <Text style={[s.driverRatingText, darkMode && s.driverRatingTextDark]}>4.8</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Cancel Button */}
                    {searching && (
                        <TouchableOpacity style={[s.cancelBtn, darkMode && s.cancelBtnDark]} onPress={handleCancel} activeOpacity={0.8}>
                            <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                            <Text style={s.cancelBtnText}>Annuler la recherche</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={[s.note, darkMode && s.noteDark]}>Vous pouvez réduire cette fenêtre pour naviguer</Text>
                </Animated.View>
            </View>
        </View>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    content: {
        backgroundColor: '#FFFFFF', borderRadius: 28, width: '92%', maxWidth: 420,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15,
    },
    contentDark: { backgroundColor: '#111827' },
    header: { paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', position: 'relative' },
    minimizeBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

    progressSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
    pulseRing: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    pulseRingDark: { backgroundColor: '#1E3A8A20' },
    progressCircle: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
    },
    progressCircleDark: { backgroundColor: '#1F2937', shadowColor: '#000' },
    progressPercent: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6', marginTop: 2 },
    progressPercentDark: { color: '#60A5FA' },
    foundCircle: { justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    progressBarBg: { width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
    progressBarBgDark: { backgroundColor: '#374151' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    infoGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 16 },
    infoItem: { alignItems: 'center', flex: 1 },
    infoIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    infoValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 3 },
    infoValueDark: { color: '#F9FAFB' },
    infoLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },
    infoLabelDark: { color: '#94A3B8' },

    statusBox: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginHorizontal: 20, marginBottom: 16 },
    statusBoxDark: { backgroundColor: '#1F2937' },
    statusTitle: { fontSize: 16, fontWeight: '600', color: '#3B82F6', marginBottom: 12 },
    statusTitleDark: { color: '#60A5FA' },
    statusItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    statusText: { fontSize: 14, color: '#475569' },
    statusTextDark: { color: '#94A3B8' },

    driverCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0',
    },
    driverCardDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
    driverAvatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: '#3B82F6',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    driverInitial: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    driverInfo: { flex: 1 },
    driverName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
    driverNameDark: { color: '#F9FAFB' },
    driverVehicle: { fontSize: 13, color: '#64748B', marginBottom: 1 },
    driverVehicleDark: { color: '#94A3B8' },
    driverEta: { fontSize: 13, color: '#10B981', fontWeight: '600' },
    driverRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    driverRatingText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    driverRatingTextDark: { color: '#F9FAFB' },

    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, marginHorizontal: 20, borderRadius: 12,
        backgroundColor: '#FEF2F2', gap: 8,
    },
    cancelBtnDark: { backgroundColor: '#450A0A20' },
    cancelBtnText: { color: '#DC2626', fontWeight: 'bold' },
    note: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 16 },
    noteDark: { color: '#6B7280' },
});

export default DriverSearchModal;