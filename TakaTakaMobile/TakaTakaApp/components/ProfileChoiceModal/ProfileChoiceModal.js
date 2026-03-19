import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../App.styles';
import { colors } from '../../constants/colors';
import { useApp } from '../../AppContext';

/**
 * Modal partagé pour le choix du profil à l'inscription (Passager / Chauffeur).
 * Utilisé sur l'accueil et dans le menu Header.
 */
export default function ProfileChoiceModal({
    visible,
    onClose,
    onSelectPassager,
    onSelectChauffeur,
}) {
    const { darkMode, theme } = useApp();
    const handleSelect = (profileType) => {
        onClose();
        if (profileType === 'passager' && onSelectPassager) onSelectPassager();
        if (profileType === 'chauffeur' && onSelectChauffeur) onSelectChauffeur();
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.profileChoiceOverlay}>
                <View style={[
                    styles.profileChoiceModal,
                    {
                        backgroundColor: theme.background,
                        borderWidth: 1,
                        borderColor: theme.border,
                    },
                ]}>
                    <View style={styles.profileChoiceHeader}>
                        <Text style={[styles.profileChoiceTitle, { color: theme.text }]}>
                            Choisissez votre profil
                        </Text>
                        <Text style={[styles.profileChoiceSubtitle, { color: theme.textSecondary }]}>
                            Sélectionnez le type de compte pour vous inscrire
                        </Text>
                    </View>

                    <View style={styles.profileChoiceCards}>
                        <TouchableOpacity
                            style={[
                                styles.profileChoiceCard,
                                {
                                    backgroundColor: darkMode ? '#1F2937' : colors.white,
                                    borderColor: darkMode ? '#374151' : colors.primaryGreenStart20,
                                },
                            ]}
                            onPress={() => handleSelect('passager')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[`${colors.primaryGreenStart}10`, `${colors.primaryGreenEnd}10`]}
                                style={styles.profileChoiceIconContainer}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="person-outline" size={32} color={colors.primaryGreenStart} />
                            </LinearGradient>
                            <Text style={[styles.profileChoiceCardTitle, { color: theme.text }]}>
                                Passager
                            </Text>
                            <Text style={[styles.profileChoiceCardDescription, { color: theme.textSecondary }]}>
                                Inscrivez-vous pour réserver des trajets
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.profileChoiceButton,
                                    {
                                        backgroundColor: `${colors.primaryGreenStart}10`,
                                        borderColor: colors.primaryGreenStart20,
                                    },
                                ]}
                                onPress={() => handleSelect('passager')}
                            >
                                <Text style={[styles.profileChoiceButtonText, { color: colors.primaryGreenStart }]}>
                                    S'inscrire
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primaryGreenStart} />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.profileChoiceCard,
                                {
                                    backgroundColor: darkMode ? '#1F2937' : colors.white,
                                    borderColor: darkMode ? '#374151' : colors.primaryBlueStart20,
                                },
                            ]}
                            onPress={() => handleSelect('chauffeur')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[`${colors.primaryBlueStart}10`, `${colors.primaryBlueEnd}10`]}
                                style={[styles.profileChoiceIconContainer, styles.chauffeurIcon]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="car-outline" size={32} color={colors.primaryBlueStart} />
                            </LinearGradient>
                            <Text style={[styles.profileChoiceCardTitle, { color: theme.text }]}>
                                Chauffeur
                            </Text>
                            <Text style={[styles.profileChoiceCardDescription, { color: theme.textSecondary }]}>
                                Inscrivez-vous pour gérer vos trajets
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.profileChoiceButton,
                                    styles.chauffeurButton,
                                    {
                                        backgroundColor: `${colors.primaryBlueStart}10`,
                                        borderColor: colors.primaryBlueStart20,
                                    },
                                ]}
                                onPress={() => handleSelect('chauffeur')}
                            >
                                <Text style={[styles.profileChoiceButtonText, { color: colors.primaryBlueStart }]}>
                                    S'inscrire
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.primaryBlueStart} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.profileChoiceCancel,
                            {
                                backgroundColor: darkMode ? '#374151' : `${colors.primaryBlueStart}05`,
                                borderColor: theme.border,
                            },
                        ]}
                        onPress={onClose}
                    >
                        <Text style={[styles.profileChoiceCancelText, { color: theme.textSecondary }]}>
                            Annuler
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
