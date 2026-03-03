const mongoose = require("mongoose");

const groupeTaxiPartageSchema = new mongoose.Schema(
    {
        // Chauffeur responsable du groupe
        chauffeur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true,
            index: true
        },

        // Type de véhicule (uniquement TAXI_PARTAGE)
        typeVehicule: {
            type: String,
            enum: ["TAXI_PARTAGE"],
            required: true
        },

        // Capacité maximale du véhicule (2 à 6 passagers)
        capaciteMax: {
            type: Number,
            required: true,
            min: 2,
            max: 6
        },

        // Statut du groupe
        statut: {
            type: String,
            enum: ["EN_FORMATION", "RAMASSAGE_EN_COURS", "TRAJET_EN_COURS", "TERMINE"],
            default: "EN_FORMATION",
            index: true
        },

        // Liste des réservations du groupe avec leur ordre de ramassage
        reservations: [{
            reservation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reservation",
                required: true
            },
            ordre: {
                type: Number,
                required: true,
                min: 1
            },
            statut: {
                type: String,
                enum: ["EN_ATTENTE", "EN_COURS_DE_RAMASSAGE", "RAMASSE"],
                default: "EN_ATTENTE"
            },
            dateRamassage: {
                type: Date,
                default: null
            }
        }],

        // Contrôle de démarrage (validation backend obligatoire)
        peutDemarrer: {
            type: Boolean,
            default: false
        },

        // Dates importantes
        dateDemarrage: {
            type: Date,
            default: null
        },

        dateFin: {
            type: Date,
            default: null
        },

        // Statistiques du groupe
        distanceTotale: {
            type: Number,
            default: 0
        },

        prixTotal: {
            type: Number,
            default: 0
        },

        // Métadonnées pour traçabilité
        creePar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            default: null
        },

        dernierModifiePar: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            default: null
        }
    },
    {
        timestamps: true,
        // Index pour optimiser les requêtes
        index: [
            { chauffeur: 1, statut: 1 },
            { statut: 1, dateDemarrage: -1 },
            { "reservations.reservation": 1 }
        ]
    }
);

// Méthodes d'instance
groupeTaxiPartageSchema.methods = {
    // Vérifier si le groupe peut démarrer
    async verifierPeutDemarrer() {
        const tousRamasses = this.reservations.every(
            r => r.statut === "RAMASSE"
        );
        
        if (tousRamasses && this.statut === "RAMASSAGE_EN_COURS") {
            this.peutDemarrer = true;
            await this.save();
        }
        
        return {
            peutDemarrer: tousRamasses,
            passagersRestants: this.reservations.filter(r => r.statut !== "RAMASSE").length,
            message: tousRamasses ? 
                "Tous les passagers sont à bord" : 
                `En attente de ${this.reservations.filter(r => r.statut !== "RAMASSE").length} passager(s)`
        };
    },

    // Ajouter une réservation au groupe
    async ajouterReservation(reservationId) {
        if (this.reservations.length >= this.capaciteMax) {
            throw new Error(`Capacité maximale atteinte (${this.capaciteMax} passagers)`);
        }

        // Vérifier que la réservation n'est pas déjà dans le groupe
        if (this.reservations.some(r => r.reservation.toString() === reservationId.toString())) {
            throw new Error("Cette réservation est déjà dans le groupe");
        }

        const nouvelOrdre = Math.max(...this.reservations.map(r => r.ordre), 0) + 1;
        
        this.reservations.push({
            reservation: reservationId,
            ordre: nouvelOrdre,
            statut: "EN_ATTENTE"
        });

        await this.save();
        return nouvelOrdre;
    },

    // Mettre à jour le statut d'une réservation
    async mettreAJourStatutReservation(reservationId, nouveauStatut) {
        const reservationGroupe = this.reservations.find(
            r => r.reservation.toString() === reservationId.toString()
        );

        if (!reservationGroupe) {
            throw new Error("Réservation introuvable dans ce groupe");
        }

        reservationGroupe.statut = nouveauStatut;
        
        if (nouveauStatut === "RAMASSE") {
            reservationGroupe.dateRamassage = new Date();
        }

        await this.save();
        return reservationGroupe;
    },

    // Démarrer le trajet
    async demarrerTrajet() {
        const verification = await this.verifierPeutDemarrer();
        
        if (!verification.peutDemarrer) {
            throw new Error(verification.message || "Impossible de démarrer - passagers en attente");
        }

        this.statut = "TRAJET_EN_COURS";
        this.dateDemarrage = new Date();
        await this.save();

        return this;
    },

    // Terminer le trajet
    async terminerTrajet() {
        this.statut = "TERMINE";
        this.dateFin = new Date();
        await this.save();

        return this;
    }
};

// Méthodes statiques
groupeTaxiPartageSchema.statics = {
    // Trouver les groupes actifs d'un chauffeur
    async trouverGroupesActifs(chauffeurId) {
        return await this.find({
            chauffeur: chauffeurId,
            statut: { $in: ["EN_FORMATION", "RAMASSAGE_EN_COURS", "TRAJET_EN_COURS"] }
        }).populate('reservations.reservation');
    },

    // Calculer les statistiques d'un chauffeur
    async calculerStatistiquesChauffeur(chauffeurId) {
        const stats = await this.aggregate([
            { $match: { chauffeur: chauffeurId } },
            {
                $group: {
                    _id: "$statut",
                    count: { $sum: 1 },
                    totalPassagers: { $sum: { $size: "$reservations" } },
                    prixTotal: { $sum: "$prixTotal" }
                }
            }
        ]);

        return stats.reduce((acc, stat) => {
            acc[stat._id] = {
                count: stat.count,
                totalPassagers: stat.totalPassagers,
                prixTotal: stat.prixTotal
            };
            return acc;
        }, {});
    }
};

// Middleware pour validation
groupeTaxiPartageSchema.pre('save', function(next) {
    // Valider que le nombre de réservations ne dépasse pas la capacité
    if (this.reservations.length > this.capaciteMax) {
        return next(new Error(`Nombre de réservations (${this.reservations.length}) dépasse la capacité maximale (${this.capaciteMax})`));
    }

    // Valider que les ordres sont uniques
    const ordres = this.reservations.map(r => r.ordre);
    const ordresUniques = [...new Set(ordres)];
    if (ordres.length !== ordresUniques.length) {
        return next(new Error("Les ordres de ramassage doivent être uniques"));
    }

    next();
});

module.exports = mongoose.model("GroupeTaxiPartage", groupeTaxiPartageSchema);
