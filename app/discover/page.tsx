import { supabase } from "@/utils/supabase";
import InstantSearch from "@/components/InstantSearch";
import SortDropdown from "@/components/SortDropdown";

export default async function DiscoverPage(props: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const sParams = await props.searchParams;
  const q = sParams?.q || "";
  const sort = sParams?.sort || "";

  let query = supabase.from("memorials").select("*");

  if (q) {
    query = query.ilike("deceased_name", `%${q}%`);
  }

  // Sorting
  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "raised") {
    query = query.order("total_raised_cents", { ascending: false });
  } else if (sort === "alpha") {
    query = query.order("deceased_name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: memorials } = await query;

  return (
    <div className="min-h-screen bg-[#fafaf9] py-20 px-6 isolate">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-5xl font-serif text-slate-900 mb-4">Discover Tributes</h1>
            <p className="text-lg text-stone-500 font-sans">Find a loved one by name.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <InstantSearch />
            <SortDropdown />
          </div>
        </header>

        {!memorials || memorials.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-stone-200 rounded-[3rem]">
             <h2 className="text-2xl font-serif text-slate-900">No memorials found</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {memorials.map((m) => (
              <div 
                key={m.id} 
                className="group relative flex flex-col bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow memorial-card-container"
              >
                {/* 1. THE LINK: Using a standard 'a' tag to bypass Next.js Link logic temporarily */}
                <a 
                  href={`/memorial/${m.id}`} 
                  className="absolute inset-0 z-50 block cursor-pointer"
                  aria-label={`View ${m.deceased_name}`}
                >
                  {/* Leave this empty; it's the hitbox */}
                </a>

                {/* 2. VISUALS */}
                <div className="aspect-[4/5] overflow-hidden bg-stone-100">
                  <img 
                    src={m.image_url || "https://images.unsplash.com/photo-1511225070737-5af5ac9a690d?w=800&q=80"} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt=""
                  />
                </div>
                
                <div className="p-8">
                  <h2 className="text-2xl font-serif text-slate-900 mb-1">{m.deceased_name}</h2>
                  {m.date_of_birth && (
                    <p className="text-[13px] text-stone-400 font-sans mb-2">
                      {new Date(m.date_of_birth).getFullYear()} 
                      {m.date_of_passing && ` – ${new Date(m.date_of_passing).getFullYear()}`}
                    </p>
                  )}
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-6">
                    {m.charity_name}
                  </p>
                  <div className="w-full text-center py-4 bg-slate-900 text-white rounded-2xl font-medium">
                    View & Support
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
