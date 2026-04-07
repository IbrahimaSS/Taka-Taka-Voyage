import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Linking,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../AppContext';

export default function HelpCenterScreen({ navigation }) {
    const { darkMode, theme } = useApp();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    const faqCategories = [
        {
            id: 1,
            title: 'Compte & Profil',
            icon: 'person',
            questions: [
                {
                    question: 'Comment modifier mon profil ?',
                    answer: 'Pour modifier votre profil, allez dans "Mon Profil" > "Informations personnelles". Vous pourrez alors changer votre nom, email, numéro de téléphone et photo de profil.'
                },
                {
                    question: 'Comment changer mon mot de passe ?',
                    answer: 'Allez dans "Paramètres" > "Sécurité" > "Changer le mot de passe". Vous devrez confirmer votre mot de passe actuel avant d\'en choisir un nouveau.'
                },
                {
                    question: 'Comment supprimer mon compte ?',
                    answer: 'La suppression de compte est disponible dans "Paramètres" > "Sécurité" > "Supprimer mon compte". Notez que cette action est irréversible et supprimera toutes vos données.'
                },
            ],
        },
        {
            id: 2,
            title: 'Paiements',
            icon: 'wallet',
            questions: [
                {
                    question: 'Comment ajouter une méthode de paiement ?',
                    answer: 'Allez dans "Mon Profil" > "Moyens de paiement" et cliquez sur "Ajouter". Vous pourrez ajouter une carte bancaire ou un compte mobile money.'
                },
                {
                    question: 'Les paiements sont-ils sécurisés ?',
                    answer: 'Oui, tous les paiements sont sécurisés et cryptés. Nous ne stockons jamais vos informations bancaires complètes.'
                },
                {
                    question: 'Comment obtenir un remboursement ?',
                    answer: 'En cas de problème, contactez le support dans les 24h. Les remboursements sont traités sous 5-7 jours ouvrés.'
                },
            ],
        },
        {
            id: 3,
            title: 'Trajets',
            icon: 'car',
            questions: [
                {
                    question: 'Comment réserver un trajet ?',
                    answer: 'Ouvrez la carte, entrez votre destination, choisissez votre type de véhicule et confirmez la réservation. Un chauffeur sera assigné en quelques secondes.'
                },
                {
                    question: 'Comment annuler un trajet ?',
                    answer: 'Allez dans "Mes trajets", sélectionnez le trajet en cours et cliquez sur "Annuler". L\'annulation est gratuite tant qu\'aucun chauffeur n\'a accepté. Après acceptation, des frais de 5 000 GNF sont appliqués.'
                },
                {
                    question: 'Comment contacter le chauffeur ?',
                    answer: 'Une fois le trajet confirmé, vous pouvez appeler le chauffeur via l\'application. Nous ne recommandons pas de partager vos coordonnées personnelles.'
                },
            ],
        },
        {
            id: 4,
            title: 'Sécurité',
            icon: 'shield-checkmark',
            questions: [
                {
                    question: 'Comment signaler un problème ?',
                    answer: 'Après chaque trajet, vous pouvez évaluer et signaler un problème. En cas d\'urgence, utilisez le bouton d\'urgence dans l\'application.'
                },
                {
                    question: 'Les chauffeurs sont-ils vérifiés ?',
                    answer: 'Oui, tous nos chauffeurs passent une vérification d\'identité et de casier judiciaire. Nous vérifions également leur permis de conduire et l\'assurance du véhicule.'
                },
                {
                    question: 'Comment fonctionne le partage de trajet ?',
                    answer: 'Le partage de trajet vous permet de partager votre trajet en temps réel avec vos proches. Activez-le dans les paramètres de sécurité.'
                },
            ],
        },
    ];



    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
        setExpandedQuestion(null);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setExpandedQuestion(null);
    };

    const toggleQuestion = (index) => {
        setExpandedQuestion(expandedQuestion === index ? null : index);
    };

    const renderCategories = () => (
        <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Rechercher dans l'aide..."
                        placeholderTextColor={darkMode ? '#9CA3AF' : '#94A3B8'}
                    />
                </View>
                <TouchableOpacity style={[styles.searchButton, { backgroundColor: theme.primary }]}>
                    <Text style={styles.searchButtonText}>Rechercher</Text>
                </TouchableOpacity>
            </View>

            {/* FAQ Categories */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Catégories</Text>
            <View style={styles.categoriesGrid}>
                {faqCategories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.categoryCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}
                        onPress={() => handleCategoryPress(category)}
                    >
                        <View style={[styles.categoryIcon, { backgroundColor: darkMode ? '#374151' : '#EFF6FF' }]}>
                            <Ionicons name={category.icon} size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.categoryTitle, { color: theme.text }]}>{category.title}</Text>
                        <Text style={[styles.questionCount, { color: theme.textSecondary }]}>{category.questions.length} questions</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick Help */}
            <View style={styles.quickHelpSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Aide rapide</Text>
                <View style={styles.quickHelpGrid}>
                    <TouchableOpacity style={[styles.quickHelpCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <Ionicons name="videocam" size={24} color="#3B82F6" />
                        <Text style={[styles.quickHelpTitle, { color: theme.text }]}>Tutoriels vidéo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickHelpCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <Ionicons name="document-text" size={24} color="#10B981" />
                        <Text style={[styles.quickHelpTitle, { color: theme.text }]}>Guide d'utilisation</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickHelpCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <Ionicons name="people" size={24} color="#8B5CF6" />
                        <Text style={[styles.quickHelpTitle, { color: theme.text }]}>Communauté</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickHelpCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                        <Ionicons name="megaphone" size={24} color="#F59E0B" />
                        <Text style={[styles.quickHelpTitle, { color: theme.text }]}>Annonces</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );

    const renderCategoryQuestions = () => (
        <>
            {/* Category Header */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToCategories}
            >
                <Ionicons name="arrow-back" size={24} color={theme.primary} />
                <Text style={[styles.backButtonText, { color: theme.primary }]}>Retour aux catégories</Text>
            </TouchableOpacity>

            <View style={[styles.categoryHeader, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                <View style={[styles.categoryHeaderIcon, { backgroundColor: darkMode ? '#374151' : '#EFF6FF' }]}>
                    <Ionicons name={selectedCategory.icon} size={28} color={theme.primary} />
                </View>
                <Text style={[styles.categoryHeaderTitle, { color: theme.text }]}>{selectedCategory.title}</Text>
            </View>

            {/* Questions List */}
            <View style={styles.questionsList}>
                {selectedCategory.questions.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.questionItem,
                            { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border },
                            expandedQuestion === index && [styles.questionItemExpanded, { borderColor: theme.primary }]
                        ]}
                        onPress={() => toggleQuestion(index)}
                    >
                        <View style={styles.questionHeader}>
                            <Text style={[styles.questionText, { color: theme.text }]}>{item.question}</Text>
                            <Ionicons
                                name={expandedQuestion === index ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={theme.textSecondary}
                            />
                        </View>

                        {expandedQuestion === index && (
                            <View style={[styles.answerContainer, { borderTopColor: theme.border }]}>
                                <Text style={[styles.answerText, { color: theme.textSecondary }]}>{item.answer}</Text>
                                <View style={styles.answerActions}>
                                    <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="thumbs-up" size={16} color={theme.success} />
                                        <Text style={[styles.helpfulButtonText, { color: theme.text }]}>Utile</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="thumbs-down" size={16} color={theme.danger || '#EF4444'} />
                                        <Text style={[styles.helpfulButtonText, { color: theme.text }]}>Pas utile</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                                        <Ionicons name="flag" size={16} color={theme.textSecondary} />
                                        <Text style={[styles.helpfulButtonText, { color: theme.text }]}>Signaler</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>


        </>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header Amélioré avec Logo Centré */}
            <View style={[styles.header, {
                backgroundColor: theme.background,
                borderBottomColor: theme.border,
                paddingTop: Platform.OS === 'android' ? 50 : 20
            }]}>
                <TouchableOpacity
                    onPress={() => selectedCategory ? handleBackToCategories() : navigation.goBack()}
                    style={styles.headerBackButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                        overflow: 'hidden',
                        borderWidth: 1.5,
                        borderColor: '#10B981'
                    }}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{ width: 35, height: 35, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        if (navigation?.navigate) {
                            navigation.navigate('ContactSupport');
                        } else {
                            Linking.openURL('tel:+224621456789');
                        }
                    }}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {selectedCategory ? renderCategoryQuestions() : renderCategories()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBackButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#3B82F6',
        marginLeft: 8,
        fontWeight: '500',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryHeaderIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    questionsList: {
        marginBottom: 24,
    },
    questionItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    questionItemExpanded: {
        borderColor: '#3B82F6',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginRight: 12,
    },
    answerContainer: {
        padding: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    answerText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    answerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 16,
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    helpfulButtonText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    needHelpCard: {
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#BAE6FD',
    },
    needHelpTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0C4A6E',
        marginBottom: 8,
    },
    needHelpText: {
        fontSize: 14,
        color: '#0C4A6E',
        marginBottom: 16,
        lineHeight: 20,
    },
    contactSupportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        padding: 16,
        gap: 12,
    },
    contactSupportButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Styles pour la vue des catégories (existants)
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        marginLeft: 8,
        fontSize: 16,
        color: '#1F2937',
    },
    searchButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    questionCount: {
        fontSize: 12,
        color: '#6B7280',
    },
    popularSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    articleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    articleContent: {
        flex: 1,
    },
    articleTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    articleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    articleViews: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    quickHelpSection: {
        marginBottom: 24,
    },
    quickHelpGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickHelpCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickHelpTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 8,
        textAlign: 'center',
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    supportIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    supportContent: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    supportText: {
        fontSize: 14,
        color: '#6B7280',
    },
};