import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { QUITTING_JOB_ASSESSMENT } from "../content";
export default function ResultsPage() { return <ResultsView config={QUITTING_JOB_ASSESSMENT} assessmentPath="/questions-before-quitting-your-job/assessment" landingPath="/questions-before-quitting-your-job" />; }
