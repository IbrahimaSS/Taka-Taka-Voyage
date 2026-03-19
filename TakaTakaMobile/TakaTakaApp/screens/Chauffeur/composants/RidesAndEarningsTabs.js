import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import des logos de paiement
const PAYMENT_LOGOS = {
    'Orange Money': require('../../../assets/payments/orange_money.png'),
    'Mobile Money (MTN)': require('../../../assets/payments/mtn_momo.png'),
    'Espèces': require('../../../assets/payments/cash.png'),
};

export const RidesHistoryTab = ({ stats, ridesHistory, onRidePress, onPlanningPress, refreshing, onRefresh, theme, darkMode }) => (
    <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
    >
        <LinearGradient colors={theme.gradientPrimary} style={s.statsBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={s.bannerTitle}>Vos performances</Text>
            <View style={s.statsGrid}>
                <View style={s.statItem}><Text style={s.statVal}>{stats.totalRides}</Text><Text style={s.statLab}>Courses</Text></View>
                <View style={s.statSep} />
                <View style={s.statItem}><Text style={s.statVal}>{stats.rating}</Text><Text style={s.statLab}>Note</Text></View>
                <View style={s.statSep} />
                <View style={s.statItem}><Text style={s.statVal}>{stats.acceptanceRate}%</Text><Text style={s.statLab}>Acceptation</Text></View>
            </View>
        </LinearGradient>

        <View style={s.historySection}>
            <View style={s.sectionHeader}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Historique des courses</Text>
                <TouchableOpacity onPress={onPlanningPress}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Planning</Text>
                </TouchableOpacity>
            </View>
            {ridesHistory.map((ride, index) => (
                <TouchableOpacity
                    key={ride.id + '-' + index}
                    onPress={() => onRidePress?.(ride)}
                    activeOpacity={0.7}
                    style={[s.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                    <View style={s.cardTop}>
                        <View style={s.passengerInfo}>
                            <View style={[s.avatar, { backgroundColor: theme.primary }]}><Text style={s.avatarText}>{ride.passengerName.charAt(0)}</Text></View>
                            <View><Text style={[s.name, { color: theme.text }]}>{ride.passengerName}</Text><Text style={[s.date, { color: theme.textSecondary }]}>{ride.date}</Text></View>
                        </View>
                        <Text style={[s.price, { color: theme.text }]}>{ride.price}</Text>
                    </View>
                    <View style={s.cardRoute}>
                        <View style={s.routeRow}><Ionicons name="location" size={14} color={theme.primary} /><Text style={[s.routeText, { color: theme.textSecondary }]} numberOfLines={1}>{ride.pickup}</Text></View>
                        <View style={s.routeRow}><Ionicons name="flag" size={14} color="#EF4444" /><Text style={[s.routeText, { color: theme.textSecondary }]} numberOfLines={1}>{ride.destination}</Text></View>
                    </View>
                    <View style={[s.cardFooter, { borderTopColor: theme.border }]}>
                        <View style={s.rating}>{[...Array(5)].map((_, i) => <Ionicons key={i} name="star" size={14} color={i < ride.rating ? "#FBBF24" : (darkMode ? '#334155' : "#E2E8F0")} />)}</View>
                        <View style={[s.statusBadge, ride.status === 'completed' ? s.statusCompleted : s.statusCancelled]}><Text style={[s.statusText, { color: ride.status === 'completed' ? '#10B981' : '#EF4444' }]}>{ride.status === 'completed' ? 'Terminée' : 'Annulée'}</Text></View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    </ScrollView>
);

export const EarningsTab = ({ earnings, transactions, refreshing, onRefresh, handleWithdrawFunds, onTransactionPress, theme, darkMode }) => {
    return (
        <ScrollView
            style={s.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
        >
            <LinearGradient colors={theme.gradientPrimary} style={s.statsBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.bannerTitle}>Total des gains</Text>
                <Text style={s.totalAmount}>{earnings.total.toLocaleString()} GNF</Text>
                <Text style={s.bannerSubtitle}>Depuis votre inscription</Text>
            </LinearGradient>

            <View style={s.periodSection}>
                <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Détails par période</Text>
                <View style={s.periodGridSmall}>
                    {[
                        { title: 'Aujourd\'hui', amount: earnings.today || 0 },
                        { title: 'Ce mois', amount: earnings.monthly || 0 },
                    ].map((p, i) => (
                        <View key={i} style={[s.periodCardSmall, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[s.pTitleSmall, { color: theme.textSecondary }]}>{p.title}</Text>
                            <Text style={[s.pAmountSmall, { color: theme.text }]}>{p.amount.toLocaleString()} GNF</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={s.transactionsSection}>
                <Text style={[s.sectionTitle, { color: theme.text, marginBottom: 15 }]}>Revenus récents</Text>
                <View style={[s.transactionTable, { backgroundColor: 'transparent', borderWidth: 0, overflow: 'visible' }]}>
                    {transactions && transactions.length > 0 ? (
                        transactions.map((t, i) => (
                            <TouchableOpacity
                                key={t.id + '-' + i}
                                style={[s.trRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => onTransactionPress(t)}
                            >
                                <View style={s.trIconBox}>
                                    <Image 
                                        source={PAYMENT_LOGOS[t.paymentMethod] || PAYMENT_LOGOS['Espèces']} 
                                        style={s.methodLogo} 
                                    />
                                </View>
                                <View style={s.trMain}>
                                    <Text style={[s.trName, { color: theme.text }]}>{t.passengerName}</Text>
                                    <Text style={[s.trDate, { color: theme.textSecondary }]}>{t.date}</Text>
                                </View>
                                <View style={s.trSide}>
                                    <Text style={[s.trAmount, { color: theme.text }]}>+{t.amount.toLocaleString()}</Text>
                                    <View style={[s.trStatus, t.status === 'versé' ? s.statusVersé : s.statusAttente]}>
                                        <Text style={[s.trStatusText, { color: t.status === 'versé' ? '#10B981' : '#F59E0B' }]}>{t.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={{ padding: 30, alignItems: 'center' }}>
                            <Ionicons name="receipt-outline" size={40} color={theme.textSecondary} opacity={0.3} />
                            <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Aucun revenu récent</Text>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity style={s.withdrawBtn} onPress={handleWithdrawFunds}>
                <LinearGradient colors={theme.gradientPrimary} style={s.withdrawGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="wallet" size={20} color="white" />
                    <Text style={s.withdrawText}>Retirer mes fonds</Text>
                </LinearGradient>
            </TouchableOpacity>
            <Text style={s.withdrawalInfo}>Prochain retrait possible à partir de 50 000 GNF</Text>
        </ScrollView>
    );
};

const s = StyleSheet.create({
    scrollView: { flex: 1 },
    content: { paddingBottom: 100 },
    statsBanner: { padding: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20, alignItems: 'center' },
    bannerTitle: { color: 'white', fontSize: 16, opacity: 0.9, marginBottom: 15 },
    bannerSubtitle: { color: 'white', fontSize: 13, opacity: 0.8 },
    totalAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 20 },
    statItem: { flex: 1, alignItems: 'center' },
    statVal: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    statLab: { color: 'white', fontSize: 12, opacity: 0.8 },
    statSep: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center' },
    historySection: { paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    historyCard: { padding: 15, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    passengerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold' },
    name: { fontSize: 15, fontWeight: 'bold' },
    date: { fontSize: 11 },
    price: { fontSize: 16, fontWeight: 'bold' },
    cardRoute: { gap: 8, marginBottom: 15 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    routeText: { fontSize: 13, flex: 1 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
    rating: { flexDirection: 'row', gap: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusCompleted: { backgroundColor: '#DCFCE7' },
    statusCancelled: { backgroundColor: '#FEF2F2' },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    periodSection: { paddingHorizontal: 16, marginBottom: 25 },
    periodCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    periodHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    pTitle: { fontSize: 14, fontWeight: '600' },
    pAmount: { fontSize: 16, fontWeight: 'bold' },
    pProgress: { height: 6, borderRadius: 3, overflow: 'hidden' },
    pBar: { height: '100%', borderRadius: 3 },
    withdrawBtn: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
    withdrawGradient: { paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    withdrawText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    withdrawalInfo: { textAlign: 'center', color: '#64748B', fontSize: 12, marginTop: 10 },
    periodGridSmall: { flexDirection: 'row', gap: 12 },
    periodCardSmall: {
        flex: 1,
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    pTitleSmall: { fontSize: 12, marginBottom: 4 },
    pAmountSmall: { fontSize: 16, fontWeight: 'bold' },
    transactionsSection: { paddingHorizontal: 16, marginBottom: 25 },
    transactionTable: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
    trRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 15, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
        marginBottom: 8,
        marginHorizontal: 1
    },
    trMain: { flex: 1 },
    trName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    trDate: { fontSize: 12 },
    trSide: { alignItems: 'flex-end' },
    trAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    trStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusVersé: { backgroundColor: '#DCFCE7' },
    statusAttente: { backgroundColor: '#FEF3C7' },
    trStatusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    trIconBox: { width: 45, height: 45, borderRadius: 12, overflow: 'hidden', marginRight: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    methodLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
});

