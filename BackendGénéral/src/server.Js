require("dotenv").config();
const http = require("http");
const app = require("./app");
const connecterBaseDeDonnees = require("./config/baseDeDonnees");
const { Server } = require("socket.io");
const initSocket = require("./socket");

const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connecterBaseDeDonnees();

// Création du serveur HTTP
const server = http.createServer(app);

// Liste des origines autorisées (très important pour le dev local)
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",     // Vite (le plus courant)
    "http://localhost:5174",     // Parfois Vite change de port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    ];

    // Initialisation de Socket.IO – configuration robuste
    const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
        // Autorise toutes les origines en dev local
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
        },
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "my-custom-header"],
    },
    path: "/socket.io/",           // Chemin par défaut – ne change pas
    transports: ["websocket", "polling"], // websocket en priorité
    pingTimeout: 60000,            // 60 secondes – évite les déconnexions prématurées
    pingInterval: 25000,
    upgradeTimeout: 30000,         // Temps pour passer en websocket
    });

    // Log détaillé des connexions (très utile pour debug)
    io.on("connection", (socket) => {
    console.log("🟢 Nouveau client connecté → ID:", socket.id);
    console.log("   → IP:", socket.handshake.address);
    console.log("   → Auth:", socket.handshake.auth);
    console.log("   → Origin:", socket.handshake.headers.origin);

    socket.on("disconnect", (reason) => {
        console.log("🔴 Client déconnecté → ID:", socket.id, "Raison:", reason);
    });

    // Test ping/pong pour confirmer la connexion bidirectionnelle
    socket.on("ping", () => {
        console.log("Ping reçu de", socket.id);
        socket.emit("pong", { message: "Pong du serveur !" });
    });
    });

    // Rendre io accessible dans les controllers (tu l'utilises déjà)
    app.set("io", io);

    // Initialisation des events socket (ton fichier ./socket)
    initSocket(io);

    // Lancement du serveur
    server.listen(PORT, () => {
    console.log(`🚀 Serveur TAKA TAKA + Socket.IO démarré sur http://localhost:${PORT}`);
    console.log(`   → CORS autorisé pour :`, allowedOrigins.join(", "));
});     