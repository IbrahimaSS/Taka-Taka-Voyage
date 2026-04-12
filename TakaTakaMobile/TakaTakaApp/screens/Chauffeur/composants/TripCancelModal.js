import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function TripCancelModal({ visible, onClose, onConfirm, role = 'CHAUFFEUR', theme }) {
    const [reason, setReason] = useState('');
    const [selectedReasonId, setSelectedReasonId] = useState(null);

    const reasons = role === 'CHAUFFEUR' ? [
        { id: 'accident', label: 'Problème technique / Accident', icon: 'construct' },
        { id: 'too_far', label: 'Passager trop loin / Introuvable', icon: 'location' },
        { id: 'no_show', label: 'Le passager ne se présente pas', icon: 'person-remove' },
        { id: 'emergency', label: 'Urgence personnelle', icon: 'alert-circle' },
        { id: 'other', label: 'Autre raison', icon: 'ellipsis-horizontal' },
    ] : [
        { id: 'no_longer_needed', label: 'Plus besoin de la course', icon: 'close-circle' },
        { id: 'wait_too_long', label: 'Temps d\'attente trop long', icon: 'time' },
        { id: 'wrong_address', label: 'Erreur d\'adresse', icon: 'map' },
        { id: 'price_too_high', label: 'Prix trop élevé', icon: 'cash' },
        { id: 'other', label: 'Autre raison', icon: 'ellipsis-horizontal' },
    ];

    const handleConfirm = () => {
        const finalReason = selectedReasonId === 'other' ? reason : reasons.find(r => r.id === selectedReasonId)?.label;
        if (!finalReason) return;
        onConfirm(finalReason);
        setReason('');
        setSelectedReasonId(null);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={20} style={s.overlay}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={s.centeredView}
                >
                    <View style={[s.modalView, { backgroundColor: theme.card }]}>
                        <View style={s.header}>
                            <View style={[s.iconBg, { backgroundColor: '#EF444420' }]}>
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                            </View>
                            <Text style={[s.title, { color: theme.text }]}>Annuler la course ?</Text>
                            <Text style={[s.subtitle, { color: theme.textSecondary }]}>
                                {role === 'CHAUFFEUR' 
                                    ? 'Cette action aura un impact sur votre taux d\'acceptation.' 
                                    : 'Des frais d\'annulation peuvent s\'appliquer si le chauffeur est déjà en route.'}
                            </Text>
                        </View>

                        <ScrollView style={s.reasonsList} showsVerticalScrollIndicator={false}>
                            {reasons.map((item) => (
                                <TouchableOpacity 
                                    key={item.id}
                                    style={[
                                        s.reasonItem, 
                                        { 
                                            borderColor: selectedReasonId === item.id ? theme.primary : theme.border,
                                            backgroundColor: selectedReasonId === item.id ? theme.primary + '10' : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setSelectedReasonId(item.id)}
                                >
                                    <Ionicons 
                                        name={item.icon} 
                                        size={20} 
                                        color={selectedReasonId === item.id ? theme.primary : theme.textSecondary} 
                                    />
                                    <Text style={[
                                        s.reasonLabel, 
                                        { color: selectedReasonId === item.id ? theme.primary : theme.text }
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedReasonId === item.id && (
                                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}

                            {selectedReasonId === 'other' && (
                                <TextInput
                                    style={[s.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                    placeholder="Précisez la raison..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={reason}
                                    onChangeText={setReason}
                                    multiline
                                />
                            )}
                        </ScrollView>

                        <View style={s.footer}>
                            <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={onClose}>
                                <Text style={[s.btnText, { color: theme.textSecondary }]}>Retour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[s.btn, s.btnPrimary, { opacity: selectedReasonId ? 1 : 0.5 }]} 
                                onPress={handleConfirm}
                                disabled={!selectedReasonId}
                            >
                                <Text style={s.btnTextPrimary}>Confirmer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        width: '90%',
        maxWidth: 400,
    },
    modalView: {
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    reasonsList: {
        marginBottom: 20,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
        gap: 12,
    },
    reasonLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        marginTop: 5,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    btnSecondary: {
        backgroundColor: 'transparent',
    },
    btnPrimary: {
        backgroundColor: '#EF4444',
    },
    btnText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    btnTextPrimary: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
