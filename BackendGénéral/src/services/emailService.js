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

module.exports = { envoyerEmailBrevo };