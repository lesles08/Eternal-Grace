import { supabase } from "@/utils/supabase";
import { notFound } from "next/navigation";
import TributeSection from "@/components/TributeSection";
import DonationTicker from "@/components/DonationTicker";
import ProgressBar from "@/components/ProgressBar";

export default async function MemorialPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<{ success?: string }>;
}) {
  // Await them both immediately
  const [resolvedParams, sParams] = await Promise.all([params, searchParams]);
  
  const id = resolvedParams.id;
  const success = sParams?.success;

  // 1. Fetch the memorial data
  const { data: person, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .single();

  // 2. Fetch the latest tributes
  const { data: tributes } = await supabase
    .from('tributes')
    .select('*')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error || !person) {
    return notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === person.created_by;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Success Banner */}
      {success === "true" && (
        <div className="bg-amber-50 border-b border-amber-100 py-4 px-6 text-center">
          <p className="text-amber-900 font-serif italic text-lg">
            Thank you for your generous gift in honor of {person.deceased_name}.
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-20 lg:flex gap-16 items-start">
        {/* Left Side: Biography */}
        <div className="flex-1 mb-12 lg:mb-0">
          <div className="relative w-48 h-48 mb-8">
             <div className="absolute inset-0 rounded-full border-2 border-amber-400 scale-105"></div>
             <img 
               src={person.image_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"} 
               className="rounded-full w-full h-full object-cover" 
               alt={person.deceased_name} 
             />
          </div>
          
          <h1 className="text-5xl font-serif text-slate-900 mb-2">{person.deceased_name}</h1>
          
          {person.date_of_birth && (
            <p className="text-stone-500 font-sans mb-6">
              {new Date(person.date_of_birth).toLocaleDateString('en-US', { 
                timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' 
              })} 
              {person.date_of_passing && ` – ${new Date(person.date_of_passing).toLocaleDateString('en-US', { 
                timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' 
              })}`}
            </p>
          )}
          
          <div className="prose prose-stone prose-lg">
            <p className="text-slate-700 leading-relaxed font-sans italic whitespace-pre-wrap">
              {person.bio}
            </p>
          </div>
        </div>

        {/* Right Side: Progress Card & Ticker */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <ProgressBar 
            goal={5000} 
            raised={(person.total_raised_cents || 0) / 100} 
            charityName={person.charity_name}
            memorialId={id}
            deceasedName={person.deceased_name}
          />

          <DonationTicker tributes={tributes || []} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <TributeSection memorialId={id} isOwner={isOwner} />
      </div>
    </div>
  );
}
