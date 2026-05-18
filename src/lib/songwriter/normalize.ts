import type { SongAnalysis } from "./types";

type RawAnalysis = {
  lyricsReport?: SongAnalysis["lyricsReport"];
  melodySummary?: SongAnalysis["melodySummary"];
  structure?: Array<{ label?: string; content?: string }>;
  chords?: {
    progression?: string;
    beginner?: string;
    advanced?: string;
    capo?: string;
  };
  arrangement?: Array<{ section?: string; notes?: string }>;
  hooks?: string[];
  rewrites?: Array<{ originalLine?: string; alternatives?: string[] }>;
  finalLyrics?: string;
  vocalGuidance?: string;
  recordingNotes?: string;
  producerBrief?: string;
};

export function normalizeAnalysis(raw: RawAnalysis): SongAnalysis {
  return {
    lyricsReport: {
      theme: raw.lyricsReport?.theme ?? "",
      emotionalConsistency: raw.lyricsReport?.emotionalConsistency ?? "",
      weakLines: raw.lyricsReport?.weakLines ?? [],
      hookStrength: raw.lyricsReport?.hookStrength ?? "",
      singability: raw.lyricsReport?.singability ?? "",
      notes: raw.lyricsReport?.notes ?? [],
    },
    melodySummary: {
      phrasing: raw.melodySummary?.phrasing ?? "",
      keyEstimate: raw.melodySummary?.keyEstimate ?? "",
      rhythm: raw.melodySummary?.rhythm ?? "",
      liftPoints: raw.melodySummary?.liftPoints ?? [],
      chorusPlacement: raw.melodySummary?.chorusPlacement ?? "",
    },
    structure: (raw.structure ?? []).map((s, i) => ({
      id: `struct-${i}`,
      label: s.label ?? `Section ${i + 1}`,
      content: s.content ?? "",
      status: "pending" as const,
      locked: false,
    })),
    chords: {
      progression: raw.chords?.progression ?? "",
      beginner: raw.chords?.beginner ?? "",
      advanced: raw.chords?.advanced ?? "",
      capo: raw.chords?.capo ?? "",
      status: "pending",
    },
    arrangement: (raw.arrangement ?? []).map((a, i) => ({
      id: `arr-${i}`,
      section: a.section ?? "",
      notes: a.notes ?? "",
      status: "pending" as const,
    })),
    hooks: (raw.hooks ?? []).slice(0, 10).map((text, i) => ({
      id: `hook-${i}`,
      text,
      status: "pending" as const,
    })),
    rewrites: (raw.rewrites ?? []).map((r, i) => ({
      id: `rewrite-${i}`,
      originalLine: r.originalLine ?? "",
      alternatives: r.alternatives ?? [],
      selectedIndex: 0,
      status: "pending" as const,
    })),
    finalLyrics: raw.finalLyrics ?? "",
    vocalGuidance: raw.vocalGuidance ?? "",
    recordingNotes: raw.recordingNotes ?? "",
    producerBrief: raw.producerBrief ?? "",
  };
}
