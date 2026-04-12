const express = require('express');
const path = require("path");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// CORS avec cookies (Avant les body parsers)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan("dev"));

// Configuration Passport (Social Login)
const setupPassport = require('./config/passport');
setupPassport(app);

// Setup de la documentation Swagger (openapi)
const setupSwagger = require('./config/swagger');
setupSwagger(app);



app.get("/", (req, res) => {
    res.status(200).json({
        succes: true,
        message: "API TAKA TAKA opérationnelle",
        horodatage: new Date().toISOString(),
    });
});

// Fichiers uploads (documents chauffeur)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
//==================== GESTIONS COMPTE =====================
//Gestion Utilisateurs
const authRoutes = require("./routes/compte/authRoutes");
//Montage
app.use("/api/auth", authRoutes);


// ===================== ROUTES ADMIN =====================
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const passagerRoutes = require("./routes/admin/passagerRoutes");
const chauffeurRoutes = require("./routes/admin/chauffeurRoutes");
const documentRoutes = require("./routes/admin/documentRoutes");
const commissionRoutes = require("./routes/admin/commissionRoutes");
const validationRoutes = require("./routes/admin/validationRoutes");
const trajetRoutes = require("./routes/admin/trajetRoutes");
const paiementRoutes = require("./routes/admin/paiementRoutes");
const rapportRoutes = require("./routes/admin/rapportRoutes");
const litigeRoutes = require("./routes/admin/litigeRoutes");
const profileRoutes = require("./routes/admin/profileRoutes");
const personnelRoutes = require("./routes/admin/personnelRoutes");
const securityRoutes = require("./routes/admin/securityRoutes");
const parametresRoutes = require("./routes/admin/parametresRoutes");
const activityLogRoutes = require("./routes/admin/activityLogRoutes");
//Montage
app.use("/api/admin", dashboardRoutes);
app.use("/api/admin", passagerRoutes);
app.use("/api/admin", chauffeurRoutes);
app.use("/api/admin", documentRoutes);
app.use("/api/admin", commissionRoutes);
app.use("/api/admin/chauffeurs/validation", validationRoutes);
app.use("/api/admin/trajets", trajetRoutes);
app.use("/api/admin/paiements", paiementRoutes);
app.use("/api/admin", rapportRoutes);
app.use("/api/admin", litigeRoutes);
app.use("/api/admin", profileRoutes);
app.use("/api/admin/parametres", parametresRoutes);
app.use("/api/admin/logs", activityLogRoutes);

const couponRoutes = require("./routes/admin/couponRoutes");
app.use("/api/coupons", couponRoutes);

// Transaction Portefeuille
const transactionRoutes = require("./routes/admin/transactionRoutes");
app.use("/api/admin", transactionRoutes);

// Sauvegardes
const backupRoutes = require("./routes/admin/backupRoutes");
app.use("/api/admin/backups", backupRoutes);

//Personnel
app.use("/api/admin/personnels", personnelRoutes);

// Changer mot de passe personnel
app.use("/api/admin/security", securityRoutes);

// ===================== ROUTES PASSAGER ET BRANCHEMENT =====================
//Passager - Estimations
const estimationRoutesP = require("./routes/passager/estimationsRoutes");
app.use("/api/estimations", estimationRoutesP);

//Passager - Reservations Immédiates
const reservationImmediateRoutesP = require("./routes/passager/reservationImmediateRoutes");
app.use("/api/reservations-immediate", reservationImmediateRoutesP);

//Passager - Paiements
const paiementRoutesP = require("./routes/passager/paiementsRoutes");
app.use("/api/paiements", paiementRoutesP);

//Passager - Réservations Planifiées
const reservationPlanifieeRoutesP = require("./routes/passager/reservationsPlanifieeRoutes");
app.use("/api/passager/reservations-planifiees", reservationPlanifieeRoutesP);

//Passager - Trajets
const trajetsRoutesP = require("./routes/passager/trajetsRoutes");
app.use("/api/passager", trajetsRoutesP);

//Passager - Réservations Générales (Active, etc.)
const reservationRoutesP = require("./routes/passager/reservationRoutes");
app.use("/api/passager/reservations", reservationRoutesP);

//Passager - Historiques des Paiements
const listesPaiements = require("./routes/passager/listesPaimentsRoutes");
app.use("/api/passager/paiements", listesPaiements);

//Stats Passager - Planning
const statsRoutesPlanning = require("./routes/passager/statsRoutesPlanning");
app.use("/api/passager", statsRoutesPlanning);

//Profil
const profileRoutesP = require("./routes/passager/profileRoutes");
app.use("/api/passager/profile", profileRoutesP);

//Changement Mot de Passe
const motDePasseRoutesP = require("./routes/passager/motDePasseRoutes");
app.use("/api/passager", motDePasseRoutesP);

//Notifications
const notificationsRoutesP = require("./routes/passager/notificationsRoutes");
app.use("/api/passager", notificationsRoutesP);

//Évaluations
const evaluationsRoutesP = require("./routes/passager/evaluationsRoutes");
app.use("/api/evaluations", evaluationsRoutesP);

// ===================== ROUTES CHAUFFEUR ET BRANCHEMENT =====================
const chauffeurProfileRoutes = require("./routes/chauffeur/profileRoutes");
app.use("/api/chauffeur", chauffeurProfileRoutes);

//Dashboard
const chauffeurDashboardRoutes = require("./routes/chauffeur/chauffeurDashboardRoutes");
app.use("/api/chauffeur", chauffeurDashboardRoutes);

//Historique des trajets
const historiqueTrajetsRoutes = require("./routes/chauffeur/historiqueTrajetsRoutes");
app.use("/api/chauffeur", historiqueTrajetsRoutes);

//Chauffeur - Revenus
const chauffeurRevenusRoutes = require("./routes/chauffeur/chauffeurRevenusRoutes");
app.use("/api/chauffeur", chauffeurRevenusRoutes);

// Après les autres routes chauffeur
const mesCoursesRoutes = require("./routes/chauffeur/mesCoursesRoutes");
app.use("/api/chauffeur", mesCoursesRoutes);

// ===================== ROUTES COMMUNES =====================
const commonLitigeRoutes = require("./routes/common/litigeRoutes");
app.use("/api/litiges", commonLitigeRoutes);

// Services actifs (route publique — pas d'auth requise)
const servicesRoutes = require("./routes/common/servicesRoutes");
app.use("/api/services-actifs", servicesRoutes);

// Alertes et SOS
const alerteRoutes = require("./routes/common/alerteRoutes");
app.use("/api/alertes", alerteRoutes);

// Assistant IA
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// 🚕 Taxi Partagé - Routes dédiées
const taxiPartageRoutes = require("./routes/taxiPartageRoutes");
app.use("/api/taxipartage", taxiPartageRoutes);

// Statistiques publiques
const statsRoutes = require("./routes/common/statsRoutes");
app.use("/api/common", statsRoutes);

// Contact et support public
const contactRoutes = require("./routes/common/contactRoutes");
app.use("/api/common", contactRoutes);

// 🏦 Portefeuille TakaTaka (Fintech)
const walletRoutes = require("./routes/common/walletRoutes");
app.use("/api/wallet", walletRoutes);

// 🎫 Tickets QR
const ticketRoutes = require("./routes/common/ticketRoutes");
app.use("/api/tickets", ticketRoutes);

// ===================== TÉLÉCHARGEMENT APK =====================
app.get("/api/download/apk", (req, res) => {
    const filePath = path.join(__dirname, "..", "downloads", "takataka-V1.apk");
    res.download(filePath, "TakaTakaApp.apk", (err) => {
        if (err && !res.headersSent) {
            console.error("Erreur téléchargement APK:", err);
            res.status(404).json({ message: "Fichier APK introuvable" });
        }
    });
});

module.exports = app;

