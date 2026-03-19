import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ReceiptView = ({ visible, onClose, darkMode, getReceiptHtml }) => (
    <Modal visible={visible} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: darkMode ? '#111827' : '#F8FAFC' }}>
            <LinearGradient colors={['#10B981', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.receiptWebHeader}>
                <TouchableOpacity onPress={onClose} style={s.receiptCloseWebBtn}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text style={s.receiptWebTitle}>Aperçu du Reçu</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={async () => {
                        const { uri } = await Print.printToFileAsync({ html: getReceiptHtml() });
                        await Sharing.shareAsync(uri);
                    }}>
                        <Ionicons name="share-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Print.printAsync({ html: getReceiptHtml() })}>
                        <Ionicons name="print-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <WebView
                source={{ html: getReceiptHtml() }}
                style={{ flex: 1 }}
                originWhitelist={['*']}
            />
        </View>
    </Modal>
);

const TransactionDetailModal = ({ visible, onClose, transaction, theme, darkMode }) => {
    const [showReceipt, setShowReceipt] = React.useState(false);

    if (!transaction) return null;

    const getReceiptHtml = () => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b; margin:0; }
                .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; background: #ffffff; border-radius: 12px; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                .logo-section { display: flex; align-items: center; gap: 12px; }
                .logo { width: 50px; height: 50px; background-color: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
                .company-info h1 { margin: 0; color: #2563eb; font-size: 20px; }
                .company-info p { margin: 2px 0 0 0; color: #64748b; font-size: 10px; letter-spacing: 1px; }
                .status-badge { display: inline-block; padding: 4px 10px; background-color: #3b82f6; color: white; border-radius: 20px; font-size: 10px; font-weight: bold; }
                .reference { margin-top: 6px; font-size: 12px; color: #64748b; font-weight: bold; }
                .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
                .billing-info h3 { margin: 0 0 6px 0; font-size: 10px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
                .billing-info p { margin: 2px 0; font-size: 12px; color: #0f172a; font-weight: 500; }
                .amount-box { background-color: #f8fafc; padding: 15px 25px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; flex: 1; }
                .amount-box h2 { margin: 4px 0; font-size: 24px; color: #2563eb; }
                .success-badge { display: inline-block; padding: 4px 8px; background-color: #d1fae5; color: #059669; border-radius: 20px; font-size: 10px; font-weight: bold; margin-top: 5px; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                .table th { background-color: #f1f5f9; color: #64748b; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
                .table td { padding: 15px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-size: 12px; }
                .course-title { font-weight: bold; color: #0f172a; margin: 0 0 4px 0; }
                .totals { width: 250px; margin-left: auto; }
                .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #64748b; }
                .total-final { display: flex; justify-content: space-between; padding: 12px 0; margin-top: 6px; border-top: 2px solid #e2e8f0; font-size: 16px; font-weight: bold; color: #0f172a; }
                .signature-section { margin-top: 40px; text-align: right; }
                .signature-name { font-family: 'cursive', serif; font-size: 24px; color: #cbd5e1; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="header">
                    <div class="logo-section">
                        <div class="logo">T</div>
                        <div class="company-info">
                            <h1>Taka Taka</h1>
                            <p>PLATEFORME DE VOYAGE</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="status-badge">FACTURE CHAUFFEUR</div>
                        <div class="reference">RÉF-TK-${transaction.id}</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="billing-info">
                        <h3>CHAUFFEUR</h3>
                        <p><strong>Prestatire Taka Taka</strong></p>
                        <p>ID: #CH-8829</p>
                        <div style="margin-top: 15px;">
                            <h3>DATE</h3>
                            <p>${transaction.date}</p>
                        </div>
                    </div>
                    <div class="amount-box">
                        <p style="font-size: 10px; color: #64748b;">MONTANT REÇU</p>
                        <h2>${transaction.amount.toLocaleString()} GNF</h2>
                        <div class="success-badge">✓ PAIEMENT CONFIRMÉ</div>
                    </div>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>DESCRIPTION DU TRAJET</th>
                            <th style="text-align: right;">COMMISSION</th>
                            <th style="text-align: right;">NET CHAUFFEUR</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <p class="course-title">COURSE TAKA TAKA CONFORT</p>
                                <p style="margin:2px 0; font-size:11px; color:#64748b;">De: ${transaction.pickup}</p>
                                <p style="margin:2px 0; font-size:11px; color:#64748b;">À: ${transaction.destination}</p>
                                <p style="margin:2px 0; font-size:11px; color:#64748b;">Passager: ${transaction.passengerName}</p>
                            </td>
                            <td style="text-align: right; color:#ef4444;">-Inclus</td>
                            <td style="text-align: right; font-weight: bold;">${transaction.amount.toLocaleString()} GNF</td>
                        </tr>
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row"><span>SOUS-TOTAL</span><span>${transaction.amount.toLocaleString()}</span></div>
                    <div class="total-row"><span>MODE PAIEMENT</span><span>${transaction.paymentMethod || 'ESPÈCES'}</span></div>
                    <div class="total-final"><span>TOTAL NET</span><span>${transaction.amount.toLocaleString()} GNF</span></div>
                </div>

                <div class="signature-section">
                    <p class="signature-name">Authorized TakaTaka</p>
                    <div style="width: 120px; height: 1px; background: #10b981; margin-left: auto; margin-top: 5px;"></div>
                    <p style="font-size: 8px; color: #94a3b8; margin-top: 4px;">SIGNATURE ÉLECTRONIQUE</p>
                </div>
            </div>
        </body>
        </html>
        `;
    };

    return (
        <>
            <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
                <View style={s.overlay}>
                    <View style={[s.container, { backgroundColor: theme.background }]}>
                        <View style={[s.header, { borderBottomColor: theme.border }]}>
                            <Text style={[s.title, { color: theme.text }]}>Détails de la transaction</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={s.content}>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Passager</Text>
                                <Text style={[s.value, { color: theme.text }]}>{transaction.passengerName}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Date</Text>
                                <Text style={[s.value, { color: theme.text }]}>{transaction.date}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Mode de paiement</Text>
                                <Text style={[s.value, { color: theme.text }]}>{transaction.paymentMethod || 'Espèces'}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Montant</Text>
                                <Text style={[s.value, { color: theme.primary, fontWeight: 'bold' }]}>{transaction.amount.toLocaleString()} GNF</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Statut</Text>
                                <View style={[s.statusBadge, transaction.status === 'versé' ? s.statusVersé : s.statusAttente]}>
                                    <Text style={[s.statusText, { color: transaction.status === 'versé' ? '#10B981' : '#F59E0B' }]}>
                                        {transaction.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.label, { color: theme.textSecondary }]}>Trajet</Text>
                                <Text style={[s.value, { color: theme.text }]}>{transaction.pickup} → {transaction.destination}</Text>
                            </View>
                        </ScrollView>

                        <View style={s.footer}>
                            <TouchableOpacity style={[s.btn, s.closeBtn, { borderColor: theme.border }]} onPress={onClose}>
                                <Text style={[s.btnText, { color: theme.textSecondary }]}>Fermer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.btn, s.receiptBtn]} onPress={() => setShowReceipt(true)}>
                                <LinearGradient colors={theme.gradientPrimary} style={s.btnGradient}>
                                    <Ionicons name="document-text-outline" size={18} color="white" />
                                    <Text style={s.receiptBtnText}>Reçu</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <ReceiptView
                visible={showReceipt}
                onClose={() => setShowReceipt(false)}
                darkMode={darkMode}
                getReceiptHtml={getReceiptHtml}
            />
        </>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { height: '70%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, paddingBottom: 15, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1 },
    infoRow: { marginBottom: 20 },
    label: { fontSize: 13, marginBottom: 5 },
    value: { fontSize: 16, fontWeight: '600' },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    statusVersé: { backgroundColor: '#DCFCE7' },
    statusAttente: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    footer: { flexDirection: 'row', gap: 15, marginTop: 20 },
    btn: { flex: 1, borderRadius: 15, overflow: 'hidden' },
    btnGradient: { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    closeBtn: { borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    btnText: { fontWeight: 'bold' },
    receiptBtnText: { color: 'white', fontWeight: 'bold' },

    // Styles Reçu (Papier)
    receiptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 25 },
    receiptTicket: { width: '100%', borderRadius: 20, padding: 25, elevation: 10 },
    receiptHeader: { alignItems: 'center', marginBottom: 20 },
    receiptIconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    receiptTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    receiptSubtitle: { fontSize: 12 },
    receiptDivider: { borderBottomWidth: 1, borderStyle: 'dashed', marginVertical: 20 },
    receiptBody: { gap: 12 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
    receiptLabel: { color: '#64748B', fontSize: 13 },
    receiptVal: { fontWeight: '600', fontSize: 13 },
    receiptTotalSection: { alignItems: 'center', marginVertical: 10 },
    receiptTotalLabel: { fontSize: 14, color: '#64748B', marginBottom: 4 },
    receiptTotalVal: { fontSize: 28, fontWeight: 'bold' },
    receiptCloseBtn: { marginTop: 25, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    receiptCloseText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Styles Web Receipt
    receiptWebHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingHorizontal: 20, paddingBottom: 15 },
    receiptCloseWebBtn: { padding: 5 },
    receiptWebTitle: { fontSize: 18, color: 'white', fontWeight: 'bold' },
});

export default TransactionDetailModal;
