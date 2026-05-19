import { MirrorLanding } from "@/features/mirror-engine/MirrorLanding";
import { MARRIAGE_ASSESSMENT } from "./content";

export default function MarriageLandingPage() {
  return (
    <MirrorLanding
      config={MARRIAGE_ASSESSMENT}
      assessmentPath="/questions-before-marriage/assessment"
      eyebrow="Before You Decide · Marriage"
      headline="Questions before getting married"
      subheadline="Couple mode is the product — where do you actually align before you sign?"
      decorativeNumber={7}
      panels={[
        {
          title: "Six domains",
          body: "Values, money, family, intimacy, conflict, and the story you tell yourselves.",
        },
        {
          title: "On this device",
          body: "Invite your partner to compare results locally — nothing uploaded.",
        },
        {
          title: "Not a quiz",
          body: "A structured pause that shows leverage areas, not a pass/fail grade.",
        },
      ]}
    />
  );
}
