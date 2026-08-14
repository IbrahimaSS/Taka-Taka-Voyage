import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Image,
    Linking,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../../services/apiClient';
import { enqueueUpload } from '../../services/uploadQueue';
import { onUploadQueueItemSuccess, processQueueOnce } from '../../services/uploadQueueSync';

export default function PersonalInfoScreen({ navigation }) {
    const { user, updateUser, darkMode, theme } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Initialiser les données du formulaire
    const getInitialFormData = () => {
        let first = user?.prenom || '';
        let last = user?.nom || '';
        
        // Si prenom/nom sont vides mais name est présent, on essaye de séparer
        if (!first && !last && user?.name) {
            const parts = user.name.split(' ');
            first = parts[0] || '';
            last = parts.slice(1).join(' ') || '';
        }

        return {
            prenom: first,
            nom: last,
            email: user?.email || '',
            phone: user?.phone || user?.telephone || '',
            photo: user?.photo || user?.photoUrl || null,
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    // Si la photo mise en file d'attente plus tôt (hors ligne ou réseau instable)
    // finit par être envoyée avec succès, on rafraîchit l'URL réelle (Cloudinary)
    // renvoyée par le backend — jusque-là, l'aperçu local (formData.photo) suffit.
    useEffect(() => {
        const unsubscribe = onUploadQueueItemSuccess((item, response) => {
            if (item.fileFieldName === 'photoUrl' && response?.utilisateur?.photoUrl) {
                updateUser({ ...user, photoUrl: response.utilisateur.photoUrl, photo: response.utilisateur.photoUrl });
            }
        });
        return unsubscribe;
    }, [user]);

    const handlePickImage = async () => {
        if (!isEditing) return;

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission refusée", "Vous avez besoin d'autoriser l'accès à vos photos pour changer votre profil.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFormData({ ...formData, photo: result.assets[0].uri });
        }
    };

    const handleSave = async () => {
        if (!formData.prenom.trim() || !formData.nom.trim() || !formData.email.trim() || !formData.phone.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        try {
            const isNewPhoto = formData.photo && formData.photo.startsWith('file://');

            // La photo est mise en file d'attente EN PREMIER, avant toute tentative
            // réseau : c'est une simple copie locale de fichier, elle ne peut pas
            // échouer pour cause de connexion. Si on l'avait fait après la tentative
            // de mise à jour du texte, une coupure réseau aurait arrêté la fonction
            // avant même que la photo ne soit mise en attente — annulant tout
            // l'intérêt de la file hors-ligne.
            if (isNewPhoto) {
                const filename = formData.photo.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

                await enqueueUpload({
                    localUri: formData.photo,
                    endpoint: '/passager/profile/profil',
                    method: 'PUT',
                    fileFieldName: 'photoUrl',
                    fileName: filename,
                    mimeType,
                });

                // Tentative d'envoi immédiate, sans bloquer l'écran (pas de "await") : si
                // la connexion est déjà là, la photo part tout de suite au lieu d'attendre
                // un futur changement d'état réseau ou un redémarrage de l'app. Si ça
                // échoue (hors ligne), l'élément reste simplement en file, sans conséquence.
                processQueueOnce();
            }

            // Champs texte : tentative de mise à jour immédiate. Contrairement à la
            // photo, ce n'est pas mis en file d'attente (hors périmètre : seuls les
            // médias en ont besoin) — si ça échoue faute de réseau, la photo reste
            // quand même en attente d'envoi, elle n'est pas perdue.
            const data = new FormData();
            data.append('prenom', formData.prenom.trim());
            data.append('nom', formData.nom.trim());
            data.append('email', formData.email.trim());
            data.append('telephone', formData.phone.trim());

            const response = await apiClient('/passager/profile/profil', {
                method: 'PUT',
                body: data,
            });

            setIsEditing(false);

            if (!response.succes) {
                if (isNewPhoto) {
                    // On ne met PAS formData.photo (URI locale file://) dans l'état global
                    // (AppContext) : d'autres écrans affichent user.photo/photoUrl en
                    // supposant une vraie URL (Cloudinary ou chemin serveur), pas un fichier
                    // local — ça casserait leur affichage. L'aperçu local reste cantonné à
                    // cet écran (formData.photo, déjà utilisé pour son propre <Image>).
                    Alert.alert(
                        'Photo mise en attente',
                        'Pas de connexion pour le moment : votre photo sera envoyée dès que possible. Les autres informations n\'ont pas été enregistrées, réessayez plus tard.'
                    );
                } else {
                    Alert.alert('Erreur', response.error || 'Impossible de mettre à jour le profil');
                }
                return;
            }

            // Mettre à jour l'état local via AppContext. Tant qu'une nouvelle photo est
            // en attente d'envoi, on garde l'ancienne URL (réelle, exploitable par tous
            // les écrans) dans l'état global — l'URI locale ne sert qu'à l'aperçu de cet
            // écran (formData.photo). La vraie nouvelle URL Cloudinary arrivera via
            // onUploadQueueItemSuccess une fois l'envoi confirmé.
            const updatedUser = {
                ...user,
                prenom: response.utilisateur.prenom,
                nom: response.utilisateur.nom,
                name: `${response.utilisateur.prenom} ${response.utilisateur.nom}`,
                email: response.utilisateur.email,
                telephone: response.utilisateur.telephone,
                phone: response.utilisateur.telephone,
                photoUrl: response.utilisateur.photoUrl,
                photo: response.utilisateur.photoUrl,
            };
            updateUser(updatedUser);

            Alert.alert(
                'Succès',
                isNewPhoto
                    ? 'Vos informations ont été mises à jour. La nouvelle photo sera envoyée dès que la connexion le permet.'
                    : 'Vos informations ont été mises à jour avec succès.'
            );
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(getInitialFormData());
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header Amélioré avec Logo Centré */}
            <View style={[styles.header, {
                backgroundColor: theme.background,
                borderBottomColor: theme.border,
                paddingTop: Platform.OS === 'android' ? 50 : 20,
                paddingBottom: 20
            }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerTitle, { color: theme.text, textAlign: 'center' }]}>Infos Professionnelles</Text>
                </View>

                {isEditing ? (
                    <TouchableOpacity onPress={handleCancel} style={{ padding: 8 }} disabled={loading}>
                        <Text style={[styles.cancelText, { fontWeight: 'bold' }]}>Annuler</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={{ padding: 8 }}>
                        <Text style={[styles.editText, { color: theme.primary, fontWeight: 'bold' }]}>Modifier</Text>
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            onPress={handlePickImage}
                            disabled={!isEditing}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={theme.gradientAvatar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.avatar}
                            >
                                {formData.photo ? (
                                    <Image 
                                        source={{ 
                                            uri: formData.photo.startsWith('http') 
                                                ? formData.photo 
                                                : (formData.photo.startsWith('/uploads') ? `https://taka-taka-voyage.onrender.com${formData.photo}` : formData.photo) 
                                        }} 
                                        style={{ width: 100, height: 100, borderRadius: 50 }} 
                                    />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {formData.prenom ? formData.prenom.charAt(0) : (formData.nom ? formData.nom.charAt(0) : 'U')}
                                    </Text>
                                )}

                                {isEditing && (
                                    <View style={{
                                        position: 'absolute',
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: theme.primary,
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 2,
                                        borderColor: '#FFFFFF'
                                    }}>
                                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.changeAvatarButton}
                            disabled={!isEditing}
                            onPress={handlePickImage}
                        >
                            <Text style={styles.changeAvatarText}>Changer la photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        {/* Nom Complet */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Prénom *</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: theme.border, color: theme.text }]}
                                    value={formData.prenom}
                                    onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                                    placeholder="Votre prénom"
                                />
                            ) : (
                                <Text style={[styles.valueText, { color: theme.text }]}>{user.prenom || (user.name ? user.name.split(' ')[0] : '')}</Text>
                            )}
                        </View>

                        {/* Nom */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom *</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: theme.border, color: theme.text }]}
                                    value={formData.nom}
                                    onChangeText={(text) => setFormData({ ...formData, nom: text })}
                                    placeholder="Votre nom"
                                />
                            ) : (
                                <Text style={[styles.valueText, { color: theme.text }]}>{user.nom || (user.name ? user.name.split(' ').slice(1).join(' ') : '')}</Text>
                            )}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Adresse email *</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: theme.border, color: theme.text }]}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    placeholder="votre@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            ) : (
                                <Text style={[styles.valueText, { color: theme.text }]}>{user.email}</Text>
                            )}
                        </View>

                        {/* Téléphone */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Téléphone *</Text>
                            {isEditing ? (
                                <TextInput
                                    style={[styles.input, { backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: theme.border, color: theme.text }]}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="+224 XXX XX XX XX"
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={[styles.valueText, { color: theme.text }]}>{user.phone || user.telephone}</Text>
                            )}
                        </View>


                        {/* Statistiques */}
                        {!isEditing && (
                            <View style={[styles.statsSection, { borderTopColor: theme.border }]}>
                                <Text style={[styles.statsTitle, { color: theme.text }]}>Statistiques</Text>
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <Ionicons name="star" size={24} color="#EF4444" />
                                        <Text style={styles.statValue}>{user.rating}</Text>
                                        <Text style={styles.statLabel}>Note moyenne</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Ionicons name="car" size={24} color="#3B82F6" />
                                        <Text style={styles.statValue}>{Object.keys(user).includes('trips') ? user.trips : (user.nombreTrajets || 0)}</Text>
                                        <Text style={styles.statLabel}>Trajets</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Ionicons name="calendar" size={24} color="#10B981" />
                                        <Text style={styles.statValue}>
                                            {user.memberSince ? new Date(user.memberSince).getFullYear() : '2026'}
                                        </Text>
                                        <Text style={styles.statLabel}>Membre depuis</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Save Button */}
                        {isEditing && (
                            <TouchableOpacity
                                style={[styles.saveButton, loading && { opacity: 0.7 }]}
                                onPress={handleSave}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#2563EB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.saveButtonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Security Note */}
                        <View style={styles.securityNote}>
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                            <Text style={styles.securityText}>
                                Vos informations personnelles sont sécurisées et ne seront jamais partagées sans votre consentement.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18, // Taille légèrement réduite pour éviter qu'il ne coince
        fontWeight: 'bold',
        color: '#1F2937',
        marginRight: 12, // Ajout d'une marge à droite
    },
    editText: {
        fontSize: 16,
        color: '#10B981', // Changé au vert Taka Taka
        fontWeight: '600',
    },
    cancelText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#E0E7FF', // Soft blue aura
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    changeAvatarButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#E6F3EA', // Fond vert très clair
    },
    changeAvatarText: {
        fontSize: 14,
        color: '#10B981', // Texte vert
        fontWeight: '600',
    },
    formSection: {
        paddingBottom: 32,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    textArea: {
        minHeight: 80,
    },
    valueText: {
        fontSize: 16,
        color: '#1F2937',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    statsSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
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
    statCard: {
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        width: '30%',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E6F3EA',
        borderRadius: 8,
        padding: 12,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    securityText: {
        flex: 1,
        fontSize: 12,
        color: '#065F46',
        marginLeft: 8,
    },
};