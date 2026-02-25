"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

export default function InstantSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  
  // New state to prevent flickering
  const [showLoader, setShowLoader] = useState(false);

  // Sync the loader with isPending, but with a slight delay
  useEffect(() => {
    if (isPending) {
      const timer = setTimeout(() => setShowLoader(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [isPending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.replace(`/discover?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full md:w-96 font-sans">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name..."
        className="w-full pl-5 pr-12 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition shadow-sm text-slate-900"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
        {/* We use showLoader now instead of isPending */}
        {showLoader ? (
          <div className="h-5 w-5 border-2 border-stone-100 border-t-amber-400 rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
    </div>
  );
}