import { useState, useRef, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client.server";
import { Camera, Upload, X, Check, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export const Route = createFileRoute('/record')({
  component: RecordPage,
});

function RecordPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Camera & Recording States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- AUTOMATIC CLEANUP ---
  useEffect(() => {
    return () => {
      if (videoPreviewRef.current?.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { aspectRatio: 9/16 }, 
        audio: true 
      });
      setIsCameraActive(true);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Camera access denied. Please check permissions.");
    }
  };

  // --- RECORDING LOGIC (MIME CHECK) ---
  const startRecording = () => {
    if (!videoPreviewRef.current?.srcObject) return;
    
    const chunks: Blob[] = []; 
    const stream = videoPreviewRef.current.srcObject as MediaStream;

    const types = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
    const supportedType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';

    const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: supportedType });
      const extension = supportedType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `zuzu-capture-${Date.now()}.${extension}`, { type: supportedType });
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    toast.success("Recording ZuZu...");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- UPLOAD LOGIC ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shout-videos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shout-videos')
        .getPublicUrl(filePath);

      // --- INTEGRATED SAFETY GATE ---
      const { error: dbError } = await supabase
        .from('shouts')
        .insert([{
          user_id: user.id,
          video_url: publicUrl,
          caption: caption,
          is_approved: false, 
        }]);

      if (dbError) throw dbError;

      toast.success("ZuZu sent for approval! ✨");
      navigate({ to: '/feed' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden items-center justify-center">
      
      {/* MOBILE CONTAINER WRAPPER */}
      <div className="w-full max-w-[430px] h-full max-h-[932px] bg-zinc-950 flex flex-col relative shadow-2xl border-x border-white/5">
        
        {/* HEADER */}
        <header className="p-6 flex justify-between items-center z-50 shrink-0">
          <button 
            onClick={() => {
              if (isCameraActive) {
                 const stream = videoPreviewRef.current?.srcObject as MediaStream;
                 stream?.getTracks().forEach(t => t.stop());
                 setIsCameraActive(false);
              } else {
                navigate({ to: '/feed' });
              }
            }} 
            className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>
          <h2 className="font-black italic uppercase tracking-tighter text-lg text-emerald-400">New ZuZu</h2>
          <div className="w-10" /> 
        </header>

        <main className="flex-1 flex flex-col px-6 pb-6 overflow-y-auto no-scrollbar">
          {!previewUrl && !isCameraActive ? (
            /* 1. SELECTION VIEW */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <div 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="w-full aspect-[9/16] border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer active:scale-95 transition-all hover:bg-white/10"
              >
                <Upload size={48} className="text-white/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">From Gallery</p>
              </div>
              <input type="file" id="file-upload" hidden accept="video/*" onChange={handleFileSelect} />
              
              <button 
                onClick={startCamera}
                className="w-full bg-white text-black py-5 rounded-2xl font-black italic uppercase text-xs flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl"
              >
                <Camera size={18} /> Use Camera
              </button>
            </div>
          ) : isCameraActive ? (
            /* 2. CAMERA VIEW */
            <div className="relative w-full aspect-[9/16] rounded-[3rem] overflow-hidden border-2 border-white/20 shadow-2xl">
              <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-4">
                {isRecording ? (
                  <button 
                    onClick={stopRecording}
                    className="w-16 h-16 bg-red-600 rounded-full border-4 border-white flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                  >
                    <div className="w-5 h-5 bg-white rounded-sm" />
                  </button>
                ) : (
                  <button 
                    onClick={startRecording}
                    className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <div className="w-10 h-10 bg-red-600 rounded-full" />
                  </button>
                )}
                <p className="text-[9px] font-black uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
                  {isRecording ? "Recording ZuZu..." : "Tap to Film"}
                </p>
              </div>
            </div>
          ) : (
            /* 3. PREVIEW & POST VIEW */
            <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-500 pb-4">
              <div className="relative aspect-[9/16] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900 shrink-0">
                <video src={previewUrl!} autoPlay loop muted className="w-full h-full object-cover" />
                <button 
                  onClick={() => { 
                    setPreviewUrl(null); 
                    setSelectedFile(null); 
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full backdrop-blur-md active:rotate-180 transition-transform duration-500"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                <textarea 
                  placeholder="Caption your ZuZu..." 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs font-medium placeholder:text-white/20 resize-none h-16"
                />
              </div>

              <button 
                disabled={isUploading}
                onClick={handleUpload}
                className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shrink-0"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                {isUploading ? "Uploading..." : "Post ZuZu"}
              </button>
              
              <p className="text-[8px] font-bold text-center text-white/30 uppercase tracking-widest">
                ZuZuShout Safe Space: your parent must approve this post
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
