import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Modal,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';

export default function PaymentMethodsScreen({ navigation }) {
    const { paymentMethods, removePaymentMethod, setDefaultPaymentMethod, addPaymentMethod, darkMode, theme } = useApp();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMethod, setNewMethod] = useState({
        type: 'credit_card',
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        isDefault: false,
    });

    const handleAddMethod = () => {
        if (!newMethod.number.trim() || !newMethod.name.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        const method = {
            id: Date.now(),
            type: newMethod.type,
            number: newMethod.type === 'credit_card' ? `**** **** **** ${newMethod.number.slice(-4)}` : newMethod.number,
            name: newMethod.name,
            isDefault: newMethod.isDefault,
            ...(newMethod.type === 'credit_card' && { expiry: newMethod.expiry }),
            ...(newMethod.type === 'mobile_money' && { provider: 'Orange' }),
        };

        addPaymentMethod(method);
        setShowAddModal(false);
        setNewMethod({
            type: 'credit_card',
            number: '',
            name: '',
            expiry: '',
            cvv: '',
            isDefault: false,
        });
        Alert.alert('Succès', 'Moyen de paiement ajouté avec succès');
    };

    const confirmRemove = (id, name) => {
        Alert.alert(
            'Supprimer',
            `Êtes-vous sûr de vouloir supprimer ${name} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => removePaymentMethod(id)
                }
            ]
        );
    };

    const getCardIcon = (type) => {
        switch (type) {
            case 'credit_card':
                return 'card';
            case 'mobile_money':
                return 'phone-portrait';
            default:
                return 'card';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.text }]}>Moyens de Paiement</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <LinearGradient
                    colors={['#F0F9FF', '#E0F2FE']}
                    style={styles.infoBanner}
                >
                    <Ionicons name="information-circle" size={24} color="#0EA5E9" />
                    <Text style={styles.infoText}>
                        Vos informations de paiement sont sécurisées et cryptées. Aucune donnée n'est stockée sur nos serveurs.
                    </Text>
                </LinearGradient>

                {/* Payment Methods List */}
                <View style={styles.methodsList}>
                    {paymentMethods.map(method => (
                        <View key={method.id} style={[styles.methodCard, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}>
                            <View style={styles.methodHeader}>
                                <View style={[styles.methodIcon, { backgroundColor: darkMode ? '#374151' : '#F0F9FF' }]}>
                                    <Ionicons
                                        name={getCardIcon(method.type)}
                                        size={24}
                                        color={theme.primary}
                                    />
                                </View>

                                <View style={styles.methodInfo}>
                                    <Text style={[styles.methodName, { color: theme.text }]}>{method.name}</Text>
                                    <Text style={[styles.methodNumber, { color: theme.textSecondary }]}>{method.number}</Text>
                                    {method.expiry && (
                                        <Text style={[styles.methodExpiry, { color: theme.textSecondary }]}>Expire: {method.expiry}</Text>
                                    )}
                                    {method.provider && (
                                        <Text style={[styles.methodProvider, { color: theme.textSecondary }]}>{method.provider}</Text>
                                    )}
                                </View>

                                <View style={styles.methodActions}>
                                    {method.isDefault ? (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultText}>Par défaut</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.setDefaultButton}
                                            onPress={() => setDefaultPaymentMethod(method.id)}
                                        >
                                            <Text style={styles.setDefaultText}>Définir</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.methodFooter}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => Alert.alert('Modifier', 'Modifier ce moyen de paiement')}
                                >
                                    <Ionicons name="create" size={16} color="#6B7280" />
                                    <Text style={styles.actionText}>Modifier</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => confirmRemove(method.id, method.name)}
                                >
                                    <Ionicons name="trash" size={16} color="#EF4444" />
                                    <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Payment Statistics */}
                <View style={styles.statsSection}>
                    <Text style={styles.statsTitle}>Statistiques de paiement</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{paymentMethods.length}</Text>
                            <Text style={styles.statLabel}>Moyens enregistrés</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {paymentMethods.filter(m => m.isDefault).length}
                            </Text>
                            <Text style={styles.statLabel}>Par défaut</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {paymentMethods.filter(m => m.type === 'mobile_money').length}
                            </Text>
                            <Text style={styles.statLabel}>Mobile Money</Text>
                        </View>
                    </View>
                </View>

                {/* Security Tips */}
                <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>Conseils de sécurité</Text>
                    <View style={styles.tipItem}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.tipText}>Ne partagez jamais vos codes CVV</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.tipText}>Vérifiez régulièrement vos relevés</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.tipText}>Signalez immédiatement toute activité suspecte</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Add Payment Method Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddModal}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ajouter un moyen de paiement</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Type Selector */}
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        newMethod.type === 'credit_card' && styles.typeOptionActive
                                    ]}
                                    onPress={() => setNewMethod({ ...newMethod, type: 'credit_card' })}
                                >
                                    <Ionicons
                                        name="card"
                                        size={20}
                                        color={newMethod.type === 'credit_card' ? '#FFFFFF' : '#6B7280'}
                                    />
                                    <Text style={[
                                        styles.typeText,
                                        newMethod.type === 'credit_card' && styles.typeTextActive
                                    ]}>Carte</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.typeOption,
                                        newMethod.type === 'mobile_money' && styles.typeOptionActive
                                    ]}
                                    onPress={() => setNewMethod({ ...newMethod, type: 'mobile_money' })}
                                >
                                    <Ionicons
                                        name="phone-portrait"
                                        size={20}
                                        color={newMethod.type === 'mobile_money' ? '#FFFFFF' : '#6B7280'}
                                    />
                                    <Text style={[
                                        styles.typeText,
                                        newMethod.type === 'mobile_money' && styles.typeTextActive
                                    ]}>Mobile Money</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form Fields */}
                            <View style={styles.modalForm}>
                                <Text style={styles.modalLabel}>Nom sur la carte</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newMethod.name}
                                    onChangeText={(text) => setNewMethod({ ...newMethod, name: text })}
                                    placeholder="Nom complet"
                                />

                                <Text style={styles.modalLabel}>
                                    {newMethod.type === 'credit_card' ? 'Numéro de carte' : 'Numéro de téléphone'}
                                </Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={newMethod.number}
                                    onChangeText={(text) => setNewMethod({ ...newMethod, number: text })}
                                    placeholder={newMethod.type === 'credit_card' ? '1234 5678 9012 3456' : '+224 XXX XX XX XX'}
                                    keyboardType="numeric"
                                />

                                {newMethod.type === 'credit_card' && (
                                    <>
                                        <View style={styles.rowInputs}>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.modalLabel}>Date d'expiration</Text>
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={newMethod.expiry}
                                                    onChangeText={(text) => setNewMethod({ ...newMethod, expiry: text })}
                                                    placeholder="MM/AA"
                                                />
                                            </View>
                                            <View style={styles.halfInput}>
                                                <Text style={styles.modalLabel}>CVV</Text>
                                                <TextInput
                                                    style={styles.modalInput}
                                                    value={newMethod.cvv}
                                                    onChangeText={(text) => setNewMethod({ ...newMethod, cvv: text })}
                                                    placeholder="123"
                                                    keyboardType="numeric"
                                                    secureTextEntry
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}

                                <View style={styles.defaultOption}>
                                    <Text style={styles.defaultLabel}>Définir comme moyen par défaut</Text>
                                    <Switch
                                        value={newMethod.isDefault}
                                        onValueChange={(value) => setNewMethod({ ...newMethod, isDefault: value })}
                                        trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalAddButton}
                                onPress={handleAddMethod}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#2563EB']}
                                    style={styles.modalAddButtonGradient}
                                >
                                    <Text style={styles.modalAddText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#0C4A6E',
        marginLeft: 12,
    },
    methodsList: {
        marginBottom: 24,
    },
    methodCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    methodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    methodNumber: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    methodExpiry: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    methodProvider: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    methodActions: {
        alignItems: 'flex-end',
    },
    defaultBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    setDefaultButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    setDefaultText: {
        fontSize: 12,
        color: '#6B7280',
    },
    methodFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    actionText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    deleteButton: {
        borderColor: '#FECACA',
    },
    deleteText: {
        color: '#EF4444',
    },
    statsSection: {
        marginBottom: 24,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        width: '30%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    tipsSection: {
        marginBottom: 32,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 8,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    typeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    typeOptionActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    typeText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 8,
    },
    typeTextActive: {
        color: '#FFFFFF',
    },
    modalForm: {
        marginBottom: 20,
    },
    modalLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        marginTop: 12,
    },
    modalInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    defaultOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    defaultLabel: {
        fontSize: 16,
        color: '#1F2937',
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    modalAddButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalAddButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    modalAddText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
};