import { useState, useEffect, useRef } from 'react';
import {
  Mic, Image as ImageIcon, Video, Phone,
  Send, X, Play, Square, ArrowLeft, Loader2
} from 'lucide-react';
import { communityService } from '../../../services/communityService';
import { socketService } from '../../../services/socketService';
import { useAuth } from '../../../context/AuthContext';
import { getFullAssetURL } from '../../../utils/urlHelper';
import toast from 'react-hot-toast';

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

export default ChatWindow;
