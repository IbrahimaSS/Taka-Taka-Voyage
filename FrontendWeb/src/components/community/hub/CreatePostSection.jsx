import { useState, useRef } from 'react';
import { Mic, Camera, Square, Loader2, X } from 'lucide-react';
import { communityService } from '../../../services/communityService';
import Button from '../../admin/ui/Bttn';
import toast from 'react-hot-toast';

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

export default CreatePostSection;
