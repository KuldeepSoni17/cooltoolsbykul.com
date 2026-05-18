"use client";

import type { SongProject } from "@/lib/songwriter/types";
import styles from "../songwriter.module.css";

export default function MelodyStep({
  project,
  onChange,
  onAudioSelect,
}: {
  project: SongProject;
  onChange: (p: SongProject) => void;
  onAudioSelect: (file: File | null) => void;
}) {
  const melody = project.melody;
  const setMelody = (patch: Partial<typeof melody>) =>
    onChange({
      ...project,
      melody: { ...melody, ...patch },
      updatedAt: new Date().toISOString(),
    });

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={`${styles.card} md:col-span-2`}>
        <label className={styles.label}>Humming upload (mp3, wav, m4a)</label>
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
          className={styles.input}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onAudioSelect(file);
            setMelody({ audioFileName: file?.name ?? "" });
          }}
        />
        {melody.audioFileName && (
          <p className="mt-2 text-sm text-emerald-400">Uploaded: {melody.audioFileName}</p>
        )}
      </div>
      <div className={`${styles.card} md:col-span-2`}>
        <label className={styles.label}>How does the melody feel?</label>
        <textarea
          className={styles.textarea}
          rows={5}
          value={melody.voiceNotes}
          onChange={(e) => setMelody({ voiceNotes: e.target.value })}
          placeholder="Soft rising melody in chorus, sudden emotional lift..."
        />
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Scale guess</label>
        <select
          className={styles.select}
          value={melody.scaleGuess}
          onChange={(e) => setMelody({ scaleGuess: e.target.value as typeof melody.scaleGuess })}
        >
          <option value="C Major">C Major</option>
          <option value="G Major">G Major</option>
          <option value="D Minor">D Minor</option>
          <option value="Not sure">Not sure</option>
        </select>
      </div>
      <div className={styles.card}>
        <label className={styles.label}>Guitar skill level</label>
        <select
          className={styles.select}
          value={melody.guitarSkill}
          onChange={(e) => setMelody({ guitarSkill: e.target.value as typeof melody.guitarSkill })}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
    </div>
  );
}
