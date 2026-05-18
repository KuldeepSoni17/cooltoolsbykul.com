"use client";

import TagInput from "../TagInput";
import type { SongProject } from "@/lib/songwriter/types";
import { GENRE_OPTIONS, MOOD_OPTIONS } from "@/lib/songwriter/types";
import styles from "../songwriter.module.css";

const LANGUAGES = ["Hindi", "Gujarati", "English", "Hinglish", "Mixed"] as const;
const TEMPOS = ["Slow", "Slow-Medium", "Medium", "Medium-Fast", "Fast"] as const;

export default function ProjectStep({
  project,
  onChange,
}: {
  project: SongProject;
  onChange: (p: SongProject) => void;
}) {
  const meta = project.meta;
  const setMeta = (patch: Partial<typeof meta>) =>
    onChange({ ...project, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={styles.card}>
        <label className={styles.label}>Project name</label>
        <input
          className={styles.input}
          value={meta.projectName}
          onChange={(e) => setMeta({ projectName: e.target.value })}
          placeholder="Rain After You"
        />
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Primary language</label>
        <select
          className={styles.select}
          value={meta.primaryLanguage}
          onChange={(e) => setMeta({ primaryLanguage: e.target.value as typeof meta.primaryLanguage })}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className={`${styles.card} md:col-span-2`}>
        <label className={styles.label}>Song mood</label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => {
            const on = meta.moods.includes(m);
            return (
              <button
                key={m}
                type="button"
                className={`${styles.moodChip} ${on ? styles.moodChipOn : ""}`}
                onClick={() =>
                  setMeta({
                    moods: on ? meta.moods.filter((x) => x !== m) : [...meta.moods, m],
                  })
                }
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Song energy ({meta.energy})</label>
        <input
          type="range"
          min={1}
          max={10}
          value={meta.energy}
          onChange={(e) => setMeta({ energy: Number(e.target.value) })}
          className={styles.slider}
        />
        <p className="mt-1 text-xs text-zinc-500">1 = Calm · 10 = High energy</p>
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Genre</label>
        <select
          className={styles.select}
          value={meta.genre}
          onChange={(e) => setMeta({ genre: e.target.value as typeof meta.genre })}
        >
          {GENRE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Tempo</label>
        <select
          className={styles.select}
          value={meta.tempo}
          onChange={(e) => setMeta({ tempo: e.target.value as typeof meta.tempo })}
        >
          {TEMPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className={`${styles.card} md:col-span-2`}>
        <label className={styles.label}>Artist inspiration</label>
        <TagInput
          tags={meta.artistInspiration}
          onChange={(artistInspiration) => setMeta({ artistInspiration })}
          placeholder="Arijit Singh, Prateek Kuhad..."
        />
      </div>
      <div className={`${styles.card} md:col-span-2`}>
        <label className={styles.label}>What should this song make people feel?</label>
        <textarea
          className={styles.textarea}
          rows={4}
          value={meta.songIntent}
          onChange={(e) => setMeta({ songIntent: e.target.value })}
          placeholder="Nostalgic warmth, like remembering someone on a rainy platform..."
        />
      </div>
    </div>
  );
}
