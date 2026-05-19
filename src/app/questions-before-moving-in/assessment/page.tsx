import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { MOVING_IN_ASSESSMENT } from "../content";

export default function AssessmentPage() {
  return (
    <AssessmentRunner
      config={MOVING_IN_ASSESSMENT}
      resultsPath="/questions-before-moving-in/results"
    />
  );
}
