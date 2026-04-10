/**
 * Service SMS via Africa's Talking
 * Initialisation LAZY pour éviter le crash du serveur si la clé est absente.
 */

let sms = null;

function getSmsClient() {
    if (sms) return sms;

    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';

    if (!apiKey) {
        console.warn("⚠️ [SMS-SERVICE] AFRICASTALKING_API_KEY non définie. Les SMS ne seront pas envoyés.");
        return null;
    }

    try {
        const africastalking = require('africastalking');
        const AT = africastalking({ apiKey, username });
        sms = AT.SMS;
        return sms;
    } catch (err) {
        console.error("🚨 [SMS-SERVICE] Erreur d'initialisation Africa's Talking:", err.message);
        return null;
    }
}

/**
 * Envoie un SMS à un numéro spécifique via Africa's Talking
 * @param {string} to - Numéro de téléphone (format international ex: +224...)
 * @param {string} message - Contenu du message
 */
exports.sendSMS = async (to, message) => {
    try {
        const client = getSmsClient();
        if (!client) {
            console.warn("⚠️ [SMS-SERVICE] Client SMS non disponible. SMS ignoré.");
            return { succes: false, error: "Service SMS non configuré" };
        }

        console.log(`📡 [SMS-SERVICE] Envoi vers ${to}...`);
        
        // Nettoyage sommaire du numéro (doit commencer par +)
        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) {
            // Par défaut si Guinéen sans +, on ajoute +224
            if (formattedTo.startsWith('6')) {
                formattedTo = '+224' + formattedTo;
            } else {
                console.warn("⚠️ [SMS-SERVICE] Numéro mal formaté, l'envoi risque d'échouer.");
            }
        }

        const options = {
            to: [formattedTo],
            message: message
            // from: 'TAKATAKA' // Optionnel : Nécessite un Sender ID validé
        };

        const result = await client.send(options);
        console.log("✅ [SMS-SERVICE] Succès :", JSON.stringify(result, null, 2));
        return { succes: true, data: result };
    } catch (error) {
        console.error("🚨 [SMS-SERVICE] Erreur :", error);
        return { succes: false, error: error.message };
    }
};
