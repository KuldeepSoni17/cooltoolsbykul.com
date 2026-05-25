import Image from "next/image";
import { Representative } from "@/lib/wikidata";

interface Props {
  rep: Representative;
}

export default function RepresentativeCard({ rep }: Props) {
  return (
    <article className="wr-card flex items-start gap-4 p-5">
      <div className="flex-shrink-0">
        {rep.photo ? (
          <Image
            src={rep.photo}
            alt={rep.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-stone-200 object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">
            👤
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
          {rep.type}
        </span>
        <h3 className="mt-0.5 font-semibold text-stone-900">{rep.name}</h3>
        {rep.party && <p className="text-sm text-stone-600">{rep.party}</p>}
        {rep.constituency && (
          <p className="mt-0.5 text-xs text-stone-500">
            Constituency: {rep.constituency}
          </p>
        )}
        {rep.note && <p className="mt-1 text-xs text-amber-800">{rep.note}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {rep.wikidataUrl && (
            <a
              href={rep.wikidataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
            >
              {rep.wikidataUrl.includes("wikidata.org")
                ? "Wikidata profile"
                : "View profile"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
