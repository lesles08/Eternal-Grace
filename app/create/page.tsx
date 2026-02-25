"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

export default function CreateMemorial() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    deceased_name: "",
    charity_name: "",
    bio: "",
    image_url: "", // Initialized as empty
    date_of_birth: "",
    date_of_passing: "",
  });

  // 1. Check for a valid session on page load
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      alert("Session error: Please log out and log back in.");
      return;
    }

    setLoading(true);

    // 2. Insert into the 'memorials' table using the state values
    const { data, error } = await supabase
      .from("memorials")
      .insert([
        {
          deceased_name: formData.deceased_name,
          charity_name: formData.charity_name,
          bio: formData.bio,
          charity_id: "manual_entry", 
          created_by: userId,
          image_url: formData.image_url,
          date_of_birth: formData.date_of_birth || null, // Ensure null if empty
          date_of_passing: formData.date_of_passing || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      alert("Database Error: " + error.message);
      setLoading(false);
    } else if (data && data.length > 0) {
      // Success! Redirect to the new memorial
      router.push(`/memorial/${data[0].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] py-20 px-6">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-3xl font-serif text-slate-900 mb-8 text-center">Create a Memorial</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deceased Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Name of the Deceased</label>
            <input 
              type="text" 
              required
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition font-sans text-slate-900"
              placeholder="e.g. Eleanor Vance Sterling"
              value={formData.deceased_name}
              onChange={(e) => setFormData({...formData, deceased_name: e.target.value})}
            />
          </div>

          {/* Charity Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Select a Non-Profit</label>
            <select 
              required
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition bg-white font-sans text-slate-900"
              value={formData.charity_name}
              onChange={(e) => setFormData({...formData, charity_name: e.target.value})}
            >
              <option value="">Choose a cause...</option>
              <option value="The Ocean Cleanup">The Ocean Cleanup</option>
              <option value="Doctors Without Borders">Doctors Without Borders</option>
              <option value="St. Jude Children's Research Hospital">St. Jude</option>
            </select>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Their Legacy (Biography)</label>
            <textarea 
              required
              rows={4}
              className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none transition font-sans text-slate-900"
              placeholder="Tell their story..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            />
          </div>
          {/* Dates of birth and death */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Date of Birth</label>
              <input 
                type="date" 
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-sans text-slate-900"
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 font-sans">Date of Passing</label>
              <input 
                type="date" 
                className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-sans text-slate-900"
                onChange={(e) => setFormData({...formData, date_of_passing: e.target.value})}
              />
            </div>
          </div>
          {/* Image Upload Component */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 font-sans">Memorial Photo</label>
            <ImageUpload onUpload={(url) => setFormData({...formData, image_url: url})} />
            
            {formData.image_url && (
              <div className="mt-4 relative w-32 h-32">
                <img 
                  src={formData.image_url} 
                  className="w-full h-full object-cover rounded-xl border-2 border-amber-400 shadow-sm" 
                  alt="Preview" 
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, image_url: ""})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading || !userId}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition shadow-md disabled:bg-stone-300 font-sans"
          >
            {loading ? "Publishing..." : "Publish Memorial"}
          </button>
          
          {!userId && !loading && (
            <p className="text-center text-xs text-red-500 mt-2">
              Verifying your session... please wait.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
