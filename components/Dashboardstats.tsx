"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function DashboardStats() {
  const [stats, setStats] = useState<{label: string, value: string | number, color: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 2. Filter the query by the user's ID
      const { data: memorials } = await supabase
        .from("memorials")
        .select("total_raised_cents")
        .eq("created_by", user.id); // <--- This ensures the counts match your list

      if (memorials) {
        const totalMemorials = memorials.length;
        const totalRaisedCents = memorials.reduce((acc, m) => acc + (m.total_raised_cents || 0), 0);
        const totalRaisedDollars = totalRaisedCents / 100;
        const average = totalMemorials > 0 ? totalRaisedDollars / totalMemorials : 0;

        setStats([
          { label: "Your Memorials", value: totalMemorials, color: "text-blue-700 bg-blue-50" },
          { label: "Total Raised", value: `$${totalRaisedDollars.toLocaleString()}`, color: "text-emerald-700 bg-emerald-50" },
          { label: "Average per Tribute", value: `$${average.toFixed(2)}`, color: "text-amber-700 bg-amber-50" },
        ]);
      }
      setLoading(false);
    }
    getStats();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-28 bg-stone-100 rounded-3xl" />)}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat) => (
        <div key={stat.label} className="p-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <p className="text-stone-500 text-sm font-medium mb-1 font-sans">{stat.label}</p>
          <p className={`text-2xl font-bold font-serif ${stat.color.split(' ')[0]}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
