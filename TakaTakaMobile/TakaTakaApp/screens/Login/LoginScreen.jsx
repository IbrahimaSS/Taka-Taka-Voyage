import React, { useState, useRef } from 'react';
import { authService } from '../../services/authService';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    Modal,
    Dimensions,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loginStyles, loginColors } from './LoginScreen.styles';
import { useApp } from '../../AppContext';

// IMPORT DU LOGO
import LogoTT from '../../assets/logo/LogoTT.jpeg';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ onBack, onLoginSuccess, onSelectProfile, onForgotPassword, handleSocialLogin }) {
    const handleSocialLoginLocal = (provider) => {
        if (handleSocialLogin) {
            handleSocialLogin(provider);
        } else {
            Alert.alert('Info', `Connexion avec ${provider} bientôt disponible`);
        }
    };
    const { darkMode, theme, updateUser } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [otpFocused, setOtpFocused] = useState(false);

    // État pour le 2FA / OTP
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [securityData, setSecurityData] = useState(null);

    // État pour le modal de choix de profil
    const [profileChoiceVisible, setProfileChoiceVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
        // Animation d'entrée fluide
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            })
        ]).start();
    }, []);

    const validateEmail = (email) => {
        // Accepter email OU téléphone (le backend gère les deux via "identifiant")
        if (!email) return false;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isPhone = /^[0-9]{9}$/.test(email);
        return isEmail || isPhone;
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
            return;
        }

        if (isOtpMode && (!otpCode || otpCode.length < 4)) {
            Alert.alert('Code requis', 'Veuillez entrer le code de sécurité reçu');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login(
                email,
                password,
                isOtpMode ? otpCode : null,
                securityData?.deviceId
            );

            setLoading(false);

            if (response.succes) {
                // Mettre à jour le contexte global avec l'utilisateur connecté
                updateUser(response.user);

                const userRole = response.user.role.toLowerCase();
                if (onLoginSuccess) {
                    onLoginSuccess(userRole, response.user);
                } else {
                    Alert.alert(
                        'Connexion réussie',
                        'Bienvenue sur Taka Taka !',
                        [{ text: 'OK', onPress: () => { if (onBack) onBack(); } }]
                    );
                }
            } else if (response.requires2FA) {
                setIsOtpMode(true);
                setSecurityData(response);
                // On ne vide pas le mot de passe car on en aura besoin pour la 2ème étape
            } else {
                Alert.alert('Erreur de connexion', response.error || 'Identifiants incorrects');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Erreur', 'Impossible de se connecter au serveur. Vérifiez votre connexion.');
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            // Pour renvoyer l'OTP, on refait simplement une tentative de login sans code
            const response = await authService.login(email, password, null, securityData?.deviceId);
            setLoading(false);
            if (response.requires2FA) {
                Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé à vos contacts de confiance.');
            } else {
                Alert.alert('Succès', 'Vérification déjà en cours ou complétée.');
            }
        } catch (e) {
            setLoading(false);
            Alert.alert('Erreur', 'Impossible de renvoyer le code.');
        }
    };

    const handleProfileChoice = (profileType) => {
        setProfileChoiceVisible(false);
        if (onSelectProfile) {
            onSelectProfile(profileType);
        } else {
            Alert.alert('Redirection', `Inscription ${profileType}`, [{ text: 'OK' }]);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[loginStyles.container, darkMode && { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={loginStyles.scrollContent}
            >
                <Animated.View style={[
                    loginStyles.responsiveContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    {/* Bouton retour uniquement en mode OTP (pour revenir au formulaire de login) */}
                    {isOtpMode && (
                        <TouchableOpacity
                            style={[loginStyles.backButton, { backgroundColor: darkMode ? '#1F2937' : '#F3F4F6' }]}
                            onPress={() => setIsOtpMode(false)}
                            disabled={loading}
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                    )}

                    <View style={loginStyles.headerSection}>
                        <View style={loginStyles.logoWrapper}>
                            <Image
                                source={LogoTT}
                                style={{ width: 100, height: 100 }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[loginStyles.welcomeTitle, { color: theme.text }]}>
                            {isOtpMode ? 'Vérification' : 'Bon retour !'}
                        </Text>
                        <Text style={[loginStyles.welcomeSubtitle, { color: theme.textSecondary }]}>
                            {isOtpMode
                                ? 'Sécurité renforcée activée'
                                : 'Connectez-vous pour continuer'}
                        </Text>
                    </View>

                    <View style={[loginStyles.loginFormCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

                        {!isOtpMode ? (
                            <>
                                {/* Identifiant (Email/Tel) */}
                                <View style={loginStyles.inputGroup}>
                                    <Text style={[loginStyles.inputLabel, { color: theme.textSecondary }]}>Identifiant (Email ou Téléphone)</Text>
                                    <View style={[
                                        loginStyles.inputContainer,
                                        emailFocused ? loginStyles.inputContainerFocused : null,
                                        { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: darkMode ? '#374151' : '#E2E8F0' }
                                    ]}>
                                        <View style={loginStyles.inputIcon}>
                                            <Ionicons
                                                name="person-outline"
                                                size={20}
                                                color={emailFocused ? theme.primary : theme.textSecondary}
                                            />
                                        </View>
                                        <TextInput
                                            style={[loginStyles.textInput, { color: theme.text }]}
                                            placeholder="email@exemple.com ou 621XXXXXX"
                                            placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                            value={email}
                                            onChangeText={setEmail}
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                            keyboardType="default"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            editable={!loading}
                                            selectionColor={theme.primary}
                                        />
                                    </View>
                                </View>

                                {/* Password */}
                                <View style={loginStyles.inputGroup}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[loginStyles.inputLabel, { color: theme.textSecondary }]}>Mot de passe</Text>
                                        <TouchableOpacity
                                            style={loginStyles.forgotPassword}
                                            disabled={loading}
                                            onPress={() => onForgotPassword && onForgotPassword()}
                                        >
                                            <Text style={loginStyles.forgotPasswordText}>Oublié ?</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[
                                        loginStyles.inputContainer,
                                        passwordFocused ? loginStyles.inputContainerFocused : null,
                                        { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: darkMode ? '#374151' : '#E2E8F0' }
                                    ]}>
                                        <View style={loginStyles.inputIcon}>
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={20}
                                                color={passwordFocused ? theme.primary : theme.textSecondary}
                                            />
                                        </View>
                                        <TextInput
                                            style={[loginStyles.textInput, { color: theme.text }]}
                                            placeholder="••••••••"
                                            placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                            value={password}
                                            onChangeText={setPassword}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            secureTextEntry={!showPassword}
                                            editable={!loading}
                                            selectionColor={theme.primary}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={loginStyles.passwordToggle}
                                            disabled={loading}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color={theme.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={loginStyles.otpInputContainer}>
                                <Text style={loginStyles.otpLabel}>Code de sécurité</Text>
                                <Text style={loginStyles.otpSubText}>
                                    Un nouvel appareil a été détecté. Un code a été envoyé au {securityData?.telephoneMasked} ou {securityData?.emailMasked}.
                                </Text>
                                <View style={[
                                    loginStyles.inputContainer,
                                    otpFocused ? loginStyles.inputContainerFocused : null,
                                    { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: darkMode ? '#374151' : '#E2E8F0' }
                                ]}>
                                    <View style={loginStyles.inputIcon}>
                                        <Ionicons
                                            name="shield-checkmark-outline"
                                            size={20}
                                            color={otpFocused ? theme.primary : theme.textSecondary}
                                        />
                                    </View>
                                    <TextInput
                                        style={[loginStyles.textInput, { color: theme.text, letterSpacing: 5, textAlign: 'center', fontSize: 20 }]}
                                        placeholder="------"
                                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                        value={otpCode}
                                        onChangeText={setOtpCode}
                                        onFocus={() => setOtpFocused(true)}
                                        onBlur={() => setOtpFocused(false)}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        editable={!loading}
                                        selectionColor={theme.primary}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={loginStyles.resendButton}
                                    onPress={handleResendOtp}
                                    disabled={loading}
                                >
                                    <Text style={loginStyles.resendText}>Renvoyer le code</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Bouton de connexion / validation */}
                        <TouchableOpacity
                            style={[
                                loginStyles.loginButton,
                                ((!email || !password || (isOtpMode && !otpCode)) || loading) && loginStyles.loginButtonDisabled
                            ]}
                            onPress={handleLogin}
                            disabled={!email || !password || (isOtpMode && !otpCode) || loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={loginStyles.loginButtonText}>
                                        {isOtpMode ? 'Vérifier le code' : 'Se connecter'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {!isOtpMode && (
                            <>
                                {/* Séparateur */}
                                <View style={loginStyles.separator}>
                                    <View style={[loginStyles.separatorLine, { backgroundColor: theme.border }]} />
                                    <Text style={[loginStyles.separatorText, { color: theme.textSecondary }]}>Ou continuer avec</Text>
                                    <View style={[loginStyles.separatorLine, { backgroundColor: theme.border }]} />
                                </View>

                                {/* Boutons sociaux */}
                                <View style={loginStyles.socialButtons}>
                                    <TouchableOpacity
                                        style={[loginStyles.socialButton, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                                        onPress={() => handleSocialLoginLocal('Google')}
                                        disabled={loading}
                                    >
                                        <Ionicons name="logo-google" size={24} color="#DB4437" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[loginStyles.socialButton, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                                        onPress={() => handleSocialLoginLocal('Facebook')}
                                        disabled={loading}
                                    >
                                        <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[loginStyles.socialButton, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                                        onPress={() => handleSocialLoginLocal('Apple')}
                                        disabled={loading}
                                    >
                                        <Ionicons name="logo-apple" size={24} color={theme.text} />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    {!isOtpMode && (
                        <TouchableOpacity
                            style={[loginStyles.registerButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => setProfileChoiceVisible(true)}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={loginStyles.registerButtonText}>
                                Nouveau ? Créez un compte
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Note d'information */}
                    <View style={[loginStyles.loginNote, { backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#EBF8FF', borderColor: darkMode ? '#1E40AF' : '#BEE3F8' }]}>
                        <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color={darkMode ? theme.primary : '#2C5282'}
                        />
                        <Text style={[loginStyles.loginNoteText, { color: darkMode ? theme.textSecondary : '#2C5282' }]}>
                            {isOtpMode
                                ? "Ce code expire dans 5 minutes. Ne le partagez jamais."
                                : "Votre sécurité est notre priorité. Vos données sont chiffrées de bout en bout."}
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* MODAL DE CHOIX DE PROFIL */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={profileChoiceVisible}
                onRequestClose={() => setProfileChoiceVisible(false)}
            >
                <View style={loginStyles.modalOverlay}>
                    <View style={[loginStyles.modalContainer, { backgroundColor: theme.background }]}>
                        <View style={loginStyles.modalHeader}>
                            <Text style={[loginStyles.modalTitle, { color: theme.text }]}>Inscription</Text>
                            <Text style={[loginStyles.modalSubtitle, { color: theme.textSecondary }]}>
                                Choisissez comment vous souhaitez utiliser Taka Taka
                            </Text>
                        </View>

                        <View style={loginStyles.modalBody}>
                            <TouchableOpacity
                                style={[loginStyles.profileCard, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}
                                onPress={() => handleProfileChoice('passager')}
                                activeOpacity={0.8}
                            >
                                <View style={[loginStyles.profileIconWrapper, { backgroundColor: `${theme.primary}15` }]}>
                                    <Ionicons name="person-outline" size={28} color={theme.primary} />
                                </View>
                                <View style={loginStyles.profileInfo}>
                                    <Text style={[loginStyles.profileRoleTitle, { color: theme.text }]}>Passager</Text>
                                    <Text style={[loginStyles.profileRoleDesc, { color: theme.textSecondary }]}>Réservez des trajets en toute sécurité</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[loginStyles.profileCard, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border }]}
                                onPress={() => handleProfileChoice('chauffeur')}
                                activeOpacity={0.8}
                            >
                                <View style={[loginStyles.profileIconWrapper, { backgroundColor: 'rgba(214, 158, 46, 0.1)' }]}>
                                    <Ionicons name="car-outline" size={28} color="#D69E2E" />
                                </View>
                                <View style={loginStyles.profileInfo}>
                                    <Text style={[loginStyles.profileRoleTitle, { color: theme.text }]}>Chauffeur</Text>
                                    <Text style={[loginStyles.profileRoleDesc, { color: theme.textSecondary }]}>Gagnez de l'argent avec votre véhicule</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={loginStyles.modalFooter}>
                            <TouchableOpacity
                                style={[loginStyles.modalCloseButton, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}
                                onPress={() => setProfileChoiceVisible(false)}
                            >
                                <Text style={[loginStyles.modalCloseText, { color: theme.textSecondary }]}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Overlay de chargement */}
            {
                loading && (
                    <View style={loginStyles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ marginTop: 16, color: 'white', fontSize: 16, fontWeight: '600' }}>
                            {isOtpMode ? 'Vérification du code...' : 'Connexion en cours...'}
                        </Text>
                    </View>
                )
            }
        </KeyboardAvoidingView >
    );
}