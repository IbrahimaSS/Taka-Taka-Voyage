import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../App.styles';
import { colors } from '../../constants/colors';
import { Dimensions } from 'react-native';
import ProfileChoiceModal from '../ProfileChoiceModal';
import { SCREENS } from '../../constants/screens';

const { width } = Dimensions.get('window');

export default function Header({ menuVisible, setMenuVisible, setCurrentScreen }) {
    const [profileChoiceVisible, setProfileChoiceVisible] = useState(false);

    const handleNavigation = (screen) => {
        setMenuVisible(false);
        setTimeout(() => {
            if (typeof setCurrentScreen === 'function') setCurrentScreen(screen);
        }, 300);
    };

    const handleSelectPassager = () => {
        setTimeout(() => setCurrentScreen(SCREENS.PASSAGER_REGISTER), 300);
    };
    const handleSelectChauffeur = () => {
        setTimeout(() => setCurrentScreen(SCREENS.DRIVER_REGISTER), 300);
    };

    // Items du menu avec les nouvelles couleurs
    const menuItems = [
        { icon: 'home', label: 'Accueil', color: colors.primaryGreenStart, onPress: () => handleNavigation(SCREENS.HOME) },
        { icon: 'person', label: 'Passager', color: colors.primaryBlueStart, onPress: () => handleNavigation(SCREENS.PASSAGER) },
        { icon: 'car', label: 'Chauffeur', color: colors.primaryBlueEnd, onPress: () => handleNavigation(SCREENS.CHAUFFEUR) },
        { icon: 'grid', label: 'Fonctionnalités', color: colors.primaryGreenEnd, onPress: () => handleNavigation(SCREENS.FEATURES) },
        { icon: 'mail', label: 'Contact', color: '#EF4444', onPress: () => handleNavigation(SCREENS.CONTACT) },
        { icon: 'log-in', label: 'Connexion', color: colors.primaryBlueStart, onPress: () => handleNavigation(SCREENS.LOGIN) },
        { icon: 'person-add', label: 'Inscription', color: colors.primaryGreenStart, onPress: () => setProfileChoiceVisible(true) },
        { icon: 'download', label: 'Télécharger', color: colors.primaryBlueEnd, onPress: () => handleNavigation(SCREENS.DOWNLOAD) },
    ];

    return (
        <>
            {/* MODAL DU MENU HAMBURGER */}
            <Modal
                animationType="slide"
                transparent
                visible={menuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <LinearGradient
                        colors={[colors.primaryBlueStart, colors.primaryBlueEnd]}
                        style={[styles.menuContent, { width: width * 0.85 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {/* HEADER DU MENU */}
                        <View style={styles.menuHeader}>
                            <View style={styles.menuLogoContainer}>
                                <View style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    backgroundColor: '#FFFFFF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    overflow: 'hidden',
                                    borderWidth: 1.5,
                                    borderColor: '#FFFFFF'
                                }}>
                                    <Image
                                        source={require('../../assets/logo/LogoTT.jpeg')}
                                        style={{ width: 40, height: 40, resizeMode: 'contain' }}
                                    />
                                </View>
                                <Text style={styles.menuTagline}>Menu principal</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setMenuVisible(false)}
                            >
                                <Ionicons name="close" size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* ITEMS DU MENU AVEC SCROLL */}
                        <ScrollView
                            style={styles.menuItems}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.menuItemsContent}
                        >
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.menuItem, {
                                        backgroundColor: `${item.color}10`,
                                        borderBottomColor: `${item.color}20`
                                    }]}
                                    onPress={item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                                        <Ionicons name={item.icon} size={22} color={item.color} />
                                    </View>

                                    <View style={styles.menuTextContainer}>
                                        <Text style={[styles.menuItemTitle, { color: 'white' }]}>{item.label}</Text>
                                        {/* Sous-titres dynamiques */}
                                        {item.label === 'Passager' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Réservez un trajet</Text>
                                        )}
                                        {item.label === 'Chauffeur' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Devenez chauffeur</Text>
                                        )}
                                        {item.label === 'Accueil' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Retour à l'accueil</Text>
                                        )}
                                        {item.label === 'Connexion' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Connectez-vous à votre compte</Text>
                                        )}
                                        {item.label === 'Inscription' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Créez un nouveau compte</Text>
                                        )}
                                        {item.label === 'Fonctionnalités' && (
                                            <Text style={[styles.menuItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Découvrez nos fonctionnalités</Text>
                                        )}
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* FOOTER MENU */}
                        <View style={styles.menuFooter}>
                            <Text style={[styles.menuFooterText, { color: 'white' }]}>Taka Taka V1.0.0</Text>
                            <Text style={[styles.menuFooterCopyright, { color: 'rgba(255,255,255,0.5)' }]}>
                                © 2026 Taka Taka Guinée
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Modal>

            <ProfileChoiceModal
                visible={profileChoiceVisible}
                onClose={() => setProfileChoiceVisible(false)}
                onSelectPassager={handleSelectPassager}
                onSelectChauffeur={handleSelectChauffeur}
            />
        </>
    );
}