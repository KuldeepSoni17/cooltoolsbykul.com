import DepartmentCard from "@/components/DepartmentCard";
import RepresentativeCard from "@/components/RepresentativeCard";
import EscalationPath from "@/components/EscalationPath";
import { Department } from "@/data/departments";
import { LocationData } from "@/lib/geocode";
import { Representative } from "@/lib/wikidata";

interface SearchState {
  issueLabel: string;
  location: LocationData;
  departments: Department[];
  representatives: Representative[];
}

interface ResultsSectionProps {
  result: SearchState;
}

export default function ResultsSection({ result }: ResultsSectionProps) {
  return (
    <section id="results" className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Responsibility for <span className="text-blue-600">{result.issueLabel}</span>{" "}
          in{" "}
          <span className="text-blue-600">
            {result.location.formattedAddress}
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          {result.location.city} - {result.location.state} - {result.location.pinCode}
        </p>
      </div>

      {result.departments.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Responsible Department{result.departments.length > 1 ? "s" : ""}
          </h3>
          {result.departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-800">
          No department mapping found for this issue in {result.location.city}. Try
          filing on{" "}
          <a
            href="https://pgportal.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            CPGRAMS
          </a>{" "}
          or{" "}
          <a
            href="https://ipgrs.karnataka.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            IPGRS
          </a>
          .
        </div>
      )}

      {result.representatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
            Your Elected Representatives
          </h3>
          {result.representatives.map((rep, i) => (
            <RepresentativeCard key={`${rep.type}-${rep.name}-${i}`} rep={rep} />
          ))}
        </div>
      )}

      <EscalationPath />

      <p className="pb-8 text-xs text-gray-400">
        Officer names are from official BBMP/department websites and may change
        after transfers. Representatives are fetched live from Wikidata and may not
        reflect very recent elections. Coverage is Bengaluru-first; for other cities
        use CPGRAMS or state grievance portals.
      </p>
    </section>
  );
}
