import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://taka-taka-voyage.onrender.com';

class SocketService {
    socket = null;
    listeners = new Map();

    async connect() {
        if (this.socket?.connected) return this.socket;

        const token = await AsyncStorage.getItem('authToken');

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['polling', 'websocket'], // Commencer par polling pour compatibilité
            path: '/socket.io/',
            secure: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from socket server:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
