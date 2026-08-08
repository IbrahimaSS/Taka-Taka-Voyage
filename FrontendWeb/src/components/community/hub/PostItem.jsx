import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, MessageSquare, Play } from 'lucide-react';
import { communityService } from '../../../services/communityService';
import { useAuth } from '../../../context/AuthContext';
import Card, { CardContent } from '../../admin/ui/Card';
import { getFullAssetURL } from '../../../utils/urlHelper';

const PostItem = ({ post, onMessage }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id || user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComs, setShowComs] = useState(false);
  const [coms, setComs] = useState([]);
  const [newCom, setNewCom] = useState('');
  const audioRef = useRef(null);

  const handleLike = async () => {
    try {
      const res = await communityService.toggleLike(post._id);
      setIsLiked(res.isLiked); setLikesCount(res.likes);
    } catch (e) { }
  };

  const toggleComs = async () => {
    if (!showComs) {
      const res = await communityService.getCommentaires(post._id);
      setComs(res.donnees);
    }
    setShowComs(!showComs);
  };

  const postCom = async () => {
    if (!newCom.trim()) return;
    const res = await communityService.ajouterCommentaire(post._id, newCom);
    setComs([...coms, res.donnees]); setNewCom('');
  };

  return (
    <Card className="border-none shadow-sm dark:bg-slate-800/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <img src={getFullAssetURL(post.auteur?.photoUrl)} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100" alt="" />
            <div>
              <h4 className="text-sm font-bold dark:text-white">{post.auteur?.prenom} {post.auteur?.nom}</h4>
              <p className="text-[10px] text-slate-400 font-medium">{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={onMessage} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:scale-110 transition-all"><Send className="w-4 h-4" /></button>
        </div>
        {post.contenu && <p className="text-sm dark:text-slate-200 leading-relaxed mb-3 whitespace-pre-wrap">{post.contenu}</p>}
        <div className="mb-3 rounded-2xl overflow-hidden">
          {post.typeMedia === 'VOCAL' && post.mediaUrl && (
            <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-2xl flex items-center gap-3">
              <button onClick={() => audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause()} className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-md"><Play className="w-4 h-4 ml-0.5" /></button>
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full relative overflow-hidden"><div className="absolute inset-y-0 left-0 bg-emerald-500 w-1/3 rounded-full" /></div>
              <audio ref={audioRef} src={getFullAssetURL(post.mediaUrl)} className="hidden" />
            </div>
          )}
          {post.typeMedia === 'IMAGE' && post.mediaUrl && <img src={getFullAssetURL(post.mediaUrl)} className="w-full max-h-96 object-cover rounded-2xl shadow-sm cursor-pointer hover:opacity-95 transition-all" alt="" />}
          {post.typeMedia === 'VIDEO' && post.mediaUrl && <video src={getFullAssetURL(post.mediaUrl)} controls className="w-full rounded-2xl bg-black shadow-sm" />}
        </div>
        <div className="flex gap-6 border-t dark:border-slate-800 pt-3">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs font-bold transition-all ${isLiked ? 'text-rose-500' : 'text-slate-500'}`}><Heart className={`w-4 h-4 ${isLiked ? 'fill-current animate-pulse' : ''}`} />{likesCount}</button>
          <button onClick={toggleComs} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-500 transition-all"><MessageSquare className="w-4 h-4" />{post.nombreCommentaires || 0}</button>
        </div>
        {showComs && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t dark:border-slate-800 space-y-3">
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {coms.length === 0 ? <p className="text-[10px] text-center text-slate-400 py-2">Soyez le premier à répondre !</p> :
                coms.map(c => (
                  <div key={c._id} className="flex gap-2 items-start">
                    <img src={getFullAssetURL(c.auteur?.photoUrl)} className="w-7 h-7 rounded-full object-cover" alt="" />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl rounded-tl-none"><div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-0.5">{c.auteur?.prenom}</div><div className="text-xs dark:text-slate-300">{c.contenu}</div></div>
                  </div>
                ))
              }
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl"><input value={newCom} onChange={e => setNewCom(e.target.value)} onKeyDown={e => e.key === 'Enter' && postCom()} placeholder="Écrire un commentaire..." className="flex-1 bg-transparent border-none text-xs px-3 py-2 outline-none dark:text-white" /><button onClick={postCom} disabled={!newCom.trim()} className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm disabled:opacity-50"><Send size={14} /></button></div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostItem;
