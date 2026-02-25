"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ProgressBarProps {
  goal: number;
  raised: number;
  charityName: string;
  memorialId: string;
  deceasedName: string;
}

export default function ProgressBar({ goal, raised, charityName, memorialId, deceasedName }: ProgressBarProps) {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  // --- THE LOOP FIX ---
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      // 1. Refresh the server data
      router.refresh();

      // 2. Clean the URL so it doesn't loop
      const newPath = window.location.pathname;
      window.history.replaceState({}, '', newPath);
    }
  }, [searchParams, router]);

  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  const handleDonation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          memorialId: memorialId,
          deceasedName: deceasedName,
          message: message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server Error");
      }

      const session = await response.json();
      
      if (session.url) {
        window.location.assign(session.url);
      } else {
        throw new Error("No checkout URL received from Stripe.");
      }

    } catch (error: any) {
      console.error("DETAILED ERROR:", error);
      alert("Checkout Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const amounts = [10, 25, 50, 100];

  return (
    <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-serif text-xl text-slate-900 leading-tight">Support {charityName}</h3>
          <span className="text-amber-600 font-bold font-sans">
            ${(raised).toLocaleString()}
          </span>
        </div>
        
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-400 transition-all duration-1000" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[10px] text-stone-400 font-sans uppercase tracking-widest">{percentage}% Complete</p>
          <p className="text-[10px] text-stone-400 font-sans uppercase tracking-widest text-right">Goal: ${goal.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        {amounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setSelectedAmount(amt)}
            className={`py-3 text-sm rounded-xl border transition-all font-sans font-medium ${
              selectedAmount === amt 
                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                : "bg-white text-slate-600 border-stone-200 hover:border-amber-300"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-[10px] text-stone-400 font-sans uppercase tracking-widest mb-2">
          Leave a Tribute Message (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share a memory or words of support..."
          className="w-full p-4 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition resize-none"
          rows={3}
        />
      </div>

      <button 
        onClick={handleDonation}
        disabled={loading}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg disabled:bg-stone-300 disabled:cursor-not-allowed font-sans"
      >
        {loading ? "Preparing Checkout..." : `Donate $${selectedAmount} in Loving Memory`}
      </button>

      <p className="text-center text-[10px] text-stone-400 mt-4 font-sans uppercase tracking-[0.15em]">
        Secure Donation via Stripe
      </p>
    </div>
  );
}