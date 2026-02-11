const Otp = require("../models/Otp");

//GénérerOtp
exports.genererOtp = async (telephone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
        telephone,
        code,
        expireA: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
    });

    console.log("🔐 OTP Généré :", code);

    return true;
};

//VérificationOtp
exports.verifierOtp = async (telephone, code) => {
    const otp = await Otp.findOne({
        telephone,
        code,
        expireA: { $gt: new Date() },
    });

    if (!otp) {
        throw new Error("Code OTP invalide ou Numéro inexistant");
    }

    await Otp.deleteMany({ telephone });

    return true;
};

