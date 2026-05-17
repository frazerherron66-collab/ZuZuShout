import { useState } from 'react';
import { supabase } from "@/../supabase/functions/_shared/supabase-client";
import { toast } from "sonner";
import { Upload, X, CheckCircle2 } from 'lucide-react';

export default function VideoUpload({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // 1. Upload the video file to your 'shouttube-videos' bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('shouttube-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Add the record to your 'videos' table (as seen in image_87a854.png)
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          storage_path: filePath,
          description: description,
          user_id: user.id,
          // We can add logic for generating a thumbnail_url later
        });

      if (dbError) throw dbError;

      toast.success("Video posted to the feed! 🚀");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded-[40px] border-4 border-black overflow-hidden shadow-[0_20px_0_rgba(0,0,0,1)]">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Share a Video</h2>
            <button onClick={onClose} className="bg-gray-100 p-2 rounded-full border-2 border-black hover:bg-red-100 transition-colors">
              <X size={24} />
            </button>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center border-4 border-dashed border-gray-200 rounded-[30px] p-12 cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all group">
              <Upload size={48} className="text-gray-300 group-hover:text-yellow-500 mb-4" />
              <p className="font-black uppercase text-sm text-gray-400 group-hover:text-yellow-600">Pick a video file</p>
              <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          ) : (
            <div className="bg-blue-50 p-6 rounded-[30px] border-2 border-blue-200 flex items-center gap-4">
              <CheckCircle2 className="text-blue-500" />
              <p className="font-bold text-blue-700 truncate">{file.name}</p>
              <button onClick={() => setFile(null)} className="ml-auto text-xs font-black uppercase text-blue-400">Change</button>
            </div>
          )}

          <textarea 
            placeholder="What's happening? #SafeContent"
            className="w-full p-6 rounded-[30px] border-4 border-gray-100 bg-gray-50 font-bold focus:border-yellow-400 outline-none resize-none h-32 transition-all"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button 
            disabled={uploading || !file}
            onClick={handleUpload}
            className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-2xl uppercase italic tracking-tighter shadow-[0_8px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {uploading ? "UPLOADING..." : "POST TO FEED ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
