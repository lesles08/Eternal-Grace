"use client";
import { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function EditMemorial({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    deceased_name: "",
    charity_name: "",
    bio: "",
    image_url: "",
    date_of_birth: "", 
    date_of_passing: "",
  });

  useEffect(() => {
    const fetchMemorial = async () => {
      // ... your session check logic ...
      const { data, error } = await supabase
        .from("memorials")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setFormData({
          deceased_name: data.deceased_name,
          charity_name: data.charity_name,
          bio: data.bio,
          image_url: data.image_url || "",
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : "",
          date_of_passing: data.date_of_passing ? data.date_of_passing.split('T')[0] : "",
        });
      }
      setLoading(false);
    };
    fetchMemorial();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("memorials")
      .update({
        deceased_name: formData.deceased_name,
        charity_name: formData.charity_name,
        bio: formData.bio,
        image_url: formData.image_url,
        date_of_birth: formData.date_of_birth || null, 
        date_of_passing: formData.date_of_passing || null,
      })
      .eq("id", id);

    if (error) {
      alert("Error updating: " + error.message);
      setSaving(false);
    } else {
      router.push("/dashboard");
    }
  };
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this memorial? This action cannot be undone and all donation progress data will be lost from your view."
    );

    if (confirmed) {
      setSaving(true);
      const { error } = await supabase
        .from("memorials")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error deleting: " + error.message);
        setSaving(false);
      } else {
        router.push("/dashboard");
      }
    }
  };

  if (loading) return <div className="p-20 text-center font-serif text-stone-400">Loading tribute details...</div>;

  return (
    <div className="min-h-screen bg-[#fafaf9] py-20 px-6">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-3xl font-serif text-slate-900 mb-8 text-center">Edit Tribute</h1>
        
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name of the Deceased</label>
            <input 
              type="text" 
              value={formData.deceased_name}
              required
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
              onChange={(e) => setFormData({...formData, deceased_name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Date of Birth</label>
              <input 
                type="date" 
                value={formData.date_of_birth || ""} 
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition font-sans text-slate-900"
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Date of Passing</label>
              <input 
                type="date" 
                value={formData.date_of_passing || ""} 
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition font-sans text-slate-900"
                onChange={(e) => setFormData({...formData, date_of_passing: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">
              Update Non-Profit
            </label>
            <select 
              required
              value={formData.charity_name} // Pre-fills with the existing choice
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition bg-white font-sans text-slate-900"
              onChange={(e) => setFormData({...formData, charity_name: e.target.value})}
            >
              <option value="The Ocean Cleanup">The Ocean Cleanup</option>
              <option value="Doctors Without Borders">Doctors Without Borders</option>
              <option value="St. Jude Children's Research Hospital">St. Jude</option>
            </select>
            <p className="text-[10px] text-stone-400 mt-1">
              Note: Changing this will redirect all future donations to the new charity.
            </p>
          </div>
          {/*<div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Charity</label>
            <input 
              type="text" 
              value={formData.charity_name}
              disabled
              className="w-full p-3 border border-stone-200 rounded-lg bg-stone-50 text-stone-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-stone-400 mt-1">Charity cannot be changed after creation for security reasons.</p>
          </div>*/}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Biography</label>
            <textarea 
              required
              rows={6}
              value={formData.bio}
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Update Photo</label>
            <ImageUpload onUpload={(url) => setFormData({...formData, image_url: url})} />
            
            {formData.image_url && (
              <div className="mt-4 relative w-32 h-32">
                <img 
                  src={formData.image_url} 
                  className="w-full h-full object-cover rounded-full border-2 border-amber-400" 
                  alt="Current photo" 
                />
                <p className="text-[10px] text-stone-400 mt-2 text-center italic">Current Image</p>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 bg-stone-100 text-slate-600 rounded-xl font-medium hover:bg-stone-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition shadow-md disabled:bg-stone-300"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
            <h3 className="text-red-900 font-serif text-xl mb-2">Danger Zone</h3>
            <p className="text-red-700/70 text-sm mb-6 font-sans">
              Once you delete a memorial, all data, stories, and donation history will be permanently removed. This action cannot be undone.
            </p>
            
            <button 
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm shadow-red-200 font-sans"
            >
              Delete Memorial Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
