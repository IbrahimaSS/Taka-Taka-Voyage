import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Send, Mic, Image as ImageIcon, Video, Phone,
  Heart, MessageSquare, Share2, X, Search, Plus,
  Loader2, Play, Pause, Hash, Square, Trash2, ArrowLeft, Camera, FileVideo
} from 'lucide-react';
import { communityService } from '../../services/communityService';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import Card, { CardContent } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import { getFullAssetURL } from '../../utils/urlHelper';
import toast from 'react-hot-toast';

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
          {!isFullPage && <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>}
        </div>

        <div className="flex bg-black/10 p-1 rounded-xl">
          <button onClick={() => { setActiveTab('FEED'); setActiveConversation(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'FEED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80'}`}>Fil d'actu</button>
          <button onClick={() => setActiveTab('CHATS')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'CHATS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-white/80'}`}>Messages</button>
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

const CreatePostSection = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) { toast.error("Micro non autorisé"); }
  };

  const stopRec = () => { mediaRecorderRef.current.stop(); setIsRecording(false); };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setAudioBlob(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handlePost = async () => {
    try {
      setUploading(true);
      let mediaUrl = null, typeMedia = 'TEXTE';
      if (audioBlob) {
        const fd = new FormData(); fd.append('media', audioBlob, 'v.wav');
        const up = await communityService.uploadMedia(fd);
        mediaUrl = up.url; typeMedia = 'VOCAL';
      } else if (selectedFile) {
        const fd = new FormData(); fd.append('media', selectedFile);
        const up = await communityService.uploadMedia(fd);
        mediaUrl = up.url;
        typeMedia = selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      }
      const res = await communityService.creerPost({ contenu: content, typeMedia, mediaUrl });
      onPostCreated(res.donnees);
      setContent(''); setAudioBlob(null); setSelectedFile(null); setPreviewUrl(null);
      toast.success("Publié avec succès !");
    } catch (e) { toast.error("Erreur de publication"); } finally { setUploading(false); }
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border dark:border-slate-700 shadow-sm">
        {!audioBlob && !selectedFile ? (
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Échangez avec la communauté..."
            className="w-full bg-transparent border-none text-sm h-12 dark:text-white outline-none resize-none"
          />
        ) : (
          <div className="mb-3 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[80px]">
            {audioBlob && <div className="flex items-center gap-3 text-emerald-600 font-bold text-xs"><Mic className="animate-pulse" /> Note vocale prête</div>}
            {selectedFile && selectedFile.type.startsWith('image/') && <img src={previewUrl} className="max-h-32 w-full object-contain" alt="" />}
            {selectedFile && selectedFile.type.startsWith('video/') && <video src={previewUrl} className="max-h-32 w-full" controls />}
            <button onClick={() => { setAudioBlob(null); setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-all"><X size={14} /></button>
          </div>
        )}
        <div className="flex justify-between items-center mt-2 border-t dark:border-slate-800 pt-2">
          <div className="flex gap-2">
            <button onClick={isRecording ? stopRec : startRec} className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-rose-100 text-rose-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
              {isRecording ? <Square size={18} /> : <Mic size={18} />}
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
              <Camera size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
          </div>
          <Button onClick={handlePost} disabled={(!content && !audioBlob && !selectedFile) || uploading} size="sm" className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-xl border-none font-bold px-6">
            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : "Publier"}
          </Button>
        </div>
      </div>
    </div>
  );
};

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

const ChatWindow = ({ conversation, onBack, onCallInitiated }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef();
  const fileInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    communityService.getHistoriqueMessages(conversation._id).then(res => setMessages(res.donnees));
    const handleIncoming = (data) => { if (data.conversationId === conversation._id) setMessages(prev => [...prev, data.message]); };
    socketService.on('community:nouveau_message', handleIncoming);
    return () => socketService.off('community:nouveau_message', handleIncoming);
  }, [conversation._id]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) { toast.error("Micro non autorisé"); }
  };

  const stopRec = () => { mediaRecorderRef.current.stop(); setIsRecording(false); };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() && !selectedFile && !audioBlob) return;
    try {
      setUploading(true);
      let mediaUrl = null, type = 'TEXTE';
      if (audioBlob) {
        const fd = new FormData(); fd.append('media', audioBlob, 'v.wav');
        const up = await communityService.uploadMedia(fd);
        mediaUrl = up.url; type = 'VOCAL';
      } else if (selectedFile) {
        const fd = new FormData(); fd.append('media', selectedFile);
        const up = await communityService.uploadMedia(fd);
        mediaUrl = up.url;
        type = selectedFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      }
      const res = await communityService.envoyerMessageDirect(conversation._id, { contenu: newMsg || (selectedFile ? "Média" : (audioBlob ? "Note vocale" : "")), type, mediaUrl });
      setMessages([...messages, res.donnees]);
      setNewMsg(''); setSelectedFile(null); setPreviewUrl(null); setAudioBlob(null);
    } catch (e) { toast.error("Échec de l'envoi"); } finally { setUploading(false); }
  };

  const d = conversation.participants.find(p => String(p?._id || p) !== String(user?._id || user?.id));

  const initiateCall = async (type = 'VIDEO') => {
    const roomName = `TakaTaka_${type}_${conversation._id}`;
    const callUrl = `https://meet.jit.si/${roomName}`;
    
    try {
      await communityService.envoyerMessageDirect(conversation._id, {
        contenu: `Appel ${type === 'VIDEO' ? 'vidéo' : 'audio'} démarré`,
        type: 'CALL_INVITE',
        mediaUrl: roomName
      });
      onCallInitiated({ room: roomName, type });
    } catch (e) {
      toast.error("Impossible de lancer l'appel");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      <div className="p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><ArrowLeft size={20} /></button>
          <img src={getFullAssetURL(d?.photoUrl)} className="w-10 h-10 rounded-full object-cover border-2 border-emerald-100" alt="" />
          <div><h4 className="text-sm font-bold dark:text-white leading-none">{d?.prenom} {d?.nom}</h4><span className="text-[10px] text-emerald-500 font-bold">En ligne</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => initiateCall('AUDIO')} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"><Phone size={20} /></button>
          <button onClick={() => initiateCall('VIDEO')} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"><Video size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? <div className="text-center py-20 text-xs text-slate-400">Dites bonjour à {d?.prenom} ! 👋</div> :
          messages.map(m => {
            const expediteurId = m.expediteur?._id || m.expediteur;
            const monId = user?._id || user?.id;
            const isMe = String(expediteurId) === String(monId);
            return (
              <div key={m._id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && <img src={getFullAssetURL(d?.photoUrl)} className="w-6 h-6 rounded-full object-cover mb-1" alt="" />}
                <div className={`max-w-[75%] p-3 px-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 dark:text-white rounded-bl-none border dark:border-slate-700'}`}>
                  {m.type === 'VOCAL' && m.mediaUrl && (
                    <div className={`p-2 rounded-xl flex items-center gap-3 mb-2 ${isMe ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <button onClick={(e) => {
                        const audio = e.currentTarget.nextSibling.nextSibling;
                        audio.paused ? audio.play() : audio.pause();
                      }} className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}><Play size={14} className="ml-0.5" /></button>
                      <div className={`flex-1 h-1 rounded-full ${isMe ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-600'}`} />
                      <audio src={getFullAssetURL(m.mediaUrl)} className="hidden" />
                    </div>
                  )}
                  {m.type === 'IMAGE' && m.mediaUrl && <img src={getFullAssetURL(m.mediaUrl)} className="w-full rounded-lg mb-2 max-h-60 object-cover" alt="" />}
                  {m.type === 'VIDEO' && m.mediaUrl && <video src={getFullAssetURL(m.mediaUrl)} controls className="w-full rounded-lg mb-2 bg-black" />}
                  {m.type === 'CALL_INVITE' && (
                    <div className="p-4 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-white/10 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center text-white animate-pulse">
                        {m.contenu.includes('vidéo') ? <Video size={20}/> : <Phone size={20}/>}
                      </div>
                      <p className="font-bold text-xs">{m.contenu}</p>
                      <button 
                        onClick={() => onCallInitiated({ room: m.mediaUrl, type: m.contenu.includes('vidéo') ? 'VIDEO' : 'AUDIO' })}
                        className={`w-full py-2 rounded-lg font-bold text-[10px] transition-all ${isMe ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white shadow-lg'}`}
                      >
                        Rejoindre l'appel
                      </button>
                    </div>
                  )}
                  {m.contenu && m.type !== 'VOCAL' && m.type !== 'CALL_INVITE' && <p className="whitespace-pre-wrap">{m.contenu}</p>}
                  {m.type === 'VOCAL' && <p className="text-[10px] italic opacity-80">Note vocale</p>}
                  <div className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                    {!isMe && <span className="font-bold mr-1">{d?.prenom || "Utilisateur"} •</span>}
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        }
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        {(previewUrl || audioBlob) && (
          <div className="mb-3 relative inline-block">
            {previewUrl ? <img src={previewUrl} className="h-20 w-20 object-cover rounded-xl border-2 border-emerald-500" alt="" /> :
              <div className="h-12 bg-emerald-50 rounded-xl px-4 flex items-center gap-3 text-emerald-600 font-bold text-xs border border-emerald-100"><Mic size={14} /> Note vocale prête</div>
            }
            <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); setAudioBlob(null); }} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg"><X size={12} /></button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <button onClick={isRecording ? stopRec : startRec} className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-rose-100 text-rose-500 animate-pulse' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}>
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>
          <button onClick={() => fileInputRef.current.click()} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><ImageIcon size={20} /></button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
          <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Écrire un message..." className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5 text-sm dark:text-white outline-none focus:ring-1 focus:ring-emerald-500" />
          <button
            onClick={handleSend}
            disabled={(!newMsg.trim() && !selectedFile && !audioBlob) || uploading}
            className="p-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const JitsiCall = ({ room, type, user, onClose }) => {
  const containerRef = useRef(null);
  const monId = user?._id || user?.id;

  useEffect(() => {
    const domain = "meet.element.io";
    const options = {
      roomName: room,
      width: "100%",
      height: "100%",
      parentNode: containerRef.current,
      configOverwrite: {
        prejoinPageEnabled: false,
        prejoinConfig: { enabled: false }, // Nouvelle syntaxe pour forcer la désactivation
        startWithAudioMuted: false,
        startWithVideoMuted: type === 'AUDIO',
        startAudioOnly: type === 'AUDIO', // Optimisation pour les appels audio
        disableDeepLinking: true,
        requireDisplayName: false,
        resolution: 360, // Baisse la résolution pour alléger la charge
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'fullscreen', 'hangup', 'chat', 'settings', 'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
      },
      userInfo: {
        displayName: `${user?.prenom} ${user?.nom}`
      }
    };

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const script = document.createElement("script");
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => {
          // Fallback au cas où l'instance bloque le script
          const fbScript = document.createElement("script");
          fbScript.src = "https://meet.jit.si/external_api.js";
          fbScript.onload = resolve;
          document.head.appendChild(fbScript);
        };
        document.head.appendChild(script);
      });
    };

    loadScript().then(() => {
      if (!containerRef.current) return;
      window.jitsiAPI = new window.JitsiMeetExternalAPI(domain, options);
      window.jitsiAPI.addEventListener("videoConferenceLeft", () => {
        onClose();
      });
    });

    return () => {
      if (window.jitsiAPI) {
        window.jitsiAPI.dispose();
        window.jitsiAPI = null;
      }
    };
  }, [room, type, monId, onClose]);

  return <div ref={containerRef} className="w-full h-full" />;
};


export default CommunityHub;
