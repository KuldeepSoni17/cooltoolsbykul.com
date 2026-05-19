import { AssessmentRunner } from "@/features/mirror-engine/AssessmentRunner";
import { PET_READINESS_ASSESSMENT } from "../../content-readiness";

export default function PetReadinessAssessmentPage() {
  return (
    <AssessmentRunner
      config={PET_READINESS_ASSESSMENT}
      resultsPath="/questions-before-adopting-pet/readiness/results"
    />
  );
}
