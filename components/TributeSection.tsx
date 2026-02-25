"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

interface TributeSectionProps {
  memorialId: string;
  isOwner: boolean;
}

export default function TributeSection({ memorialId, isOwner }: TributeSectionProps) {
  const [tributes, setTributes] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTributes();
  }, [memorialId]);

  async function fetchTributes() {
    const { data, error } = await supabase
      .from("tributes")
      .select("*")
      .eq("memorial_id", memorialId)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching tributes:", error);
    } else {
      setTributes(data || []);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("tributes").insert([
      { 
        memorial_id: memorialId, 
        author_name: name, 
        message: message 
      }
    ]);

    if (error) {
      alert("Error posting tribute: " + error.message);
    } else {
      setName("");
      setMessage("");
      // Refresh the list to show the new post
      fetchTributes();
    }
    setSubmitting(false);
  }

  async function handleDelete(tributeId: string) {
    if (!window.confirm("Are you sure you want to remove this tribute?")) return;

    const { error } = await supabase
      .from("tributes")
      .delete()
      .eq("id", tributeId);

    if (error) {
      alert("Error deleting tribute: " + error.message);
    } else {
      // Optimistically update UI by filtering out the deleted tribute
      setTributes(tributes.filter(t => t.id !== tributeId));
    }
  }

  return (
    <div className="mt-16 border-t border-stone-200 pt-12 max-w-3xl mx-auto">
      <h2 className="text-3xl font-serif text-slate-900 mb-8">Tributes & Memories</h2>

      {/* Message Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200 mb-12 shadow-sm">
        <div className="space-y-4 mb-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
          <textarea
            placeholder="Share a memory or message of support..."
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition disabled:bg-stone-300 shadow-md"
        >
          {submitting ? "Posting..." : "Post Tribute"}
        </button>
      </form>

      {/* List of Tributes */}
      <div className="space-y-8">
        {tributes.length === 0 ? (
          <p className="text-stone-400 italic font-serif">No tributes have been shared yet. Be the first to share a memory.</p>
        ) : (
          tributes.map((t) => (
            <div key={t.id} className="border-b border-stone-100 pb-8 flex justify-between items-start group">
              <div className="flex-1">
                <p className="text-slate-800 font-sans text-lg leading-relaxed mb-3">"{t.message}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">— {t.author_name}</span>
                  <span className="text-xs text-stone-300">•</span>
                  <span className="text-xs text-stone-400">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Moderation Button: Only visible to the creator of the memorial */}
              {isOwner && (
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="ml-4 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition p-2 border border-red-50 rounded opacity-0 group-hover:opacity-100"
                  title="Remove this tribute"
                >
                  Remove
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}