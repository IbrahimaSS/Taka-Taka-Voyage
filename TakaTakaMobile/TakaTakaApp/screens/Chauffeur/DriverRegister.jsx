import React, { useState, useRef, useMemo } from 'react';
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
    Image,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './DriverRegister.styles';
import { PLATFORM } from '../../constants/platform';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';
import { enqueueUpload } from '../../services/uploadQueue';
import { processQueueOnce } from '../../services/uploadQueueSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function DriverRegister({ onBack, onLogin, onSuccess }) {
    const { darkMode, theme } = useApp();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        carType: '',
        carModel: '',
        carYear: '',
        licensePlate: '',
        licenseNumber: '',
        address: '',
        otpCode: '',
        genre: 'MASCULIN',
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [registrationSent, setRegistrationSent] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [vehicleImage, setVehicleImage] = useState(null);
    const [uploadedDocs, setUploadedDocs] = useState({});

    const totalSteps = 4;
    const isProcessing = useRef(false);
    const horizontalScrollRef = useRef(null);

    const carTypes = [
        { id: 1, label: 'Voiture', value: 'car', icon: 'car-sport' },
        { id: 2, label: 'Moto', value: 'moto', icon: 'bicycle' },
        { id: 3, label: 'Taxi Partagé', value: 'taxi_partage', icon: 'people' },
        { id: 4, label: 'Minibus', value: 'minibus', icon: 'bus' },
    ];

    const [showYearPicker, setShowYearPicker] = useState(false);

    const yearsList = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= 1990; y--) {
            years.push(y.toString());
        }
        return years;
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const pickProfileImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions requises", "Nous avons besoin d'accéder à votre galerie.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const pickVehicleImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions requises", "Nous avons besoin d'accéder à votre galerie.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) setVehicleImage(result.assets[0].uri);
    };

    const pickDocumentImage = async (docId) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permissions requises", "Nous avons besoin d'accéder à votre galerie.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) {
            setUploadedDocs(prev => ({ ...prev, [docId]: result.assets[0].uri }));
            if (errors[docId]) {
                setErrors(prev => ({ ...prev, [docId]: '' }));
            }
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est requis';
        if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
        if (!formData.email.trim()) newErrors.email = "L'email est requis";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
        if (!formData.password) newErrors.password = 'Le mot de passe est requis';
        else if (formData.password.length < 8) newErrors.password = 'Minimum 8 caractères';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2OTP = () => {
        const code = (formData.otpCode || '').trim();
        if (code.length > 0 && code.length !== 6) {
            setErrors({ otpCode: 'Le code doit contenir 6 chiffres' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateStep3 = () => {
        const newErrors = {};
        if (!formData.carType) newErrors.carType = 'Le type de véhicule est requis';
        if (!formData.carModel.trim()) newErrors.carModel = 'Le modèle est requis';
        if (!formData.carYear.trim()) newErrors.carYear = "L'année est requise";
        if (!formData.licensePlate.trim()) newErrors.licensePlate = "La plaque d'immatriculation est requise";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep4 = () => {
        const newErrors = {};
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Le numéro de permis est requis';
        // Vérifier que chaque document est uploadé
        PLATFORM.driverDocuments.forEach(doc => {
            if (!uploadedDocs[doc.id]) {
                newErrors[doc.id] = `${doc.label} est requis`;
            }
        });
        if (!formData.address.trim()) newErrors.address = "L'adresse est requise";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            const missingDocs = PLATFORM.driverDocuments.filter(d => !uploadedDocs[d.id]);
            if (missingDocs.length > 0) {
                Alert.alert('Documents manquants', `Veuillez uploader : ${missingDocs.map(d => d.label).join(', ')}`);
            }
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (loading || isProcessing.current) return;
        
        if (currentStep === 1) {
            if (!validateStep1()) return;
            setLoading(true);
            isProcessing.current = true;
            try {
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
                        typeProfil: 'CHAUFFEUR',
                        genre: formData.genre
                    }
                });

                if (res.succes) {
                    setCurrentStep(2);
                    horizontalScrollRef.current?.scrollTo({ x: width, animated: true });
                } else {
                    const isCooldown = res.error && res.error.includes("patienter");
                    if (isCooldown) {
                        Alert.alert(
                            "Code déjà envoyé",
                            "Le serveur a déjà envoyé un code récemment.\n\n1. Vérifiez l'onglet PRINCIPAL de votre Gmail (pas uniquement Promotions).\n2. Vérifiez vos SPAMS.\n3. Si rien n'est reçu, attendez la fin du décompte : " + res.error,
                            [
                                { text: "Attendre", style: "cancel" },
                                { 
                                    text: "Saisir le code", 
                                    onPress: () => {
                                        setCurrentStep(2);
                                        horizontalScrollRef.current?.scrollTo({ x: width, animated: true });
                                    } 
                                }
                            ]
                        );
                    } else {
                        Alert.alert("Erreur", res.error || res.message || "Impossible d'initier l'inscription");
                    }
                }
            } catch (err) {
                Alert.alert("Erreur", err.message);
            } finally {
                setLoading(false);
                isProcessing.current = false;
            }
            return;
        }

        if (currentStep === 2) {
            if (!validateStep2OTP()) return;
            setLoading(true);
            try {
                const cleanPhone = formData.phone.replace(/\D/g, '');
                const finalPhone = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;
                const res = await apiClient('/auth/verifier-otp', {
                    method: 'POST',
                    body: {
                        telephone: finalPhone,
                        code: formData.otpCode
                    }
                });

                if (res.succes) {
                    setCurrentStep(3);
                    horizontalScrollRef.current?.scrollTo({ x: width * 2, animated: true });
                } else {
                    Alert.alert("Erreur", res.message || "Code invalide");
                }
            } catch (err) {
                Alert.alert("Erreur", err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        let isValid = false;
        if (currentStep === 3) isValid = validateStep3();
        else if (currentStep === 4) isValid = validateStep4();

        if (isValid) {
            if (currentStep < totalSteps) {
                setCurrentStep(prev => prev + 1);
                horizontalScrollRef.current?.scrollTo({
                    x: width * currentStep,
                    animated: true
                });
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            horizontalScrollRef.current?.scrollTo({
                x: width * (currentStep - 2),
                animated: true
            });
        } else {
            onBack?.();
        }
    };

    const handleResendOTP = () => {
        setOtpSent(true);
        Alert.alert('Code envoyé', 'Un nouveau code a été envoyé à ' + formData.email);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const cleanPhone = formData.phone.replace(/\D/g, '');
            const finalPhone = cleanPhone.length > 9 ? cleanPhone.slice(-9) : cleanPhone;
            
            // 1. Finaliser inscription (Création Utilisateur)
            const resFinal = await apiClient('/auth/finaliser-inscription', {
                method: 'POST',
                body: { telephone: finalPhone }
            });

            if (!resFinal.succes) {
                throw new Error(resFinal.message || "Erreur lors de la finalisation.");
            }

            // 2. Connexion pour obtenir le token (nécessaire pour les documents/véhicule)
            const resLogin = await apiClient('/auth/connexion', {
                method: 'POST',
                body: {
                    identifiant: cleanPhone,
                    motDePasse: formData.password
                }
            });

            if (!resLogin.succes || !resLogin.token) {
                throw new Error(resLogin.message || "Erreur de connexion après inscription.");
            }

            // Sauvegarder pour apiClient
            await AsyncStorage.setItem('authToken', resLogin.token);
            await AsyncStorage.setItem('user', JSON.stringify(resLogin.utilisateur));

            // 3. Mise à jour véhicule
            await apiClient('/chauffeur/vehicule', {
                method: 'PUT',
                body: {
                    typeVehicule: formData.carType,
                    marque: formData.carModel,
                    modele: formData.carModel,
                    plaque: formData.licensePlate,
                    annee: formData.carYear
                }
            });

            // 4. Mise en file d'attente des documents (envoi résilient hors-ligne)
            //
            // Chaque document est mis en file séparément plutôt qu'envoyé en un seul
            // FormData combiné : si la connexion est instable, un document qui échoue
            // n'empêche pas les autres de partir, et chacun est retenté indépendamment
            // (voir services/uploadQueue.js et uploadQueueSync.js). Cette étape ne fait
            // qu'écrire localement — quasi instantanée, l'inscription peut se terminer
            // même hors ligne, les documents partiront dès que la connexion reviendra.
            const documentsAEnvoyer = [
                vehicleImage && { fileFieldName: 'photo', uri: vehicleImage, name: 'vehicle.jpg' },
                uploadedDocs['license'] && { fileFieldName: 'license', uri: uploadedDocs['license'], name: 'license.jpg' },
                uploadedDocs['piece_identite'] && { fileFieldName: 'idCard', uri: uploadedDocs['piece_identite'], name: 'idcard.jpg' },
                uploadedDocs['carte_grise'] && { fileFieldName: 'carRegistration', uri: uploadedDocs['carte_grise'], name: 'carte_grise.jpg' },
                uploadedDocs['assurance'] && { fileFieldName: 'insurance', uri: uploadedDocs['assurance'], name: 'assurance.jpg' },
            ].filter(Boolean);

            for (const doc of documentsAEnvoyer) {
                // On garde l'URI complète (avec "file://") pour la copie locale — le
                // retrait du préfixe pour iOS se fait plus tard, juste avant l'envoi
                // réseau (voir uploadQueueSync.js), pas ici.
                await enqueueUpload({
                    localUri: doc.uri,
                    endpoint: '/chauffeur/documents',
                    method: 'POST',
                    fileFieldName: doc.fileFieldName,
                    fileName: doc.name,
                    mimeType: 'image/jpeg',
                });
            }

            // Tentative d'envoi immédiate de toute la file (pas seulement ces documents),
            // sans bloquer l'écran : si la connexion est là, tout part tout de suite au
            // lieu d'attendre un futur changement d'état réseau ou un redémarrage de l'app.
            processQueueOnce();

            // Une fois terminé, on appelle onSuccess pour aller sur la page d'attente
            if (onSuccess) onSuccess();
            else setRegistrationSent(true);
        } catch (error) {
            Alert.alert("Erreur", error.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    const handleValidationSuccess = () => {
        if (onLogin) onLogin();
    };
    const renderStepIndicator = () => {
        return (
            <View style={styles.stepIndicator}>
                {[1, 2, 3, 4].map((step) => (
                    <View key={step} style={styles.stepContainer}>
                        <LinearGradient
                            colors={currentStep >= step ? ['#2563EB', '#3B82F6'] : [darkMode ? '#374151' : '#E2E8F0', darkMode ? '#1F2937' : '#F1F5F9']}
                            style={[styles.stepCircle, currentStep > step && styles.stepCompleted]}
                        >
                            {currentStep > step ? (
                                <Ionicons name="checkmark" size={20} color="white" />
                            ) : (
                                <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>
                                    {step}
                                </Text>
                            )}
                        </LinearGradient>
                        <Text style={[styles.stepLabel, currentStep >= step && { color: theme.text, fontWeight: '700' }]}>
                            {step === 1 ? 'Compte' : step === 2 ? 'OTP' : step === 3 ? 'Véhicule' : 'Documents'}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderStep1 = () => (
        <ScrollView
            style={styles.stepScrollView}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Photo de profil */}
            <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={pickProfileImage} activeOpacity={0.8} style={styles.avatarWrapper}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.profileImagePlaceholder, { borderColor: theme.primary, backgroundColor: darkMode ? '#1F2937' : '#EFF6FF' }]}>
                            <Ionicons name="camera" size={36} color={theme.primary} />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={[styles.profileImageText, { color: theme.textSecondary, marginTop: 14 }]}>Ajouter une photo</Text>
            </View>

            {/* Card formulaire */}
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Nom complet <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'fullName' && styles.inputFocused, errors.fullName && styles.inputError]}
                        placeholder="Votre nom complet"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.fullName}
                        onChangeText={(text) => handleInputChange('fullName', text)}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="next"
                    />
                    {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Téléphone <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'phone' && styles.inputFocused, errors.phone && styles.inputError]}
                        placeholder="+224 00 00 00 00"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.phone}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="phone-pad"
                        returnKeyType="next"
                    />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Email <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'email' && styles.inputFocused, errors.email && styles.inputError]}
                        placeholder="votre@email.com"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.email}
                        onChangeText={(text) => handleInputChange('email', text)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Genre */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Genre <Text style={{ color: '#EF4444' }}>*</Text></Text>
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

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Mot de passe <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'password' && styles.inputFocused, errors.password && styles.inputError]}
                        placeholder="Minimum 6 caractères"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.password}
                        onChangeText={(text) => handleInputChange('password', text)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        returnKeyType="next"
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Confirmer le mot de passe <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'confirmPassword' && styles.inputFocused, errors.confirmPassword && styles.inputError]}
                        placeholder="Retapez votre mot de passe"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.confirmPassword}
                        onChangeText={(text) => handleInputChange('confirmPassword', text)}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        returnKeyType="done"
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                {/* BOUTON CONTINUER */}
                <TouchableOpacity
                    style={styles.nextStepButton}
                    onPress={handleNext}
                >
                    <LinearGradient
                        colors={theme.gradientPrimary}
                        style={styles.nextStepButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.nextStepButtonText}>Continuer</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.stepSpacer} />
        </ScrollView>
    );

    const renderStep2OTP = () => (
        <ScrollView
            style={styles.stepScrollView}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.otpIconContainer, { backgroundColor: darkMode ? '#1F2937' : '#EFF6FF' }]}>
                    <Ionicons name="mail-open" size={36} color={theme.primary} />
                </View>
                <Text style={[styles.otpTitle, { color: theme.text }]}>Vérification Email</Text>
                <Text style={[styles.otpSubtitle, { color: theme.textSecondary }]}>
                    Code envoyé à <Text style={{ fontWeight: 'bold', color: theme.text }}>{formData.email || 'votre email'}</Text>
                </Text>

                <View style={styles.formGroup}>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border, textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: 'bold' }, focusedField === 'otpCode' && styles.inputFocused, errors.otpCode && styles.inputError]}
                        placeholder="000000"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.otpCode}
                        onChangeText={(text) => handleInputChange('otpCode', text.replace(/\D/g, '').slice(0, 6))}
                        onFocus={() => setFocusedField('otpCode')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    {errors.otpCode && <Text style={styles.errorText}>{errors.otpCode}</Text>}
                </View>

                <TouchableOpacity onPress={handleResendOTP} style={{ alignSelf: 'center', marginBottom: 20 }}>
                    <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 14 }}>Renvoyer le code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextStepButton} onPress={handleNext}>
                    <LinearGradient colors={theme.gradientPrimary} style={styles.nextStepButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={styles.nextStepButtonText}>Continuer</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <View style={styles.stepSpacer} />
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView
            style={styles.stepScrollView}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Type de véhicule <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <View style={styles.carTypeGrid}>
                        {carTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.carTypeButton,
                                    { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border },
                                    formData.carType === type.value && [styles.carTypeButtonActive, { backgroundColor: darkMode ? '#1E3A8A' : '#EFF6FF', borderColor: theme.primary }]
                                ]}
                                onPress={() => handleInputChange('carType', type.value)}
                            >
                                <Ionicons
                                    name={type.icon}
                                    size={24}
                                    color={formData.carType === type.value ? theme.primary : theme.textSecondary}
                                />
                                <Text style={[
                                    styles.carTypeLabel,
                                    { color: theme.textSecondary },
                                    formData.carType === type.value && [styles.carTypeLabelActive, { color: theme.primary }]
                                ]}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.carType && <Text style={styles.errorText}>{errors.carType}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Modèle du véhicule <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'carModel' && styles.inputFocused, errors.carModel && styles.inputError]}
                        placeholder="Ex: Toyota Corolla"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.carModel}
                        onChangeText={(text) => handleInputChange('carModel', text)}
                        onFocus={() => setFocusedField('carModel')}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="next"
                    />
                    {errors.carModel && <Text style={styles.errorText}>{errors.carModel}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Année du véhicule <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TextInput
                            style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border, flex: 1 }, focusedField === 'carYear' && styles.inputFocused, errors.carYear && styles.inputError]}
                            placeholder="Ex: 2020"
                            placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                            value={formData.carYear}
                            onChangeText={(text) => handleInputChange('carYear', text)}
                            onFocus={() => setFocusedField('carYear')}
                            onBlur={() => setFocusedField(null)}
                            keyboardType="numeric"
                            returnKeyType="next"
                        />
                        <TouchableOpacity
                            style={[styles.yearPickerButton, { backgroundColor: darkMode ? '#1F2937' : '#EFF6FF', borderColor: theme.primary }]}
                            onPress={() => setShowYearPicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={22} color={theme.primary} />
                            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600', marginTop: 2 }}>Choisir</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.carYear && <Text style={styles.errorText}>{errors.carYear}</Text>}
                </View>

                {/* Modal Year Picker */}
                <Modal visible={showYearPicker} transparent animationType="slide">
                    <View style={styles.yearPickerOverlay}>
                        <View style={[styles.yearPickerContainer, { backgroundColor: theme.card }]}>
                            <View style={styles.yearPickerHeader}>
                                <Text style={[styles.yearPickerTitle, { color: theme.text }]}>Sélectionner l'année</Text>
                                <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                                    <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={yearsList}
                                keyExtractor={(item) => item}
                                numColumns={4}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.yearPickerItem,
                                            { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderColor: theme.border },
                                            formData.carYear === item && { backgroundColor: theme.primary, borderColor: theme.primary },
                                        ]}
                                        onPress={() => {
                                            handleInputChange('carYear', item);
                                            setShowYearPicker(false);
                                        }}
                                    >
                                        <Text style={[
                                            { fontSize: 15, fontWeight: '600', color: theme.text },
                                            formData.carYear === item && { color: '#FFFFFF' },
                                        ]}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Plaque d'immatriculation <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'licensePlate' && styles.inputFocused, errors.licensePlate && styles.inputError]}
                        placeholder="Ex: AB-123-CD"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.licensePlate}
                        onChangeText={(text) => handleInputChange('licensePlate', text)}
                        onFocus={() => setFocusedField('licensePlate')}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="next"
                    />
                    {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate}</Text>}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Photo du véhicule</Text>
                    <TouchableOpacity
                        style={[styles.vehicleUploadZone, { borderColor: vehicleImage ? theme.primary : theme.border, backgroundColor: darkMode ? '#1F2937' : '#F9FAFB' }]}
                        onPress={pickVehicleImage}
                        activeOpacity={0.7}
                    >
                        {vehicleImage ? (
                            <Image source={{ uri: vehicleImage }} style={styles.vehicleImagePreview} />
                        ) : (
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <Ionicons name="camera-outline" size={40} color={theme.textSecondary} />
                                <Text style={[styles.imageUploadText, { color: theme.text, marginTop: 8 }]}>Ajouter une photo</Text>
                                <Text style={[styles.imageUploadHint, { color: theme.textSecondary }]}>Face avant visible</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* BOUTONS NAVIGATION */}
                <View style={styles.stepNavigation}>
                    <TouchableOpacity
                        style={[styles.backButtonStep, { backgroundColor: darkMode ? '#1F2937' : '#F1F5F9' }]}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.primary} />
                        <Text style={[styles.backButtonText, { color: theme.primary }]}>Retour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.nextStepButton}
                        onPress={handleNext}
                    >
                        <LinearGradient
                            colors={theme.gradientPrimary}
                            style={styles.nextStepButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.nextStepButtonText}>Continuer</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.stepSpacer} />
        </ScrollView>
    );

    const renderStep4 = () => (
        <ScrollView
            style={styles.stepScrollView}
            contentContainerStyle={styles.stepContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Numéro de permis de conduire <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'licenseNumber' && styles.inputFocused, errors.licenseNumber && styles.inputError]}
                        placeholder="Numéro sur votre permis"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.licenseNumber}
                        onChangeText={(text) => handleInputChange('licenseNumber', text)}
                        onFocus={() => setFocusedField('licenseNumber')}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="next"
                    />
                    {errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
                </View>

                {/* Documents en grille 2x2 */}
                <Text style={[styles.label, { color: theme.textSecondary, marginBottom: 12 }]}>Documents requis <Text style={{ color: '#EF4444' }}>*</Text></Text>
                <View style={styles.documentsGrid}>
                    {PLATFORM.driverDocuments.map((doc) => (
                        <TouchableOpacity
                            key={doc.id}
                            style={[styles.documentGridItem, errors[doc.id] && { borderWidth: 2, borderColor: '#EF4444' }]}
                            onPress={() => pickDocumentImage(doc.id)}
                            activeOpacity={0.7}
                        >
                            {uploadedDocs[doc.id] ? (
                                <View style={styles.documentGridUploaded}>
                                    <Image source={{ uri: uploadedDocs[doc.id] }} style={styles.documentGridImage} />
                                    <View style={styles.documentGridOverlay}>
                                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                        <Text style={styles.documentGridUploadedLabel}>{doc.label}</Text>
                                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Modifier</Text>
                                    </View>
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={darkMode ? ['#1F2937', '#111827'] : ['#FEF3C7', '#FDE68A']}
                                    style={[styles.documentGridGradient, { borderColor: errors[doc.id] ? '#EF4444' : theme.border }]}
                                >
                                    <Ionicons name={doc.icon} size={28} color={darkMode ? theme.primary : "#D97706"} />
                                    <Text style={[styles.documentGridLabel, { color: theme.text }]}>{doc.label}</Text>
                                    <Text style={{ fontSize: 11, color: errors[doc.id] ? '#EF4444' : theme.textSecondary, marginTop: 2 }}>
                                        {errors[doc.id] ? 'Requis !' : 'Ajouter'}
                                    </Text>
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>Adresse complète <Text style={{ color: '#EF4444' }}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', color: theme.text, borderColor: theme.border }, focusedField === 'address' && styles.inputFocused, errors.address && styles.inputError]}
                        placeholder="Votre adresse de résidence"
                        placeholderTextColor={darkMode ? '#4A5568' : '#CBD5E0'}
                        value={formData.address}
                        onChangeText={(text) => handleInputChange('address', text)}
                        onFocus={() => setFocusedField('address')}
                        onBlur={() => setFocusedField(null)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        returnKeyType="done"
                    />
                    {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                </View>

                <View style={[styles.termsContainer, { backgroundColor: darkMode ? '#1F2937' : '#F0FDF4' }]}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.success} />
                    <Text style={[styles.termsText, { color: darkMode ? theme.textSecondary : '#065F46' }]}>
                        En vous inscrivant, vous acceptez nos{' '}
                        <Text style={[styles.termsLink, { color: theme.primary }]}>Conditions d'utilisation</Text> et notre{' '}
                        <Text style={[styles.termsLink, { color: theme.primary }]}>Politique de confidentialité</Text>.
                    </Text>
                </View>

                {/* BOUTONS NAVIGATION ÉTAPE 3 */}
                <View style={styles.stepNavigation}>
                    <TouchableOpacity
                        style={styles.backButtonStep}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={20} color="#2563EB" />
                        <Text style={styles.backButtonText}>Retour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.finalSubmitButton}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#10B981', '#34D399']}
                            style={styles.finalSubmitButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Text style={styles.finalSubmitButtonText}>Terminer l'inscription</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </View>

            {/* LIEN "DÉJÀ UN COMPTE" */}
            <TouchableOpacity
                style={[styles.loginLinkContainer, { borderTopColor: theme.border }]}
                onPress={() => onLogin?.()}
            >
                <Text style={[styles.loginLinkText, { color: theme.textSecondary }]}>
                    Vous avez déjà un compte ? <Text style={[styles.loginLinkBold, { color: theme.primary }]}>Se connecter</Text>
                </Text>
            </TouchableOpacity>

            <View style={styles.stepSpacer} />
        </ScrollView>
    );

    if (registrationSent) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
                <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
                <LinearGradient
                    colors={['#1E293B', '#334155']}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <View style={[styles.stepCircle, { width: 80, height: 80, borderRadius: 40, marginBottom: 24 }]}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                    <Text style={[styles.stepTitle, { color: '#FFF', textAlign: 'center', marginBottom: 12 }]}>
                        Dossier en cours d'examen
                    </Text>
                    <Text style={[styles.stepDescription, { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 32 }]}>
                        Votre compte est en cours de vérification. Vous serez notifié en temps réel dès qu'un administrateur aura validé votre dossier.
                    </Text>
                    <TouchableOpacity
                        onPress={handleValidationSuccess}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                    >
                        <Text style={{ color: '#FFF', fontWeight: '600' }}>Simuler la validation (démo)</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <Modal visible={showSuccessModal} transparent animationType="fade">
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}>
                            <Ionicons name="checkmark-circle" size={64} color={theme.success} style={{ marginBottom: 16 }} />
                            <Text style={[styles.stepTitle, { color: theme.text, marginBottom: 8 }]}>Compte validé !</Text>
                            <Text style={[styles.stepDescription, { color: theme.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                                Vous pouvez maintenant vous connecter et commencer à recevoir des courses.
                            </Text>
                            <TouchableOpacity
                                onPress={() => { setShowSuccessModal(false); onLogin?.(); }}
                                style={{ width: '100%' }}
                            >
                                <LinearGradient
                                    colors={theme.gradientPrimary}
                                    style={{ paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Se connecter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="#10B981" />

            {/* Header avec fond professionnel */}
            <LinearGradient
                colors={theme.gradientPrimary}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 4,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.5)',
                        overflow: 'hidden'
                    }}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{ width: 32, height: 32, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                <View style={styles.headerProgress}>
                    <Text style={styles.headerProgressText}>{currentStep}/{totalSteps}</Text>
                </View>
            </LinearGradient>

            <View style={[styles.stepIndicatorWrapper, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                {renderStepIndicator()}
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={horizontalScrollRef}
                    horizontal
                    pagingEnabled
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScrollView}
                >
                    <View style={styles.stepPage}>{renderStep1()}</View>
                    <View style={styles.stepPage}>{renderStep2OTP()}</View>
                    <View style={styles.stepPage}>{renderStep3()}</View>
                    <View style={styles.stepPage}>{renderStep4()}</View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}