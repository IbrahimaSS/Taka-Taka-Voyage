import { io } from "socket.io-client";
import { getServerURL } from "../utils/urlHelper";

// -----------------------------------------------------------------------------
// 1️⃣  URL du serveur Socket.io – provient de VITE_SOCKET_URL
// -----------------------------------------------------------------------------
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || getServerURL();

class SocketService {
  constructor() {
    this.socket = null;
    this.identity = null;
    this.pendingEmits = [];
    this.listeners = new Map(); // Store listeners to re‑apply them on reconnect
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  // ---------------------------------------------------------------------------
  // 2️⃣  Connexion – on ajoute le JWT (authToken) au payload d'authentification
  // ---------------------------------------------------------------------------
  connect(userId, role = "CHAUFFEUR", nom = "", prenom = "") {
    if (!userId) throw new Error("socketService.connect: userId manquant");

    const nextIdentity = { userId, role, nom, prenom };

    // Si déjà connecté avec la même identité, on s'assure juste d'émettre client:online pour le serveur
    if (this.socket?.connected && this.identity?.userId === userId && this.identity?.role === role) {
      this.socket.emit("client:online", { role, userId, nom, prenom });
      return;
    }

    // Nettoyage de l'ancienne socket et suppression des listeners
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(cb => this.socket.off(event, cb));
      });
      this.socket.disconnect();
      this.socket = null;
    }

    this.identity = nextIdentity;

    // Récupération du JWT stocké côté client
    const jwt = localStorage.getItem('authToken');
    const authPayload = { userId, role, nom, prenom };
    if (jwt) authPayload.token = jwt; // le serveur pourra le lire via socket.handshake.auth

    this.socket = io(SOCKET_URL, {
      path: "/socket.io/",
      auth: authPayload,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 20,
      withCredentials: true,
    });

    // Ré‑attacher les listeners déjà enregistrés (une seule fois)
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(cb => this.socket.on(event, cb));
    });

    this.socket.on("connect", () => {
      console.log(`🟢 Socket connecté → ${this.socket.id} (${role})`);
      this.socket.emit("client:online", { role, userId, nom, prenom });

      if (this.pendingEmits.length) {
        const queue = [...this.pendingEmits];
        this.pendingEmits = [];
        queue.forEach(({ event, data }) => this.socket.emit(event, data));
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ socket connect_error:", err.message);
      // Gestion du cas 401 – token invalide
      if (err?.data?.code === 401) {
        console.warn('🔐 401 socket – token invalide, nettoyage et redirection');
        localStorage.removeItem('authToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3️⃣  Gestion des écouteurs
  // ---------------------------------------------------------------------------
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  onceConnected(cb) {
    if (this.socket?.connected) return cb?.();
    const handler = () => {
      this.socket.off("connect", handler);
      cb?.();
    };
    this.socket?.on("connect", handler);
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      this.pendingEmits.push({ event, data });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.identity = null;
      this.pendingEmits = [];
      // listeners are kept for future reconnection
    }
  }
}

export const socketService = new SocketService();
export default socketService;
