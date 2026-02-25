"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh(); // Refresh to update the header links
    }
  };

  const handleSignUp = async () => {
  if (!email || !password) {
    alert("Please enter both an email and password to create an account.");
    return;
  }

  setLoading(true);
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      // This ensures it doesn't try to create an anonymous session
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Check your email for the confirmation link!");
  }
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-3xl font-serif text-slate-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-stone-400 text-center mb-8 text-sm">Sign in to manage your memorials</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
          >
            {loading ? "Processing..." : "Log In"}
          </button>
        </form>
        
        <div className="mt-6 flex gap-4">
           <button 
             onClick={handleSignUp}
             className="w-full py-3 border border-stone-200 text-slate-600 rounded-xl text-sm hover:bg-stone-50 transition"
           >
             Create Account
           </button>
        </div>
      </div>
    </div>
  );
}
