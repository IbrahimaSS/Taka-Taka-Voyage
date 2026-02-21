import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, X, Send, Bot, User, Sparkles,
    ChevronDown, Minus, Maximize2, Headset,
    HelpCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../services/apiClient';
import './AssistantIA.css';

const AssistantIA = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'model',
            content: 'Bonjour ! Je suis Taka-Assistant, votre guide IA. Comment puis-je vous aider aujourd\'hui ?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
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
        e.preventDefault();
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
            // Préparer le contexte pour l'IA (historique limité aux 10 derniers messages)
            const context = messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await apiClient.post('/ai/chat', {
                message: inputValue,
                context: context
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
            setError('Impossible de contacter l\'assistant. Vérifiez votre connexion.');

            // Message d'erreur de secours dans le chat
            const errorMessage = {
                id: Date.now() + 1,
                role: 'model',
                content: "Désolé, je rencontre une petite difficulté technique. Veuillez contacter notre support à support@takataka.com si le problème persiste.",
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
            {/* 🚀 Bouton Bulle Flottant */}
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

            {/* 💬 Fenêtre de Chat */}
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        className="assistant-window"
                        initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        {/* Header */}
                        <div className="assistant-header bg-gradient-to-r from-blue-700 to-green-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                                    <Bot className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm leading-none">Taka-Assistant</h3>
                                    <p className="text-[10px] text-blue-100 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        IA en ligne
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80">
                                    <Minus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="assistant-content">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                                    <div className={`message-bubble ${msg.isError ? 'error-bubble' : ''}`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <span className="message-time">{msg.time}</span>
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
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form className="assistant-footer" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Posez votre question..."
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

            {/* 🤏 Mini-barre quand réduit */}
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
                        <span className="text-xs font-medium text-white">Assistant réduit</span>
                        <Maximize2 size={16} className="text-white/80 ml-2" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssistantIA;
