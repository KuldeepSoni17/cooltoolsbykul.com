import { ModeSelector } from "@/components/landing/ModeSelector";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0C0C0F] flex flex-col">
      <header className="px-8 py-6 border-b border-[#1E1E26]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-display text-xl text-[#F5F0E8]">VacancyBible</span>
          <nav className="flex gap-6 text-sm text-[#7A7A8C]">
            <a href="/watchlist" className="hover:text-[#F5F0E8] transition-colors">
              My Watchlist
            </a>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl text-[#F5F0E8] leading-tight mb-4">
              Find the role.
              <br />
              <span className="italic text-[#7A7A8C]">Cut the noise.</span>
            </h1>
            <p className="text-[#7A7A8C] text-lg">How do you want to search today?</p>
          </div>
          <ModeSelector />
        </div>
      </div>

      <footer className="px-8 py-4 border-t border-[#1E1E26] text-center">
        <p className="text-xs text-[#4B5563] font-mono">
          VacancyBible does not host job listings. All results link to original sources.
        </p>
      </footer>
    </main>
  );
}
