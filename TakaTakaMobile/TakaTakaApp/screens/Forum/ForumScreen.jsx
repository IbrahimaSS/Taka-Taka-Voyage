import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StatusBar,
    TextInput,
    Image,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

export default function ForumScreen({ onBack }) {
    const { darkMode, theme, user } = useApp();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Tous');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostCategory, setNewPostCategory] = useState('Discussion');
    const [isPosting, setIsPosting] = useState(false);

    const categories = ['Tous', 'Trafic', 'Aide', 'Discussion', 'Annonce'];

    useEffect(() => {
        fetchPosts();
    }, [activeCategory]);

    const fetchPosts = async () => {
        if (!refreshing) setLoading(true);
        try {
            const url = activeCategory === 'Tous' 
                ? '/community/posts' 
                : `/community/posts?tag=${activeCategory}`;
            
            const res = await apiClient(url);
            if (res.succes) {
                setPosts(res.donnees);
            }
        } catch (error) {
            console.error('Forum fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        setIsPosting(true);
        try {
            const res = await apiClient('/community/posts', {
                method: 'POST',
                body: {
                    contenu: newPostContent,
                    tags: [newPostCategory],
                    typeMedia: 'TEXT'
                }
            });

            if (res.succes) {
                setShowCreateModal(false);
                setNewPostContent('');
                fetchPosts();
                Alert.alert('Succès', 'Votre publication est en ligne !');
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de publier votre message.');
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await apiClient(`/community/posts/${postId}/like`, { method: 'PUT' });
            if (res.succes) {
                // Mise à jour locale rapide
                setPosts(posts.map(p => {
                    if (p._id === postId) {
                        return { 
                            ...p, 
                            likes: res.isLiked 
                                ? [...p.likes, user._id] 
                                : p.likes.filter(id => id !== user._id) 
                        };
                    }
                    return p;
                }));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const getInitials = (author) => {
        if (!author) return 'U';
        const p = author.prenom || '';
        const n = author.nom || '';
        return (p.charAt(0) + n.charAt(0)).toUpperCase() || 'U';
    };

    const renderPost = ({ item }) => {
        const isLiked = item.likes?.includes(user?._id);
        const category = item.tags && item.tags.length > 0 ? item.tags[0] : 'Discussion';

        return (
            <View style={[styles.postCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.postHeader}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                        {item.auteur?.photoUrl ? (
                            <Image 
                                source={{ uri: item.auteur.photoUrl.startsWith('http') ? item.auteur.photoUrl : `https://taka-taka-voyage.onrender.com${item.auteur.photoUrl}` }} 
                                style={styles.avatarImg} 
                            />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {getInitials(item.auteur)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.authorInfo}>
                        <Text style={[styles.authorName, { color: theme.text }]}>
                            {item.auteur?.prenom} {item.auteur?.nom}
                        </Text>
                        <Text style={[styles.authorRole, { color: theme.textSecondary }]}>
                            {new Date(item.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) + '20' }]}>
                        <Text style={[styles.categoryText, { color: getCategoryColor(category) }]}>{category}</Text>
                    </View>
                </View>

                <Text style={[styles.postContent, { color: theme.text }]}>{item.contenu}</Text>

                <View style={[styles.postFooter, { borderTopColor: theme.border }]}>
                    <TouchableOpacity style={styles.footerAction} onPress={() => handleLike(item._id)}>
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={22} 
                            color={isLiked ? "#EF4444" : theme.textSecondary} 
                        />
                        <Text style={[styles.footerActionText, { color: isLiked ? "#EF4444" : theme.textSecondary }]}>
                            {item.likes?.length || 0}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.footerAction}>
                        <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} />
                        <Text style={[styles.footerActionText, { color: theme.textSecondary }]}>
                            {item.nombreCommentaires || 0}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.footerAction}>
                        <Ionicons name="share-social-outline" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const getCategoryColor = (cat) => {
        switch (cat) {
            case 'Trafic': return '#EF4444';
            case 'Aide': return '#3B82F6';
            case 'Annonce': return '#F59E0B';
            default: return '#10B981';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
            
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Communauté Taka</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.searchButton}>
                    <Ionicons name="refresh" size={22} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {categories.map(cat => (
                        <TouchableOpacity 
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            style={[
                                styles.categoryItem, 
                                { backgroundColor: activeCategory === cat ? theme.primary : theme.card },
                                activeCategory !== cat && { borderWidth: 1, borderColor: theme.border }
                            ]}
                        >
                            <Text style={[styles.categoryItemText, { color: activeCategory === cat ? 'white' : theme.textSecondary }]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ marginTop: 10, color: theme.textSecondary }}>Chargement du fil...</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="newspaper-outline" size={60} color={theme.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Aucune publication pour le moment</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => setShowCreateModal(true)}
            >
                <Ionicons name="create" size={28} color="white" />
            </TouchableOpacity>

            <Modal visible={showCreateModal} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text style={{ color: theme.textSecondary }}>Annuler</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Nouvelle Publication</Text>
                            <TouchableOpacity onPress={handleCreatePost} disabled={isPosting}>
                                {isPosting ? <ActivityIndicator size="small" color={theme.primary} /> : <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Publier</Text>}
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                             <Text style={[styles.label, { color: theme.textSecondary }]}>Catégorie de votre message</Text>
                             <View style={styles.modalCategories}>
                                {['Discussion', 'Trafic', 'Aide', 'Annonce'].map(cat => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        onPress={() => setNewPostCategory(cat)}
                                        style={[styles.modalCatItem, { borderColor: newPostCategory === cat ? theme.primary : theme.border, backgroundColor: newPostCategory === cat ? theme.primary + '10' : 'transparent' }]}
                                    >
                                        <Text style={{ color: newPostCategory === cat ? theme.primary : theme.textSecondary }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                             </View>

                             <TextInput
                                style={[styles.postInput, { color: theme.text, backgroundColor: darkMode ? '#1F2937' : '#F9FAFB' }]}
                                multiline
                                placeholder="Quoi de neuf sur la route ?"
                                placeholderTextColor={theme.textSecondary}
                                value={newPostContent}
                                onChangeText={setNewPostContent}
                                autoFocus
                             />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    searchButton: { padding: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    categoriesContainer: { paddingVertical: 12 },
    categoriesScroll: { paddingHorizontal: 16 },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryItemText: { fontSize: 13, fontWeight: '600' },

    listContent: { padding: 16, paddingBottom: 100 },
    postCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden'
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarText: { fontSize: 16, fontWeight: 'bold' },
    authorInfo: { flex: 1 },
    authorName: { fontSize: 15, fontWeight: 'bold' },
    authorRole: { fontSize: 11, marginTop: 1 },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: { fontSize: 10, fontWeight: 'bold' },
    postContent: { fontSize: 15, lineHeight: 22, marginBottom: 15 },
    postFooter: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    footerAction: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25
    },
    footerActionText: { fontSize: 13, marginLeft: 6 },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalBody: { flex: 1 },
    label: { fontSize: 12, marginBottom: 10 },
    modalCategories: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    modalCatItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, marginRight: 8, marginBottom: 8 },
    postInput: {
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 200
    },
    emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
    emptyText: { marginTop: 15, fontSize: 14 }
});
