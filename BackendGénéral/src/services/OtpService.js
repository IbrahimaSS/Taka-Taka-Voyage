const crypto = require("crypto");
const Otp = require("../models/Otp");
const { envoyerEmailBrevo } = require("./emailService");

function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function sha256(v) {
  return crypto.createHash("sha256").update(String(v)).digest("hex");
}

exports.genererOtp = async ({ telephone, email }) => {
  if (!telephone) throw new Error("Téléphone requis");
  if (!email) throw new Error("Email requis pour envoyer l’OTP");

  const ttlMin = Number(process.env.OTP_TTL_MINUTES || 5);
  const cooldownSec = Number(process.env.OTP_COOLDOWN_SECONDS || 60);

  const existing = await Otp.findOne({ telephone });
  if (existing?.lastSentAt) {
    const diff = Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
    if (diff < cooldownSec) {
      throw new Error(`Veuillez patienter ${cooldownSec - diff}s avant de redemander un code.`);
    }
  }

  const code = generateOtp6();
  const codeHash = sha256(code);
  const expireA = new Date(Date.now() + ttlMin * 60 * 1000);

  await Otp.findOneAndUpdate(
    { telephone },
    { telephone, codeHash, expireA, lastSentAt: new Date(), attempts: 0 },
    { upsert: true, new: true }
  );

  await envoyerEmailBrevo({
    toEmail: email,
    subject: "Votre code de vérification (OTP)",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Code OTP</h2>
        <p>Valable ${ttlMin} minutes :</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</div>
      </div>
    `,
  });

  return true;
};

exports.verifierOtp = async (telephone, code) => {
  const otp = await Otp.findOne({ telephone });
  if (!otp) throw new Error("Aucun OTP trouvé");

  if (otp.expireA <= new Date()) {
    await Otp.deleteOne({ telephone });
    throw new Error("OTP expiré");
  }

  if ((otp.attempts || 0) >= 5) {
    await Otp.deleteOne({ telephone });
    throw new Error("Trop de tentatives. Redemandez un OTP.");
  }

  const ok = sha256(String(code).trim()) === otp.codeHash;
  if (!ok) {
    await Otp.updateOne({ telephone }, { $inc: { attempts: 1 } });
    throw new Error("Code OTP invalide");
  }

  await Otp.deleteOne({ telephone });
  return true;
};