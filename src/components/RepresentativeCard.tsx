import Image from "next/image";
import { Representative } from "@/lib/wikidata";

interface Props {
  rep: Representative;
}

export default function RepresentativeCard({ rep }: Props) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex-shrink-0">
        {rep.photo ? (
          <Image
            src={rep.photo}
            alt={rep.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
            👤
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
          {rep.type}
        </span>
        <h3 className="mt-0.5 font-semibold text-gray-900">{rep.name}</h3>
        {rep.party && <p className="text-sm text-gray-500">{rep.party}</p>}
        {rep.constituency && (
          <p className="mt-0.5 text-xs text-gray-400">
            Constituency: {rep.constituency}
          </p>
        )}
        {rep.note && <p className="mt-1 text-xs text-amber-600">{rep.note}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {rep.wikidataUrl && rep.wikidataUrl.includes("wikidata.org") && (
            <a
              href={rep.wikidataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-200"
            >
              🔗 Wikidata Profile
            </a>
          )}
          {rep.wikidataUrl && !rep.wikidataUrl.includes("wikidata.org") && (
            <a
              href={rep.wikidataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-200"
            >
              🔗 View Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
