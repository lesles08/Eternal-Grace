// app/page.tsx
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default async function Home() {
  // Fetch the 3 most recent memorials for the "Featured" section
  const { data: featured } = await supabase
    .from("memorials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main>
      {/* ... your Hero section ... */}

      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-3xl font-serif text-slate-900 mb-10 text-center">Featured Tributes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured?.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={m.image_url || "/placeholder.jpg"} className="h-48 w-full object-cover" />
              <div className="p-6 text-center">
                <h3 className="text-xl font-serif mb-2">{m.deceased_name}</h3>
                <p className="text-stone-500 text-sm mb-6 line-clamp-2">{m.bio}</p>
                
                {/* THE FIX: Use the Supabase ID here */}
                <Link 
                  href={`/memorial/${m.id}`}
                  className="inline-block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
                >
                  View Memorial & Donate
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
