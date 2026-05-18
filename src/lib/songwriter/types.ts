export type PrimaryLanguage = "Hindi" | "Gujarati" | "English" | "Hinglish" | "Mixed";

export type SongMood =
  | "Romantic"
  | "Nostalgic"
  | "Sad"
  | "Hopeful"
  | "Spiritual"
  | "Motivational"
  | "Dark"
  | "Celebration"
  | "Devotional"
  | "Cinematic"
  | "Playful"
  | "Introspective";

export type Genre =
  | "Acoustic Indie"
  | "Bollywood"
  | "Ghazal"
  | "Folk"
  | "Pop"
  | "Rock"
  | "Worship"
  | "Sufi"
  | "Lo-fi"
  | "Cinematic"
  | "Experimental";

export type TempoPreference = "Slow" | "Slow-Medium" | "Medium" | "Medium-Fast" | "Fast";

export type ScaleGuess = "C Major" | "G Major" | "D Minor" | "Not sure";

export type GuitarSkill = "Beginner" | "Intermediate" | "Advanced";

export type ReviewStatus = "pending" | "accepted" | "rejected";

export type RefineAction =
  | "rewrite"
  | "more_emotional"
  | "simpler"
  | "more_commercial"
  | "more_poetic"
  | "match_artist";

export type ProjectMeta = {
  projectName: string;
  primaryLanguage: PrimaryLanguage;
  secondaryLanguages: string[];
  moods: SongMood[];
  energy: number;
  artistInspiration: string[];
  genre: Genre;
  tempo: TempoPreference;
  songIntent: string;
};

export type LyricsVersion = {
  id: string;
  content: string;
  savedAt: string;
};

export type LyricsInput = {
  rawLyrics: string;
  hookLine: string;
  keywordsToPreserve: string[];
  versions: LyricsVersion[];
};

export type MelodyInput = {
  audioFileName: string;
  voiceNotes: string;
  scaleGuess: ScaleGuess;
  guitarSkill: GuitarSkill;
};

export type StructureSection = {
  id: string;
  label: string;
  content: string;
  status: ReviewStatus;
  locked: boolean;
};

export type ChordBlueprint = {
  progression: string;
  beginner: string;
  advanced: string;
  capo: string;
  status: ReviewStatus;
};

export type ArrangementBeat = {
  id: string;
  section: string;
  notes: string;
  status: ReviewStatus;
};

export type HookSuggestion = {
  id: string;
  text: string;
  status: ReviewStatus;
};

export type RewriteSuggestion = {
  id: string;
  originalLine: string;
  alternatives: string[];
  selectedIndex: number;
  status: ReviewStatus;
};

export type LyricsQualityReport = {
  theme: string;
  emotionalConsistency: string;
  weakLines: string[];
  hookStrength: string;
  singability: string;
  notes: string[];
};

export type MelodySummary = {
  phrasing: string;
  keyEstimate: string;
  rhythm: string;
  liftPoints: string[];
  chorusPlacement: string;
};

export type SongAnalysis = {
  lyricsReport: LyricsQualityReport;
  melodySummary: MelodySummary;
  structure: StructureSection[];
  chords: ChordBlueprint;
  arrangement: ArrangementBeat[];
  hooks: HookSuggestion[];
  rewrites: RewriteSuggestion[];
  finalLyrics: string;
  vocalGuidance: string;
  recordingNotes: string;
  producerBrief: string;
};

export type HistoryEntry = {
  version: number;
  summary: string;
  at: string;
};

export type SongProject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  meta: ProjectMeta;
  lyrics: LyricsInput;
  melody: MelodyInput;
  analysis: SongAnalysis | null;
  history: HistoryEntry[];
};

export const MOOD_OPTIONS: SongMood[] = [
  "Romantic",
  "Nostalgic",
  "Sad",
  "Hopeful",
  "Spiritual",
  "Motivational",
  "Dark",
  "Celebration",
  "Devotional",
  "Cinematic",
  "Playful",
  "Introspective",
];

export const GENRE_OPTIONS: Genre[] = [
  "Acoustic Indie",
  "Bollywood",
  "Ghazal",
  "Folk",
  "Pop",
  "Rock",
  "Worship",
  "Sufi",
  "Lo-fi",
  "Cinematic",
  "Experimental",
];

export function emptyProject(): SongProject {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    meta: {
      projectName: "",
      primaryLanguage: "English",
      secondaryLanguages: [],
      moods: [],
      energy: 5,
      artistInspiration: [],
      genre: "Acoustic Indie",
      tempo: "Medium",
      songIntent: "",
    },
    lyrics: {
      rawLyrics: "",
      hookLine: "",
      keywordsToPreserve: [],
      versions: [],
    },
    melody: {
      audioFileName: "",
      voiceNotes: "",
      scaleGuess: "Not sure",
      guitarSkill: "Beginner",
    },
    analysis: null,
    history: [],
  };
}
