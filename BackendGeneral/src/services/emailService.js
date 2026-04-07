//emailService Version finale et complete et corriger du fichier
const axios = require("axios");

async function envoyerEmailBrevo({ toEmail, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.OTP_SENDER_EMAIL;
  const senderName = process.env.OTP_SENDER_NAME || "NoReply";

  if (!apiKey) throw new Error("BREVO_API_KEY manquant");
  if (!senderEmail) throw new Error("OTP_SENDER_EMAIL manquant");
  if (!toEmail) throw new Error("toEmail manquant");

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );
    return true;
  } catch (err) {
    // remonte l’erreur Brevo lisible
    const details = err.response?.data;
    throw new Error(details ? JSON.stringify(details) : err.message);
  }
}

async function envoyerSmsBrevo({ toPhone, content }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.OTP_SENDER_NAME || "TAKATAKA";

  if (!apiKey) throw new Error("BREVO_API_KEY manquant");
  if (!toPhone) throw new Error("Numéro de téléphone manquant");

  // On enlève le + pour tester le format numérique pur exigé par certains comptes Brevo
  const formattedPhone = toPhone.toString().replace(/\D/g, '');

  const requestBody = {
    sender: "INFO", // Test avec un expéditeur générique très court
    recipient: formattedPhone,
    content: content,
    type: "transactional"
  };

  try {
    console.log("📤 [BREVO_API_REQUEST] Format numérique pur...", JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(
      "https://api.brevo.com/v3/transactionalSMS/sms",
      requestBody,
      {
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );
    return true;
  } catch (err) {
    console.error("❌ [BREVO_API_ERROR] Échec final:", err.response?.data || err.message);
    const details = err.response?.data;
    throw new Error(details ? JSON.stringify(details) : err.message);
  }
}

module.exports = { envoyerEmailBrevo, envoyerSmsBrevo };