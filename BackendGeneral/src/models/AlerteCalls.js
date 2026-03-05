const mongoose = require("mongoose");

const alerteCallSchema = new mongoose.Schema(
    {
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true,
        },
        role: {
            type: String,
            enum: ["PASSAGER", "CHAUFFEUR"],
            required: true,
        },
        service: {
            type: String,
            required: true,
        },
        numero: {
            type: String,
            required: true,
        },
        position: {
            lat: Number,
            lng: Number,
        },
        dateAppel: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AlerteCalls", alerteCallSchema);
