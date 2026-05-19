import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { QUITTING_JOB_ASSESSMENT } from "../content";
export default function AssessmentPage() { return <AssessmentRunner config={QUITTING_JOB_ASSESSMENT} resultsPath="/questions-before-quitting-your-job/results" />; }
