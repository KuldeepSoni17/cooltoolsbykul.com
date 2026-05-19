import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { MARRIAGE_ASSESSMENT } from "../content";

export default function AssessmentPage() {
  return (
    <AssessmentRunner
      config={MARRIAGE_ASSESSMENT}
      resultsPath="/questions-before-marriage/results"
    />
  );
}
