const Faq = require("../../models/Faq");

exports.listerFaq = async (req, res) => {
    try {
        const faqs = await Faq.find({ actif: true })
        .sort({ ordre: 1 });

        res.status(200).json({
        succes: true,
        faqs,
        });
    } catch (error) {
        res.status(500).json({
        succes: false,
        message: error.message,
        });
    }
};
