import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Modal,
    TextInput,
    Platform,
    RefreshControl,
    Alert,
    Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

export default function WalletScreen({ onBack }) {
    const { darkMode, theme, user, updateUser } = useApp();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // États communs pour les modaux
    const [modalConfig, setModalConfig] = useState({ type: null, visible: false });
    const [formData, setFormData] = useState({ amount: '', phone: '', method: 'ORANGE_MONEY' });
    const [isProcessing, setIsProcessing] = useState(false);
    
    // États spécifiques au Retrait (OTP)
    const [otpStep, setOtpStep] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            // Utilisation de la même route que le Web pour le solde
            const res = await apiClient('/wallet/solde');
            let currentBalance = 0;
            if (res.solde !== undefined) {
                currentBalance = res.solde;
            } else if (res.balance !== undefined) {
                currentBalance = res.balance;
            } else {
                currentBalance = user?.solde || 0;
            }
            
            setBalance(currentBalance);
            // MISE À JOUR DU CONTEXTE GLOBAL
            updateUser({ ...user, solde: currentBalance });

            // Utilisation de la même route que le Web pour l'historique
            const resHistory = await apiClient('/wallet/historique');
            if (resHistory.succes && resHistory.transactions) {
                const formattedTxs = resHistory.transactions.map(t => ({
                    id: t._id,
                    type: t.type,
                    amount: (t.type === 'DEPOT' || t.type.includes('RECU')) ? t.montant : -t.montant,
                    date: t.createdAt,
                    description: t.commentaire || t.methode || t.type.replace(/_/g, ' '),
                    status: t.statut
                }));
                setTransactions(formattedTxs);
            }
        } catch (error) {
            console.error('Wallet fetch error:', error);
            // Repli sécurisé
            setBalance(user?.solde || 0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchWalletData();
    };

    const openModal = (type) => {
        setModalConfig({ type, visible: true });
        setFormData({ amount: '', phone: user?.telephone || '', method: 'ORANGE_MONEY' });
        setOtpStep(false);
        setOtpCode('');
    };

    const handleAction = async () => {
        const { amount, phone, method } = formData;
        if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
            Alert.alert('Erreur', 'Veuillez entrer un montant valide');
            return;
        }

        setIsProcessing(true);
        try {
            let res;
            if (modalConfig.type === 'depot') {
                // Logique de dépôt (comme sur le Web)
                res = await apiClient('/wallet/depoter', {
                    method: 'POST',
                    body: { montant: amount, methode: method, referenceExterne: `MOBILE-${Date.now()}` }
                });
            } else if (modalConfig.type === 'retrait') {
                if (!otpStep) {
                    // ÉTAPE 1: Envoyer l'OTP
                    const otpRes = await apiClient('/wallet/envoyer-otp', { method: 'POST' });
                    if (otpRes.succes) {
                        setOtpStep(true);
                        Alert.alert('Sécurité', 'Un code de validation a été envoyé à votre e-mail.');
                    } else {
                        Alert.alert('Erreur', otpRes.message || 'Impossible d\'envoyer le code');
                    }
                    setIsProcessing(false);
                    return;
                } else {
                    // ÉTAPE 2: Valider avec l'OTP
                    if (!otpCode || otpCode.length !== 4) {
                        Alert.alert('Erreur', 'Veuillez saisir le code à 4 chiffres');
                        setIsProcessing(false);
                        return;
                    }
                    res = await apiClient('/wallet/retirer', {
                        method: 'POST',
                        body: { montant: amount, methode: method, numeroMobileMoney: phone, otp: otpCode }
                    });
                }
            } else if (modalConfig.type === 'transfert') {
                if (!phone) {
                    Alert.alert('Erreur', 'Veuillez entrer le numéro du destinataire');
                    setIsProcessing(false);
                    return;
                }
                res = await apiClient('/wallet/transferer', {
                    method: 'POST',
                    body: { destinataireTel: phone, montant: amount }
                });
            }

            if (res && res.succes) {
                Alert.alert('Succès', res.message || 'Opération réussie');
                setModalConfig({ type: null, visible: false });
                fetchWalletData();
            } else if (res) {
                Alert.alert('Erreur', res.message || 'Une erreur est survenue');
            }
        } catch (error) {
            Alert.alert('Erreur Serveur', 'Impossible de contacter le serveur. Veuillez réessayer.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const getModalTitle = () => {
        switch (modalConfig.type) {
            case 'depot': return 'Recharger mon compte';
            case 'retrait': return 'Effectuer un retrait';
            case 'transfert': return "Transférer de l'argent";
            default: return '';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
            
            {/* HEADER CUSTOM */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Mon Portefeuille</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
            >
                {/* CARTE DE SOLDE PREMIUM */}
                <LinearGradient
                    colors={['#10B981', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCard}
                >
                    <View style={styles.balanceInfo}>
                        <Text style={styles.balanceLabel}>Solde disponible</Text>
                        <Text style={styles.balanceAmount}>
                            {balance.toLocaleString('fr-FR')} <Text style={styles.currency}>GNF</Text>
                        </Text>
                        <View style={styles.userInfoMini}>
                             <Text style={styles.userNameMini}>{user?.prenom} {user?.nom}</Text>
                             <Text style={styles.userPhoneMini}>{user?.telephone}</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="wallet-outline" size={100} color="rgba(255,255,255,0.15)" style={styles.cardBgIcon} />
                </LinearGradient>

                {/* ACTIONS RAPIDES (4 BOUTONS) */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => openModal('depot')}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.actionIconBg}>
                            <Ionicons name="add" size={24} color="white" />
                        </LinearGradient>
                        <Text style={[styles.actionText, { color: theme.text }]}>Dépôt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => openModal('retrait')}>
                        <LinearGradient colors={['#EF4444', '#B91C1C']} style={styles.actionIconBg}>
                            <Ionicons name="arrow-up" size={22} color="white" />
                        </LinearGradient>
                        <Text style={[styles.actionText, { color: theme.text }]}>Retrait</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => openModal('transfert')}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionIconBg}>
                            <Ionicons name="swap-horizontal" size={20} color="white" />
                        </LinearGradient>
                        <Text style={[styles.actionText, { color: theme.text }]}>Transfert</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]} onPress={() => Alert.alert('Info', 'Historique des factures bientôt disponible')}>
                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionIconBg}>
                            <Ionicons name="receipt-outline" size={20} color="white" />
                        </LinearGradient>
                        <Text style={[styles.actionText, { color: theme.text }]}>Factures</Text>
                    </TouchableOpacity>
                </View>

                {/* HISTORIQUE DES TRANSACTIONS */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Activité financière</Text>
                </View>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={60} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune activité récente</Text>
                    </View>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={[styles.txItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                            <View style={[styles.txIconBox, { backgroundColor: tx.amount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons 
                                    name={tx.amount > 0 ? "arrow-down" : "arrow-up"} 
                                    size={20} 
                                    color={tx.amount > 0 ? "#10B981" : "#EF4444"} 
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={[styles.txTitle, { color: theme.text }]}>{tx.description}</Text>
                                <Text style={[styles.txSub, { color: theme.textSecondary }]}>{formatDate(tx.date)}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#10B981' : theme.text }]}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} GNF
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* MODAL UNIQUE DYNAMIQUE (Dépôt / Retrait / Transfert) */}
            <Modal
                visible={modalConfig.visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalConfig({ ...modalConfig, visible: false })}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{getModalTitle()}</Text>
                            <TouchableOpacity onPress={() => setModalConfig({ ...modalConfig, visible: false })}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {!otpStep ? (
                                <>
                                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Montant (GNF)</Text>
                                    <View style={[styles.amountInputContainer, { borderColor: theme.border }]}>
                                        <TextInput
                                            style={[styles.amountInput, { color: theme.text }]}
                                            placeholder="Ex: 50000"
                                            placeholderTextColor={theme.textSecondary}
                                            keyboardType="numeric"
                                            value={formData.amount}
                                            onChangeText={(val) => setFormData({ ...formData, amount: val })}
                                        />
                                    </View>

                                    {(modalConfig.type === 'retrait' || modalConfig.type === 'transfert') && (
                                        <>
                                            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>
                                                {modalConfig.type === 'transfert' ? "Numéro du destinataire" : "Numéro de retrait"}
                                            </Text>
                                            <View style={[styles.amountInputContainer, { borderColor: theme.border }]}>
                                                <TextInput
                                                    style={[styles.amountInput, { color: theme.text, fontSize: 18 }]}
                                                    placeholder="621 XX XX XX"
                                                    placeholderTextColor={theme.textSecondary}
                                                    keyboardType="phone-pad"
                                                    value={formData.phone}
                                                    onChangeText={(val) => setFormData({ ...formData, phone: val })}
                                                />
                                            </View>
                                        </>
                                    )}

                                    {modalConfig.type !== 'transfert' && (
                                        <>
                                            <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 20 }]}>Opérateur</Text>
                                            <View style={styles.methodList}>
                                                <TouchableOpacity 
                                                    style={[styles.methodItem, formData.method === 'ORANGE_MONEY' && styles.methodItemActive]}
                                                    onPress={() => setFormData({ ...formData, method: 'ORANGE_MONEY' })}
                                                >
                                                    <View style={styles.methodIcon}>
                                                        <Text style={{ fontWeight: 'bold', color: '#FF6600' }}>OM</Text>
                                                    </View>
                                                    <Text style={[styles.methodText, formData.method === 'ORANGE_MONEY' && styles.methodTextActive]}>Orange Money</Text>
                                                    {formData.method === 'ORANGE_MONEY' && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                                                </TouchableOpacity>

                                                <TouchableOpacity 
                                                    style={[styles.methodItem, formData.method === 'MTN_MONEY' && styles.methodItemActive]}
                                                    onPress={() => setFormData({ ...formData, method: 'MTN_MONEY' })}
                                                >
                                                    <View style={styles.methodIcon}>
                                                        <Text style={{ fontWeight: 'bold', color: '#FFCC00' }}>MTN</Text>
                                                    </View>
                                                    <Text style={[styles.methodText, formData.method === 'MTN_MONEY' && styles.methodTextActive]}>MTN Money</Text>
                                                    {formData.method === 'MTN_MONEY' && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                </>
                            ) : (
                                <View style={styles.otpContainer}>
                                    <View style={styles.securityBanner}>
                                        <Ionicons name="shield-checkmark" size={32} color="#10B981" />
                                        <Text style={[styles.otpTitle, { color: theme.text }]}>Sécurité renforcée</Text>
                                        <Text style={[styles.otpSub, { color: theme.textSecondary }]}>
                                            Saisissez le code à 4 chiffres envoyé à votre adresse e-mail.
                                        </Text>
                                    </View>
                                    
                                    <TextInput
                                        style={[styles.otpInput, { color: theme.text, borderBottomColor: theme.primary }]}
                                        placeholder="0000"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        textAlign="center"
                                        autoFocus
                                    />
                                    
                                    <TouchableOpacity onPress={() => setOtpStep(false)}>
                                        <Text style={{ color: theme.primary, marginTop: 20, fontWeight: '600' }}>
                                            Modifier les informations
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity 
                                style={[styles.confirmButton, isProcessing && { opacity: 0.7 }]}
                                onPress={handleAction}
                                disabled={isProcessing}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#3B82F6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.confirmGradient}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.confirmText}>
                                            {otpStep ? "Valider le retrait" : (modalConfig.type === 'retrait' ? "Envoyer le code" : "Confirmer")}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    refreshButton: { padding: 5 },
    scrollContent: { padding: 20 },
    balanceCard: {
        borderRadius: 24,
        padding: 25,
        height: 190,
        justifyContent: 'center',
        marginBottom: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        overflow: 'hidden'
    },
    balanceInfo: { zIndex: 2 },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 5, fontWeight: '600', letterSpacing: 1 },
    balanceAmount: { color: 'white', fontSize: 36, fontWeight: 'bold', marginBottom: 15 },
    currency: { fontSize: 18, fontWeight: 'normal' },
    userInfoMini: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: 10,
    },
    userNameMini: { color: 'white', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
    userPhoneMini: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    cardBgIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        zIndex: 1
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30
    },
    actionButton: {
        width: '23%',
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    actionText: { fontSize: 11, fontWeight: 'bold' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        opacity: 0.5
    },
    emptyText: { marginTop: 10, fontSize: 14 },
    txItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    txIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    txInfo: { flex: 1 },
    txTitle: { fontSize: 14, fontWeight: 'bold' },
    txSub: { fontSize: 11, marginTop: 2 },
    txAmount: { fontSize: 14, fontWeight: 'bold' },
    
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '90%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalBody: { paddingBottom: 20 },
    inputLabel: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
    amountInputContainer: {
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 60,
        justifyContent: 'center'
    },
    amountInput: { fontSize: 24, fontWeight: 'bold' },
    methodList: { marginTop: 10 },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.03)',
        marginBottom: 10
    },
    methodItemActive: {
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)'
    },
    methodIcon: { width: 40, alignItems: 'center' },
    methodText: { flex: 1, fontSize: 15, color: '#666', fontWeight: '600' },
    methodTextActive: { color: '#10B981' },
    confirmButton: { marginTop: 30, borderRadius: 15, overflow: 'hidden' },
    confirmGradient: { height: 60, justifyContent: 'center', alignItems: 'center' },
    confirmText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    
    // OTP styles
    otpContainer: { alignItems: 'center', paddingVertical: 20 },
    securityBanner: { alignItems: 'center', marginBottom: 30 },
    otpTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
    otpSub: { textAlign: 'center', fontSize: 13, marginTop: 8, paddingHorizontal: 20 },
    otpInput: {
        fontSize: 48,
        fontWeight: 'bold',
        width: 200,
        borderBottomWidth: 3,
        paddingBottom: 10,
        letterSpacing: 20
    }
});
