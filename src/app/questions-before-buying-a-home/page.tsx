import { MirrorLanding } from "@/features/mirror-engine/MirrorLanding";
import { BUYING_HOME_ASSESSMENT } from "./content";

export default function BuyingHomeLandingPage() {
  return (
    <MirrorLanding
      config={BUYING_HOME_ASSESSMENT}
      assessmentPath="/questions-before-buying-a-home/assessment"
      eyebrow="Before You Decide · Home"
      headline="Questions before buying a home"
      subheadline="Finance, timing, lifestyle, partnership, risk, and commitment."
      decorativeNumber={8}
      panels={[
        {
          title: "Six domains",
          body: "Full mirror before you leverage decades of income.",
        },
        {
          title: "Stress-tested",
          body: "Maintenance, rate rises, and reversibility included.",
        },
        { title: "Private", body: "On this device only." },
      ]}
    />
  );
}
