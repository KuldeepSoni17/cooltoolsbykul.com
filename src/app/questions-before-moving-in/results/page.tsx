import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { MOVING_IN_ASSESSMENT } from "../content";

export default function ResultsPage() {
  return (
    <ResultsView
      config={MOVING_IN_ASSESSMENT}
      assessmentPath="/questions-before-moving-in/assessment"
      landingPath="/questions-before-moving-in"
    />
  );
}
