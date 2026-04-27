import { Department } from "@/data/departments";

interface Props {
  department: Department;
}

const LEVEL_COLORS = {
  municipal: "bg-blue-100 text-blue-800",
  state: "bg-orange-100 text-orange-800",
  central: "bg-purple-100 text-purple-800",
};

export default function DepartmentCard({ department: dept }: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{dept.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{dept.description}</p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${LEVEL_COLORS[dept.level]}`}
        >
          {dept.level.charAt(0).toUpperCase() + dept.level.slice(1)}
        </span>
      </div>

      {dept.officers.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Officer in Charge
          </p>
          {dept.officers.map((officer) => (
            <div
              key={`${officer.designation}-${officer.name}`}
              className="flex items-start gap-3"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg">
                👤
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{officer.name}</p>
                <p className="text-xs text-gray-500">{officer.designation}</p>
                {officer.phone && (
                  <a
                    href={`tel:${officer.phone}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    📞 {officer.phone}
                  </a>
                )}
                {officer.email && (
                  <a
                    href={`mailto:${officer.email}`}
                    className="ml-3 text-xs text-blue-600 hover:underline"
                  >
                    ✉️ {officer.email}
                  </a>
                )}
                {officer.note && (
                  <p className="mt-0.5 text-xs text-amber-600">⚠️ {officer.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-start gap-2 border-t pt-3 sm:flex-row sm:items-center">
        <a
          href={`tel:${dept.helpline}`}
          className="text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          📞 Helpline: {dept.helpline}
        </a>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <a
            href={dept.complaintUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            📝 File Complaint
          </a>
          <a
            href={dept.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
          >
            🌐 Dept Website
          </a>
        </div>
      </div>
    </div>
  );
}
