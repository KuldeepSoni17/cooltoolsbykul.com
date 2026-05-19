import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { BUYING_HOME_ASSESSMENT } from "../content";
export default function AssessmentPage() { return <AssessmentRunner config={BUYING_HOME_ASSESSMENT} resultsPath="/questions-before-buying-a-home/results" />; }
