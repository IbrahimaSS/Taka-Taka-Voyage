import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AvailableRidesList = ({ isOnline, availableRides, currentRide, onRideSelect, theme, darkMode }) => {
    if (!isOnline) return null;

    if (availableRides.length === 0) {
        return (
            <View style={s.section}>
                <View style={s.sectionHeader}>
                    <Text style={[s.sectionTitle, { color: theme.text }]}>Courses disponibles</Text>
                </View>
                <View style={[s.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={s.emptyIconContainer}>
                        <Ionicons name="notifications-off-outline" size={40} color={theme.primary} />
                    </View>
                    <Text style={[s.emptyTitle, { color: theme.text }]}>Aucune demande en cours</Text>
                    <Text style={[s.emptySubtitle, { color: theme.textSecondary }]}>
                        Restez en ligne pour recevoir les prochaines réservations.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Courses disponibles</Text>
                <View style={s.badge}><Text style={[s.badgeText, { color: theme.primary }]}>{availableRides.length}</Text></View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                {availableRides.map((ride, index) => (
                    <TouchableOpacity
                        key={ride.id + '-' + index}
                        style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => onRideSelect(ride)}
                        activeOpacity={0.8}
                    >
                        <View style={s.cardTop}>
                            <View style={s.passengerInfo}>
                                <View style={[s.avatar, { backgroundColor: theme.primary }]}><Text style={s.avatarText}>{ride.passengerName.charAt(0)}</Text></View>
                                <View>
                                    <Text style={[s.name, { color: theme.text }]} numberOfLines={1}>{ride.passengerName}</Text>
                                    <View style={s.rating}><Ionicons name="star" size={12} color="#FBBF24" /><Text style={{ fontSize: 11, color: theme.textSecondary }}>{ride.passengerRating}</Text></View>
                                </View>
                            </View>
                            <View style={[s.timeBadge, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}><Ionicons name="time" size={12} color={theme.textSecondary} /><Text style={[s.timeText, { color: theme.textSecondary }]}>{ride.timeAgo}</Text></View>
                        </View>

                        <View style={s.routeInfo}>
                            <View style={s.routeItem}><Ionicons name="location" size={14} color={theme.primary} /><Text style={[s.routeText, { color: theme.textSecondary }]} numberOfLines={1}>{ride.pickup}</Text></View>
                            <View style={s.routeItem}><Ionicons name="flag" size={14} color="#EF4444" /><Text style={[s.routeText, { color: theme.textSecondary }]} numberOfLines={1}>{ride.destination}</Text></View>
                        </View>

                        <View style={[s.cardMeta, { borderTopColor: theme.border }]}>
                            <View style={s.metaBox}><Ionicons name="map" size={12} color={theme.textSecondary} /><Text style={[s.metaText, { color: theme.textSecondary }]}>{ride.distance}</Text></View>
                            <View style={s.metaBox}><Ionicons name="person" size={12} color={theme.textSecondary} /><Text style={[s.metaText, { color: theme.textSecondary }]}>{ride.passengerCount}</Text></View>
                            <View style={s.metaBox}><Ionicons name="wallet" size={12} color={theme.textSecondary} /><Text style={[s.metaText, { color: theme.textSecondary }]}>{ride.paymentMethod}</Text></View>
                        </View>

                        <View style={s.cardFooter}>
                            <Text style={[s.price, { color: theme.text }]}>{ride.price}</Text>
                            <View style={s.acceptBtn}><LinearGradient colors={['#3B82F6', '#1E40AF']} style={s.btnGradient}><Text style={s.btnText}>Détails</Text></LinearGradient></View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const s = StyleSheet.create({
    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 16, gap: 10 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold' },
    badge: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center' },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    scrollContent: { paddingLeft: 16, paddingRight: 8 },
    card: { width: 280, padding: 15, borderRadius: 20, borderWidth: 1, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    passengerInfo: { flexDirection: 'row', gap: 10, flex: 1 },
    avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    name: { fontSize: 14, fontWeight: 'bold' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
    timeText: { fontSize: 10, fontWeight: '600' },
    routeInfo: { gap: 8, marginBottom: 15 },
    routeItem: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    routeText: { fontSize: 12, flex: 1 },
    cardMeta: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12, marginBottom: 12 },
    metaBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 18, fontWeight: 'bold' },
    acceptBtn: { borderRadius: 10, overflow: 'hidden' },
    btnGradient: { paddingHorizontal: 15, paddingVertical: 8 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    emptyState: { marginHorizontal: 16, padding: 30, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed' },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59,130,246,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
});

export default AvailableRidesList;
