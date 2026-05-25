"use client";

import { useEffect, useRef, useState } from "react";
import { ISSUE_CATEGORIES } from "@/data/issues";

interface SearchFormProps {
  onSearch: (issueSlug: string, issueLabel: string, location: string) => void;
  loading: boolean;
  variant?: "hero" | "default";
}

const QUICK_PILLS = [
  "Pothole",
  "Waterlogging",
  "Power Cut",
  "Garbage",
  "Water Supply",
  "Illegal Construction",
];

export default function SearchForm({
  onSearch,
  loading,
  variant = "default",
}: SearchFormProps) {
  const isHero = variant === "hero";
  const issueFieldRef = useRef<HTMLDivElement>(null);

  const [issueQuery, setIssueQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<{
    slug: string;
    label: string;
  } | null>(null);
  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const allIssues = ISSUE_CATEGORIES.flatMap((cat) =>
    cat.issues.map((i) => ({ ...i, category: cat.category, icon: cat.icon }))
  );

  const filtered =
    issueQuery.length > 0
      ? allIssues.filter(
          (i) =>
            i.label.toLowerCase().includes(issueQuery.toLowerCase()) ||
            i.category.toLowerCase().includes(issueQuery.toLowerCase())
        )
      : allIssues;

  useEffect(() => {
    if (!showDropdown) return;

    function handleOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (issueFieldRef.current && !issueFieldRef.current.contains(target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [showDropdown]);

  function selectIssue(slug: string, label: string) {
    setSelectedIssue({ slug, label });
    setIssueQuery("");
    setShowDropdown(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIssue || !location.trim()) return;
    onSearch(selectedIssue.slug, selectedIssue.label, location);
  }

  const labelClass = isHero
    ? "mb-1.5 block text-sm font-medium text-sky-100"
    : "mb-1.5 block text-sm font-medium text-stone-700";

  const inputClass = isHero
    ? "w-full rounded-xl border border-slate-400 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
    : "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500";

  const chipClass = isHero
    ? "rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
    : "rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-sky-50 hover:text-sky-800";

  const submitClass = isHero
    ? "w-full rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-500"
    : "w-full rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative" ref={issueFieldRef}>
        <label className={labelClass}>What is the problem?</label>
        <input
          type="text"
          placeholder="e.g. pothole, waterlogging, power cut..."
          className={inputClass}
          value={selectedIssue ? selectedIssue.label : issueQuery}
          onChange={(e) => {
            setSelectedIssue(null);
            setIssueQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && !selectedIssue && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
            {filtered.slice(0, 20).map((issue) => (
              <button
                key={issue.slug}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-stone-900 hover:bg-sky-50"
                onClick={() => selectIssue(issue.slug, issue.label)}
              >
                <span>{issue.icon}</span>
                <span>
                  <span className="font-medium">{issue.label}</span>
                  <span className="ml-2 text-xs text-stone-500">
                    {issue.category}
                  </span>
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-stone-500">
                No matching issue found
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Where? (area, locality, city)</label>
        <input
          type="text"
          placeholder="e.g. Satellite, Ahmedabad or Koramangala, Bengaluru"
          className={inputClass}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {!selectedIssue && (
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_PILLS.map((label) => {
            const issue = allIssues.find((i) =>
              i.label.toLowerCase().includes(label.toLowerCase())
            );
            if (!issue) return null;
            return (
              <button
                key={label}
                type="button"
                onClick={() => selectIssue(issue.slug, issue.label)}
                className={chipClass}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedIssue || !location.trim() || loading}
        className={submitClass}
      >
        {loading ? "Finding who's responsible…" : "Find Who's Responsible →"}
      </button>
    </form>
  );
}
