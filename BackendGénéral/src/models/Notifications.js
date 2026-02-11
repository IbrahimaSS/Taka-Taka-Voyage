const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateur",
        required: true,
        },
        message: {
        type: String,
        required: true,
        },
        lue: {
        type: Boolean,
        default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
