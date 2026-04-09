const admin = require("firebase-admin");
const path = require("path");

try {
  const serviceAccount = require(path.join(__dirname, "../../serviceAccountKey.json"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("✅ Firebase Admin initialisé avec succès");
} catch (error) {
  console.error("❌ Erreur initialisation Firebase Admin:", error.message);
}

module.exports = admin;
