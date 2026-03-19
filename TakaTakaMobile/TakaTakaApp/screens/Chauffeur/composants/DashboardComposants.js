import React from 'react';
import { styles } from '../DriverDashboard.styles';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    StyleSheet,
    ScrollView,
    Image,
    Platform,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const StatusCard = ({ isOnline, handleToggleOnline, theme, darkMode }) => (
    <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: theme.text }]}>Statut du chauffeur</Text>
            <View style={s.statusBadge}>
                <View style={[s.statusDot, isOnline ? s.dotOnline : s.dotOffline]} />
                <Text style={[s.statusText, { color: theme.textSecondary }]}>{isOnline ? 'EN LIGNE' : 'HORS LIGNE'}</Text>
            </View>
        </View>
        <View style={s.toggleZone}>
            <Text style={[s.toggleLabel, { color: theme.text }]}>Prise de service</Text>
            <Switch
                value={isOnline}
                onValueChange={handleToggleOnline}
                trackColor={{ false: '#94A3B8', true: '#10B981' }}
                thumbColor="#FFFFFF"
            />
        </View>
        <View style={[s.infoBox, { backgroundColor: isOnline ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4') : (darkMode ? 'rgba(100,116,139,0.1)' : '#F8FAFC') }]}>
            <Ionicons name={isOnline ? 'checkmark-circle' : 'pause-circle'} size={20} color={isOnline ? '#10B981' : '#64748B'} />
            <Text style={[s.infoText, { color: isOnline ? (darkMode ? '#10B981' : '#065F46') : '#64748B' }]}>
                {isOnline ? 'Prêt à recevoir des courses' : 'Mettez-vous en ligne pour travailler'}
            </Text>
        </View>
    </View>
);

export const MainDashboardHeaderCombined = ({
    userData,
    profileImage,
    isOnline,
    handleToggleOnline,
    earnings,
    stats,
    theme,
    darkMode,
    unreadNotificationsCount,
    onNotificationsPress,
    onProfilePress
}) => {
    const { width } = Dimensions.get('window');
    return (
        <LinearGradient
            colors={theme.gradientPrimary}
            style={s.unifiedHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            {/* Profile & Notifications Row */}
            <View style={s.topRow}>
                <TouchableOpacity style={s.profileContainer} onPress={onProfilePress}>
                    <View style={s.avatarWrapper}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={s.avatarImg} />
                        ) : (
                            <View style={[s.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={s.avatarInitial}>{userData.name.charAt(0)}</Text>
                            </View>
                        )}
                    </View>
                    <View style={s.profileInfo}>
                        <Text style={s.welcomeTxt}>Bonjour,</Text>
                        <Text style={s.driverName}>{userData.name}</Text>
                        <View style={s.ratingRow}>
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text style={s.ratingTxt}>{userData.rating} • {userData.car}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={s.notifBtn} onPress={onNotificationsPress}>
                    <Ionicons name="notifications" size={24} color="#FFFFFF" />
                    {unreadNotificationsCount > 0 && (
                        <View style={s.notifBadge}>
                            <Text style={s.notifBadgeText}>{unreadNotificationsCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Status Toggle Row - Simplified */}
            <View style={s.statusRowCombined}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={s.statusBadgeCombined}>
                        <View style={[s.statusDotCombined, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
                        <Text style={s.statusTextCombined}>{isOnline ? 'EN LIGNE' : 'HORS LIGNE'}</Text>
                    </View>
                    {isOnline && (
                        <TouchableOpacity
                            onPress={() => onNotificationsPress({ type: 'simulate' })}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}
                        >
                            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>SIMULER</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={s.switchWrapper}>
                    <Switch
                        value={isOnline}
                        onValueChange={handleToggleOnline}
                        trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#10B981' }}
                        thumbColor="#FFFFFF"
                    />
                    <Text style={s.switchLabel}>{isOnline ? 'En service' : 'Hors service'}</Text>
                </View>
            </View>

            {/* Earnings Section */}
            <View style={s.earningsSectionCombined}>
                <View style={s.earningsHeaderCombined}>
                    <Text style={s.earningsTitleCombined}>Gains du jour</Text>
                </View>
                <Text style={s.earningsAmountCombined}>{earnings.today.toLocaleString()} GNF</Text>

                <View style={s.statsGridCombined}>
                    <View style={s.statItemCombined}>
                        <Text style={s.statValCombined}>{stats.totalRides}</Text>
                        <Text style={s.statLabCombined}>Courses</Text>
                    </View>
                    <View style={s.statDividerCombined} />
                    <View style={s.statItemCombined}>
                        <Text style={s.statValCombined}>{stats.rating}</Text>
                        <Text style={s.statLabCombined}>Note</Text>
                    </View>
                    <View style={s.statDividerCombined} />
                    <View style={s.statItemCombined}>
                        <Text style={s.statValCombined}>{stats.acceptanceRate}%</Text>
                        <Text style={s.statLabCombined}>Acceptation</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

export const EarningsCard = ({ earnings, stats, onPress, theme, darkMode }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={s.earningsWrapper}>
        <LinearGradient
            colors={theme.gradientPrimary}
            style={s.earningsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
        >
            <View style={s.earningsHeader}>
                <Text style={s.earningsTitle}>Gains du jour</Text>
                <View style={s.detailsBtn}><Text style={s.detailsBtnText}>Voir détails</Text></View>
            </View>
            <Text style={s.earningsAmount}>{earnings.today.toLocaleString()} GNF</Text>
            <View style={s.statsRow}>
                <View style={s.statBox}><Text style={s.statVal}>{stats.totalRides}</Text><Text style={s.statLab}>Courses</Text></View>
                <View style={s.statSep} />
                <View style={s.statBox}><Text style={s.statVal}>{stats.rating}</Text><Text style={s.statLab}>Note</Text></View>
                <View style={s.statSep} />
                <View style={s.statBox}><Text style={s.statVal}>{stats.acceptanceRate}%</Text><Text style={s.statLab}>Acceptation</Text></View>
            </View>
        </LinearGradient>
    </TouchableOpacity >
);

export const CurrentRideCard = ({ ride, onAccept, onReject, onCall, onStart, onComplete, onArrived, onRejoindre, theme, darkMode }) => {
    if (!ride) return null;

    const isPending = !ride.status || ride.status === 'pending';
    const isAccepted = ride.status === 'accepted';
    const isHeading = ride.status === 'heading';
    const isArrived = ride.status === 'arrived';
    const isEnRoute = ride.status === 'en_route';

    // Titre dynamique selon la phase
    const getTitle = () => {
        if (isPending) return 'Demande en attente';
        if (isAccepted) return 'Course acceptée';
        if (isHeading) return 'En route vers le client';
        if (isArrived) return 'Passager à récupérer';
        if (isEnRoute) return 'Trajet en cours';
        return 'Mission active';
    };

    // Badge de statut
    const getBadgeStyle = () => {
        if (isAccepted) return { bg: theme.primary + '20', text: theme.primary, label: 'PLANIFIÉ' };
        if (isHeading) return { bg: '#3B82F620', text: '#3B82F6', label: 'APPROCHE' };
        if (isArrived) return { bg: '#F59E0B20', text: '#F59E0B', label: 'ARRIVÉ' };
        if (isEnRoute) return { bg: '#10B98120', text: '#10B981', label: 'EN COURS' };
        return null;
    };

    const badge = getBadgeStyle();

    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>{getTitle()}</Text>
                {badge && (
                    <View style={[s.statusBadgeSmall, { backgroundColor: badge.bg }]}>
                        <Text style={[s.statusTextSmall, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                )}
            </View>
            <View style={[s.rideCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={s.rideTop}>
                    <View style={s.passengerInfo}>
                        <View style={[s.avatar, { backgroundColor: theme.primary, borderWidth: 2, borderColor: '#E0E7FF' }]}><Text style={s.avatarText}>{ride.passengerName?.charAt(0)}</Text></View>
                        <View>
                            <Text style={[s.name, { color: theme.text }]}>{ride.passengerName}</Text>
                            <View style={s.rating}><Ionicons name="star" size={14} color="#FBBF24" /><Text style={{ color: theme.textSecondary }}>{ride.passengerRating || '4.8'}</Text></View>
                        </View>
                    </View>
                    <TouchableOpacity style={[s.callBtnHeader, { backgroundColor: theme.primary + '15' }]} onPress={onCall}>
                        <Ionicons name="call" size={18} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                <View style={s.routeInfo}>
                    <View style={s.routeItem}>
                        <View style={s.dotLineContainer}>
                            <View style={[s.dot, { backgroundColor: theme.primary }]} />
                            <View style={[s.line, { backgroundColor: theme.border }]} />
                            <View style={[s.square, { backgroundColor: '#EF4444' }]} />
                        </View>
                        <View style={{ flex: 1, gap: 10 }}>
                            <View>
                                <Text style={[s.routeLabel, { color: theme.textSecondary }]}>RÉCUPÉRATION</Text>
                                <Text style={[s.routeText, { color: theme.text }]} numberOfLines={1}>{ride.pickup}</Text>
                            </View>
                            <View>
                                <Text style={[s.routeLabel, { color: theme.textSecondary }]}>DESTINATION</Text>
                                <Text style={[s.routeText, { color: theme.text }]} numberOfLines={1}>{ride.destination}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={s.actions}>
                    {isPending ? (
                        <>
                            <TouchableOpacity style={s.primaryBtn} onPress={onAccept} activeOpacity={0.8}>
                                <LinearGradient colors={['#10B981', '#059669']} style={s.btnGradient}>
                                    <Text style={s.btnText}>Accepter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#FEE2E2', elevation: 0 }]} onPress={onReject} activeOpacity={0.8}>
                                <View style={[s.btnGradient, { backgroundColor: 'transparent' }]}><Text style={[s.btnText, { color: '#EF4444' }]}>Refuser</Text></View>
                            </TouchableOpacity>
                        </>
                    ) : isAccepted ? (
                        <TouchableOpacity style={s.primaryBtn} onPress={onRejoindre} activeOpacity={0.8}>
                            <LinearGradient colors={theme.gradientPrimary} style={s.btnGradient}>
                                <Text style={s.btnText}>Rejoindre le passager</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : isHeading ? (
                        <TouchableOpacity style={s.primaryBtn} onPress={onArrived} activeOpacity={0.8}>
                            <LinearGradient colors={['#F59E0B', '#D97706']} style={s.btnGradient}>
                                <Text style={s.btnText}>Signaler l'arrivée</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : isArrived ? (
                        <TouchableOpacity style={s.primaryBtn} onPress={onStart} activeOpacity={0.8}>
                            <LinearGradient colors={['#10B981', '#059669']} style={s.btnGradient}>
                                <Text style={s.btnText}>Passager à bord / Démarrer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={s.primaryBtn}
                            onPress={onComplete}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#F87171', '#EF4444']}
                                style={s.btnGradient}
                            >
                                <Text style={s.btnText}>
                                    Terminer
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export const AcceptedMissionsList = ({ missions, onRejoindre, onArrived, onStart, onCall, theme, darkMode }) => {
    if (!missions || missions.length === 0) return null;

    return (
        <View style={s.section}>
            <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Missions à effectuer ({missions.length})</Text>
            </View>
            {missions.map((ride, index) => (
                <View key={ride.id + '-' + index} style={[s.rideCard, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 12, borderStyle: 'dashed' }]}>
                    <View style={s.rideTop}>
                        <View style={s.passengerInfo}>
                            <View style={[s.avatarSmall, { backgroundColor: theme.primary + '30' }]}><Text style={[s.avatarTextSmall, { color: theme.primary }]}>{ride.passengerName?.charAt(0)}</Text></View>
                            <View>
                                <Text style={[s.nameSmall, { color: theme.text }]}>{ride.passengerName}</Text>
                                <Text style={[s.subText, { color: theme.textSecondary }]}>{ride.pickup} ➔ {ride.destination}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[s.actions, { marginTop: 10 }]}>
                        {ride.status === 'accepted' ? (
                            <TouchableOpacity style={s.primaryBtn} onPress={() => onRejoindre(ride)} activeOpacity={0.8}>
                                <LinearGradient colors={theme.gradientPrimary} style={s.btnGradientSmall}>
                                    <Text style={s.btnTextSmall}>Rejoindre</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : ride.status === 'heading' ? (
                            <TouchableOpacity style={s.primaryBtn} onPress={() => onArrived(ride)} activeOpacity={0.8}>
                                <LinearGradient colors={['#F59E0B', '#D97706']} style={s.btnGradientSmall}>
                                    <Text style={s.btnTextSmall}>Signaler l'arrivée</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={s.primaryBtn} onPress={() => onStart(ride)} activeOpacity={0.8}>
                                <LinearGradient colors={['#10B981', '#059669']} style={s.btnGradientSmall}>
                                    <Text style={s.btnTextSmall}>Passager à bord / Démarrer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[s.callBtnSmall, { backgroundColor: theme.primary + '15' }]} onPress={() => onCall(ride)}>
                            <Ionicons name="call" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};

const s = StyleSheet.create({
    card: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    dotOnline: { backgroundColor: '#10B981' },
    dotOffline: { backgroundColor: '#EF4444' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    toggleZone: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    toggleLabel: { fontSize: 15, fontWeight: '500' },
    infoBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 10 },
    infoText: { fontSize: 13, fontWeight: '600' },
    earningsWrapper: { marginBottom: 15 },
    earningsCard: { padding: 15, borderRadius: 20 },
    earningsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    earningsTitle: { color: 'white', fontSize: 14, opacity: 0.9 },
    detailsBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    detailsBtnText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    earningsAmount: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    statLab: { color: 'white', fontSize: 11, opacity: 0.8 },
    statSep: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center' },
    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: '47%', padding: 15, borderRadius: 16, alignItems: 'center' },
    gridIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    gridText: { fontSize: 13, fontWeight: 'bold' },
    rideCard: { padding: 16, borderRadius: 24, borderWidth: 1, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8 },
    rideTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    passengerInfo: { flexDirection: 'row', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold' },
    name: { fontSize: 15, fontWeight: 'bold' },
    rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(59,130,246,0.1)' },
    routeInfo: { gap: 10, marginBottom: 20 },
    routeItem: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    routeText: { fontSize: 13, fontWeight: '500' },
    actions: { flexDirection: 'row', gap: 15, paddingHorizontal: 25, justifyContent: 'center' },
    primaryBtn: { flex: 1, maxWidth: '95%', borderRadius: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    btnGradient: { paddingVertical: 12, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.3 },
    callBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    callBtnHeader: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    statusBadgeSmall: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusTextSmall: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    dotLineContainer: { alignItems: 'center', width: 20, gap: 4, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    line: { width: 2, flex: 1, minHeight: 20 },
    square: { width: 8, height: 8 },
    routeLabel: { fontSize: 10, fontWeight: 'bold', marginBottom: 2, opacity: 0.6 },
    avatarSmall: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarTextSmall: { fontSize: 14, fontWeight: 'bold' },
    nameSmall: { fontSize: 14, fontWeight: 'bold' },
    subText: { fontSize: 11, opacity: 0.8 },
    btnGradientSmall: { paddingVertical: 10, alignItems: 'center', borderRadius: 14 },
    btnTextSmall: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.3 },
    callBtnSmall: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },

    // Unified Header Styles
    unifiedHeader: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarWrapper: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        overflow: 'hidden',
        marginRight: 12,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    welcomeTxt: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    driverName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingTxt: {
        color: '#FFFFFF',
        fontSize: 13,
        marginLeft: 4,
        opacity: 0.9,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E40AF',
    },
    notifBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusRowCombined: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    statusInfoCol: {
        flex: 1,
    },
    statusTitleCombined: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 4,
    },
    statusBadgeCombined: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDotCombined: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusTextCombined: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    switchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switchLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.9,
    },
    earningsSectionCombined: {
        paddingTop: 10,
    },
    earningsHeaderCombined: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    earningsTitleCombined: {
        color: '#FFFFFF',
        fontSize: 16,
        opacity: 0.9,
    },
    detailsBtnCombined: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    detailsBtnTxtCombined: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    earningsAmountCombined: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    statsGridCombined: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 15,
    },
    statItemCombined: {
        flex: 1,
        alignItems: 'center',
    },
    statValCombined: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabCombined: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    statDividerCombined: {
        width: 1,
        height: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
