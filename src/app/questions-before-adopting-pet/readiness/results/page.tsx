"use client";

import Link from "next/link";
import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { PET_READINESS_ASSESSMENT } from "../../content-readiness";

export default function PetReadinessResultsPage() {
  return (
    <>
      <ResultsView
        config={PET_READINESS_ASSESSMENT}
        assessmentPath="/questions-before-adopting-pet/readiness/assessment"
        landingPath="/questions-before-adopting-pet"
      />
      <div className="mirror-root pointer-events-none fixed bottom-24 left-0 right-0 z-30 flex justify-center px-6">
        <Link
          href="/questions-before-adopting-pet/match"
          className="pointer-events-auto rounded-full px-8 py-3 text-sm font-semibold text-[#0e0e0e]"
          style={{ background: "#9caf88" }}
        >
          Continue to breed matcher →
        </Link>
      </div>
    </>
  );
}
