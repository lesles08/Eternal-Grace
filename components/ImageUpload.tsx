"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("memorial-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the Public URL
      const { data } = supabase.storage
        .from("memorial-photos")
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 font-sans">Profile Photo</label>
      <input
        type="file"
        accept="image/*"
        onChange={uploadPhoto}
        disabled={uploading}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition cursor-pointer"
      />
      {uploading && <p className="text-xs text-amber-600 animate-pulse">Uploading photo...</p>}
    </div>
  );
}