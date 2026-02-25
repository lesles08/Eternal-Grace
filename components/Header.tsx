"use client"; // Add this at the top
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-[#fafaf9] border-b border-stone-100">
      <div className="flex justify-between items-center px-12 py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 bg-amber-400 rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
          <h1 className="text-2xl font-serif font-medium tracking-tight text-slate-900">Honor Gift</h1>
        </Link>
        <div className="flex gap-8 text-sm font-medium text-slate-600 items-center">
          <Link href="/discover" className="hover:text-slate-900 transition">
            Discover
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-amber-700">My Dashboard</Link>
              <Link href="/create" className="bg-amber-400 text-amber-950 px-4 py-2 rounded-lg hover:bg-amber-500 transition">
                Create Memorial
              </Link>
              <button onClick={() => supabase.auth.signOut()} className="hover:text-amber-700">Log Out</button>
            </>
          ) : (
            <Link href="/login" className="hover:text-amber-700">Log In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}