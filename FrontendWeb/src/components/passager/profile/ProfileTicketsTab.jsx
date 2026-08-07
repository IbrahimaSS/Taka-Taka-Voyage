import { Search, QrCode, ChevronRight } from 'lucide-react';

const ProfileTicketsTab = ({ tickets, isLoadingTickets, searchTerm, setSearchTerm, onSelectTicket }) => {
  const filteredTickets = tickets.filter(ticket =>
    (ticket.depart?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ticket.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none"
          />
        </div>
        <p className="text-xs text-gray-500">{tickets.length} ticket(s) trouvé(s)</p>
      </div>

      {isLoadingTickets ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/10 rounded-2xl border-2 border-dashed">
          <p className="text-gray-400">Aucun ticket trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket._id}
              onClick={() => onSelectTicket(ticket)}
              className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-gray-700/30 border rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className="w-10 h-10 shrink-0 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600"><QrCode className="w-6 h-6" /></div>
                <div className="min-w-0">
                  <h4 className="font-bold truncate">{ticket.destination || 'Trajet'}</h4>
                  <p className="text-xs text-gray-500 truncate">{new Date(ticket.createdAt).toLocaleDateString()} • {(ticket.prix || 0).toLocaleString()} GNF</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileTicketsTab;
