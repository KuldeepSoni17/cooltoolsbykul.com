"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

type WatchJob = {
  id: string;
  exact_role_title: string;
  location: string;
  source_url: string;
  is_new: boolean;
  is_active: boolean;
};

type WatchedCompany = {
  id: string;
  company_name: string;
  ats_platform: string;
  last_checked_at: string;
  jobs: WatchJob[];
};

export default function WatchlistPage() {
  const [companies, setCompanies] = useState<WatchedCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from("watched_companies")
        .select("id,company_name,ats_platform,last_checked_at,jobs(id,exact_role_title,location,source_url,is_new,is_active)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setCompanies((data as WatchedCompany[]) ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0C0C0F] flex items-center justify-center">
        <span className="font-mono text-[#4B5563] animate-pulse text-sm">Loading watchlist...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0C0C0F]">
      <header className="px-8 py-6 border-b border-[#1E1E26]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-[#F5F0E8]">
            VacancyBible
          </Link>
          <Link href="/" className="text-xs font-mono text-[#7A7A8C] hover:text-[#F5F0E8] transition-colors">
            ← Add company
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl text-[#F5F0E8]">My Watchlist</h1>
          <span className="text-xs font-mono text-[#4B5563]">{companies.length} companies watched</span>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#7A7A8C] font-sans mb-4">No companies watched yet.</p>
            <Link href="/" className="text-xs font-mono text-[#5B6EF5] hover:underline">
              Add your first company →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => {
              const activeJobs = (company.jobs || []).filter((j) => j.is_active);
              const newJobs = activeJobs.filter((j) => j.is_new);

              return (
                <div key={company.id} className="border border-[#1E1E26] bg-[#141418] rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-[#1E1E26]">
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-semibold text-[#F5F0E8]">{company.company_name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-[#5B6EF5] border-[#1E2456] bg-[#0D1233]">
                        {company.ats_platform}
                      </span>
                      {newJobs.length > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-[#4CAF7D] border-[#2A5E42] bg-[#1A3D2B]">
                          {newJobs.length} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#4B5563]">{activeJobs.length} PM roles</span>
                      <span className="text-xs font-mono text-[#4B5563]">Checked {timeAgo(company.last_checked_at)}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-[#1E1E26]/50">
                    {activeJobs.length === 0 ? (
                      <div className="px-6 py-4 text-xs font-mono text-[#4B5563]">No PM roles currently open</div>
                    ) : (
                      activeJobs.map((job) => (
                        <div
                          key={job.id}
                          className="px-6 py-3 flex items-center justify-between hover:bg-[#1A1A22] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {job.is_new && <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF7D] shrink-0" />}
                            <span className={job.is_new ? "text-sm font-sans text-[#F5F0E8]" : "text-sm font-sans text-[#7A7A8C]"}>
                              {job.exact_role_title}
                            </span>
                            {job.location && <span className="text-xs font-mono text-[#4B5563]">{job.location}</span>}
                          </div>
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-[#4B5563] hover:text-[#5B6EF5] transition-colors whitespace-nowrap"
                          >
                            View ↗
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function timeAgo(iso: string): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  if (h > 23) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}
