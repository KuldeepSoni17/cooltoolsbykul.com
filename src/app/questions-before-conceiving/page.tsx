import type { Metadata } from "next";
import { LandingClient } from "./LandingClient";

export const metadata: Metadata = {
  title: "Questions Before Conceiving | Cool Tools by Kul",
  description:
    "A deliberate readiness mirror for prospective parents — 32 questions across eight domains.",
};

export default function QuestionsBeforeConceivingPage() {
  return <LandingClient />;
}
