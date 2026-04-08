const africastalking = require('africastalking');

// Configuration
const credentials = {
    apiKey: process.env.AFRICASTALKING_API_KEY,
    username: process.env.AFRICASTALKING_USERNAME || 'sandbox'
};

const AT = africastalking(credentials);
const sms = AT.SMS;

/**
 * Envoie un SMS à un numéro spécifique via Africa's Talking
 * @param {string} to - Numéro de téléphone (format international ex: +224...)
 * @param {string} message - Contenu du message
 */
exports.sendSMS = async (to, message) => {
    try {
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

        const result = await sms.send(options);
        console.log("✅ [SMS-SERVICE] Succès :", JSON.stringify(result, null, 2));
        return { succes: true, data: result };
    } catch (error) {
        console.error("🚨 [SMS-SERVICE] Erreur :", error);
        return { succes: false, error: error.message };
    }
};
