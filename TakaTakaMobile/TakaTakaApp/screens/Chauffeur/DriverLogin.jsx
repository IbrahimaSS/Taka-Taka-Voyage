import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
    StatusBar,
    Platform,
    SafeAreaView,
    ScrollView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './DriverLogin.styles';

const { width, height } = Dimensions.get('window');

export default function DriverLogin({ navigation, onBack }) {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!credentials.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!credentials.password) {
            newErrors.password = 'Le mot de passe est requis';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Simulation de connexion
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                "Connexion réussie !",
                "Bienvenue dans votre espace chauffeur.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setLoading(false);
                            // Ici, vous navigueriez vers l'écran principal chauffeur
                            console.log('Connecté au dashboard chauffeur');
                            onBack?.(); // Ou navigation vers dashboard
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert("Erreur", "Email ou mot de passe incorrect.");
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.prompt(
            "Mot de passe oublié",
            "Entrez votre email pour recevoir un lien de réinitialisation",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Envoyer",
                    onPress: (email) => {
                        if (email && /\S+@\S+\.\S+/.test(email)) {
                            Alert.alert("Email envoyé", "Vérifiez votre boîte mail.");
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => onBack?.()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <LinearGradient
                        colors={['#EFF6FF', '#DBEAFE']}
                        style={styles.illustration}
                    >
                        <Ionicons name="car-sport" size={80} color="#2563EB" />
                    </LinearGradient>
                    <Text style={styles.welcomeText}>Bon retour parmi nous !</Text>
                </View>

                {/* Formulaire */}
                <View style={styles.formContainer}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="votre@email.com"
                            value={credentials.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Mot de passe *</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                                placeholder="Votre mot de passe"
                                value={credentials.password}
                                onChangeText={(text) => handleInputChange('password', text)}
                                secureTextEntry={!showPassword}
                                autoComplete="password"
                            />
                            <TouchableOpacity
                                style={styles.passwordToggle}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={handleForgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#4F46E5', '#2563EB']}
                            style={styles.loginButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Se connecter</Text>
                                    <Ionicons name="log-in" size={20} color="white" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Ou continuer avec</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.socialButtonGradient}
                            >
                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                                <Text style={styles.socialButtonText}>Google</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <LinearGradient
                                colors={['#FFFFFF', '#F8FAFC']}
                                style={styles.socialButtonGradient}
                            >
                                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                <Text style={styles.socialButtonText}>Facebook</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => console.log('Redirection vers inscription')}
                    >
                        <Text style={styles.registerText}>Pas encore de compte ? </Text>
                        <Text style={styles.registerLinkText}>S'inscrire</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    En vous connectant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
                </Text>
            </View>
        </SafeAreaView>
    );
}