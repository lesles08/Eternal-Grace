"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardStats from "@/components/DashboardStats";

export default function Dashboard() {
  const [memorials, setMemorials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user"); // Track the role
  const router = useRouter();

  useEffect(() => {
    const fetchMemorialData = async () => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log("My current ID is:", user?.id); 
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Fetch user's role from the profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "user";
      setUserRole(role);

      // 3. Build the query based on role
      let query = supabase.from("memorials").select("*");

      // Only restrict to "created_by" if NOT an admin or developer
      if (role !== "admin" && role !== "developer") {
        query = query.eq("created_by", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching memorials:", error);
      } else {
        setMemorials(data || []);
      }
      setLoading(false);
    };

    fetchMemorialData();
  }, [router]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      userRole === "admin" 
      ? "SUPER ADMIN: Are you sure you want to delete this memorial? This cannot be undone." 
      : "Are you sure you want to delete this memorial? This cannot be undone."
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from('memorials')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // Filter out the deleted memorial from state locally for instant feedback
      setMemorials(prev => prev.filter(m => m.id !== id));
    }
  };

  if (loading) return <div className="p-20 text-center font-serif italic text-stone-400">Loading your legacy...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-serif text-slate-900">Your Dashboard</h1>
        {userRole === "admin" && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200">
            Super Admin
          </span>
        )}
      </div>
      
      <DashboardStats />

      <div className="min-h-screen bg-[#fafaf9] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-serif text-slate-900 mb-2">
                {userRole === "admin" ? "All Memorials" : "My Memorials"}
              </h1>
              <p className="text-stone-500 font-sans">
                {userRole === "admin" ? "Managing site-wide tributes as administrator." : "Manage the tributes you have created."}
              </p>
            </div>
            <Link 
              href="/create" 
              className="bg-amber-400 text-amber-950 px-6 py-3 rounded-xl font-medium hover:bg-amber-500 transition shadow-sm"
            >
              + Create New
            </Link>
          </header>

          {memorials.length === 0 ? (
            <div className="bg-white border border-dashed border-stone-300 rounded-3xl p-20 text-center">
              <p className="text-stone-400 mb-6 font-serif text-xl">No memorials found.</p>
              <Link href="/create" className="text-amber-600 font-medium hover:underline underline-offset-4">
                Start your first tribute &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memorials.map((m) => (
                <div key={m.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col">
                  {/* Added an image preview for better management */}
                  {m.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-stone-100 border-b border-stone-100">
                       <img src={m.image_url} className="w-full h-full object-cover" alt={m.deceased_name} />
                    </div>
                  )}
                  
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-serif text-slate-900 mb-1">{m.deceased_name}</h3>
                    <p className="text-sm text-stone-400 mb-4">{m.charity_name}</p>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">${(m.total_raised_cents / 100).toLocaleString()} raised</span>
                        <span className="text-stone-400">of $5,000</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 transition-all duration-1000" 
                          style={{ width: `${Math.min((m.total_raised_cents / 500000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        href={`/memorial/${m.id}`} 
                        className="flex-1 text-center py-2 border border-stone-200 rounded-lg text-xs font-medium hover:bg-stone-50 transition"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/memorial/${m.id}/edit`} 
                        className="flex-1 text-center py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
