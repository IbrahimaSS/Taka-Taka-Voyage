import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header professionnel
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 14,
        height: Platform.OS === 'ios' ? 110 : 85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
        marginTop: 25,
    },
    headerBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    headerProgress: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    headerProgressText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },

    // Indicateur d'étapes
    stepIndicatorWrapper: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    stepCompleted: {
        backgroundColor: '#10B981',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    stepNumberActive: {
        color: 'white',
    },
    stepLabel: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        fontWeight: '500',
    },
    stepLabelActive: {
        color: '#1E293B',
        fontWeight: '600',
    },

    // Scroll views
    keyboardAvoidingView: {
        flex: 1,
    },
    horizontalScrollView: {
        flex: 1,
    },
    stepPage: {
        width: width,
    },
    stepScrollView: {
        flex: 1,
    },
    stepContent: {
        padding: 24,
        paddingBottom: 40,
    },

    // Titres et descriptions
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 19,
    },

    // Photo de profil
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#2563EB',
        borderStyle: 'solid',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    profileImageText: {
        marginTop: 14,
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#2563EB',
    },

    // Card formulaire
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 16,
    },

    // OTP styles
    otpIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    otpTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 6,
    },
    otpSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 19,
    },

    // Upload véhicule
    vehicleUploadZone: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleImagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 14,
        resizeMode: 'cover',
    },

    // Formulaires
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    inputFocused: {
        borderColor: '#93C5FD',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },

    // Type de véhicule
    carTypeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    carTypeButton: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    carTypeButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563EB',
        borderWidth: 2,
    },
    carTypeLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    carTypeLabelActive: {
        color: '#2563EB',
    },

    // Upload d'images
    imageUploadButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    imageUploadGradient: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        borderStyle: 'dashed',
    },
    imageUploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 4,
    },
    imageUploadHint: {
        fontSize: 13,
        color: '#64748B',
    },

    // Year Picker
    yearPickerButton: {
        width: 64,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    yearPickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    yearPickerContainer: {
        maxHeight: '60%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    yearPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 12,
    },
    yearPickerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    yearPickerItem: {
        flex: 1,
        margin: 4,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Documents grid 2x2
    documentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    documentGridItem: {
        width: '47%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    documentGridGradient: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        borderStyle: 'dashed',
        borderRadius: 12,
        gap: 6,
    },
    documentGridLabel: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    documentGridUploaded: {
        width: '100%',
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
    },
    documentGridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    documentGridOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        gap: 2,
    },
    documentGridUploadedLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    // Zone de texte
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
        lineHeight: 22,
    },

    // Conditions
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0FDF4',
        padding: 20,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 32,
        gap: 12,
    },
    termsText: {
        fontSize: 13,
        color: '#065F46',
        lineHeight: 18,
        flex: 1,
    },
    termsLink: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },

    // Boutons de navigation
    stepNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        gap: 16,
    },
    backButtonStep: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        flex: 1,
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563EB',
    },

    // Bouton continuer
    nextStepButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    nextStepButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 12,
    },
    nextStepButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Bouton final
    finalSubmitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    finalSubmitButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 12,
    },
    finalSubmitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Lien de connexion
    loginLinkContainer: {
        marginTop: 24,
        padding: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    loginLinkText: {
        fontSize: 15,
        color: '#64748B',
    },
    loginLinkBold: {
        fontWeight: 'bold',
        color: '#2563EB',
    },

    // Espacement
    stepSpacer: {
        height: 60,
    },
});