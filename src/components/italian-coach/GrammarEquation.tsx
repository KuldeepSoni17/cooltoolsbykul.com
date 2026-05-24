"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { nouns, pronouns, verbs } from "@/content/italian-coach/vocab";
import { conjugate } from "@/lib/italian-coach/grammar";

const SUBJECTS = pronouns.slice(0, 5); // io, tu, lui, lei, noi
const VERBS = ["volere", "bere", "mangiare", "andare"]
  .map((id) => verbs.find((v) => v.id === id))
  .filter(Boolean) as typeof verbs;
const OBJECTS = ["te", "caffe", "acqua", "pizza"]
  .map((id) => nouns.find((n) => n.id === id))
  .filter(Boolean) as typeof nouns;

export function GrammarEquation() {
  const [s, setS] = useState(0);
  const [v, setV] = useState(0);
  const [o, setO] = useState(0);

  const subject = SUBJECTS[s];
  const verb = VERBS[v];
  const object = OBJECTS[o];
  const verbForm = conjugate(verb, subject.person);
  const italian = `${capitalize(subject.word)} ${verbForm} ${object.singular}`;
  const english = `${subject.english} ${verb.english.replace(/^to /, "")} ${object.english}`;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-stone-900">Grammar as math</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Change the subject — verb morphs to match. That is the whole game.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-white/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Slot
            label="subject"
            value={subject.word}
            tint="bg-cyan-50 border-cyan-300 text-cyan-900 hover:bg-cyan-100"
            onClick={() => setS((p) => (p + 1) % SUBJECTS.length)}
          />
          <span className="text-2xl font-light text-stone-300">+</span>
          <Slot
            label={`verb · ${verb.infinitive}`}
            value={verbForm}
            tint="bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100"
            onClick={() => setV((p) => (p + 1) % VERBS.length)}
          />
          <span className="text-2xl font-light text-stone-300">+</span>
          <Slot
            label="object"
            value={object.singular}
            tint="bg-sky-50 border-sky-300 text-sky-900 hover:bg-sky-100"
            onClick={() => setO((p) => (p + 1) % OBJECTS.length)}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={italian}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-6 text-center"
          >
            <p className="font-serif text-3xl text-stone-900">{italian}</p>
            <p className="mt-1 text-sm text-stone-500">{english}</p>
          </motion.div>
        </AnimatePresence>
        <p className="mt-4 text-center text-xs text-stone-400">Tap any slot to cycle.</p>
      </div>
    </section>
  );
}

function Slot({
  label,
  value,
  tint,
  onClick,
}: {
  label: string;
  value: string;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[52px] min-w-[4.5rem] rounded-xl border ${tint} px-3 py-2.5 text-center transition sm:px-4 sm:py-3`}
    >
      <div className="text-base font-medium sm:text-lg">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-70">{label}</div>
    </button>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
