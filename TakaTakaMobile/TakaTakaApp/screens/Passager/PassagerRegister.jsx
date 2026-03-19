import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Platform,
    SafeAreaView,
    KeyboardAvoidingView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { styles } from './PassagerRegister.styles';
import { useApp } from '../../AppContext';
import { colors as globalColors } from '../../constants/colors';
import { apiClient } from '../../services/apiClient';

const { width, height } = Dimensions.get('window');

export default function PassagerRegister({ navigation, onBack, onLogin }) {
    const { darkMode, theme } = useApp();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        genre: 'MASCULIN',
    });

    const [profileImage, setProfileImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const isProcessing = useRef(false);
    const horizontalScrollRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // ÉTATS OTP
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isOtpFocused, setIsOtpFocused] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // ÉTAT TOASTER
    const [toastVisible, setToastVisible] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                "Permissions requises",
                "Nous avons besoin d'accéder à votre galerie pour changer votre photo de profil."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Le nom complet est requis';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est requis';
        } else if (!/^\+?[0-9\s\-]+$/.test(formData.phone)) {
            newErrors.phone = 'Numéro de téléphone invalide';
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'adresse email est requise";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Minimum 8 caractères';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'Vous devez accepter les conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (loading || isProcessing.current) return;
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        isProcessing.current = true;
        setErrors({});

        try {
            // Séparer le nom complet pour le backend
            const nameParts = formData.fullName.trim().split(' ');
            const prenom = nameParts[0];
            const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : prenom;
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const finalPhone = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;

            const res = await apiClient('/auth/init-inscription', {
                method: 'POST',
                body: {
                    nom,
                    prenom,
                    telephone: finalPhone,
                    email: formData.email,
                    motDePasse: formData.password,
                    typeProfil: 'PASSAGER',
                    genre: formData.genre
                }
            });

            if (res.succes) {
                setLoading(false);
                setOtpModalVisible(true);
            } else {
                setLoading(false);
                const isCooldown = res.error && res.error.includes("patienter");
                if (isCooldown) {
                    Alert.alert(
                        "Code déjà envoyé",
                        "Le serveur a déjà envoyé un code récemment.\n\n1. Vérifiez l'onglet PRINCIPAL de votre Gmail (pas uniquement Promotions).\n2. Vérifiez vos SPAMS.\n3. Si rien n'est reçu, attendez la fin du décompte : " + res.error,
                        [
                            { text: "Attendre", style: "cancel" },
                            { text: "Saisir le code", onPress: () => setOtpModalVisible(true) }
                        ]
                    );
                } else {
                    Alert.alert("Erreur", res.error || res.message || "Impossible d'initier l'inscription");
                }
            }

        } catch (error) {
            Alert.alert(
                "Erreur",
                error.message || "Une erreur est survenue lors de l'envoi du code. Veuillez réessayer."
            );
        } finally {
            setLoading(false);
            isProcessing.current = false;
        }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length < 6) {
            Alert.alert("Code incomplet", "Veuillez saisir les 6 chiffres du code.");
            return;
        }

        setVerifying(true);
        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const finalPhone = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;
            
            // 1. Vérifer OTP
            const resVerify = await apiClient('/auth/verifier-otp', {
                method: 'POST',
                body: {
                    telephone: finalPhone,
                    code: otpCode
                }
            });

            if (resVerify.succes) {
                // 2. Finaliser inscription
                const resFinal = await apiClient('/auth/finaliser-inscription', {
                    method: 'POST',
                    body: { telephone: finalPhone }
                });

                if (resFinal.succes) {
                    setVerifying(false);
                    setOtpModalVisible(false);
                    setToastVisible(true);

                    setTimeout(() => {
                        setToastVisible(false);
                        if (onLogin) onLogin();
                        else if (onBack) onBack();
                    }, 3000);
                } else {
                    Alert.alert("Erreur", resFinal.message || "Erreur lors de la finalisation.");
                    setVerifying(false);
                }
            } else {
                Alert.alert("Erreur", resVerify.message || "Code invalide.");
                setVerifying(false);
            }

        } catch (error) {
            Alert.alert("Erreur", error.message || "Code invalide. Veuillez réessayer.");
            setVerifying(false);
        }
    };

    const handleResendOTP = () => {
        Alert.alert("Code renvoyé", `Un nouveau code a été envoyé à ${formData.email}`);
    };

    const handleGoogleSignup = () => {
        Alert.alert("Google Signup", "Fonctionnalité à venir");
    };

    const handleFacebookSignup = () => {
        Alert.alert("Facebook Signup", "Fonctionnalité à venir");
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => onBack?.()}
                    style={[styles.backButton, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={{
                        width: 55,
                        height: 55,
                        borderRadius: 27.5,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: 1.5,
                        borderColor: '#10B981',
                        overflow: 'hidden'
                    }}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{ width: 40, height: 40, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.photoUploadContainer}>
                            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: darkMode ? '#1F2937' : '#EFF6FF', borderColor: theme.primary }]}>
                                        <Ionicons name="camera" size={40} color={theme.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.welcomeText, { color: theme.text }]}>Créez votre compte en quelques étapes</Text>
                    </View>

                    {/* Formulaire */}
                    <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {/* Nom complet */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom complet <Text style={styles.requiredStar}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, errors.fullName && styles.inputError]}
                                placeholder="Votre nom complet"
                                placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                value={formData.fullName}
                                onChangeText={(text) => handleInputChange('fullName', text)}
                                autoCapitalize="words"
                                returnKeyType="next"
                            />
                            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                        </View>

                        {/* Téléphone */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Téléphone <Text style={styles.requiredStar}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, errors.phone && styles.inputError]}
                                placeholder="+224 00 00 00 00"
                                placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange('phone', text)}
                                keyboardType="phone-pad"
                                returnKeyType="next"
                            />
                            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>

                        {/* Email */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Email <Text style={styles.requiredStar}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, errors.email && styles.inputError]}
                                placeholder="votre@email.com"
                                placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                returnKeyType="next"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Genre */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Genre <Text style={styles.requiredStar}>*</Text></Text>
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: formData.genre === 'MASCULIN' ? theme.primary : theme.border,
                                        backgroundColor: formData.genre === 'MASCULIN' ? (darkMode ? '#1E3A8A' : '#EFF6FF') : (darkMode ? '#1F2937' : '#F9FAFB'),
                                    }}
                                    onPress={() => handleInputChange('genre', 'MASCULIN')}
                                >
                                    <Ionicons name="male" size={20} color={formData.genre === 'MASCULIN' ? theme.primary : theme.textSecondary} style={{ marginRight: 8 }} />
                                    <Text style={{ color: formData.genre === 'MASCULIN' ? theme.primary : theme.textSecondary, fontWeight: '600' }}>Homme</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 12,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: formData.genre === 'FEMININ' ? theme.primary : theme.border,
                                        backgroundColor: formData.genre === 'FEMININ' ? (darkMode ? '#1E3A8A' : '#EFF6FF') : (darkMode ? '#1F2937' : '#F9FAFB'),
                                    }}
                                    onPress={() => handleInputChange('genre', 'FEMININ')}
                                >
                                    <Ionicons name="female" size={20} color={formData.genre === 'FEMININ' ? theme.primary : theme.textSecondary} style={{ marginRight: 8 }} />
                                    <Text style={{ color: formData.genre === 'FEMININ' ? theme.primary : theme.textSecondary, fontWeight: '600' }}>Femme</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Mot de passe */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Mot de passe <Text style={styles.requiredStar}>*</Text></Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, errors.password && styles.inputError]}
                                    placeholder="Minimum 6 caractères"
                                    placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                    value={formData.password}
                                    onChangeText={(text) => handleInputChange('password', text)}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="next"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color={theme.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        {/* Confirmation mot de passe */}
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmer le mot de passe <Text style={styles.requiredStar}>*</Text></Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, errors.confirmPassword && styles.inputError]}
                                    placeholder="Retapez votre mot de passe"
                                    placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                                    secureTextEntry={!showConfirmPassword}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color={theme.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Conditions d'utilisation */}
                        <TouchableOpacity
                            style={[styles.termsContainer, { backgroundColor: darkMode ? '#1F2937' : '#F8FAFC' }]}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                {acceptedTerms && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <Text style={styles.termsText}>
                                J'accepte les{' '}
                                <Text style={styles.termsLink}>Conditions d'utilisation</Text> et la{' '}
                                <Text style={styles.termsLink}>Politique de confidentialité</Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.terms && <Text style={[styles.errorText, { marginTop: -10, marginBottom: 10 }]}>{errors.terms}</Text>}

                        {/* Bouton d'inscription - CORRIGÉ */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#4F46E5', '#2563EB']}
                                style={styles.registerButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={styles.registerButtonText}>S'inscrire</Text>
                                        <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Séparateur */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>Ou continuer avec</Text>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        </View>

                        {/* Boutons sociaux */}
                        <View style={styles.socialButtons}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleGoogleSignup}
                            >
                                <LinearGradient
                                    colors={darkMode ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F8FAFC']}
                                    style={[styles.socialButtonGradient, { borderColor: theme.border }]}
                                >
                                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleFacebookSignup}
                            >
                                <LinearGradient
                                    colors={darkMode ? ['#1F2937', '#111827'] : ['#FFFFFF', '#F8FAFC']}
                                    style={[styles.socialButtonGradient, { borderColor: theme.border }]}
                                >
                                    <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                    <Text style={[styles.socialButtonText, { color: theme.text }]}>Facebook</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Lien vers connexion */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => onLogin?.()}
                        >
                            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
                            <Text style={styles.loginLinkText}>Se Connecter</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* TOASTER DE SUCCÈS (Message en haut) */}
            {toastVisible && (
                <View style={styles.toastContainer}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.toastGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.toastTitle}>Inscription réussie !</Text>
                            <Text style={styles.toastMessage}>Redirection vers la connexion...</Text>
                        </View>
                    </LinearGradient>
                </View>
            )}

            {/* MODALE OTP (Vérification Email) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={otpModalVisible}
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
                        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                            <View style={[styles.modalIconContainer, { backgroundColor: darkMode ? '#1F2937' : '#EFF6FF' }]}>
                                <Ionicons name="mail-open" size={36} color={theme.primary} />
                            </View>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Vérification Email</Text>
                            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                                Saisissez le code de validation envoyé à{"\n"}
                                <Text style={{ fontWeight: 'bold', color: theme.text }}>{formData.email}</Text>
                            </Text>
                            <View style={styles.otpInputContainer}>
                                <TextInput
                                    style={[
                                        styles.otpInput,
                                        { backgroundColor: darkMode ? '#1F2937' : '#F8FAFC', color: theme.text, borderColor: theme.border },
                                        isOtpFocused && { borderColor: theme.primary }
                                    ]}
                                    placeholder="000000"
                                    placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E1'}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    onFocus={() => setIsOtpFocused(true)}
                                    onBlur={() => setIsOtpFocused(false)}
                                    autoFocus={true}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={handleVerifyOTP}
                                disabled={verifying}
                            >
                                <LinearGradient
                                    colors={theme.gradientPrimary}
                                    style={styles.verifyButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {verifying ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.verifyButtonText}>Vérifier le compte</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.resendButton}
                                onPress={handleResendOTP}
                                disabled={verifying}
                            >
                                <Text style={[styles.resendButtonText, { color: theme.primary }]}>Renvoyer le code</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalCloseButton, { backgroundColor: darkMode ? '#374151' : '#F3F4F6', borderRadius: 12, paddingHorizontal: 20 }]}
                                onPress={() => setOtpModalVisible(false)}
                                disabled={verifying}
                            >
                                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}