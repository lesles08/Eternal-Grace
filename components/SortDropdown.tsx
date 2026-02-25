"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.replace(`/discover?${params.toString()}`);
  };

  return (
    <select
      defaultValue={searchParams.get("sort") || ""}
      onChange={(e) => handleSortChange(e.target.value)}
      className="px-4 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition shadow-sm font-sans text-sm text-slate-600 cursor-pointer"
    >
      <option value="">Newest First</option>
      <option value="oldest">Oldest First</option>
      <option value="raised">Most Raised</option>
      <option value="alpha">Alphabetical (A-Z)</option>
    </select>
  );
}