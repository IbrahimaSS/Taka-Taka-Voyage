const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        telephone: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        expireAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
