import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { CONCEIVING_ASSESSMENT } from "../content";

export default function ConceivingAssessmentPage() {
  return (
    <AssessmentRunner
      config={CONCEIVING_ASSESSMENT}
      resultsPath="/questions-before-conceiving/results"
    />
  );
}
