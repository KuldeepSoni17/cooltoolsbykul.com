"use client";

import { useState } from "react";
import { ISSUE_CATEGORIES } from "@/data/issues";

interface SearchFormProps {
  onSearch: (issueSlug: string, issueLabel: string, location: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIssue || !location.trim()) return;
    onSearch(selectedIssue.slug, selectedIssue.label, location);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          What is the problem?
        </label>
        <input
          type="text"
          placeholder="e.g. pothole, waterlogging, power cut..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={selectedIssue ? selectedIssue.label : issueQuery}
          onChange={(e) => {
            setSelectedIssue(null);
            setIssueQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && !selectedIssue && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {filtered.slice(0, 20).map((issue) => (
              <button
                key={issue.slug}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-blue-50"
                onClick={() => {
                  setSelectedIssue({ slug: issue.slug, label: issue.label });
                  setShowDropdown(false);
                  setIssueQuery("");
                }}
              >
                <span>{issue.icon}</span>
                <span>
                  <span className="font-medium">{issue.label}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {issue.category}
                  </span>
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">
                No matching issue found
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Where? (area, locality, city)
        </label>
        <input
          type="text"
          placeholder="e.g. Koramangala, Bengaluru"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {!selectedIssue && (
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            "Pothole",
            "Waterlogging",
            "Power Cut",
            "Garbage",
            "Water Supply",
            "Illegal Construction",
          ].map((label) => {
            const issue = allIssues.find((i) =>
              i.label.toLowerCase().includes(label.toLowerCase())
            );
            if (!issue) return null;
            return (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setSelectedIssue({ slug: issue.slug, label: issue.label })
                }
                className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-blue-100"
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
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? "Finding who's responsible..." : "Find Who's Responsible ->"}
      </button>
    </form>
  );
}
