import { useState, useEffect } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { communityService } from '../../../services/communityService';
import { useAuth } from '../../../context/AuthContext';
import { getFullAssetURL } from '../../../utils/urlHelper';

const ConversationsList = ({ onSelect }) => {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => { communityService.getMesConversations().then(res => { setConvs(res.donnees); setLoading(false); }); }, []);
  if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>;
  if (convs.length === 0) return (<div className="text-center py-20 opacity-50"><MessageSquare className="w-12 h-12 mx-auto mb-4" /><p className="text-sm font-bold">Aucune discussion privée</p><p className="text-xs">Commencez à discuter via le fil d'actualité</p></div>);
  return (
    <div className="p-4 space-y-3">
      {convs.map(c => {
        const d = c.participants.find(p => p?._id !== user?._id);
        return (
          <button key={c._id} onClick={() => onSelect(c)} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-3xl transition-all border dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 group">
            <div className="relative"><img src={getFullAssetURL(d?.photoUrl)} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100" alt="" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" /></div>
            <div className="text-left flex-1 min-w-0"><h4 className="text-sm font-bold dark:text-white truncate group-hover:text-emerald-600 transition-colors">{d?.prenom} {d?.nom}</h4><p className="text-xs text-slate-400 truncate mt-0.5">{c.dernierMessage || "Appuyez pour discuter"}</p></div>
            <div className="text-[10px] text-slate-300 font-bold">{new Date(c.dateDernierMessage).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationsList;
