import type { ProjectMeta, LyricsInput, MelodyInput } from "./types";

export const ANALYSIS_SYSTEM = `You are an expert songwriting partner for indie and multilingual creators (Hindi, Gujarati, English, Hinglish).
You help structure, refine, and arrange songs while preserving the artist's voice.
Never replace preserved keywords without explicit approval.
Respond ONLY with valid JSON matching the requested schema. No markdown fences.`;

export function buildAnalysisPrompt(
  meta: ProjectMeta,
  lyrics: LyricsInput,
  melody: MelodyInput,
  hasAudio: boolean,
) {
  return `Analyze this songwriting project and return a complete creative blueprint.

PROJECT
- Name: ${meta.projectName}
- Primary language: ${meta.primaryLanguage}
- Secondary: ${meta.secondaryLanguages.join(", ") || "none"}
- Moods: ${meta.moods.join(", ")}
- Energy (1-10): ${meta.energy}
- Artists: ${meta.artistInspiration.join(", ") || "none"}
- Genre: ${meta.genre}
- Tempo: ${meta.tempo}
- Intent: ${meta.songIntent}

LYRICS
${lyrics.rawLyrics || "(no lyrics yet)"}

Hook line: ${lyrics.hookLine || "none"}
Keywords to preserve (never remove): ${lyrics.keywordsToPreserve.join(", ") || "none"}

MELODY
- Audio uploaded: ${hasAudio ? "yes (user hummed — infer phrasing from description if needed)" : "no"}
- Voice notes: ${melody.voiceNotes || "none"}
- Scale guess: ${melody.scaleGuess}
- Guitar skill: ${melody.guitarSkill}

Return JSON:
{
  "lyricsReport": {
    "theme": "string",
    "emotionalConsistency": "string",
    "weakLines": ["string"],
    "hookStrength": "string",
    "singability": "string",
    "notes": ["string"]
  },
  "melodySummary": {
    "phrasing": "string",
    "keyEstimate": "string",
    "rhythm": "string",
    "liftPoints": ["string"],
    "chorusPlacement": "string"
  },
  "structure": [
    { "label": "Verse 1", "content": "lyrics for section" },
    { "label": "Pre-Chorus", "content": "..." },
    { "label": "Chorus", "content": "..." },
    { "label": "Verse 2", "content": "..." },
    { "label": "Bridge", "content": "..." },
    { "label": "Outro", "content": "..." }
  ],
  "chords": {
    "progression": "Am — F — C — G",
    "beginner": "simplified voicings",
    "advanced": "richer voicings",
    "capo": "capo suggestion or none"
  },
  "arrangement": [
    { "section": "Intro", "notes": "instrumentation" },
    { "section": "Verse", "notes": "..." },
    { "section": "Chorus", "notes": "..." },
    { "section": "Bridge", "notes": "..." },
    { "section": "Outro", "notes": "..." }
  ],
  "hooks": ["hook line 1", "hook line 2", "... up to 10"],
  "rewrites": [
    { "originalLine": "weak line", "alternatives": ["alt1", "alt2"] }
  ],
  "finalLyrics": "full approved-style lyrics text",
  "vocalGuidance": "where to emphasize emotion",
  "recordingNotes": "texture, harmonies, pauses",
  "producerBrief": "ready-to-send producer summary"
}`;
}

export function buildRefinePrompt(
  meta: ProjectMeta,
  sectionType: string,
  content: string,
  action: string,
  feedback?: string,
) {
  return `Refine this songwriting section for project "${meta.projectName}" (${meta.primaryLanguage}, ${meta.genre}, moods: ${meta.moods.join(", ")}).

Section type: ${sectionType}
Current content:
${content}

Action: ${action}
${feedback ? `User feedback: ${feedback}` : ""}
Artists for style match: ${meta.artistInspiration.join(", ") || "none"}

Return JSON: { "content": "refined text only for this section" }`;
}
