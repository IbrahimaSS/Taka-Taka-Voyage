import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RideAcceptModal = ({ visible, onClose, ride, onAccept, onReject, onCall, theme, darkMode }) => {
    const [countdown, setCountdown] = React.useState(30);
    const timerRef = React.useRef(null);

    React.useEffect(() => {
        if (visible && ride && ride.status !== 'completed' && ride.status !== 'cancelled' && ride.status !== 'scheduled') {
            setCountdown(30);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        onReject && onReject(ride); // Auto-refuse on timeout
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [visible, ride]);

    if (!ride) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={[s.container, { backgroundColor: theme.background }]}>
                    <View style={[s.header, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderBottomColor: theme.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={[s.title, { color: theme.text }]}>
                                {ride.status === 'completed' || ride.status === 'cancelled' ? 'Détails de la course' :
                                    ride.status === 'scheduled' ? 'Course planifiée' : 'Nouvelle course'}
                            </Text>
                            {ride.status !== 'completed' && ride.status !== 'cancelled' && ride.status !== 'scheduled' && (
                                <View style={s.timerBadge}>
                                    <Text style={s.timerText}>{countdown}s</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.content}>
                        <View style={s.passengerSection}>
                            <View style={[s.avatar, { backgroundColor: theme.primary }]}>
                                <Text style={s.avatarText}>{ride.passengerName?.charAt(0)}</Text>
                            </View>
                            <View style={s.passengerInfo}>
                                <Text style={[s.passengerName, { color: theme.text }]}>{ride.passengerName}</Text>
                                <View style={s.ratingBox}>
                                    <Ionicons name="star" size={16} color="#FBBF24" />
                                    <Text style={[s.ratingText, { color: theme.textSecondary }]}>{ride.passengerRating || ride.rating}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[s.routeBox, { backgroundColor: darkMode ? '#374151' : '#F8FAFC', borderColor: theme.border }]}>
                            <View style={s.routeRow}>
                                <Ionicons name="location" size={20} color={theme.primary} />
                                <View style={s.routeDetails}>
                                    <Text style={[s.routeLabel, { color: theme.textSecondary }]}>Départ</Text>
                                    <Text style={[s.routePoint, { color: theme.text }]} numberOfLines={1}>{ride.pickup}</Text>
                                </View>
                            </View>
                            <View style={s.routeRow}>
                                <Ionicons name="flag" size={20} color="#EF4444" />
                                <View style={s.routeDetails}>
                                    <Text style={[s.routeLabel, { color: theme.textSecondary }]}>Destination</Text>
                                    <Text style={[s.routePoint, { color: theme.text }]} numberOfLines={1}>{ride.destination}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={s.statsGrid}>
                            <View style={s.statItem}>
                                <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                                <Text style={[s.statText, { color: theme.text }]}>{ride.date || 'Aujourd\'hui'}</Text>
                            </View>
                            <View style={s.statItem}>
                                <Ionicons name="time" size={16} color={theme.textSecondary} />
                                <Text style={[s.statText, { color: theme.text }]}>{ride.duration || '15 min'}</Text>
                            </View>
                            <View style={s.statItem}>
                                <Ionicons name="wallet" size={16} color={theme.textSecondary} />
                                <Text style={[s.statText, { color: theme.text }]}>{ride.paymentMethod || 'Espèces'}</Text>
                            </View>
                        </View>

                        <View style={[s.priceBox, { backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
                            <Text style={[s.priceLabel, { color: theme.primary }]}>Montant</Text>
                            <Text style={[s.priceValue, { color: theme.primary }]}>{ride.price}</Text>
                        </View>
                    </View>

                    <View style={s.actions}>
                        {ride.status === 'completed' || ride.status === 'cancelled' ? (
                            <TouchableOpacity style={[s.closeBtnFull, { backgroundColor: theme.primary }]} onPress={onClose}>
                                <Text style={s.closeBtnText}>Fermer</Text>
                            </TouchableOpacity>
                        ) : ride.status === 'scheduled' ? (
                            <>
                                <TouchableOpacity style={s.rejectBtn} onPress={onCall}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Ionicons name="call" size={18} color={theme.primary} />
                                        <Text style={[s.rejectBtnText, { color: theme.primary }]}>Contacter</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.acceptBtn} onPress={() => onAccept(ride)}>
                                    <LinearGradient colors={['#10B981', '#059669']} style={s.acceptBtnGradient}>
                                        <Text style={s.acceptBtnText}>Commencer</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={s.rejectBtn} onPress={() => onReject(ride)}>
                                    <Text style={s.rejectBtnText}>Refuser</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.acceptBtn} onPress={() => onAccept(ride)}>
                                    <LinearGradient colors={['#10B981', '#059669']} style={s.acceptBtnGradient}>
                                        <Text style={s.acceptBtnText}>Accepter</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    container: { borderRadius: 25, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    content: { padding: 20 },
    passengerSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    passengerName: { fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
    ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 14 },
    routeBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    routeRow: { flexDirection: 'row', marginBottom: 15 },
    routeDetails: { flex: 1, marginLeft: 12 },
    routeLabel: { fontSize: 11, marginBottom: 2, fontWeight: '600' },
    routePoint: { fontSize: 15, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 13, fontWeight: '500' },
    priceBox: { padding: 16, borderRadius: 16, alignItems: 'center' },
    priceLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    priceValue: { fontSize: 28, fontWeight: 'bold' },
    actions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    rejectBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
    rejectBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
    acceptBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    acceptBtnGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    acceptBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    closeBtnFull: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    timerBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 40, alignItems: 'center' },
    timerText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
});

export default RideAcceptModal;
