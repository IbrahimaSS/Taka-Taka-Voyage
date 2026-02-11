// src/services/socketService.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.identity = null;
    this.pendingEmits = [];
    this.listeners = new Map(); // Store listeners to re-apply them on reconnect/reconnect
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  connect(userId, role = "CHAUFFEUR", nom = "", prenom = "") {
    if (!userId) throw new Error("socketService.connect: userId manquant");

    const nextIdentity = { userId, role, nom, prenom };

    // Si on est déjà connecté avec la même identité, on ne fait rien
    if (this.socket?.connected && this.identity?.userId === userId && this.identity?.role === role) {
      return;
    }

    if (this.socket) {
      // ✅ On ne remove pas TOUS les listeners (sinon on perd ceux du front)
      // On se déconnecte juste proprement
      this.socket.disconnect();
      this.socket = null;
    }

    this.identity = nextIdentity;

    this.socket = io(SOCKET_URL, {
      path: "/socket.io/",
      auth: { userId, role, nom, prenom },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 20,
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      console.log(`🟢 Socket connecté → ${this.socket.id} (${role})`);

      // ✅ Re-appliquer tous les listeners enregistrés
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(cb => this.socket.on(event, cb));
      });

      this.socket.emit("client:online", { role, userId, nom, prenom });

      if (this.pendingEmits.length) {
        const queue = [...this.pendingEmits];
        this.pendingEmits = [];
        queue.forEach(({ event, data }) => this.socket.emit(event, data));
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("❌ socket connect_error:", err.message);
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Si déjà connecté, on attache direct
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
      // Note: we keep this.listeners to re-apply them if connect() is called again
    }
  }
}

export const socketService = new SocketService();
export default socketService;
