import { MirrorLanding } from "@/features/mirror-engine/MirrorLanding";
import { QUITTING_JOB_ASSESSMENT } from "./content";

export default function QuittingJobLandingPage() {
  return (
    <MirrorLanding
      config={QUITTING_JOB_ASSESSMENT}
      assessmentPath="/questions-before-quitting-your-job/assessment"
      eyebrow="Before You Decide · Career"
      headline="Questions before quitting your job"
      subheadline="Runway, push vs pull, identity, reversibility, and timing."
      decorativeNumber={5}
      panels={[
        {
          title: "Six domains",
          body: "Runway through ethical exit.",
        },
        {
          title: "Burnout-aware",
          body: "Escape vs opportunity separated before you hand in notice.",
        },
        { title: "Private", body: "No employer sees this." },
      ]}
    />
  );
}
