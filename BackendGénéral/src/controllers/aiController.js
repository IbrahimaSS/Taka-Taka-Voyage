const axios = require("axios");

/**
 * CONNAISSANCES DE L'ASSISTANT TAKA-TAKA
 */
const SYSTEM_PROMPT = `
Tu es "Taka-Assistant", l'intelligence artificielle experte de Taka-Taka Voyage en Guinée. 
Ton but est d'aider les passagers et chauffeurs avec courtoisie.

INFOS CLÉS :
- Services : Course immédiate, Course planifiée, Taxi-Partage (Carpooling).
- Pour les Passagers : Estimation de prix, suivi temps réel, paiement Cash ou Digital.
- Pour les Chauffeurs : Inscription, envoi de documents, validation par l'admin.
- Modèle Économique : Commission de 20% pour Taka-Taka, 80% des gains pour le chauffeur.

TON STYLE :
- Langue : Français de Guinée (accueil chaleureux, "Bienvenue", "C'est un plaisir").
- Concision : Réponses directes et précises.
- Pas de blabla technique sur les clés API ou les serveurs.
`;

exports.chat = async (req, res) => {
    try {
        const { message, context = [] } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).json({ succes: false, message: "Configuration incomplète." });

        // Restauration de la mémoire (Historique de conversation)
        const history = context
            .filter(msg => msg.content && msg.content.trim() !== "")
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

        // S'assurer que l'historique commence par un message utilisateur (exigence Google)
        if (history.length > 0 && history[0].role !== 'user') {
            history.shift();
        }

        // Appel au modèle stable gemini-flash-latest
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
            {
                contents: [
                    ...history,
                    {
                        role: "user",
                        parts: [{ text: `${SYSTEM_PROMPT}\n\nClient : ${message}` }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7
                }
            },
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const aiText = response.data.candidates[0].content.parts[0].text;
            return res.json({ succes: true, reponse: aiText });
        } else {
            throw new Error("Réponse de l'IA non valide.");
        }

    } catch (error) {
        console.error("🚨 [TAKA-ASSISTANT] Erreur:", error.message);
        return res.status(500).json({
            succes: false,
            message: "L'assistant rencontre une petite difficulté. Réessayez."
        });
    }
};
