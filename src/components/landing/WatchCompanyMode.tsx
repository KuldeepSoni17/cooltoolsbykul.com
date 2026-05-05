"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DetectionResult } from "@/lib/ats-detector";

type Step = "input" | "detecting" | "confirm" | "scraping" | "done" | "error";

export function WatchCompanyMode() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [error, setError] = useState("");
  const [jobCount, setJobCount] = useState(0);

  async function handleDetect() {
    if (!url.trim()) return;
    setStep("detecting");
    setError("");

    try {
      const resp = await fetch("/api/watch/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || "Could not read that URL. Is it a careers page?");
        setStep("error");
        return;
      }

      setDetection(data);
      setStep("confirm");
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  async function handleConfirmWatch() {
    if (!detection) return;
    setStep("scraping");

    try {
      const resp = await fetch("/api/watch/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detection }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || "Failed to start watching.");
        setStep("error");
        return;
      }

      setJobCount(data.jobs_found || 0);
      setStep("done");
      setTimeout(() => router.push("/watchlist"), 2000);
    } catch {
      setError("Failed to start watching. Please try again.");
      setStep("error");
    }
  }

  if (step === "input" || step === "error") {
    return (
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs font-mono text-[#7A7A8C] uppercase tracking-widest mb-3">Company Careers Page URL</label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDetect()}
              placeholder="https://www.metacareers.com/jobs"
              className="flex-1 bg-[#141418] border border-[#1E1E26] rounded-xl px-4 py-3.5 text-[#F5F0E8] font-mono text-sm placeholder:text-[#3A3A4A] focus:outline-none focus:border-[#5B6EF5] transition-colors"
            />
            <button
              onClick={handleDetect}
              disabled={!url.trim()}
              className="px-6 py-3.5 bg-[#5B6EF5] hover:bg-[#4A5DE4] text-white rounded-xl font-sans font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Detect →
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider">Examples</p>
          {[
            "https://www.metacareers.com/jobs",
            "https://jobs.lever.co/razorpay",
            "https://boards.greenhouse.io/stripe",
            "https://careers.google.com/jobs/results",
            "https://www.amazon.jobs/en/search",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setUrl(example)}
              className="block text-xs font-mono text-[#4B5563] hover:text-[#7A7A8C] transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        {step === "error" && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm font-mono">{error}</div>
        )}
      </div>
    );
  }

  if (step === "detecting") {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-[#5B6EF5] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#7A7A8C]">Reading careers page...</span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">{url}</p>
        </div>
      </div>
    );
  }

  if (step === "confirm" && detection) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl space-y-5">
          <div>
            <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-2">Detected</p>
            <div className="flex items-center gap-3">
              <span className="text-[#F5F0E8] font-sans font-semibold text-lg">{detection.company_name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-[#5B6EF5] border-[#1E2456] bg-[#0D1233]">
                {detection.ats_platform}
              </span>
            </div>
          </div>
          <div className="h-px bg-[#1E1E26]" />
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Jobs found" value={String(detection.total_jobs_found)} />
            <Stat label="PM roles matched" value={String(detection.pm_roles_found)} highlight />
            <Stat label="Platform" value={detection.ats_platform} />
          </div>
          {detection.sample_roles.length > 0 && (
            <div>
              <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-2">Sample roles found</p>
              <div className="space-y-1">
                {detection.sample_roles.slice(0, 3).map((role, i) => (
                  <div key={i} className="text-sm text-[#7A7A8C] font-mono flex items-center gap-2">
                    <span className="text-[#4B5563]">·</span>
                    {role}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirmWatch}
            className="flex-1 py-3.5 bg-[#5B6EF5] hover:bg-[#4A5DE4] text-white rounded-xl font-sans font-medium text-sm transition-colors"
          >
            Watch this company →
          </button>
          <button
            onClick={() => {
              setStep("input");
              setDetection(null);
            }}
            className="px-6 py-3.5 border border-[#1E1E26] text-[#7A7A8C] rounded-xl text-sm font-sans hover:border-[#2E2E3E] hover:text-[#F5F0E8] transition-colors"
          >
            Try different URL
          </button>
        </div>
      </div>
    );
  }

  if (step === "scraping") {
    return (
      <div className="max-w-2xl">
        <div className="p-6 bg-[#141418] border border-[#1E1E26] rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-[#4CAF7D] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#7A7A8C]">Adding to watchlist and fetching roles...</span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">First scrape in progress. Taking you to your watchlist shortly.</p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="max-w-2xl">
        <div className="p-6 bg-[#0D1F15] border border-[#2A5E42] rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#4CAF7D]">✓</span>
            <span className="text-sm font-mono text-[#4CAF7D]">Watching {detection?.company_name}</span>
          </div>
          <p className="text-xs font-mono text-[#4B5563]">Found {jobCount} matching roles. Taking you to your watchlist...</p>
        </div>
      </div>
    );
  }

  return null;
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-mono text-[#4B5563] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-mono font-medium ${highlight ? "text-[#4CAF7D]" : "text-[#F5F0E8]"}`}>{value}</p>
    </div>
  );
}
