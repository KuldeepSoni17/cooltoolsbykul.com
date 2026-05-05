export function SearchAllMode() {
  return (
    <div className="rounded-2xl border border-[#1E1E26] bg-[#141418] p-6">
      <p className="text-sm text-[#7A7A8C] mb-4">
        Continue with the existing Search All flow. No search logic was changed.
      </p>
      <a
        href="/vacancybible/search-all"
        className="inline-flex items-center px-4 py-2 rounded-xl bg-[#5B6EF5] hover:bg-[#4A5DE4] text-white text-sm font-medium transition-colors"
      >
        Open Search All →
      </a>
    </div>
  );
}
