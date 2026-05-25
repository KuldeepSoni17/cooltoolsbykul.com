import { Department } from "@/data/departments";

interface Props {
  department: Department;
}

const LEVEL_STYLES = {
  municipal: "bg-sky-100 text-sky-800",
  state: "bg-amber-100 text-amber-900",
  central: "bg-violet-100 text-violet-800",
};

export default function DepartmentCard({ department: dept }: Props) {
  return (
    <article className="wr-card space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-900">{dept.name}</h3>
          <p className="mt-0.5 text-sm text-stone-600">{dept.description}</p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${LEVEL_STYLES[dept.level]}`}
        >
          {dept.level.charAt(0).toUpperCase() + dept.level.slice(1)}
        </span>
      </div>

      {dept.officers.length > 0 && (
        <div className="space-y-2 border-t border-[var(--wr-border)] pt-3">
          <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
            Officer in charge
          </p>
          {dept.officers.map((officer) => (
            <div
              key={`${officer.designation}-${officer.name}`}
              className="flex items-start gap-3"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-lg">
                👤
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">{officer.name}</p>
                <p className="text-xs text-stone-600">{officer.designation}</p>
                {officer.phone && (
                  <a
                    href={`tel:${officer.phone}`}
                    className="text-xs font-medium text-sky-700 hover:text-sky-800 hover:underline"
                  >
                    {officer.phone}
                  </a>
                )}
                {officer.email && (
                  <a
                    href={`mailto:${officer.email}`}
                    className="ml-3 text-xs font-medium text-sky-700 hover:text-sky-800 hover:underline"
                  >
                    {officer.email}
                  </a>
                )}
                {officer.note && (
                  <p className="mt-0.5 text-xs text-amber-800">{officer.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-start gap-2 border-t border-[var(--wr-border)] pt-3 sm:flex-row sm:items-center">
        <a
          href={`tel:${dept.helpline}`}
          className="text-sm font-medium text-stone-800 hover:text-sky-700"
        >
          Helpline: {dept.helpline}
        </a>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <a
            href={dept.complaintUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
          >
            File complaint
          </a>
          <a
            href={dept.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-100"
          >
            Dept website
          </a>
        </div>
      </div>
    </article>
  );
}
