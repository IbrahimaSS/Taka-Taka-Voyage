import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../App.styles';
import { SCREENS } from '../../constants/screens';

const { width } = Dimensions.get('window');

export default function ContactScreen({ setCurrentScreen }) {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        sujet: '',
        message: '',
    });

    const [loading, setLoading] = useState(false);

    // Fonction pour appeler un numéro
    const handleCall = (phoneNumber) => {
        const url = `tel:${phoneNumber.replace(/\s/g, '')}`;
        Linking.openURL(url).catch(err => {
            Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
            console.error('Erreur lors de l\'appel:', err);
        });
    };

    // Fonction pour envoyer un email
    const handleEmail = (emailAddress) => {
        const url = `mailto:${emailAddress}`;
        Linking.openURL(url).catch(err => {
            Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
            console.error('Erreur lors de l\'ouverture email:', err);
        });
    };

    // Fonction pour ouvrir l'adresse dans Google Maps
    const handleOpenMap = (address) => {
        const encodedAddress = encodeURIComponent(address);
        const url = Platform.select({
            ios: `maps:0,0?q=${encodedAddress}`,
            android: `geo:0,0?q=${encodedAddress}`,
        });
        
        Linking.openURL(url).catch(err => {
            // Fallback vers Google Maps web
            const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            Linking.openURL(webUrl).catch(err2 => {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de cartes');
            });
        });
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSubmit = async () => {
        if (!formData.nom || !formData.email || !formData.sujet || !formData.message) {
            Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
            return;
        }

        setLoading(true);

        try {
            // Ici, vous pourriez envoyer les données à votre backend
            // Pour l'instant, simulation d'envoi
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            Alert.alert(
                'Message envoyé !',
                'Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setFormData({
                                nom: '',
                                email: '',
                                sujet: '',
                                message: '',
                            });
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const contactMethods = [
        {
            id: 1,
            icon: 'call',
            title: 'Téléphone',
            details: ['+224 621 45 67 89', '+224 622 34 56 78'],
            color: '#3B82F6',
            action: (detail) => handleCall(detail),
            actionLabel: 'Appeler'
        },
        {
            id: 2,
            icon: 'mail',
            title: 'Email',
            details: ['contact@takataka.gn', 'support@takataka.gn'],
            color: '#10B981',
            action: (detail) => handleEmail(detail),
            actionLabel: 'Envoyer un email'
        },
        {
            id: 3,
            icon: 'location',
            title: 'Adresse',
            details: ['Conakry, Kaloum', 'Immeuble Alpha 2000, 3ème étage'],
            color: '#F59E0B',
            action: (detail) => handleOpenMap(detail),
            actionLabel: 'Voir sur la carte'
        },
        {
            id: 4,
            icon: 'time',
            title: 'Horaires',
            details: ['Lundi - Vendredi: 8h-18h', 'Samedi: 9h-13h', 'Urgences: 24/7'],
            color: '#8B5CF6',
            action: null,
            actionLabel: null
        },
    ];

    const faqs = [
        {
            question: 'Comment devenir chauffeur Taka Taka ?',
            answer: 'Téléchargez l\'application, remplissez le formulaire d\'inscription et passez notre processus de vérification.',
        },
        {
            question: 'Comment fonctionne le paiement ?',
            answer: 'Plusieurs méthodes : Orange Money, MTN Mobile Money, espèces, ou carte bancaire.',
        },
        {
            question: 'Que faire en cas de problème pendant un trajet ?',
            answer: 'Utilisez le bouton d\'urgence dans l\'app ou appelez notre support 24/7.',
        },
        {
            question: 'Comment annuler une réservation ?',
            answer: 'Annulez directement dans l\'application. Consultez notre politique d\'annulation pour les frais éventuels.',
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.featuresHeader}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => setCurrentScreen(SCREENS.HOME)}
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.featuresTitle}>Contactez-nous</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.featuresScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Hero Section */}
                    <View style={[styles.heroSectionFeatures, { 
                        paddingVertical: 40,
                        backgroundColor: '#075dd6ae' 
                    }]}>
                        <Ionicons name="chatbubble-ellipses" size={60} color="#FFFFFF" style={{ marginBottom: 16 }} />
                        <Text style={[styles.heroTitleFeatures, { marginBottom: 12 }]}>
                            Nous sommes là pour vous aider
                        </Text>
                        <Text style={[styles.heroSubtitleFeatures, { maxWidth: width * 0.8 }]}>
                            Une question, un problème ou une suggestion ? Contactez notre équipe
                        </Text>
                    </View>

                    {/* Formulaire de Contact */}
                    <View style={[
                        styles.sectionContainer, 
                        { 
                            backgroundColor: '#FFFFFF',
                            marginHorizontal: 20,
                            borderRadius: 20,
                            marginTop: 10,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }
                    ]}>
                        <Text style={[
                            styles.sectionTitleFeatures, 
                            { 
                                fontSize: 22,
                                marginBottom: 8,
                                textAlign: 'left',
                                alignSelf: 'flex-start'
                            }
                        ]}>
                            Envoyez-nous un message
                        </Text>
                        
                        <Text style={[
                            styles.sectionDescription,
                            { 
                                textAlign: 'left',
                                alignSelf: 'flex-start',
                                marginBottom: 24
                            }
                        ]}>
                            Notre équipe vous répondra dans les plus brefs délais
                        </Text>

                        {/* Formulaire */}
                        <View style={{ marginBottom: 30 }}>
                            {/* Nom */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                }}>
                                    Nom complet *
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: '#1F2937',
                                    }}
                                    placeholder="Votre nom"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.nom}
                                    onChangeText={(text) => handleInputChange('nom', text)}
                                />
                            </View>

                            {/* Email */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                }}>
                                    Adresse email *
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: '#1F2937',
                                    }}
                                    placeholder="votre@email.com"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                />
                            </View>

                            {/* Sujet */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                }}>
                                    Sujet *
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: '#1F2937',
                                    }}
                                    placeholder="De quoi souhaitez-vous parler ?"
                                    placeholderTextColor="#9CA3AF"
                                    value={formData.sujet}
                                    onChangeText={(text) => handleInputChange('sujet', text)}
                                />
                            </View>

                            {/* Message */}
                            <View style={{ marginBottom: 30 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: 8,
                                }}>
                                    Votre message *
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        fontSize: 16,
                                        color: '#1F2937',
                                        height: 150,
                                        textAlignVertical: 'top',
                                    }}
                                    placeholder="Décrivez-nous votre demande en détail..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline={true}
                                    numberOfLines={6}
                                    value={formData.message}
                                    onChangeText={(text) => handleInputChange('message', text)}
                                />
                            </View>

                            {/* Bouton Envoyer */}
                            <TouchableOpacity
                                style={{
                                    backgroundColor: loading ? '#9CA3AF' : '#075dd6ae',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 4,
                                }}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Ionicons name="time" size={20} color="#FFFFFF" />
                                        <Text style={{
                                            color: '#FFFFFF',
                                            fontSize: 16,
                                            fontWeight: '600',
                                            marginLeft: 10,
                                        }}>
                                            Envoi en cours...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="send" size={20} color="#FFFFFF" />
                                        <Text style={{
                                            color: '#FFFFFF',
                                            fontSize: 16,
                                            fontWeight: '600',
                                            marginLeft: 10,
                                        }}>
                                            Envoyer le message
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Note */}
                        <View style={{
                            backgroundColor: '#F0F9FF',
                            padding: 16,
                            borderRadius: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: '#3B82F6',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                                <Text style={{ 
                                    fontSize: 14, 
                                    color: '#1E40AF',
                                    flex: 1,
                                    lineHeight: 20
                                }}>
                                    Tous les champs marqués d'un * sont obligatoires. Nous nous engageons à répondre dans un délai de 24h.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Méthodes de Contact */}
                    <View style={[
                        styles.sectionContainer, 
                        { 
                            backgroundColor: '#FFFFFF',
                            marginHorizontal: 20,
                            borderRadius: 20,
                            marginTop: 20,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }
                    ]}>
                        <Text style={[
                            styles.sectionTitleFeatures, 
                            { 
                                fontSize: 22,
                                marginBottom: 8,
                                textAlign: 'left',
                                alignSelf: 'flex-start'
                            }
                        ]}>
                            Autres moyens de nous contacter
                        </Text>
                        
                        <Text style={[
                            styles.sectionDescription,
                            { 
                                textAlign: 'left',
                                alignSelf: 'flex-start',
                                marginBottom: 24
                            }
                        ]}>
                            Choisissez la méthode qui vous convient le mieux
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                        }}>
                            {contactMethods.map((method) => (
                                <View key={method.id} style={{
                                    width: (width - 88) / 2,
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}>
                                    <View style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        backgroundColor: `${method.color}15`,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}>
                                        <Ionicons name={method.icon} size={24} color={method.color} />
                                    </View>
                                    
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: '600',
                                        color: '#1F2937',
                                        marginBottom: 8,
                                    }}>
                                        {method.title}
                                    </Text>
                                    
                                    {method.details.map((detail, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => method.action && method.action(detail)}
                                            disabled={!method.action}
                                            activeOpacity={method.action ? 0.7 : 1}
                                        >
                                            <Text style={{
                                                fontSize: 14,
                                                color: method.action ? method.color : '#6B7280',
                                                lineHeight: 20,
                                                marginBottom: 4,
                                                textDecorationLine: method.action ? 'underline' : 'none',
                                            }}>
                                                {detail}
                                                {method.action && (
                                                    <Ionicons 
                                                        name="arrow-forward-circle" 
                                                        size={14} 
                                                        color={method.color} 
                                                        style={{ marginLeft: 4 }}
                                                    />
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                    
                                    {method.actionLabel && method.action && (
                                        <TouchableOpacity
                                            style={{
                                                marginTop: 8,
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                backgroundColor: `${method.color}15`,
                                                borderRadius: 8,
                                                alignSelf: 'flex-start',
                                            }}
                                            onPress={() => method.action(method.details[0])}
                                        >
                                            <Text style={{
                                                fontSize: 12,
                                                color: method.color,
                                                fontWeight: '600',
                                            }}>
                                                {method.actionLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* FAQ */}
                    <View style={[
                        styles.sectionContainer, 
                        { 
                            backgroundColor: '#FFFFFF',
                            marginHorizontal: 20,
                            borderRadius: 20,
                            marginTop: 20,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                            marginBottom: 30,
                        }
                    ]}>
                        <Text style={[
                            styles.sectionTitleFeatures, 
                            { 
                                fontSize: 22,
                                marginBottom: 8,
                                textAlign: 'left',
                                alignSelf: 'flex-start'
                            }
                        ]}>
                            Questions fréquentes
                        </Text>
                        
                        <Text style={[
                            styles.sectionDescription,
                            { 
                                textAlign: 'left',
                                alignSelf: 'flex-start',
                                marginBottom: 24
                            }
                        ]}>
                            Vous avez peut-être déjà la réponse
                        </Text>

                        <View style={styles.avantagesContainer}>
                            {faqs.map((faq, index) => (
                                <View key={index} style={{
                                    backgroundColor: '#F9FAFB',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    marginBottom: 16,
                                    padding: 16,
                                    borderRadius: 12,
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                        <Ionicons name="help-circle" size={20} color="#075dd6ae" style={{ marginRight: 12, marginTop: 2 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: '600',
                                                color: '#1F2937',
                                                marginBottom: 8,
                                            }}>
                                                {faq.question}
                                            </Text>
                                            
                                            <Text style={{
                                                fontSize: 14,
                                                color: '#6B7280',
                                                lineHeight: 20,
                                            }}>
                                                {faq.answer}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#F3F4F6',
                                paddingVertical: 14,
                                paddingHorizontal: 20,
                                borderRadius: 12,
                                marginTop: 16,
                            }}
                            onPress={() => Alert.alert('FAQ Complète', 'Redirection vers la page FAQ complète')}
                        >
                            <Text style={{
                                color: '#075dd6ae',
                                fontSize: 16,
                                fontWeight: '600',
                                marginRight: 8,
                            }}>
                                Voir toutes les questions
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#075dd6ae" />
                        </TouchableOpacity>
                    </View>

                    {/* Section Appel d'urgence */}
                    <View style={[
                        styles.ctaContainer, 
                        { 
                            marginTop: 10,
                            marginBottom: 30,
                            paddingVertical: 32,
                            paddingHorizontal: 24,
                            backgroundColor: '#075dd6ae',
                        }
                    ]}>
                        <Ionicons name="alert-circle" size={48} color="#FFFFFF" style={{ marginBottom: 16 }} />
                        
                        <Text style={[
                            styles.ctaTitle,
                            { 
                                fontSize: 24,
                                marginBottom: 12
                            }
                        ]}>
                            Urgence 24/7
                        </Text>
                        
                        <Text style={[
                            styles.ctaDescription,
                            { 
                                fontSize: 16,
                                lineHeight: 24,
                                marginBottom: 32
                            }
                        ]}>
                            En cas d'urgence pendant un trajet, contactez notre équipe de sécurité
                        </Text>
                        
                        <TouchableOpacity 
                            style={{
                                backgroundColor: '#FFFFFF',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 16,
                                paddingHorizontal: 24,
                                borderRadius: 12,
                                marginBottom: 16,
                                width: '100%',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                            onPress={() => handleCall('+224621456789')}
                        >
                            <Ionicons name="call" size={20} color="#EF4444" />
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '700',
                                marginLeft: 10,
                                color: '#EF4444'
                            }}>
                                Appeler l'urgence
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.secondaryButton}
                            onPress={() => setCurrentScreen(SCREENS.HOME)}
                        >
                            <Text style={[
                                styles.secondaryButtonText,
                                { 
                                    fontSize: 14,
                                    fontWeight: '500'
                                }
                            ]}>
                                Retour à l'accueil
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Réseaux sociaux */}
                    <View style={[
                        styles.sectionContainer, 
                        { 
                            backgroundColor: '#FFFFFF',
                            marginHorizontal: 20,
                            borderRadius: 20,
                            marginTop: 10,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                            marginBottom: 20,
                        }
                    ]}>
                        <Text style={[
                            styles.sectionTitleFeatures, 
                            { 
                                fontSize: 22,
                                marginBottom: 8,
                                textAlign: 'center',
                            }
                        ]}>
                            Suivez-nous
                        </Text>
                        
                        <Text style={[
                            styles.sectionDescription,
                            { 
                                textAlign: 'center',
                                marginBottom: 24
                            }
                        ]}>
                            Restez connectés sur nos réseaux sociaux
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 20,
                        }}>
                            {[
                                { icon: 'logo-facebook', color: '#1877F2', label: 'Facebook', url: 'https://facebook.com/takataka' },
                                { icon: 'logo-twitter', color: '#1DA1F2', label: 'Twitter', url: 'https://twitter.com/takataka' },
                                { icon: 'logo-instagram', color: '#E4405F', label: 'Instagram', url: 'https://instagram.com/takataka' },
                                { icon: 'logo-linkedin', color: '#0A66C2', label: 'LinkedIn', url: 'https://linkedin.com/company/takataka' },
                            ].map((social, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        alignItems: 'center',
                                    }}
                                    onPress={() => Linking.openURL(social.url).catch(err => 
                                        Alert.alert('Erreur', `Impossible d'ouvrir ${social.label}`)
                                    )}
                                >
                                    <View style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        backgroundColor: `${social.color}15`,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 8,
                                    }}>
                                        <Ionicons name={social.icon} size={24} color={social.color} />
                                    </View>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#6B7280',
                                    }}>
                                        {social.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}