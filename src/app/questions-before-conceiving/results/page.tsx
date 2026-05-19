import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { CONCEIVING_ASSESSMENT } from "../content";

export default function ConceivingResultsPage() {
  return (
    <ResultsView
      config={CONCEIVING_ASSESSMENT}
      assessmentPath="/questions-before-conceiving/assessment"
      landingPath="/questions-before-conceiving"
    />
  );
}
