import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import './AssistantIA.css';

const AssistantIA = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

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
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // --- Fonctionnalité : Text-To-Speech (Lire le message) ---
    const speakMessage = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Adaptation de la langue pour la synthèse
        const langMap = { 'fr': 'fr-FR', 'en': 'en-GB' };
        utterance.lang = langMap[i18n.language] || 'fr-FR';

        utterance.rate = 1;
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
        };

        recognition.start();
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

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
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
                    smartContext += `Paiement: ${ct.typePaiement}. `;
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
                        const isShared = driverCtx.acceptedTrips.some(t => t.typeCourse === 'TAXI_PARTAGE' || t.groupeTaxiPartage);
                        if (isShared) {
                            smartContext += `MODE ACTUEL: TAXI PARTAGÉ. `;
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
                message: inputValue,
                context: chatContext,
                smartContext: smartContext // Envoyer le contexte métier au backend
            });

            if (response.data.succes) {
                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'model',
                    content: response.data.reponse,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMessage]);
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

                        <form className="assistant-footer" onSubmit={handleSend}>
                            <button
                                type="button"
                                className={`voice-btn ${isListening ? 'listening' : ''}`}
                                onClick={startListening}
                                disabled={isTyping}
                                title={t('assistant.voice_start')}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
        </div>
    );
};

export default AssistantIA;
