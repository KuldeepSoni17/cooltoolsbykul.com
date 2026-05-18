"use client";

import { useState } from "react";
import type { RefineAction, ReviewStatus, SongAnalysis, SongProject } from "@/lib/songwriter/types";
import styles from "../songwriter.module.css";

function ReviewActions({
  status,
  locked,
  onAccept,
  onReject,
  onRefine,
  onLock,
}: {
  status: ReviewStatus;
  locked?: boolean;
  onAccept: () => void;
  onReject: () => void;
  onRefine: (action: RefineAction, feedback?: string) => void;
  onLock?: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [showRewrite, setShowRewrite] = useState(false);

  return (
    <div className={styles.reviewBar}>
      <button type="button" className={styles.reviewBtn} onClick={onAccept}>
        Accept
      </button>
      <button type="button" className={styles.reviewBtn} onClick={onReject}>
        Reject
      </button>
      {onLock && (
        <button type="button" className={styles.reviewBtn} onClick={onLock}>
          {locked ? "Unlocked" : "Preserve line"}
        </button>
      )}
      <button type="button" className={styles.reviewBtn} onClick={() => onRefine("more_emotional")}>
        More emotional
      </button>
      <button type="button" className={styles.reviewBtn} onClick={() => onRefine("simpler")}>
        Simpler
      </button>
      <button type="button" className={styles.reviewBtn} onClick={() => onRefine("more_commercial")}>
        Commercial
      </button>
      <button type="button" className={styles.reviewBtn} onClick={() => onRefine("more_poetic")}>
        Poetic
      </button>
      <button type="button" className={styles.reviewBtn} onClick={() => onRefine("match_artist")}>
        Match artist
      </button>
      <button type="button" className={styles.reviewBtn} onClick={() => setShowRewrite((s) => !s)}>
        Rewrite
      </button>
      {showRewrite && (
        <div className="flex w-full gap-2 mt-2">
          <input
            className={styles.input}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell AI what to improve..."
          />
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              onRefine("rewrite", feedback);
              setShowRewrite(false);
              setFeedback("");
            }}
          >
            Send
          </button>
        </div>
      )}
      {status === "accepted" && <span className="text-xs text-emerald-400 ml-2">✓ Approved</span>}
    </div>
  );
}

export default function DashboardStep({
  project,
  analysis,
  onChange,
  onRefine,
  refining,
}: {
  project: SongProject;
  analysis: SongAnalysis;
  onChange: (a: SongAnalysis) => void;
  onRefine: (sectionType: string, content: string, action: RefineAction, feedback?: string) => Promise<string>;
  refining: boolean;
}) {
  const update = (patch: Partial<SongAnalysis>) => onChange({ ...analysis, ...patch });

  const refineSection = async (
    sectionType: string,
    getContent: () => string,
    setContent: (c: string) => void,
    action: RefineAction,
    feedback?: string,
  ) => {
    const content = await onRefine(sectionType, getContent(), action, feedback);
    if (content) setContent(content);
  };

  return (
    <div className="space-y-6">
      {refining && (
        <p className="text-sm text-fuchsia-300 animate-pulse">AI is refining your section...</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className={styles.card}>
          <h3 className={styles.panelTitle}>Lyrics quality report</h3>
          <p className="text-sm text-zinc-400 mb-1">
            <strong>Theme:</strong> {analysis.lyricsReport.theme}
          </p>
          <p className="text-sm text-zinc-400 mb-1">
            <strong>Emotion:</strong> {analysis.lyricsReport.emotionalConsistency}
          </p>
          <p className="text-sm text-zinc-400 mb-1">
            <strong>Hook strength:</strong> {analysis.lyricsReport.hookStrength}
          </p>
          <p className="text-sm text-zinc-400">
            <strong>Singability:</strong> {analysis.lyricsReport.singability}
          </p>
          {analysis.lyricsReport.weakLines.length > 0 && (
            <ul className="mt-2 text-sm text-amber-200/80 list-disc pl-4">
              {analysis.lyricsReport.weakLines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.card}>
          <h3 className={styles.panelTitle}>Melody summary</h3>
          <p className="text-sm text-zinc-400">{analysis.melodySummary.phrasing}</p>
          <p className="text-sm text-zinc-400 mt-2">
            Key: {analysis.melodySummary.keyEstimate} · Rhythm: {analysis.melodySummary.rhythm}
          </p>
          <p className="text-sm text-zinc-400 mt-2">{analysis.melodySummary.chorusPlacement}</p>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.panelTitle}>Song structure</h3>
        {analysis.structure.map((sec, i) => (
          <div
            key={sec.id}
            className={`mb-4 pb-4 border-b border-zinc-800 ${sec.status === "rejected" ? styles.rejected : ""} ${sec.status === "accepted" ? styles.accepted : ""}`}
          >
            <p className="text-xs font-semibold text-fuchsia-300 mb-1">{sec.label}</p>
            <textarea
              className={styles.textarea}
              rows={3}
              value={sec.content}
              disabled={sec.locked}
              onChange={(e) => {
                const structure = [...analysis.structure];
                structure[i] = { ...sec, content: e.target.value };
                update({ structure });
              }}
            />
            <ReviewActions
              status={sec.status}
              locked={sec.locked}
              onAccept={() => {
                const structure = [...analysis.structure];
                structure[i] = { ...sec, status: "accepted" };
                update({ structure });
              }}
              onReject={() => {
                const structure = [...analysis.structure];
                structure[i] = { ...sec, status: "rejected" };
                update({ structure });
              }}
              onLock={() => {
                const structure = [...analysis.structure];
                structure[i] = { ...sec, locked: !sec.locked };
                update({ structure });
              }}
              onRefine={(action, feedback) =>
                refineSection(
                  sec.label,
                  () => sec.content,
                  (content) => {
                    const structure = [...analysis.structure];
                    structure[i] = { ...sec, content, status: "pending" };
                    update({ structure });
                  },
                  action,
                  feedback,
                )
              }
            />
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${analysis.chords.status === "accepted" ? styles.accepted : ""}`}>
        <h3 className={styles.panelTitle}>Chords</h3>
        <p className="text-lg font-mono text-amber-200">{analysis.chords.progression}</p>
        <p className="text-sm text-zinc-400 mt-2">Beginner: {analysis.chords.beginner}</p>
        <p className="text-sm text-zinc-400">Advanced: {analysis.chords.advanced}</p>
        <p className="text-sm text-zinc-400">Capo: {analysis.chords.capo}</p>
        <ReviewActions
          status={analysis.chords.status}
          onAccept={() => update({ chords: { ...analysis.chords, status: "accepted" } })}
          onReject={() => update({ chords: { ...analysis.chords, status: "rejected" } })}
          onRefine={(action, feedback) =>
            refineSection(
              "chords",
              () =>
                `${analysis.chords.progression}\nBeginner: ${analysis.chords.beginner}\nAdvanced: ${analysis.chords.advanced}`,
              (content) => {
                const lines = content.split("\n");
                update({
                  chords: {
                    ...analysis.chords,
                    progression: lines[0] ?? analysis.chords.progression,
                    status: "pending",
                  },
                });
              },
              action,
              feedback,
            )
          }
        />
      </div>

      <div className={styles.card}>
        <h3 className={styles.panelTitle}>Arrangement blueprint</h3>
        {analysis.arrangement.map((beat, i) => (
          <div key={beat.id} className="mb-3">
            <p className="text-sm font-medium text-amber-200">{beat.section}</p>
            <p className="text-sm text-zinc-400">{beat.notes}</p>
            <ReviewActions
              status={beat.status}
              onAccept={() => {
                const arrangement = [...analysis.arrangement];
                arrangement[i] = { ...beat, status: "accepted" };
                update({ arrangement });
              }}
              onReject={() => {
                const arrangement = [...analysis.arrangement];
                arrangement[i] = { ...beat, status: "rejected" };
                update({ arrangement });
              }}
              onRefine={(action, feedback) =>
                refineSection(
                  `arrangement ${beat.section}`,
                  () => beat.notes,
                  (notes) => {
                    const arrangement = [...analysis.arrangement];
                    arrangement[i] = { ...beat, notes, status: "pending" };
                    update({ arrangement });
                  },
                  action,
                  feedback,
                )
              }
            />
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h3 className={styles.panelTitle}>Hook suggestions</h3>
        {analysis.hooks.map((hook, i) => (
          <div key={hook.id} className={`mb-2 ${hook.status === "accepted" ? styles.accepted : ""}`}>
            <p className="text-zinc-200">{hook.text}</p>
            <ReviewActions
              status={hook.status}
              onAccept={() => {
                const hooks = [...analysis.hooks];
                hooks[i] = { ...hook, status: "accepted" };
                update({ hooks });
              }}
              onReject={() => {
                const hooks = [...analysis.hooks];
                hooks[i] = { ...hook, status: "rejected" };
                update({ hooks });
              }}
              onRefine={(action, feedback) =>
                refineSection(
                  "hook",
                  () => hook.text,
                  (text) => {
                    const hooks = [...analysis.hooks];
                    hooks[i] = { ...hook, text, status: "pending" };
                    update({ hooks });
                  },
                  action,
                  feedback,
                )
              }
            />
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h3 className={styles.panelTitle}>Rewrite suggestions</h3>
        {analysis.rewrites.map((rw, i) => (
          <div key={rw.id} className="mb-4 border-b border-zinc-800 pb-3">
            <p className="text-sm text-zinc-500 line-through">{rw.originalLine}</p>
            {rw.alternatives.map((alt, j) => (
              <label key={j} className="flex items-center gap-2 mt-1 text-sm text-zinc-300">
                <input
                  type="radio"
                  name={rw.id}
                  checked={rw.selectedIndex === j}
                  onChange={() => {
                    const rewrites = [...analysis.rewrites];
                    rewrites[i] = { ...rw, selectedIndex: j };
                    update({ rewrites });
                  }}
                />
                {alt}
              </label>
            ))}
            <ReviewActions
              status={rw.status}
              onAccept={() => {
                const rewrites = [...analysis.rewrites];
                rewrites[i] = { ...rw, status: "accepted" };
                const alt = rw.alternatives[rw.selectedIndex];
                if (alt) {
                  update({
                    rewrites,
                    finalLyrics: analysis.finalLyrics.replace(rw.originalLine, alt),
                  });
                } else update({ rewrites });
              }}
              onReject={() => {
                const rewrites = [...analysis.rewrites];
                rewrites[i] = { ...rw, status: "rejected" };
                update({ rewrites });
              }}
              onRefine={(action, feedback) =>
                refineSection(
                  "rewrite",
                  () => rw.alternatives.join("\n"),
                  (content) => {
                    const rewrites = [...analysis.rewrites];
                    rewrites[i] = {
                      ...rw,
                      alternatives: content.split("\n").filter(Boolean),
                      status: "pending",
                    };
                    update({ rewrites });
                  },
                  action,
                  feedback,
                )
              }
            />
          </div>
        ))}
      </div>

      {project.history.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.panelTitle}>History timeline</h3>
          {project.history.map((h) => (
            <p key={h.version} className={styles.historyItem}>
              v{h.version} — {h.summary} · {new Date(h.at).toLocaleString()}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
