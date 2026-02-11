const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
    {
        question: {
        type: String,
        required: true,
        trim: true,
        },
        reponse: {
        type: String,
        required: true,
        trim: true,
        },
        categorie: {
        type: String,
        default: "GÉNÉRAL",
        },
        ordre: {
        type: Number,
        default: 0,
        },
        actif: {
        type: Boolean,
        default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
