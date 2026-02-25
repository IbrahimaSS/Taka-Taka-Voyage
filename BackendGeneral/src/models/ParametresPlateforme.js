const mongoose = require("mongoose");

const parametresPlateformeSchema = new mongoose.Schema(
    {
        // Général
        platform: {
            name: { type: String, default: 'Taka Taka' },
            logo: { type: String, default: null },
            tagline: { type: String, default: 'Votre transport, notre priorité' },
            currency: { type: String, default: 'GNF' },
            timezone: { type: String, default: 'Africa/Conakry' },
            language: { type: String, default: 'fr' },
            country: { type: String, default: 'GN' },
            companyAddress: { type: String, default: '' },
            contactEmail: { type: String, default: 'contact@takataka.com' },
            contactPhone: { type: String, default: '+224 000 000 000' },
            website: { type: String, default: 'https://takataka.com' },
            maintenanceMode: { type: Boolean, default: false },
            maintenanceMessage: { type: String, default: 'Plateforme en maintenance. Veuillez réessayer plus tard.' }
        },

        // Services
        services: {
            motoTaxi: {
                name: { type: String, default: 'Moto-taxi' },
                basePrice: { type: Number, default: 5000 },
                perKm: { type: Number, default: 1500 },
                perMinute: { type: Number, default: 300 },
                minimumFare: { type: Number, default: 5000 },
                enabled: { type: Boolean, default: true },
                description: { type: String, default: 'Service de moto-taxi économique et rapide' }
            },
            sharedTaxi: {
                name: { type: String, default: 'Taxi partagé' },
                basePrice: { type: Number, default: 10000 },
                perKm: { type: Number, default: 2000 },
                perMinute: { type: Number, default: 400 },
                minimumFare: { type: Number, default: 10000 },
                enabled: { type: Boolean, default: true },
                description: { type: String, default: 'Taxi partagé pour plusieurs passagers' }
            },
            privateCar: {
                name: { type: String, default: 'Voiture privée' },
                basePrice: { type: Number, default: 15000 },
                perKm: { type: Number, default: 2500 },
                perMinute: { type: Number, default: 500 },
                minimumFare: { type: Number, default: 15000 },
                enabled: { type: Boolean, default: true },
                description: { type: String, default: 'Voiture privée avec chauffeur' }
            },
            delivery: {
                name: { type: String, default: 'Livraison' },
                basePrice: { type: Number, default: 3000 },
                perKm: { type: Number, default: 1000 },
                perMinute: { type: Number, default: 200 },
                minimumFare: { type: Number, default: 3000 },
                enabled: { type: Boolean, default: false },
                description: { type: String, default: 'Service de livraison de colis' }
            }
        },

        // Paiements
        payments: {
            methods: {
                cash: { enabled: { type: Boolean, default: true }, minAmount: { type: Number, default: 1000 } },
                orangeMoney: {
                    enabled: { type: Boolean, default: true },
                    commission: { type: Number, default: 2.5 },
                    apiKey: { type: String, default: '' },
                    username: { type: String, default: '' },
                    sandbox: { type: Boolean, default: true }
                },
                mtnMoney: {
                    enabled: { type: Boolean, default: true },
                    commission: { type: Number, default: 2.5 },
                    apiKey: { type: String, default: '' },
                    userId: { type: String, default: '' },
                    sandbox: { type: Boolean, default: true }
                },
                stripe: {
                    enabled: { type: Boolean, default: false },
                    commission: { type: Number, default: 3.5 },
                    publicKey: { type: String, default: '' },
                    secretKey: { type: String, default: '' }
                }
            },
            autoWithdrawal: {
                enabled: { type: Boolean, default: true },
                threshold: { type: Number, default: 50000 },
                schedule: { type: String, default: 'daily' }
            }
        },

        // Notifications
        notifications: {
            channels: {
                whatsapp: {
                    enabled: { type: Boolean, default: true },
                    template: { type: String, default: 'Bonjour {customer_name}, votre course #{ride_id} est confirmée! 🚗\nChauffeur: {driver_name}\nVéhicule: {vehicle_type}\nPrix: {amount} GNF' },
                    businessAccountId: { type: String, default: '' }
                },
                sms: {
                    enabled: { type: Boolean, default: false },
                    provider: { type: String, default: 'africastalking' },
                    apiKey: { type: String, default: '' },
                    senderId: { type: String, default: 'TAKATAKA' }
                },
                email: {
                    enabled: { type: Boolean, default: true },
                    provider: { type: String, default: 'smtp' },
                    smtp: {
                        host: { type: String, default: '' },
                        port: { type: Number, default: 587 },
                        username: { type: String, default: '' },
                        password: { type: String, default: '' },
                        encryption: { type: String, default: 'tls' }
                    }
                },
                push: {
                    enabled: { type: Boolean, default: true },
                    firebaseConfig: { type: mongoose.Schema.Types.Mixed, default: {} }
                }
            }
        },

        // Métadonnées
        version: { type: String, default: '1.0.0' }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ParametresPlateforme", parametresPlateformeSchema);
