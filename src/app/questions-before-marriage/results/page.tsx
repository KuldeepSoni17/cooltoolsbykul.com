import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { MARRIAGE_ASSESSMENT } from "../content";

export default function ResultsPage() {
  return (
    <ResultsView
      config={MARRIAGE_ASSESSMENT}
      assessmentPath="/questions-before-marriage/assessment"
      landingPath="/questions-before-marriage"
    />
  );
}
