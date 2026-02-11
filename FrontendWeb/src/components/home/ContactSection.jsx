import React from 'react';
import {
  Headphones,
  MapPin,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Apple,
  Download,
  Play
} from 'lucide-react';
import Button from '../../ui/Buttons';
import Card from '../../ui/Card';

const ContactSection = () => {
  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('✅ Message envoyé avec succès !\nNotre équipe vous répondra dans les plus brefs délais.');
    e.target.reset();
  };

  return (
    <section
      id="contact"
      className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      data-aos="fade-up"
    >
      <div className="container mx-auto">
        {/* Titre */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Contactez-<span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start">nous</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
            Vous avez des questions ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Formulaire de contact */}
          <div
            className="lg:w-1/2 mb-12 lg:mb-0"
            data-aos="fade-right"
          >
            <Card className="p-8">
              <form onSubmit={handleContactSubmit}>
                {/* Nom */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="name">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    placeholder="Votre nom"
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="email">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                {/* Sujet */}
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="subject">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="driver">Devenir chauffeur</option>
                    <option value="partner">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-8">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primaryGreen-start/50 focus:border-transparent transition-all resize-none"
                    placeholder="Votre message..."
                    required
                  ></textarea>
                </div>

                {/* Bouton Submit */}
                <Button
                  type="submit"
                  variant="gradientMix"
                  size="lg"
                  fullWidth
                  icon={<Send size={20} />}
                >
                  Envoyer le message
                </Button>
              </form>
            </Card>
          </div>

          {/* Informations de contact */}
          <div
            className="lg:w-1/2"
            data-aos="fade-left"
            data-aos-delay="100"
          >
            <div className="space-y-8">
              {/* Support Client */}
              <Card hover={true}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryGreen-start/20 to-primaryBlue-start/20 flex items-center justify-center flex-shrink-0">
                    <Headphones
                      size={24}
                      className="text-white"
                    />

                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Support Client</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Notre équipe est disponible 24h/24 et 7j/7 pour répondre à vos questions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone size={18} className="text-primaryGreen-start" />
                        <span className="text-primaryGreen-start font-bold">+224 123 45 67 89</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={18} className="text-primaryBlue-start" />
                        <span className="text-primaryBlue-start font-bold">support@takataka.gn</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Adresse */}
              <Card hover={true}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primaryBlue-start/20 to-primaryGreen-start/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="" size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Notre Siège en Guinée</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Rue du Commerce, Kaloum<br />Conakry, Guinée
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink size={16} />}
                    >
                      Voir sur la carte
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Téléchargement App */}
              <div
                id="telecharger"
                className="bg-gradient-to-r from-primaryGreen-start to-primaryBlue-start p-8 rounded-3xl text-white shadow-2xl"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Téléchargez l'application Taka Taka</h3>
                  <p className="opacity-90">
                    Disponible sur iOS et Android. Commencez à voyager dès aujourd'hui !
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {/* App Store */}
                  <Button
                    variant="green"
                    size="lg"
                    className="bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/20"
                    icon={<Apple size={24} />}
                    iconPosition="left"
                    fullWidth={true}
                  >
                    <div className="text-left">
                      <div className="text-xs opacity-80">Télécharger sur</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </Button>

                  {/* Google Play */}
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                    icon={<Play size={24} />}
                    iconPosition="left"
                    fullWidth={true}
                  >
                    <div className="text-left">
                      <div className="text-xs opacity-80">Disponible sur</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;