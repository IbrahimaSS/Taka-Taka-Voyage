const ContactMessage = require("../../models/ContactMessage");
const ParametresPlateforme = require("../../models/ParametresPlateforme");

exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                succes: false,
                message: "Tous les champs sont obligatoires."
            });
        }

        const newMessage = new ContactMessage({
            name,
            email,
            subject,
            message
        });

        await newMessage.save();

        // Émettre un événement socket à tous les administrateurs connectés
        const io = req.app.get("io");
        if (io) {
            io.to("ADMINS").emit("contact:new", {
                id: newMessage._id,
                name: newMessage.name,
                email: newMessage.email,
                subject: newMessage.subject,
                message: newMessage.message,
                timestamp: newMessage.createdAt
            });
            console.log("📡 [SOCKET] Événement 'contact:new' envoyé aux ADMINS.");
        }

        return res.status(200).json({
            succes: true,
            message: "Votre message a été transmis avec succès. Notre équipe vous répondra par email.",
            messageId: newMessage._id
        });

    } catch (error) {
        console.error("Erreur Contact Form:", error);
        return res.status(500).json({
            succes: false,
            message: "Une erreur est survenue lors de l'envoi du message."
        });
    }
};

exports.getContactSettings = async (req, res) => {
    try {
        const parametres = await ParametresPlateforme.findOne();
        if (!parametres) {
            return res.status(200).json({
                succes: true,
                settings: {
                    phone: "+224 000 000 000",
                    email: "support@takataka.gn",
                    address: "Conakry, Guinée"
                }
            });
        }

        return res.status(200).json({
            succes: true,
            settings: {
                phone: parametres.platform.contactPhone,
                email: parametres.platform.contactEmail,
                address: parametres.platform.companyAddress
            }
        });
    } catch (error) {
        return res.status(500).json({ succes: false, message: error.message });
    }
};

exports.replyContactForm = async (req, res) => {
    try {
        const { messageId, reply } = req.body;

        if (!messageId || !reply) {
            return res.status(400).json({ succes: false, message: "ID du message et réponse obligatoires." });
        }

        const message = await ContactMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ succes: false, message: "Message introuvable." });
        }

        message.adminReply = reply;
        message.repliedAt = new Date();
        message.statut = "TRAITE";
        await message.save();

        // Diffuser la réponse en temps réel au visiteur sur le canal spécifique à ce messageId
        const io = req.app.get("io");
        if (io) {
            io.emit(`contact:reply:${messageId}`, {
                reply: reply,
                timestamp: message.repliedAt
            });
            console.log(`📡 [SOCKET] Réponse émise sur contact:reply:${messageId}`);
        }

        return res.status(200).json({
            succes: true,
            message: "Réponse envoyée avec succès."
        });

    } catch (error) {
        console.error("Erreur Reply Contact Form:", error);
        return res.status(500).json({
            succes: false,
            message: "Une erreur est survenue lors de l'envoi de la réponse."
        });
    }
};
