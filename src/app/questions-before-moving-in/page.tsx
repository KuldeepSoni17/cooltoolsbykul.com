import { MirrorLanding } from "@/features/mirror-engine/MirrorLanding";
import { MOVING_IN_ASSESSMENT } from "./content";

export default function MovingInLandingPage() {
  return (
    <MirrorLanding
      config={MOVING_IN_ASSESSMENT}
      assessmentPath="/questions-before-moving-in/assessment"
      eyebrow="Before You Decide · Moving in"
      headline="Questions before moving in together"
      subheadline="Daily logistics, money, space, and exit — before you sign the lease."
      decorativeNumber={6}
      panels={[
        {
          title: "Six domains",
          body: "Logistics, money, privacy, conflict, expectations, and exit planning.",
        },
        {
          title: "Couple compare",
          body: "Each partner completes the mirror; compare domain by domain.",
        },
        { title: "Private", body: "Stored on your device only." },
      ]}
    />
  );
}
