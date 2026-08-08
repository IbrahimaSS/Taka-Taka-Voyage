import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Loader2 } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CreatePostSection from './hub/CreatePostSection';
import PostItem from './hub/PostItem';
import ConversationsList from './hub/ConversationsList';
import ChatWindow from './hub/ChatWindow';
import JitsiCall from './hub/JitsiCall';

const CommunityHub = ({ isOpen, onClose, isFullPage = false }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('FEED'); // FEED or CHATS
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activeCall, setActiveCall] = useState(null); // { room, type }

  useEffect(() => {
    if (isOpen || isFullPage) {
      if (activeTab === 'FEED') fetchPosts();
    }
  }, [isOpen, isFullPage, activeTab]);

  useEffect(() => {
    const handleNewMessage = (data) => {
      if (activeTab === 'CHATS' && !activeConversation) {
        // Optionnel: rafraîchir la liste des convs si besoin
      }
    };

    const handleNewComment = (data) => {
      setPosts(prev => prev.map(p =>
        p._id === data.post ? { ...p, nombreCommentaires: (p.nombreCommentaires || 0) + 1 } : p
      ));
    };

    socketService.on('community:nouveau_message', handleNewMessage);
    socketService.on('community:nouveau_commentaire', handleNewComment);

    return () => {
      socketService.off('community:nouveau_message', handleNewMessage);
      socketService.off('community:nouveau_commentaire', handleNewComment);
    };
  }, [activeTab, activeConversation]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts();
      setPosts(res.donnees || []);
    } catch (error) {
      toast.error("Erreur flux");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (destinataireId) => {
    try {
      const res = await communityService.startConversation(destinataireId);
      setActiveConversation(res.donnees);
      setActiveTab('CHATS');
    } catch (error) {
      toast.error("Discussion indisponible");
    }
  };

  const renderContent = () => (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 ${isFullPage ? 'rounded-3xl shadow-xl overflow-hidden' : ''}`}>
      <div className="p-6 border-b dark:border-slate-800 bg-gradient-to-r from-blue-600 to-emerald-500 text-white shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-bold">Communauté</h2>
          </div>
          {!isFullPage && <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"><X /></button>}
        </div>

        <div className="flex bg-black/10 p-1 rounded-xl">
          <button onClick={() => { setActiveTab('FEED'); setActiveConversation(null); }} className={`flex-1 min-h-[44px] text-xs font-bold rounded-lg transition-all ${activeTab === 'FEED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80'}`}>Fil d'actu</button>
          <button onClick={() => setActiveTab('CHATS')} className={`flex-1 min-h-[44px] text-xs font-bold rounded-lg transition-all ${activeTab === 'CHATS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80'}`}>Messages</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'FEED' ? (
          <div className="h-full flex flex-col">
            <CreatePostSection onPostCreated={(post) => setPosts([post, ...posts])} />
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div> :
                posts.map(post => <PostItem key={post._id} post={post} onMessage={() => handleStartChat(post.auteur?._id)} />)
              }
            </div>
          </div>
        ) : (
          <div className="h-full">
            {activeConversation ? (
              <ChatWindow conversation={activeConversation} onBack={() => setActiveConversation(null)} onCallInitiated={setActiveCall} />
            ) : (
              <ConversationsList onSelect={setActiveConversation} />
            )}
          </div>
        )}
      </div>

      {activeCall && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
            <button
              onClick={() => {
                if (window.jitsiAPI) window.jitsiAPI.dispose();
                setActiveCall(null);
              }}
              className="bg-rose-500 text-white p-3 rounded-full shadow-lg hover:bg-rose-600 transition-all"
            >
              <X size={24}/>
            </button>
            <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Appel en cours...</span>
          </div>
          <JitsiCall
            room={activeCall.room}
            type={activeCall.type}
            user={user}
            onClose={() => setActiveCall(null)}
          />
        </div>
      )}
    </div>
  );

  if (isFullPage) return renderContent();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-y-0 left-0 w-full max-w-md z-[70]">
            {renderContent()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommunityHub;
