const mongoose = require("mongoose");

const appareilApprouveSchema = new mongoose.Schema(
    {
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        userAgent: String,
        isApprouve: {
            type: Boolean,
            default: false,
        },
        derniereIp: String,
        derniereConnexion: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

appareilApprouveSchema.index({ utilisateur: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("AppareilApprouve", appareilApprouveSchema);
