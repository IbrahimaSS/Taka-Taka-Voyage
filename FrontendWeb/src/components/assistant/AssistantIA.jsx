import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, X, Send, Bot, User, Sparkles,
    ChevronDown, Minus, Maximize2, Headset,
    HelpCircle, RefreshCw, AlertCircle, Volume2, Mic, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../services/apiClient';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { usePassenger } from '../../context/PassengerContext';
import { useDriverContext } from '../../context/DriverContext';
import { useTheme } from '../../context/ThemeContext';
import PremiumInvoice from '../admin/ui/PremiumInvoice';
import './AssistantIA.css';

const AssistantIA = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { setTheme, theme } = useTheme();

    // Tentative d'accès aux contextes (peuvent être undefined si hors provider)
    const passengerCtx = usePassenger();
    const driverCtx = useDriverContext();

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'model',
            content: t('assistant.welcome_msg'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    // --- ASSISTANCE PROACTIVE ---
    const inactivityTimerRef = useRef(null);
    const [hasSentProactiveHelp, setHasSentProactiveHelp] = useState(false);

    useEffect(() => {
        // Logique métier proactive pour le Chauffeur
        const role = user?.role?.toUpperCase();
        if (role === 'CHAUFFEUR' || role === 'DRIVER') {
            if (driverCtx?.acceptedTrips?.length > 0 && !driverCtx.trajetEnCours) {
                // S'il a des passagers en attente mais n'a pas démarré la course
                if (!inactivityTimerRef.current && !hasSentProactiveHelp) {
                    inactivityTimerRef.current = setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            role: 'model',
                            content: "Je vois que vous avez des passagers en attente depuis un moment. Avez-vous besoin d'aide pour naviguer vers eux ou démarrer le trajet ?",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isProactive: true
                        }]);
                        setHasSentProactiveHelp(true);
                        setIsOpen(true); // Ouvre l'assistant pour attirer l'attention
                    }, 45000); // 45 secondes sans action = aide
                }
            } else {
                // Reset si la situation change
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                    inactivityTimerRef.current = null;
                }
            }
        } else if (role === 'PASSAGER' || role === 'PASSENGER') {
            if (passengerCtx?.tripStatus === 'driver_found' || passengerCtx?.tripStatus === 'approaching') {
                if (!inactivityTimerRef.current && !hasSentProactiveHelp) {
                    inactivityTimerRef.current = setTimeout(() => {
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            role: 'model',
                            content: "Votre chauffeur est en route. Êtes-vous prêt au point de rendez-vous ? Si vous avez un problème, vous pouvez le contacter directement ou utiliser le bouton d'urgence.",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isProactive: true
                        }]);
                        setHasSentProactiveHelp(true);
                        setIsOpen(true);
                    }, 60000); // 1 minute après assignation sans changement
                }
            } else {
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                    inactivityTimerRef.current = null;
                }
            }
        }
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [driverCtx?.acceptedTrips, driverCtx?.trajetEnCours, passengerCtx?.tripStatus, hasSentProactiveHelp, user?.role]);

    const suggestions = useMemo(() => {
        const role = user?.role?.toUpperCase();

        // --- Suggestions pour l'ADMIN ---
        if (role === 'ADMIN') {
            return [
                { label: "Que dois-je vérifier ? 🛡️", query: "Y a-t-il des actions urgentes comme des validations ou signalements en attente ?" },
                { label: "Activité Globale 📊", query: "Fais-moi un point sur l'activité des chauffeurs et trajets en cours." },
                { label: "Mode Maintenance 🔧", query: "Comment activer le mode maintenance en douceur ?" }
            ];
        }

        // --- Suggestions pour le CHAUFFEUR ---
        if (role === 'CHAUFFEUR' || role === 'DRIVER') {
            return [
                { label: "Ma prochaine action ? 🎯", query: "Selon mon statut actuel et mes passagers assignés, que dois-je faire maintenant ?" },
                { label: "Règles Taxi Partagé 🚕", query: "Rappelle-moi comment gérer la récupération multiple en taxi partagé." },
                { label: "Paiement en attente 💳", query: "Un passager refuse de payer ou n'a pas finalisé, que dois-je faire ?" }
            ];
        }

        // --- Suggestions pour le PASSAGER ---
        if (role === 'PASSAGER' || role === 'PASSENGER') {
            return [
                { label: "Où en est mon trajet ? 📍", query: "Analyse mon statut actuel et dis-moi quoi faire en une phrase." },
                { label: "Problème Paiement ❌", query: "Mon paiement a échoué. Comment le relancer ?" },
                { label: "Urgence / Support 🚨", query: "J'ai un problème urgent avec la voiture ou le chauffeur." }
            ];
        }

        // --- Suggestions pour les VISITEURS ---
        return [
            { label: "C'est quoi Taka-Taka ? 🤔", query: "Qu'est-ce que Taka-Taka, et quelle est la différence avec les autres ?" },
            { label: "Devenir Chauffeur 🚗", query: "Quels sont les avantages et les documents requis pour devenir chauffeur ?" },
            { label: "Tarifs & Paiements 💳", query: "Quels sont les méthodes de paiement acceptées sur l'application ?" }
        ];
    }, [user, t]);

    // Mettre à jour le message de bienvenue si la langue change (et qu'il n'y a qu'un message)
    useEffect(() => {
        if (messages.length === 1 && messages[0].role === 'model') {
            setMessages([{
                ...messages[0],
                content: t('assistant.welcome_msg')
            }]);
        }
    }, [i18n.language]);
    const [inputValue, setInputValue] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isAutoVoice, setIsAutoVoice] = useState(false);
    const [usedVoiceThisTurn, setUsedVoiceThisTurn] = useState(false);
    const [error, setError] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const messagesEndRef = useRef(null);

    // --- Fonctionnalité : Text-To-Speech (Lire le message) ---
    const speakMessage = (text, onEndCallback) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        // Nettoyer le markdown (étoiles, dièses, etc.) pour la voix
        const cleanText = text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Supprime les gras **...**
            .replace(/\*(.*?)\*/g, '$1')     // Supprime les italiques *...*
            .replace(/#/g, '')               // Supprime les titres #
            .replace(/- /g, '')              // Supprime les puces
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        const langMap = { 'fr': 'fr-FR', 'en': 'en-GB' };
        utterance.lang = langMap[i18n.language] || 'fr-FR';
        utterance.rate = 1;

        if (onEndCallback) {
            utterance.onend = onEndCallback;
        }

        window.speechSynthesis.speak(utterance);
    };

    // --- Fonctionnalité : Speech-To-Text (Écouter l'utilisateur) ---
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('assistant.voice_unsupported'));
            return;
        }

        const recognition = new SpeechRecognition();
        const langMap = { 'fr': 'fr-FR', 'en': 'en-US' };
        recognition.lang = langMap[i18n.language] || 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
            setUsedVoiceThisTurn(true);
            setIsAutoVoice(true);
            // Envoyer automatiquement après avoir parlé en forçant le flag vocal
            processMessage(transcript, true);
        };

        recognition.start();
    };

    // --- MAPPAGE DES DONNEES PAIEMENT ---
    const mapBackendPaymentToFrontend = (p) => {
        if (!p) return null;
        const r = p.reservation || {};
        const passager = r.passager || {};
        const chauffeur = r.chauffeur || {};

        const dateObj = new Date(p.createdAt);
        const formatMoney = (amount) => `${(amount || 0).toLocaleString('fr-FR')} GNF`;

        return {
            id: `PAY-${p._id?.slice(-6).toUpperCase()}`,
            _id: p._id,
            transactionId: p.transactionId || `TXN-${p._id?.slice(-8).toUpperCase()}`,
            amount: formatMoney(p.montantTotal),
            rawAmount: p.montantTotal,
            commission: formatMoney(p.commissionPlateforme),
            netAmount: formatMoney(p.montantChauffeur),
            status: p.statut === 'PAYE' ? 'paid' : 'pending',
            method: p.methode?.toLowerCase() || 'cash',
            date: dateObj.toLocaleDateString('fr-FR'),
            time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            invoiceNumber: `INV-${dateObj.getFullYear()}-${p._id?.slice(-6).toUpperCase()}`,
            reference: (r.paiement && r.paiement.reference) || p.reference || '-',
            passenger: {
                name: passager.nomComplet || (passager.nom ? `${passager.prenom || ''} ${passager.nom}`.trim() : 'Utilisateur Client'),
                phone: passager.telephone || '-',
                email: passager.email || '-'
            },
            driver: {
                name: chauffeur.nom ? `${chauffeur.prenom || ''} ${chauffeur.nom}`.trim() : 'Chauffeur',
                phone: chauffeur.telephone || '-',
                email: chauffeur.email || '-',
                vehicle: (chauffeur.vehicule && typeof chauffeur.vehicule === 'object')
                    ? `${chauffeur.vehicule.marque || ''} ${chauffeur.vehicule.modele || ''}`.trim()
                    : (r.typeVehicule || '-')
            }
        };
    };

    // --- EXECUTION DES ACTIONS REELLES ---
    const executeAction = async (actionData) => {
        try {
            const { name, reservationId, groupeId } = actionData;
            setIsTyping(true);

            let success = false;
            let finalMessage = "";

            switch (name) {
                case 'creer_reservation_immediate':
                case 'creer_reservation_planifiee':
                    try {
                        const resObj = await apiClient.post('/ai/execute', {
                            action: name,
                            payload: actionData.payload || {}
                        });
                        success = true;
                        
                        // ✅ Émettre un événement global pour que le PassengerContext le capte
                        window.dispatchEvent(new CustomEvent('taka-ia-reservation', {
                            detail: {
                                action: name,
                                reservationId: resObj.data.reservationId,
                                pickup: actionData.payload?.point_depart || 'Position actuelle',
                                destination: actionData.payload?.destination || 'Destination non spécifiée',
                                vehicleType: actionData.payload?.type_vehicule || 'taxi',
                                isPlanifie: name === 'creer_reservation_planifiee'
                            }
                        }));
                        
                        finalMessage = resObj.data.message || "✅ Commande de course validée et envoyée aux chauffeurs de Taka-Taka !";
                    } catch (err) {
                        success = false;
                        finalMessage = "❌ Oups, impossible de finaliser la réservation IA pour le moment.";
                    }
                    break;
                case 'demarrer_trajet':
                    if (driverCtx?.startTripImmediately) {
                        await driverCtx.startTripImmediately(reservationId);
                        success = true;
                        finalMessage = "✅ Trajet démarré avec succès ! Bonne route.";
                    }
                    break;
                case 'signaler_arrivee':
                    if (driverCtx?.signalArrival) {
                        await driverCtx.signalArrival();
                        success = true;
                        finalMessage = "✅ Arrivée signalée au passager.";
                    }
                    break;
                case 'rejoindre_course':
                    if (driverCtx?.rejoindreCourse) {
                        await driverCtx.rejoindreCourse(reservationId);
                        success = true;
                        finalMessage = "✅ Vous êtes maintenant enregistré en route vers le passager.";
                    }
                    break;
                case 'terminer_trajet':
                    // On peut utiliser le service directement ou via le contexte
                    const { tripService } = await import('../../services/tripService');
                    const { taxiPartageApiService } = await import('../../services/taxiPartageService');

                    if (groupeId) {
                        await taxiPartageApiService.terminerTrajet(groupeId);
                    } else {
                        await tripService.complete(reservationId);
                    }
                    success = true;
                    finalMessage = "✅ Course terminée ! N'oubliez pas l'évaluation.";
                    break;
                case 'activer_maintenance':
                case 'desactiver_maintenance':
                    await apiClient.patch('/admin/parametres', {
                        maintenanceMode: name === 'activer_maintenance'
                    });
                    success = true;
                    finalMessage = name === 'activer_maintenance'
                        ? "✅ Mode maintenance activé."
                        : "✅ Mode maintenance désactivé.";
                    break;
                case 'changer_theme':
                    let targetTheme = theme === 'dark' ? 'light' : 'dark';
                    const userMsg = actionData.contextMsg?.toLowerCase() || "";
                    if (userMsg.includes('clair') || userMsg.includes('light')) targetTheme = 'light';
                    if (userMsg.includes('sombre') || userMsg.includes('dark') || userMsg.includes('noir')) targetTheme = 'dark';

                    setTheme(targetTheme);
                    success = true;
                    finalMessage = targetTheme === 'dark' ? "✅ Mode sombre activé." : "✅ Mode clair activé.";
                    break;
                case 'changer_langue':
                    let targetLang = i18n.language === 'fr' ? 'en' : 'fr';
                    const langMsg = actionData.contextMsg?.toLowerCase() || "";
                    if (langMsg.includes('anglais') || langMsg.includes('english') || langMsg.includes('en')) targetLang = 'en';
                    if (langMsg.includes('français') || langMsg.includes('french') || langMsg.includes('fr')) targetLang = 'fr';

                    i18n.changeLanguage(targetLang);
                    success = true;
                    finalMessage = targetLang === 'en' ? "✅ Language changed to English." : "✅ Langue changée en Français.";
                    break;
                case 'passer_en_ligne':
                    if (driverCtx?.setOnline) {
                        driverCtx.setOnline(true);
                        success = true;
                        finalMessage = "✅ Vous êtes maintenant EN LIGNE. Les passagers peuvent vous voir !";
                    }
                    break;
                case 'passer_hors_ligne':
                    if (driverCtx?.setOnline) {
                        driverCtx.setOnline(false);
                        success = true;
                        finalMessage = "✅ Vous êtes maintenant HORS LIGNE.";
                    }
                    break;
                case 'annuler_reservation':
                    if (user?.role === 'PASSAGER' && passengerCtx?.cancelTripByPassenger) {
                        await passengerCtx.cancelTripByPassenger({ reason: "Annulation par assistant IA" });
                        success = true;
                        finalMessage = "✅ Votre réservation a été annulée comme demandé.";
                    } else if (user?.role === 'CHAUFFEUR' && driverCtx) {
                        // Pour le chauffeur, on utilise le tripService ou l'API via le context
                        const { tripService } = await import('../../services/tripService');
                        await tripService.cancel(reservationId, { raison: "Annulation par assistant IA" });
                        success = true;
                        finalMessage = "✅ La course a été annulée.";
                    }
                    break;
                case 'accepter_demande':
                    if (driverCtx?.acceptTripRequest && driverCtx.tripRequests?.length > 0) {
                        const firstReqId = driverCtx.tripRequests[0].reservationId || driverCtx.tripRequests[0].id;
                        await driverCtx.acceptTripRequest(firstReqId);
                        success = true;
                        finalMessage = "✅ Demande acceptée ! En route pour récupérer le passager.";
                    } else {
                        finalMessage = "❌ Aucune demande de course en attente actuellement.";
                    }
                    break;
                case 'refuser_demande':
                    if (driverCtx?.rejectTripRequest && driverCtx.tripRequests?.length > 0) {
                        const firstReqId = driverCtx.tripRequests[0].reservationId || driverCtx.tripRequests[0].id;
                        await driverCtx.rejectTripRequest(firstReqId);
                        success = true;
                        finalMessage = "✅ Demande refusée.";
                    } else {
                        finalMessage = "❌ Aucune demande à refuser.";
                    }
                    break;
                case 'deconnexion':
                    await logout();
                    navigate('/connexion');
                    success = true;
                    finalMessage = "👋 Déconnexion réussie. À bientôt !";
                    break;
                case 'voir_mon_solde':
                    if (user?.role === 'CHAUFFEUR') {
                        navigate('/chauffeur/revenus');
                    } else if (user?.role === 'ADMIN') {
                        navigate('/admin/paiements');
                    } else if (passengerCtx?.setCurrentPage) {
                        passengerCtx.setCurrentPage('payments');
                    }
                    success = true;
                    finalMessage = "💰 Voici votre solde et vos dernières transactions.";
                    break;
                case 'rechercher_taxi':
                    if (passengerCtx?.setCurrentPage) {
                        passengerCtx.setCurrentPage('home');
                        success = true;
                        finalMessage = "🚕 Je vous ouvre l'écran de réservation. Où souhaitez-vous aller ?";
                    }
                    break;
                case 'voir_planning':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/planning');
                    else if (user?.role === 'ADMIN') navigate('/admin/trajets');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('planning');
                    success = true;
                    finalMessage = "📅 Voici votre planning de réservation.";
                    break;
                case 'voir_historique':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/history');
                    else if (user?.role === 'ADMIN') navigate('/admin/trajets');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('history');
                    success = true;
                    finalMessage = "📜 Je vous affiche l'historique de vos trajets.";
                    break;
                case 'voir_profil':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/profil');
                    else if (user?.role === 'ADMIN') navigate('/admin/profil');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('profile');
                    success = true;
                    finalMessage = "👤 Voici votre profil utilisateur.";
                    break;
                case 'voir_parametres':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/settings');
                    else if (user?.role === 'ADMIN') navigate('/admin/parametres');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('settings');
                    success = true;
                    finalMessage = "⚙️ J'ouvre vos paramètres.";
                    break;
                case 'voir_support':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/support');
                    else if (user?.role === 'ADMIN') navigate('/admin/litiges');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('support');
                    success = true;
                    finalMessage = "🎧 Bienvenue au support Taka-Taka. Comment puis-je vous aider ?";
                    break;
                case 'voir_evaluations':
                    if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/evaluations');
                    else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('evaluations');
                    success = true;
                    finalMessage = "⭐ Voici vos avis et évaluations.";
                    break;
                case 'voir_mon_vehicule':
                    if (user?.role === 'CHAUFFEUR') {
                        navigate('/chauffeur/vehicule');
                        success = true;
                        finalMessage = "🚗 Voici les détails de votre véhicule.";
                    }
                    break;
                case 'bouton_sos':
                    // On simule l'appel SOS ou on redirige vers l'action SOS du contexte
                    if (passengerCtx?.sosTrigger) {
                        await passengerCtx.sosTrigger();
                        success = true;
                        finalMessage = "🚨 ALERTE SOS DÉCLENCHÉE ! Les autorités et vos contacts d'urgence sont prévenus.";
                    } else if (driverCtx?.sosTrigger) {
                        await driverCtx.sosTrigger();
                        success = true;
                        finalMessage = "🚨 ALERTE SOS DÉCLENCHÉE ! Le centre de contrôle est alerté.";
                    } else {
                        // Action par défaut: simuler l'envoi
                        success = true;
                        finalMessage = "🚨 SIGNAL D'URGENCE ENVOYÉ ! Ne vous inquiétez pas, l'aide arrive.";
                    }
                    break;
                case 'contacter_chauffeur':
                    if (user?.role === 'PASSAGER' && passengerCtx?.selectedDriver?.phone) {
                        window.open(`tel:${passengerCtx.selectedDriver.phone}`);
                        success = true;
                        finalMessage = "📞 Appel en cours vers votre chauffeur...";
                    } else {
                        finalMessage = "❌ Aucun chauffeur assigné à un trajet en cours pour le moment.";
                    }
                    break;
                case 'confirmer_ramassage':
                    if (user?.role === 'CHAUFFEUR' && driverCtx?.confirmPassengerPickup) {
                        // Si l'IA a détecté un ID dans les futurs params ou prend le premier
                        await driverCtx.confirmPassengerPickup();
                        success = true;
                        finalMessage = "✅ Passager marqué comme récupéré.";
                    }
                    break;


                // --- NAVIGATION ADMIN ---
                case 'voir_admin_dashboard': navigate('/admin'); success = true; finalMessage = "🛡️ Voici le tableau de bord administrateur."; break;
                case 'voir_admin_utilisateurs': navigate('/admin/utilisateurs'); success = true; finalMessage = "👥 Liste des passagers affichée."; break;
                case 'voir_admin_chauffeurs': navigate('/admin/chauffeurs'); success = true; finalMessage = "🚗 Liste des chauffeurs affichée."; break;
                case 'voir_admin_trajets': navigate('/admin/trajets'); success = true; finalMessage = "🗺️ Historique de tous les trajets."; break;
                case 'voir_admin_paiements': navigate('/admin/paiements'); success = true; finalMessage = "💰 Liste de tous les paiements."; break;
                case 'voir_admin_validations': navigate('/admin/validations'); success = true; finalMessage = "🔍 Validations en attente."; break;
                case 'voir_admin_litiges': navigate('/admin/litiges'); success = true; finalMessage = "⚠️ Signalements et litiges."; break;
                case 'voir_admin_documents': navigate('/admin/documents'); success = true; finalMessage = "📄 Documents de la plateforme."; break;
                case 'voir_admin_rapports': navigate('/admin/rapports'); success = true; finalMessage = "📊 Rapports et statistiques."; break;
                case 'voir_admin_commissions': navigate('/admin/commissions'); success = true; finalMessage = "💸 Gestion des revenus et commissions."; break;

                case 'valider_chauffeur':
                    const { adminService } = await import('../../services/adminService');
                    // chauffeurId peut être passé via actionData (params backend)
                    await adminService.validateDriver(actionData.chauffeurId, { commentaire: "Validé par l'assistant IA" });
                    success = true;
                    finalMessage = "✅ Le chauffeur a été validé avec succès. Il a reçu une notification de confirmation.";
                    break;
                case 'exporter_donnees':
                    if (user?.role === 'ADMIN') {
                        const dataType = actionData.dataType || 'passagers';
                        const format = (actionData.format || 'pdf').toLowerCase();

                        success = true; // On marque success pour déclencher le message final après l'export

                        try {
                            const { adminService } = await import('../../services/adminService');
                            const exporters = await import('../../utils/exporters');

                            let data = [];
                            let columns = [];
                            let exportTitle = `Export ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} - Taka Taka`;
                            let fileName = `export_${dataType}_${new Date().getTime()}`;

                            if (dataType === 'passagers' || dataType === 'utilisateurs') {
                                const { data: res } = await adminService.getPassengers({ limit: 1000 });
                                data = res.passagers || res.utilisateurs || [];
                                columns = [
                                    { header: 'Nom', accessor: (u) => `${u.prenom || ''} ${u.nom || ''}` },
                                    { header: 'Email', accessor: 'email' },
                                    { header: 'Téléphone', accessor: 'telephone' },
                                    { header: 'Statut', accessor: 'statut' },
                                    { header: 'Trajets', accessor: (u) => u.nombreTrajets || 0 }
                                ];
                            } else if (dataType === 'chauffeurs') {
                                const { data: res } = await adminService.getDrivers({ limit: 1000 });
                                data = res.chauffeurs || [];
                                columns = [
                                    { header: 'Nom', accessor: (c) => c.utilisateur ? `${c.utilisateur.prenom || ''} ${c.utilisateur.nom || ''}` : 'N/A' },
                                    { header: 'Téléphone', accessor: (c) => c.utilisateur?.telephone || 'N/A' },
                                    { header: 'Véhicule', accessor: (c) => c.vehicule ? `${c.vehicule.marque || ''} ${c.vehicule.modele || ''}` : 'N/A' },
                                    { header: 'Statut', accessor: 'statut' },
                                    { header: 'Note', accessor: 'noteMoyenne' }
                                ];
                            } else if (dataType === 'trajets' || dataType === 'geographic') {
                                const { data: res } = await adminService.getTrips({ limit: 1000 });
                                data = res.trajets || [];
                                columns = [
                                    { header: 'ID', accessor: '_id' },
                                    { header: 'Départ', accessor: (t) => t.depart || t.pointDepart?.adresse || (t.reservation?.depart) || 'N/A' },
                                    { header: 'Arrivée', accessor: (t) => t.destination || t.pointArrivee?.adresse || (t.reservation?.destination) || 'N/A' },
                                    { header: 'Prix', accessor: (t) => `${t.prix || t.montant || (t.reservation?.prix) || 0} GNF` },
                                    { header: 'Statut', accessor: 'statut' }
                                ];
                            }

                            if (data.length > 0) {
                                const exportOptions = { data, columns, fileName, title: exportTitle };
                                if (format === 'pdf') await exporters.exportToPDF(exportOptions);
                                else if (format === 'word') await exporters.exportToWord(exportOptions);
                                else await exporters.exportToCSV(exportOptions);

                                finalMessage = `✅ L'export ${format.toUpperCase()} des ${dataType} a été généré et téléchargé avec succès.`;
                            } else {
                                finalMessage = `⚠️ Aucune donnée n'a été trouvée pour exporter la liste des ${dataType}.`;
                            }
                        } catch (err) {
                            console.error("Erreur Export Assistant:", err);
                            finalMessage = "❌ Oups, une erreur est survenue lors de la tentative d'exportation. Veuillez réessayer via le menu des rapports.";
                        }
                    }
                    break;
                case 'voir_facture':
                    try {
                        const { adminService } = await import('../../services/adminService');
                        let lastPayment = null;

                        if (user?.role === 'ADMIN') {
                            const { data: res } = await adminService.getPaymentList({ limit: 1 });
                            if (res.paiements?.length > 0) lastPayment = mapBackendPaymentToFrontend(res.paiements[0]);
                        } else if (user?.role === 'CHAUFFEUR') {
                            const { data: res } = await adminService.getCommissionList({ limit: 1 });
                            if (res.paiements?.length > 0) lastPayment = mapBackendPaymentToFrontend(res.paiements[0]);
                        } else {
                            // Pour les passagers, on utilise l'apiClient directement si besoin ou un service dédié
                            const { data: res } = await apiClient.get(API_ROUTES.passager.paiements.list, { params: { limit: 1 } });
                            if (res.paiements?.length > 0) lastPayment = mapBackendPaymentToFrontend(res.paiements[0]);
                        }

                        if (lastPayment) {
                            setSelectedInvoice(lastPayment);
                            success = true;
                            finalMessage = "🧾 Voici l'aperçu premium de votre dernière facture. Vous pouvez l'imprimer ou la télécharger.";
                        } else {
                            // Fallback si aucun paiement trouvé
                            if (user?.role === 'ADMIN') navigate('/admin/paiements');
                            else if (user?.role === 'CHAUFFEUR') navigate('/chauffeur/history');
                            else if (passengerCtx?.setCurrentPage) passengerCtx.setCurrentPage('payments');
                            success = true;
                            finalMessage = "🧾 Aucun paiement récent n'a été trouvé pour afficher une facture immédiate. Je vous redirige vers votre historique.";
                        }
                    } catch (err) {
                        console.error("Erreur Facture Assistant:", err);
                        finalMessage = "❌ Impossible de récupérer la facture pour le moment. Veuillez réessayer plus tard.";
                    }
                    break;

                case 'identite_ia':
                    finalMessage = "Je suis Taka-Assistant, votre guide intelligent pour la plateforme Taka-Taka Voyage. Je peux vous aider à gérer vos trajets, changer vos paramètres ou répondre à vos questions sur le service.";
                    success = true;
                    break;
                default:
                    finalMessage = "Désolé, je ne peux pas encore exécuter cette action automatiquement.";
            }

            if (success) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: 'model',
                    content: finalMessage,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (err) {
            console.error("Erreur exécution action IA:", err);
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'model',
                content: "❌ Une erreur est survenue lors de l'exécution de l'action.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }]);
        } finally {
            setIsTyping(false);
            setPendingAction(null);
        }
    };

    // --- CONFIRMATION D'ACTION ---
    const handleConfirmAction = () => {
        if (pendingAction) {
            executeAction(pendingAction);
        }
    };

    const handleCancelAction = () => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'model',
            content: "Compris, j'ai annulé l'action.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setPendingAction(null);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const toggleAssistant = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    const handleSend = (e) => {
        if (e) e.preventDefault();
        processMessage();
    };

    const processMessage = async (textOverride = null, isVocalOverride = false) => {
        const msgText = textOverride || inputValue;
        if (!msgText.trim() || isTyping) return;

        const isVocalTurn = isVocalOverride || isAutoVoice || usedVoiceThisTurn;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setError(null);

        try {
            // 🧠 Récupération du contexte métier ultra-détaillé pour l'IA
            const role = user?.role?.toUpperCase() || 'VISITEUR';
            let smartContext = `Rôle: ${role}. Prénom: ${user?.prenom || 'Client'}. Langue: ${i18n.language}.\n`;

            if (role === 'PASSAGER' || role === 'PASSENGER') {
                if (passengerCtx?.currentTrip) {
                    const ct = passengerCtx.currentTrip;
                    smartContext += `ETAT PASSAGER: Trajet en cours. `;
                    smartContext += `Statut exact: ${passengerCtx.tripStatus}. Type: ${ct.typeCourse}. `;
                    smartContext += `Paiement: ${ct.typePaiement}. ID Réservation: ${ct._id || ct.id}. `;
                    if (passengerCtx.selectedDriver) {
                        smartContext += `Chauffeur assigné: ${passengerCtx.selectedDriver.nom || passengerCtx.selectedDriver.name}. `;
                    }
                } else {
                    smartContext += `ETAT PASSAGER: Aucun trajet en cours. En attente de réservation.\n`;
                }
            } else if (role === 'CHAUFFEUR' || role === 'DRIVER') {
                if (driverCtx) {
                    smartContext += `ETAT CHAUFFEUR: ${driverCtx.isOnline ? 'EN LIGNE' : 'HORS LIGNE'}. `;
                    if (driverCtx.trajetEnCours) smartContext += `Statut: Occupé (Trajet en cours). `;
                    else smartContext += `Statut: Disponible. `;

                    if (driverCtx.acceptedTrips && driverCtx.acceptedTrips.length > 0) {
                        smartContext += `Passagers actuels dans le véhicule ou assignés: ${driverCtx.acceptedTrips.length}. `;
                        const activeTrip = driverCtx.acceptedTrips[0]; // On prend le premier pour le contexte ID
                        smartContext += `ID Réservation active: ${activeTrip.id || activeTrip._id}. `;

                        const isShared = driverCtx.acceptedTrips.some(t => t.typeCourse === 'TAXI_PARTAGE' || t.groupeTaxiPartage);
                        if (isShared) {
                            smartContext += `MODE ACTUEL: TAXI PARTAGÉ. `;
                            if (driverCtx.groupeTaxiPartage) smartContext += `ID Groupe: ${driverCtx.groupeTaxiPartage._id}. `;
                            const unpicked = driverCtx.acceptedTrips.filter(t => t.statut === 'EN_ATTENTE_DE_RECUPERATION');
                            const picked = driverCtx.acceptedTrips.filter(t => t.statut === 'RECUPERE');
                            smartContext += `Passagers à récupérer: ${unpicked.length}. Passagers à bord: ${picked.length}. `;
                            if (unpicked.length > 0) {
                                smartContext += `(ACTION REQUISE: Récupérer tous les passagers 'en attente' avant de démarrer le trajet principal). `;
                            } else {
                                smartContext += `(ACTION REQUISE: Vous pouvez démarrer le trajet principal car tout le monde est à bord). `;
                            }
                        } else {
                            smartContext += `MODE ACTUEL: COURSE STANDARD. `;
                        }
                    }
                }
            }

            const chatContext = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await apiClient.post('/ai/chat', {
                message: msgText, // ✅ Correction : Utiliser msgText au lieu de inputValue
                context: chatContext,
                smartContext: smartContext
            });

            if (response.data.succes) {
                const { reponse, actionDetected } = response.data;

                // 🟢 Extraction des données partielles [SLOT_DATA] pour remplissage en direct du formulaire
                let cleanResponse = reponse;
                const slotMatch = reponse.match(/\[SLOT_DATA\](.*?)\[\/SLOT_DATA\]/s);
                if (slotMatch) {
                    // Retirer le bloc [SLOT_DATA] du message affiché
                    cleanResponse = reponse.replace(/\[SLOT_DATA\].*?\[\/SLOT_DATA\]/s, '').trim();
                    try {
                        const slotData = JSON.parse(slotMatch[1]);
                        console.log('🟢 [IA] Slot Data reçu:', slotData);
                        // Émettre vers le formulaire de réservation
                        window.dispatchEvent(new CustomEvent('taka-ia-slot-update', {
                            detail: slotData
                        }));
                    } catch (e) {
                        console.warn('⚠️ Slot Data parsing error:', e);
                    }
                }

                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'model',
                    content: cleanResponse,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMessage]);

                // 🔊 Réponse vocale automatique si le mode est activé
                if (isVocalTurn) {
                    speakMessage(cleanResponse, () => {
                        // Si le mode auto-vocal est actif, on relance l'écoute après avoir parlé
                        if (isAutoVoice || isVocalOverride) {
                            setTimeout(() => startListening(), 500);
                        }
                    });
                    setUsedVoiceThisTurn(false);
                }

                // 🔥 DETECTION ET VALIDATION D'ACTION
                if (actionDetected) {
                    setIsTyping(true);
                    try {
                        const valRes = await apiClient.post('/ai/validate', { action: actionDetected.name });

                        if (valRes.data.succes && valRes.data.canExecute) {
                            if (valRes.data.needsConfirmation) {
                                setPendingAction({
                                    name: actionDetected.name,
                                    message: actionDetected.confirmationMessage,
                                    reservationId: valRes.data.reservationId,
                                    groupeId: valRes.data.groupeId,
                                    payload: actionDetected.payload, // Transmission du payload vers executeAction
                                    contextMsg: userMessage.content,
                                    needsConfirmation: true
                                });
                            } else {
                                // Exécution automatique immédiate
                                await executeAction({
                                    name: actionDetected.name,
                                    reservationId: valRes.data.reservationId,
                                    groupeId: valRes.data.groupeId,
                                    payload: actionDetected.payload,
                                    contextMsg: userMessage.content
                                });
                            }
                        } else {
                            // Erreur métier ou blocage
                            setMessages(prev => [...prev, {
                                id: Date.now() + 2,
                                role: 'model',
                                content: `⚠️ Impossible : ${valRes.data.raison || "Les conditions ne sont pas remplies."}`,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }]);
                        }
                    } catch (vErr) {
                        console.error("Erreur validation action IA:", vErr);
                    } finally {
                        setIsTyping(false);
                    }
                }
            } else {
                throw new Error(response.data.message || 'Erreur inconnue');
            }
        } catch (err) {
            console.error('Erreur Assistant IA:', err);
            setError(null); // On ne met pas l'alerte statique, on utilise la bulle.

            const errorMessage = {
                id: Date.now() + 1,
                role: 'model',
                content: "Erreur, veuillez vérifier votre connexion réseau.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="taka-assistant-container">
            <motion.button
                className={`assistant-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleAssistant}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="trigger-icon-wrapper">
                        <Bot size={28} />
                        <div className="pulse-dot"></div>
                    </div>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        className="assistant-window"
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="assistant-header bg-gradient-to-r from-blue-700 to-green-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                                    <Bot className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm leading-none">{t('assistant.title')}</h3>
                                    <p className="text-[10px] text-blue-100 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        {i18n.language === 'fr' ? 'IA en ligne' : 'AI Online'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <LanguageSwitcher variant="simple" />
                                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80">
                                    <Minus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="assistant-content">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                                    <div className={`message-bubble ${msg.isError ? 'error-bubble' : ''}`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <div className="message-meta-actions">
                                            <span className="message-time">{msg.time}</span>
                                            {msg.role === 'model' && (
                                                <button
                                                    onClick={() => speakMessage(msg.content)}
                                                    className="listen-btn"
                                                    title={t('assistant.listen_msg')}
                                                >
                                                    <Volume2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message-wrapper model">
                                    <div className="message-bubble typing">
                                        <div className="dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="error-alert">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {messages.length < 5 && (
                                <div className="suggestion-chips">
                                    {suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setInputValue(s.query);
                                            }}
                                            className="suggestion-chip"
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {pendingAction && (
                            <div className="action-confirmation-overlay p-4 bg-white/10 backdrop-blur-sm border-t border-white/20">
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 text-center">
                                        Confirmez-vous l'exécution de cette action ?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmAction}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
                                        >
                                            OUI, EXÉCUTER
                                        </button>
                                        <button
                                            onClick={handleCancelAction}
                                            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition-all"
                                        >
                                            NON, ANNULER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="assistant-footer" onSubmit={handleSend}>
                            <button
                                type="button"
                                className={`voice-btn ${isListening ? 'listening' : ''} ${isAutoVoice ? 'active-vocal' : ''}`}
                                onClick={() => {
                                    if (isAutoVoice) {
                                        setIsAutoVoice(false);
                                        window.speechSynthesis.cancel();
                                    } else {
                                        startListening();
                                    }
                                }}
                                disabled={isTyping}
                                title={isAutoVoice ? "Désactiver le mode vocal" : t('assistant.voice_start')}
                            >
                                {isListening ? <MicOff size={18} /> : (isAutoVoice ? <Volume2 size={18} className="text-green-500" /> : <Mic size={18} />)}
                            </button>
                            <input
                                type="text"
                                placeholder={t('assistant.placeholder')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="send-button"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && isMinimized && (
                    <motion.div
                        className="minimized-bar bg-gradient-to-r from-blue-700 to-green-600"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        onClick={() => setIsMinimized(false)}
                    >
                        <Bot size={18} className="text-white" />
                        <span className="text-xs font-medium text-white">
                            {i18n.language === 'fr' ? 'Assistant réduit' : 'Minimized Assistant'}
                        </span>
                        <Maximize2 size={16} className="text-white/80 ml-2" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Facture Premium via Assistant */}
            <AnimatePresence>
                {selectedInvoice && (
                    <PremiumInvoice
                        payment={selectedInvoice}
                        onClose={() => setSelectedInvoice(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssistantIA;
