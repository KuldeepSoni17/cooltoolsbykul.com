"use client";

import { buildMarkdownPackage, downloadText } from "@/lib/songwriter/export";
import type { SongProject } from "@/lib/songwriter/types";
import styles from "../songwriter.module.css";

export default function ExportStep({ project }: { project: SongProject }) {
  const a = project.analysis;
  if (!a) {
    return <p className="text-zinc-400">Complete the studio review first to export your package.</p>;
  }

  const md = buildMarkdownPackage(project);

  return (
    <div className="space-y-5">
      <div className={styles.card}>
        <h3 className={styles.panelTitle}>Final song package</h3>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-zinc-300">
          <div>
            <h4 className="text-fuchsia-300 font-medium mb-2">Final lyrics</h4>
            <pre className="whitespace-pre-wrap font-sans text-zinc-400">{a.finalLyrics}</pre>
          </div>
          <div>
            <h4 className="text-fuchsia-300 font-medium mb-2">Vocal guidance</h4>
            <p>{a.vocalGuidance}</p>
            <h4 className="text-fuchsia-300 font-medium mt-4 mb-2">Recording notes</h4>
            <p>{a.recordingNotes}</p>
          </div>
        </div>
        <h4 className="text-fuchsia-300 font-medium mt-4 mb-2">Producer brief</h4>
        <p className="text-sm text-zinc-300">{a.producerBrief}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => downloadText(`${project.meta.projectName || "song"}.md`, md)}
        >
          Download Markdown
        </button>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => {
            const text = [
              a.finalLyrics,
              "",
              `Chords: ${a.chords.progression}`,
              "",
              a.producerBrief,
            ].join("\n");
            downloadText(`${project.meta.projectName || "song"}.txt`, text, "text/plain");
          }}
        >
          Download plain text
        </button>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
