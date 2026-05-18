"use client";

import { useEffect, useRef } from "react";
import TagInput from "../TagInput";
import type { SongProject } from "@/lib/songwriter/types";
import styles from "../songwriter.module.css";

export default function LyricsStep({
  project,
  onChange,
}: {
  project: SongProject;
  onChange: (p: SongProject) => void;
}) {
  const lyrics = project.lyrics;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLyrics = (patch: Partial<typeof lyrics>) =>
    onChange({
      ...project,
      lyrics: { ...lyrics, ...patch },
      updatedAt: new Date().toISOString(),
    });

  useEffect(() => {
    if (!lyrics.rawLyrics.trim()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const last = lyrics.versions[0];
      if (last?.content === lyrics.rawLyrics) return;
      setLyrics({
        versions: [
          { id: crypto.randomUUID(), content: lyrics.rawLyrics, savedAt: new Date().toISOString() },
          ...lyrics.versions.slice(0, 19),
        ],
      });
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [lyrics.rawLyrics]);

  return (
    <div className="grid gap-5">
      <div className={styles.card}>
        <label className={styles.label}>Raw lyrics</label>
        <textarea
          className={styles.textarea}
          rows={14}
          value={lyrics.rawLyrics}
          onChange={(e) => setLyrics({ rawLyrics: e.target.value })}
          placeholder="Write in Hindi, Gujarati, English, or mixed..."
        />
        <p className="mt-2 text-xs text-zinc-500">Auto-saves versions as you write</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className={styles.card}>
          <label className={styles.label}>Hook line (optional)</label>
          <input
            className={styles.input}
            value={lyrics.hookLine}
            onChange={(e) => setLyrics({ hookLine: e.target.value })}
            placeholder="Your strongest memorable line"
          />
        </div>
        <div className={styles.card}>
          <label className={styles.label}>Keywords to preserve</label>
          <TagInput
            tags={lyrics.keywordsToPreserve}
            onChange={(keywordsToPreserve) => setLyrics({ keywordsToPreserve })}
            placeholder="rain, station, goodbye..."
          />
        </div>
      </div>
      {lyrics.versions.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.panelTitle}>Version history</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {lyrics.versions.map((v) => (
              <li key={v.id} className={styles.historyItem}>
                <span className="text-zinc-400">{new Date(v.savedAt).toLocaleString()}</span>
                <p className="text-zinc-300 truncate">{v.content.slice(0, 120)}...</p>
                <button
                  type="button"
                  className={`${styles.btnGhost} mt-1 text-xs`}
                  onClick={() => setLyrics({ rawLyrics: v.content })}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
