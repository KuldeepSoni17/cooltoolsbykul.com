import { ResultsView } from "@/features/mirror-engine/ResultsView";
import { BUYING_HOME_ASSESSMENT } from "../content";
export default function ResultsPage() { return <ResultsView config={BUYING_HOME_ASSESSMENT} assessmentPath="/questions-before-buying-a-home/assessment" landingPath="/questions-before-buying-a-home" />; }
