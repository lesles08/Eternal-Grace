"use client";

import React from "react";

interface Tribute {
  id: string;
  donor_name: string;
  amount_cents: number;
  message: string;
  created_at: string;
}

interface DonationTickerProps {
  tributes: Tribute[];
}

export default function DonationTicker({ tributes }: { tributes: any[] }) {
  if (!tributes || tributes.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t border-stone-100 text-center">
        <p className="text-stone-400 font-serif italic">No tributes have been left yet. Be the first to share a memory.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 font-sans">
          Recent Tributes
        </h3>
        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded font-bold uppercase font-sans">
          Live Feed
        </span>
      </div>

      <div className="space-y-4">
        {tributes.map((tribute) => (
          <div key={tribute.id} className="...">
		    <div className="flex justify-between items-start mb-2">
		      <span className="font-serif text-lg text-slate-900">
		        {/* Use author_name here */}
		        {tribute.author_name || "Anonymous Supporter"}
		      </span>
		      <span className="text-amber-600 font-bold font-sans tabular-nums">
		        {/* Use amount_cents here */}
		        ${((tribute.amount_cents || 0) / 100).toLocaleString()}
		      </span>
		    </div>

            {tribute.message && (
              <p className="text-stone-600 font-serif italic leading-relaxed text-sm relative pl-4 border-l-2 border-amber-200">
                "{tribute.message}"
              </p>
            )}

            <div className="mt-3 text-[10px] text-stone-400 font-sans uppercase tracking-widest">
              {new Date(tribute.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}