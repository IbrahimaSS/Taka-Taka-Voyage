import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TakaAlertModal = ({ visible, title, message, type = 'success', onClose, onConfirm, theme, darkMode }) => {
    // Icons and colors based on type
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'error': return { name: 'close-circle', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
            case 'warning': return { name: 'warning', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
            case 'info': return { name: 'information-circle', color: theme.primary, bg: 'rgba(37, 99, 235, 0.1)' };
            default: return { name: 'checkmark-circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
        }
    };

    const icon = getIcon();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={[s.container, { backgroundColor: theme.background }]}>
                    <View style={s.content}>
                        <View style={[s.iconBox, { backgroundColor: icon.bg }]}>
                            <Ionicons name={icon.name} size={40} color={icon.color} />
                        </View>
                        
                        <Text style={[s.title, { color: theme.text }]}>{title}</Text>
                        <Text style={[s.message, { color: theme.textSecondary }]}>{message}</Text>
                        
                        <View style={s.footer}>
                            {onConfirm ? (
                                <>
                                    <TouchableOpacity style={[s.btn, { borderColor: theme.border, borderWidth: 1 }]} onPress={onClose}>
                                        <Text style={[s.btnText, { color: theme.textSecondary }]}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={onConfirm}>
                                        <LinearGradient colors={theme.gradientPrimary} style={s.gradient}>
                                            <Text style={s.btnPrimaryText}>Confirmer</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={onClose}>
                                    <LinearGradient colors={theme.gradientPrimary} style={s.gradient}>
                                        <Text style={s.btnPrimaryText}>C'est compris</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width * 0.85,
        borderRadius: 25,
        padding: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
    },
    content: {
        alignItems: 'center',
    },
    iconBox: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    footer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    btn: {
        flex: 1,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    btnPrimary: {
        elevation: 3,
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontWeight: '600',
        fontSize: 16,
    },
    btnPrimaryText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default TakaAlertModal;
