/**
 * RideCompletionModal - Modal de fin de trajet
 * Affiche le résumé du trajet, les statistiques, 
 * les détails de paiement et le bouton d'action.
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RideCompletionModal = ({ visible, onClose, bookingData, onPaymentRequired, onRatingRequired, darkMode = false }) => {
    const handleAction = () => {
        if (bookingData?.paymentMoment === 'Anticipé') {
            onRatingRequired();
        } else {
            onPaymentRequired();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[s.container, darkMode && s.containerDark]}>
                <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header gradient */}
                    <LinearGradient
                        colors={['#10B981', '#2563EB']}
                        style={s.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={s.successIcon}>
                            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
                        </View>
                        <Text style={s.headerTitle}>Vous êtes arrivé à destination !</Text>
                        <Text style={s.headerSubtitle}>
                            Votre trajet s'est déroulé avec succès. Merci d'avoir choisi TakaTaka.
                        </Text>
                        <View style={s.successBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                            <Text style={s.successBadgeText}>Trajet complété avec succès</Text>
                        </View>
                    </LinearGradient>

                    {/* Résumé */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <View style={s.sectionHeader}>
                            <Ionicons name="map" size={18} color="#3B82F6" />
                            <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Résumé du trajet</Text>
                        </View>

                        <View style={s.detailRow}>
                            <View style={[s.detailDot, { backgroundColor: '#10B981' }]} />
                            <View style={s.detailContent}>
                                <Text style={[s.detailLabel, darkMode && s.detailLabelDark]}>Départ</Text>
                                <Text style={[s.detailValue, darkMode && s.detailValueDark]}>{bookingData?.departure || 'Mamou, Préfecture de Mamou'}</Text>
                            </View>
                        </View>

                        <View style={[s.detailConnector, darkMode && s.detailConnectorDark]} />

                        <View style={s.detailRow}>
                            <View style={[s.detailDot, { backgroundColor: '#EF4444' }]} />
                            <View style={s.detailContent}>
                                <Text style={[s.detailLabel, darkMode && s.detailLabelDark]}>Destination</Text>
                                <Text style={[s.detailValue, darkMode && s.detailValueDark]}>{bookingData?.destination || 'Région de Kindia, Guinée'}</Text>
                            </View>
                        </View>

                        <View style={[s.driverRow, darkMode && s.driverRowDark]}>
                            <View style={s.driverAvatar}>
                                <Text style={s.driverInitial}>M</Text>
                            </View>
                            <View style={s.driverInfo}>
                                <Text style={[s.driverName, darkMode && s.driverNameDark]}>{bookingData?.driver || 'Mamadou Diallo'}</Text>
                                <View style={s.driverRating}>
                                    <Ionicons name="star" size={14} color="#FBBF24" />
                                    <Text style={[s.driverRatingText, darkMode && s.driverRatingTextDark]}>4.8</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Statistiques */}
                    <View style={s.statsGrid}>
                        <View style={[s.statCard, darkMode && s.statCardDark]}>
                            <LinearGradient colors={darkMode ? ['#1E3A8A40', '#1E3A8A20'] : ['#EFF6FF', '#DBEAFE']} style={s.statIconBox}>
                                <Ionicons name="navigate" size={20} color="#3B82F6" />
                            </LinearGradient>
                            <Text style={[s.statValue, darkMode && s.statValueDark]}>124.6 km</Text>
                            <Text style={[s.statLabel, darkMode && s.statLabelDark]}>Distance</Text>
                        </View>
                        <View style={[s.statCard, darkMode && s.statCardDark]}>
                            <LinearGradient colors={darkMode ? ['#064E3B40', '#064E3B20'] : ['#F0FDF4', '#DCFCE7']} style={s.statIconBox}>
                                <Ionicons name="time" size={20} color="#10B981" />
                            </LinearGradient>
                            <Text style={[s.statValue, darkMode && s.statValueDark]}>374 min</Text>
                            <Text style={[s.statLabel, darkMode && s.statLabelDark]}>Durée</Text>
                        </View>
                    </View>

                    {/* Horaires */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <View style={s.sectionHeader}>
                            <Ionicons name="time-outline" size={18} color="#8B5CF6" />
                            <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Horaires</Text>
                        </View>
                        <View style={s.timeGrid}>
                            <View style={s.timeSlot}>
                                <View style={s.timeIconBox}>
                                    <Ionicons name="arrow-up-circle" size={20} color="#3B82F6" />
                                </View>
                                <Text style={[s.timeLabel, darkMode && s.timeLabelDark]}>Heure de départ</Text>
                                <Text style={[s.timeValue, darkMode && s.timeValueDark]}>23:38</Text>
                            </View>
                            <View style={[s.timeDivider, darkMode && s.timeDividerDark]} />
                            <View style={s.timeSlot}>
                                <View style={s.timeIconBox}>
                                    <Ionicons name="arrow-down-circle" size={20} color="#10B981" />
                                </View>
                                <Text style={[s.timeLabel, darkMode && s.timeLabelDark]}>Heure d'arrivée</Text>
                                <Text style={[s.timeValue, darkMode && s.timeValueDark]}>00:00</Text>
                            </View>
                        </View>
                    </View>

                    {/* Paiement */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <View style={s.sectionHeader}>
                            <Ionicons name="card" size={18} color="#10B981" />
                            <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Détails du paiement</Text>
                        </View>

                        <View style={s.payRow}><Text style={[s.payLabel, darkMode && s.payLabelDark]}>Prix de base</Text><Text style={[s.payValue, darkMode && s.payValueDark]}>249 235 GNF</Text></View>
                        <View style={s.payRow}><Text style={[s.payLabel, darkMode && s.payLabelDark]}>Frais de service</Text><Text style={[s.payValue, darkMode && s.payValueDark]}>100 GNF</Text></View>
                        <View style={s.payRow}><Text style={[s.payLabel, darkMode && s.payLabelDark]}>Supplément trafic</Text><Text style={[s.payValue, darkMode && s.payValueDark]}>0 GNF</Text></View>
                        <View style={[s.payDivider, darkMode && s.payDividerDark]} />
                        <View style={s.totalRow}>
                            <Text style={[s.totalLabel, darkMode && s.totalLabelDark]}>Total</Text>
                            <Text style={s.totalValue}>349 GNF</Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity style={s.actionBtn} onPress={handleAction} activeOpacity={0.85}>
                        <LinearGradient
                            colors={bookingData?.paymentMoment === 'Anticipé' ? ['#3B82F6', '#2563EB'] : ['#10B981', '#059669']}
                            style={s.actionBtnGradient}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <Ionicons
                                name={bookingData?.paymentMoment === 'Anticipé' ? 'star' : 'card'}
                                size={22} color="#FFFFFF"
                            />
                            <Text style={s.actionBtnText}>
                                {bookingData?.paymentMoment === 'Anticipé' ? 'Évaluer le chauffeur' : 'Procéder au paiement'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Télécharger la facture */}
                    <TouchableOpacity
                        style={[s.invoiceBtn, darkMode && s.invoiceBtnDark]}
                        onPress={() => Alert.alert('Facture', 'La facture a été générée et enregistrée dans votre historique.')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="document-text-outline" size={20} color={darkMode ? "#94A3B8" : "#64748B"} />
                        <Text style={[s.invoiceBtnText, darkMode && s.invoiceBtnTextDark]}>Télécharger la facture</Text>
                    </TouchableOpacity>

                    {/* Info */}
                    <View style={[s.infoBox, darkMode && s.infoBoxDark]}>
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <Text style={[s.infoText, darkMode && s.infoTextDark]}>
                            {bookingData?.paymentMoment === 'Anticipé'
                                ? 'Votre paiement a déjà été effectué. Vous pouvez maintenant évaluer votre chauffeur.'
                                : 'Veuillez effectuer le paiement pour finaliser votre trajet.'}
                        </Text>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 50 : 40 },
    containerDark: { backgroundColor: '#111827' },
    scrollContent: { flex: 1 },
    header: { padding: 28, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    successIcon: { marginBottom: 16 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
    headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
    successBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 4,
    },
    successBadgeText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },

    section: {
        backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, marginHorizontal: 16, marginTop: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    sectionDark: { backgroundColor: '#1F2937', shadowColor: '#000' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
    sectionTitleDark: { color: '#F9FAFB' },

    detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
    detailDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: 12 },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: 13, color: '#64748B', marginBottom: 3, fontWeight: '500' },
    detailLabelDark: { color: '#94A3B8' },
    detailValue: { fontSize: 15, color: '#1E293B', lineHeight: 21 },
    detailValueDark: { color: '#F9FAFB' },
    detailConnector: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginLeft: 5.5, marginVertical: 2 },
    detailConnectorDark: { backgroundColor: '#374151' },

    driverRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    driverRowDark: { borderTopColor: '#374151' },
    driverAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    driverInitial: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    driverInfo: { flex: 1 },
    driverName: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 3 },
    driverNameDark: { color: '#F9FAFB' },
    driverRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    driverRatingText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    driverRatingTextDark: { color: '#94A3B8' },

    statsGrid: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
    statCard: {
        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    statCardDark: { backgroundColor: '#1F2937', shadowColor: '#000' },
    statIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 3 },
    statValueDark: { color: '#F9FAFB' },
    statLabel: { fontSize: 13, color: '#64748B' },
    statLabelDark: { color: '#94A3B8' },

    timeGrid: { flexDirection: 'row', alignItems: 'center' },
    timeSlot: { flex: 1, alignItems: 'center' },
    timeIconBox: { marginBottom: 8 },
    timeLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
    timeLabelDark: { color: '#94A3B8' },
    timeValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
    timeValueDark: { color: '#F9FAFB' },
    timeDivider: { width: 1, height: 50, backgroundColor: '#E2E8F0' },
    timeDividerDark: { backgroundColor: '#374151' },

    payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    payLabel: { fontSize: 15, color: '#64748B' },
    payLabelDark: { color: '#94A3B8' },
    payValue: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
    payValueDark: { color: '#F9FAFB' },
    payDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
    payDividerDark: { backgroundColor: '#374151' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    totalLabelDark: { color: '#F9FAFB' },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },

    actionBtn: {
        marginHorizontal: 16, marginTop: 20, borderRadius: 14, overflow: 'hidden',
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    actionBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    actionBtnText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },

    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF',
        borderRadius: 14, padding: 16, marginHorizontal: 16, marginVertical: 20,
    },
    infoBoxDark: { backgroundColor: '#1E3A8A20' },
    infoText: { flex: 1, fontSize: 14, color: '#1E40AF', marginLeft: 12, lineHeight: 20 },
    infoTextDark: { color: '#60A5FA' },
    invoiceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        gap: 8,
    },
    invoiceBtnDark: { borderColor: '#374151' },
    invoiceBtnText: {
        fontSize: 15,
        color: '#64748B',
        fontWeight: '600',
    },
    invoiceBtnTextDark: { color: '#94A3B8' },
});

export default RideCompletionModal;