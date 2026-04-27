import type { Metadata } from "next";
import Link from "next/link";
import { AssessmentClient } from "./ui";

export const metadata: Metadata = {
  title: "Assessment | Questions Before Conceiving",
  description:
    "Take the Questions Before Conceiving readiness assessment and get your domain profile.",
};

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#f2f0eb]">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-[0.24em] text-[#8a8680]">
            QUESTIONS BEFORE CONCEIVING
          </p>
          <Link
            href="/questions-before-conceiving"
            className="text-sm text-[#c8a97e] transition-colors hover:text-[#d4b896]"
          >
            Back
          </Link>
        </header>
        <AssessmentClient />
      </div>
    </main>
  );
}
