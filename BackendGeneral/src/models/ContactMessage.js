const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        subject: {
            type: String,
            required: true,
            enum: ["support", "driver", "partner", "other"],
            default: "other"
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        adminReply: {
            type: String,
            trim: true
        },
        repliedAt: {
            type: Date
        },
        statut: {
            type: String,
            enum: ["NOUVEAU", "TRAITE", "ARCHIVE"],
            default: "NOUVEAU"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
