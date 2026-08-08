import { motion } from 'framer-motion';
import { Lock, Smartphone } from 'lucide-react';

const OrangeMoneyForm = ({
  phoneNumber,
  onPhoneNumberChange,
  otpValues,
  otpRefs,
  otpTimer,
  onOtpChange,
  onOtpKeyDown,
}) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="mb-6"
  >
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <Lock className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100">Validation de sécurité</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Veuillez renseigner vos informations Orange Money</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Phone number input for Orange Money */}
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro de téléphone Orange Money</label>
          <div className="relative">
            <input
              type="tel"
              placeholder="ex: 622 00 00 00"
              value={phoneNumber}
              onChange={e => onPhoneNumberChange(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 transition-all outline-none pl-12"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Smartphone className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code OTP (reçu par SMS)</p>
          <div className="flex justify-between gap-2">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => onOtpChange(index, e.target.value)}
                onKeyDown={(e) => onOtpKeyDown(index, e)}
                className="w-full h-14 text-center text-2xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 transition-all outline-none"
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Code valide pendant{' '}
            <span className={`font-bold ${otpTimer < 30 ? 'text-red-600' : 'text-orange-600 dark:text-orange-400'}`}>
              {otpTimer}
            </span>{' '}
            secondes
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default OrangeMoneyForm;
