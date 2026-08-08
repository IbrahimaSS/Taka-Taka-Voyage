import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const EmergencyContactsList = ({ contacts, onQuickCall }) => (
  <motion.div
    key="list"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
  >
    <Card>
      <CardHeader>
        <CardTitle size="sm">Contacts d'urgence</CardTitle>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Appeler directement un service de secours
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.id}
                className={`p-4 ${contact.bgColor} rounded-xl flex items-center justify-between hover:shadow-md transition-shadow dark:border dark:border-white/5`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${contact.bgColor} flex items-center justify-center mr-3`}>
                    <Icon className={`w-5 h-5 ${contact.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.number}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => onQuickCall(contact)}
                  className={`!px-4 !py-2 !min-h-[44px] ${contact.bgColor} ${contact.color} hover:bg-opacity-30 border-none font-bold`}
                  icon={Phone}
                >
                  Appeler
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EmergencyContactsList;
