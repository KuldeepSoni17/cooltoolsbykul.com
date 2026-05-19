import { MirrorLanding } from "@/features/mirror-engine/MirrorLanding";
import { PET_READINESS_ASSESSMENT } from "./content-readiness";

export default function PetLandingPage() {
  return (
    <MirrorLanding
      config={PET_READINESS_ASSESSMENT}
      assessmentPath="/questions-before-adopting-pet/readiness/assessment"
      eyebrow="Before You Decide · Pet"
      headline="Questions before adopting a pet"
      subheadline="Readiness first — then an honest breed matcher. Rescue-first, no sales pitch."
      decorativeNumber={15}
      panels={[
        {
          title: "Readiness mirror",
          body: "32 questions across time, money, housing, household, and honest motivation.",
        },
        {
          title: "Breed matcher",
          body: "Matches your real constraints — including breeds ruled out and why.",
        },
        {
          title: "On this device",
          body: "Nothing is uploaded. Your answers stay in your browser.",
        },
      ]}
      extraCta={{
        label: "Skip to breed matcher →",
        href: "/questions-before-adopting-pet/match",
      }}
    />
  );
}
