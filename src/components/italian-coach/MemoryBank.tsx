"use client";

import { useMemo, useState } from "react";
import {
  adjectives,
  connectors,
  nouns,
  pronouns,
  timeWords,
  verbs,
} from "@/content/italian-coach/vocab";
import { WORD_TYPE_COLORS } from "@/lib/italian-coach/colors";
import {
  PERSONS,
  adjUid,
  nounUid,
  personLabel,
  pronounUid,
  verbFormUid,
} from "@/lib/italian-coach/engine";
import { definiteArticle } from "@/lib/italian-coach/grammar";
import { useCoachStore } from "@/lib/italian-coach/store";
import type { DisplayWord } from "@/lib/italian-coach/types";

type PaletteSection = "all" | "pronouns" | "verbs" | "nouns" | "adjectives" | "time" | "connectors";

export function MemoryBank({
  onPick,
}: {
  onPick?: (w: DisplayWord) => void;
}) {
  const knownWordIds = useCoachStore((s) => s.knownWordIds);
  const unlockMany = useCoachStore((s) => s.unlockMany);
  const knownSet = useMemo(() => new Set(knownWordIds), [knownWordIds]);
  const [section, setSection] = useState<PaletteSection>("all");
  const [showLocked, setShowLocked] = useState(false);

  const sections: { id: PaletteSection; label: string; count: string }[] = [
    { id: "all", label: "All", count: `${knownWordIds.length}` },
    {
      id: "pronouns",
      label: "Pronouns",
      count: `${pronouns.filter((p) => knownSet.has(pronounUid(p.id))).length}/${pronouns.length}`,
    },
    {
      id: "verbs",
      label: "Verbs",
      count: `${verbs.filter((v) => PERSONS.some((p) => knownSet.has(verbFormUid(v.id, p)))).length}/${verbs.length}`,
    },
    {
      id: "nouns",
      label: "Nouns",
      count: `${nouns.filter((n) => knownSet.has(nounUid(n.id))).length}/${nouns.length}`,
    },
    {
      id: "adjectives",
      label: "Adjectives",
      count: `${adjectives.filter((a) => knownSet.has(adjUid(a.id))).length}/${adjectives.length}`,
    },
    { id: "time", label: "Time", count: `${timeWords.filter((t) => knownSet.has(t.id)).length}/${timeWords.length}` },
    {
      id: "connectors",
      label: "Connectors",
      count: `${connectors.filter((c) => knownSet.has(c.id)).length}/${connectors.length}`,
    },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Palette</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {onPick ? "Tap any word to add it to the builder." : "Browse what you have learned."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowLocked((s) => !s)}
          className="text-xs font-medium text-stone-500 hover:text-stone-900"
        >
          {showLocked ? "Hide locked" : "Show locked"}
        </button>
      </div>

      <div className="-mx-1 mt-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition min-h-[40px] ${
              section === s.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white/70 text-stone-600 hover:border-stone-900"
            }`}
          >
            {s.label} <span className="ml-1 opacity-60">{s.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-8">
        {(section === "all" || section === "pronouns") && (
          <PronounRow knownSet={knownSet} onPick={onPick} showLocked={showLocked} />
        )}
        {(section === "all" || section === "verbs") && (
          <VerbTable knownSet={knownSet} onPick={onPick} showLocked={showLocked} unlockMany={unlockMany} />
        )}
        {(section === "all" || section === "nouns") && (
          <NounGrid knownSet={knownSet} onPick={onPick} showLocked={showLocked} />
        )}
        {(section === "all" || section === "adjectives") && (
          <AdjectiveGrid knownSet={knownSet} onPick={onPick} showLocked={showLocked} />
        )}
        {(section === "all" || section === "time") && (
          <SimpleRow
            label="Time"
            items={timeWords.map((t) => ({ id: t.id, word: t.word, english: t.english, type: "time" as const }))}
            knownSet={knownSet}
            onPick={onPick}
            showLocked={showLocked}
          />
        )}
        {(section === "all" || section === "connectors") && (
          <SimpleRow
            label="Connectors"
            items={connectors.map((c) => ({ id: c.id, word: c.word, english: c.english, type: "connector" as const }))}
            knownSet={knownSet}
            onPick={onPick}
            showLocked={showLocked}
          />
        )}
      </div>
    </section>
  );
}

function PronounRow({
  knownSet,
  onPick,
  showLocked,
}: {
  knownSet: Set<string>;
  onPick?: (w: DisplayWord) => void;
  showLocked: boolean;
}) {
  return (
    <div>
      <GroupHeader label="Pronouns" tint="pronoun" hint="Who is doing the action." />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pronouns.map((p) => {
          const isKnown = knownSet.has(pronounUid(p.id));
          if (!isKnown && !showLocked) return null;
          const dw: DisplayWord = {
            id: pronounUid(p.id),
            word: p.word,
            english: p.english,
            type: "pronoun",
            meta: { person: p.person, pronounId: p.id },
          };
          return (
            <Chip
              key={p.id}
              word={p.word}
              english={p.english}
              type="pronoun"
              locked={!isKnown}
              onClick={isKnown && onPick ? () => onPick(dw) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

function VerbTable({
  knownSet,
  onPick,
  showLocked,
  unlockMany,
}: {
  knownSet: Set<string>;
  onPick?: (w: DisplayWord) => void;
  showLocked: boolean;
  unlockMany: (ids: string[]) => void;
}) {
  return (
    <div>
      <GroupHeader label="Verbs · present tense" tint="verb" hint="Each verb has six forms — one per person." />
      <div className="mt-3 space-y-3">
        {verbs.map((v) => {
          const anyKnown = PERSONS.some((p) => knownSet.has(verbFormUid(v.id, p)));
          if (!anyKnown && !showLocked) return null;
          return (
            <div key={v.id} className="rounded-2xl border border-stone-200 bg-white/60 p-3 sm:p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-lg text-stone-900">{v.infinitive}</span>
                  <span className="text-sm text-stone-500">— {v.english}</span>
                </div>
                {!anyKnown ? (
                  <button
                    type="button"
                    onClick={() => unlockMany(PERSONS.map((p) => verbFormUid(v.id, p)))}
                    className="rounded-full border border-stone-300 px-3 py-0.5 text-xs text-stone-600 hover:border-stone-900"
                  >
                    Unlock all forms
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {PERSONS.map((person) => {
                  const id = verbFormUid(v.id, person);
                  const isKnown = knownSet.has(id);
                  if (!isKnown && !showLocked) {
                    return (
                      <div key={person} className="rounded-lg border border-dashed border-stone-300 p-2 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">{personLabel(person)}</p>
                        <p className="font-serif text-base text-stone-300">—</p>
                      </div>
                    );
                  }
                  const dw: DisplayWord = {
                    id,
                    word: v.present[person],
                    english: `${v.english} (${personLabel(person)})`,
                    type: "verb",
                    meta: { verbId: v.id, person },
                  };
                  return (
                    <button
                      key={person}
                      type="button"
                      onClick={isKnown && onPick ? () => onPick(dw) : undefined}
                      disabled={!isKnown || !onPick}
                      className={`rounded-lg border p-2 text-center transition ${
                        isKnown
                          ? "border-rose-300 bg-rose-50 hover:bg-rose-100"
                          : "border-stone-300 bg-stone-50 opacity-50"
                      } ${onPick && isKnown ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-rose-700/70">
                        {personLabel(person)}
                      </p>
                      <p className="font-serif text-base text-rose-900">{v.present[person]}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NounGrid({
  knownSet,
  onPick,
  showLocked,
}: {
  knownSet: Set<string>;
  onPick?: (w: DisplayWord) => void;
  showLocked: boolean;
}) {
  return (
    <div>
      <GroupHeader label="Nouns · gender + plural" tint="noun" hint="Italian nouns have a gender. The article changes with it." />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {nouns.map((n) => {
          const isKnown = knownSet.has(nounUid(n.id));
          if (!isKnown && !showLocked) return null;
          const dw: DisplayWord = {
            id: nounUid(n.id),
            word: n.singular,
            english: n.english,
            type: "noun",
            meta: { nounId: n.id, gender: n.gender, plural: false },
          };
          const art = definiteArticle(n);
          return (
            <button
              key={n.id}
              type="button"
              onClick={isKnown && onPick ? () => onPick(dw) : undefined}
              disabled={!isKnown || !onPick}
              className={`rounded-xl border p-3 text-left transition ${
                isKnown
                  ? "border-sky-300 bg-sky-50 hover:bg-sky-100"
                  : "border-stone-300 bg-stone-50 opacity-50"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-sky-700/70">
                {n.gender === "m" ? "masc" : "fem"} · pl. {n.plural}
              </p>
              <p className="mt-1 font-serif text-lg text-sky-900">
                <span className="opacity-50">{art === "l'" ? "l' " : `${art} `}</span>
                {n.singular}
              </p>
              <p className="text-sm text-sky-800/80">{n.english}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdjectiveGrid({
  knownSet,
  onPick,
  showLocked,
}: {
  knownSet: Set<string>;
  onPick?: (w: DisplayWord) => void;
  showLocked: boolean;
}) {
  return (
    <div>
      <GroupHeader
        label="Adjectives · agreement"
        tint="adjective"
        hint="Adjectives change ending with the noun's gender + number."
      />
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {adjectives.map((a) => {
          const isKnown = knownSet.has(adjUid(a.id));
          if (!isKnown && !showLocked) return null;
          const dw: DisplayWord = {
            id: adjUid(a.id),
            word: a.m_sg,
            english: a.english,
            type: "adjective",
            meta: { adjectiveId: a.id },
          };
          return (
            <button
              key={a.id}
              type="button"
              onClick={isKnown && onPick ? () => onPick(dw) : undefined}
              disabled={!isKnown || !onPick}
              className={`rounded-xl border p-3 text-left transition ${
                isKnown ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100" : "border-stone-300 bg-stone-50 opacity-50"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-emerald-700/70">{a.english}</p>
              <p className="mt-1 font-serif text-sm text-emerald-900">
                <span className="opacity-70">m.sg</span> {a.m_sg} · <span className="opacity-70">f.sg</span> {a.f_sg}
              </p>
              <p className="font-serif text-sm text-emerald-900">
                <span className="opacity-70">m.pl</span> {a.m_pl} · <span className="opacity-70">f.pl</span> {a.f_pl}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SimpleRow({
  label,
  items,
  knownSet,
  onPick,
  showLocked,
}: {
  label: string;
  items: { id: string; word: string; english: string; type: "time" | "connector" | "article" }[];
  knownSet: Set<string>;
  onPick?: (w: DisplayWord) => void;
  showLocked: boolean;
}) {
  return (
    <div>
      <GroupHeader label={label} tint={items[0]?.type ?? "time"} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((i) => {
          const isKnown = knownSet.has(i.id);
          if (!isKnown && !showLocked) return null;
          const dw: DisplayWord = { id: i.id, word: i.word, english: i.english, type: i.type };
          return (
            <Chip
              key={i.id}
              word={i.word}
              english={i.english}
              type={i.type}
              locked={!isKnown}
              onClick={isKnown && onPick ? () => onPick(dw) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  word,
  english,
  type,
  locked,
  onClick,
}: {
  word: string;
  english: string;
  type: keyof typeof WORD_TYPE_COLORS;
  locked?: boolean;
  onClick?: () => void;
}) {
  const c = WORD_TYPE_COLORS[type];
  if (locked) {
    return (
      <span className="rounded-lg border border-dashed border-stone-300 bg-white/40 px-2.5 py-1 text-sm text-stone-400" title={english}>
        + {word}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-lg border ${c.chip} ${c.chipHover} px-2.5 py-1 text-sm font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.06)] transition ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
      title={english}
    >
      {word}
    </button>
  );
}

function GroupHeader({
  label,
  tint,
  hint,
}: {
  label: string;
  tint: keyof typeof WORD_TYPE_COLORS;
  hint?: string;
}) {
  const meta = WORD_TYPE_COLORS[tint];
  return (
    <div className="flex items-baseline gap-3">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      <h3 className="font-serif text-lg text-stone-900">{label}</h3>
      {hint ? <span className="text-xs text-stone-500">{hint}</span> : null}
    </div>
  );
}
