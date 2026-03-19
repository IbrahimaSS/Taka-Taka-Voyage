/**
 * PaiementScreen - Écran de paiement après course
 * Choix de méthode (Orange Money / MTN / Carte), formulaire OTP, récapitulatif
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PaiementScreen = ({ visible, onClose, onPaymentSuccess, rideData, darkMode = false }) => {
    const [selectedMethod, setSelectedMethod] = useState('orange');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [timer, setTimer] = useState(101);

    const paymentMethods = [
        { id: 'orange', name: 'Orange Money', desc: 'Paiement mobile sécurisé', icon: 'phone-portrait', color: '#FF6B00', bg: '#FFF7ED', darkBg: '#431407' },
        { id: 'mtn', name: 'MTN Mobile Money', desc: 'Paiement via Flocq', icon: 'phone-portrait', color: '#FFCC00', bg: '#FEF3C7', darkBg: '#451a03' },
        { id: 'card', name: 'Carte Bancaire', desc: 'Visa, Mastercard', icon: 'card', color: '#3B82F6', bg: '#EFF6FF', darkBg: '#1e3a8a20' },
    ];

    const handlePayment = () => {
        Alert.alert(
            'Paiement confirmé !',
            'Votre paiement de 349 GNF a été effectué avec succès.',
            [{ text: 'Continuer', onPress: onPaymentSuccess }]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[s.container, darkMode && s.containerDark]}>
                {/* Header */}
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.header}
                >
                    <TouchableOpacity onPress={onClose} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Paiement du trajet</Text>
                    <View style={{ width: 40 }} />
                </LinearGradient>

                <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                    {/* Montant */}
                    <View style={s.amountSection}>
                        <Text style={[s.amountLabel, darkMode && s.amountLabelDark]}>Montant à payer</Text>
                        <Text style={s.amountValue}>349 GNF</Text>
                        <View style={[s.amountBadge, darkMode && s.amountBadgeDark]}>
                            <Ionicons name="receipt" size={14} color="#10B981" />
                            <Text style={[s.amountBadgeText, darkMode && s.amountBadgeTextDark]}>Total du trajet</Text>
                        </View>
                    </View>

                    {/* Méthodes de paiement */}
                    <View style={s.methodsSection}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Mode de paiement</Text>
                        {paymentMethods.map(method => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    s.methodCard,
                                    darkMode && s.methodCardDark,
                                    selectedMethod === method.id && (darkMode ? s.methodCardSelectedDark : s.methodCardSelected)
                                ]}
                                onPress={() => setSelectedMethod(method.id)}
                                activeOpacity={0.8}
                            >
                                <View style={s.methodInfo}>
                                    <View style={[s.methodIcon, { backgroundColor: darkMode ? method.darkBg : method.bg }]}>
                                        <Ionicons name={method.icon} size={24} color={method.color} />
                                    </View>
                                    <View style={s.methodTexts}>
                                        <Text style={[s.methodName, darkMode && s.methodNameDark]}>{method.name}</Text>
                                        <Text style={[s.methodDesc, darkMode && s.methodDescDark]}>{method.desc}</Text>
                                    </View>
                                </View>
                                {selectedMethod === method.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Formulaire */}
                    <View style={s.formSection}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Détails du paiement</Text>

                        {/* Numéro */}
                        <View style={s.fieldGroup}>
                            <Text style={[s.fieldLabel, darkMode && s.fieldLabelDark]}>Numéro de téléphone</Text>
                            <View style={[s.phoneInput, darkMode && s.phoneInputDark]}>
                                <Text style={[s.countryCode, darkMode && s.countryCodeDark]}>+224</Text>
                                <TextInput
                                    style={[s.phoneField, darkMode && s.phoneFieldDark]}
                                    placeholder="6XX XXX XXX"
                                    placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Code OTP */}
                        <View style={s.fieldGroup}>
                            <Text style={[s.fieldLabel, darkMode && s.fieldLabelDark]}>Code de confirmation</Text>
                            <TextInput
                                style={[s.codeInput, darkMode && s.codeInputDark]}
                                placeholder="00000000"
                                placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                                value={otpCode}
                                onChangeText={setOtpCode}
                                keyboardType="number-pad"
                                maxLength={8}
                            />
                            <View style={s.timerRow}>
                                <Ionicons name="time-outline" size={16} color={darkMode ? "#94A3B8" : "#64748B"} />
                                <Text style={[s.timerText, darkMode && s.timerTextDark]}>
                                    Code valide pendant <Text style={s.timerHighlight}>{timer}</Text> secondes
                                </Text>
                            </View>
                        </View>

                        {/* Récapitulatif */}
                        <View style={[s.summaryBox, darkMode && s.summaryBoxDark]}>
                            <View style={s.summaryHeader}>
                                <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
                                <Text style={[s.summaryTitle, darkMode && s.summaryTitleDark]}>Récapitulatif</Text>
                            </View>
                            <View style={s.summaryRow}><Text style={[s.summaryLabel, darkMode && s.summaryLabelDark]}>Prix de base</Text><Text style={[s.summaryValue, darkMode && s.summaryValueDark]}>249 235 GNF</Text></View>
                            <View style={s.summaryRow}><Text style={[s.summaryLabel, darkMode && s.summaryLabelDark]}>Frais de service</Text><Text style={[s.summaryValue, darkMode && s.summaryValueDark]}>100 GNF</Text></View>
                            <View style={s.summaryRow}><Text style={[s.summaryLabel, darkMode && s.summaryLabelDark]}>Supplément trafic</Text><Text style={[s.summaryValue, darkMode && s.summaryValueDark]}>0 GNF</Text></View>
                            <View style={[s.summaryDivider, darkMode && s.summaryDividerDark]} />
                            <View style={s.summaryRow}>
                                <Text style={[s.totalLabel, darkMode && s.totalLabelDark]}>Total</Text>
                                <Text style={s.totalValue}>349 GNF</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Footer */}
                <View style={[s.footer, darkMode && s.footerDark]}>
                    <TouchableOpacity style={s.payBtn} onPress={handlePayment} activeOpacity={0.85}>
                        <LinearGradient colors={['#10B981', '#059669']} style={s.payBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                            <Text style={s.payBtnText}>Confirmer le paiement</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 50 : 40 },
    containerDark: { backgroundColor: '#111827' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 18,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 20 },

    amountSection: { alignItems: 'center', paddingVertical: 28 },
    amountLabel: { fontSize: 14, color: '#64748B', marginBottom: 8 },
    amountLabelDark: { color: '#94A3B8' },
    amountValue: { fontSize: 48, fontWeight: '800', color: '#10B981', marginBottom: 8 },
    amountBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DCFCE7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    amountBadgeDark: { backgroundColor: '#064E3B40' },
    amountBadgeText: { fontSize: 13, color: '#166534', fontWeight: '500' },
    amountBadgeTextDark: { color: '#10B981' },

    methodsSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    sectionTitleDark: { color: '#F9FAFB' },
    methodCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10,
        borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    methodCardDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    methodCardSelected: { borderColor: '#10B981', backgroundColor: '#F0FDF4', borderWidth: 2 },
    methodCardSelectedDark: { borderColor: '#10B981', backgroundColor: '#064E3B20', borderWidth: 2 },
    methodInfo: { flexDirection: 'row', alignItems: 'center' },
    methodIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    methodTexts: { flex: 1 },
    methodName: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
    methodNameDark: { color: '#F9FAFB' },
    methodDesc: { fontSize: 13, color: '#64748B' },
    methodDescDark: { color: '#94A3B8' },

    formSection: { marginBottom: 24 },
    fieldGroup: { marginBottom: 20 },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
    fieldLabelDark: { color: '#94A3B8' },
    phoneInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    phoneInputDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    countryCode: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 16, fontWeight: '500' },
    countryCodeDark: { backgroundColor: '#374151', color: '#94A3B8' },
    phoneField: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1E293B' },
    phoneFieldDark: { color: '#F9FAFB' },
    codeInput: {
        backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 12,
        fontSize: 22, fontWeight: 'bold', color: '#1E293B', height: 55,
        paddingHorizontal: 16, textAlign: 'center', letterSpacing: 4, marginBottom: 8,
    },
    codeInputDark: { backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' },
    timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    timerText: { fontSize: 13, color: '#64748B', marginLeft: 6 },
    timerTextDark: { color: '#94A3B8' },
    timerHighlight: { color: '#EF4444', fontWeight: '700' },

    summaryBox: {
        backgroundColor: '#F8FAFC', borderRadius: 14, padding: 18,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    summaryBoxDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    summaryTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    summaryTitleDark: { color: '#F9FAFB' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#64748B' },
    summaryLabelDark: { color: '#94A3B8' },
    summaryValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
    summaryValueDark: { color: '#F9FAFB' },
    summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
    summaryDividerDark: { backgroundColor: '#374151' },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    totalLabelDark: { color: '#F9FAFB' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#10B981' },

    footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    footerDark: { backgroundColor: '#111827', borderTopColor: '#1F2937' },
    payBtn: {
        borderRadius: 14, overflow: 'hidden',
        shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    payBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    payBtnText: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
});

export default PaiementScreen;
