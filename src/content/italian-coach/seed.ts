export type CoachSentence = {
  italian: string;
  english: string;
  difficulty: "beginner" | "intermediate" | "advanced";
};

export type CoachWord = {
  word: string;
  translation: string;
  frequencyRank: number;
};

export const coachMission = {
  reviewCards: 12,
  grammarLesson: "Feminine vs Masculine Articles",
  exercises: 8,
  speakingShadow: 1,
};

export const grammarCards = [
  {
    title: "Definite Articles",
    rule: "Use il (m. singular), lo (m. before s+consonant/z), la (f. singular), l' (before vowel).",
    examples: ["il libro", "lo studente", "la casa", "l'acqua"],
    commonMistake: "Il acqua",
    fix: "L'acqua",
  },
  {
    title: "Plural Patterns",
    rule: "Words ending in -o usually become -i, and -a usually becomes -e.",
    examples: ["ragazzo -> ragazzi", "casa -> case", "libro -> libri"],
    commonMistake: "La casas",
    fix: "Le case",
  },
  {
    title: "Adjective Agreement",
    rule: "Adjectives must agree with noun gender and number.",
    examples: ["ragazzo alto", "ragazza alta", "ragazzi alti", "ragazze alte"],
    commonMistake: "La casa bello",
    fix: "La casa bella",
  },
];

export const sentenceBuilderPrompts = [
  { scrambled: ["mela", "la", "mangio", "io"], answer: "Io mangio la mela." },
  { scrambled: ["casa", "mia", "grande", "la", "e"], answer: "La mia casa e grande." },
  { scrambled: ["scuola", "alla", "domani", "andiamo"], answer: "Domani andiamo alla scuola." },
];

export const agreementFixerPrompts = [
  { wrong: "Il casa e bella.", fixed: "La casa e bella." },
  { wrong: "Le ragazzo sono alti.", fixed: "I ragazzi sono alti." },
  { wrong: "Uno acqua fredda.", fixed: "Un'acqua fredda." },
];

export const coachSentences: CoachSentence[] = [
  { italian: "Io mangio la mela.", english: "I eat the apple.", difficulty: "beginner" },
  { italian: "La casa e molto grande.", english: "The house is very big.", difficulty: "beginner" },
  { italian: "Domani andiamo al mercato.", english: "Tomorrow we go to the market.", difficulty: "intermediate" },
  {
    italian: "Se avessi piu tempo, studierei ogni giorno.",
    english: "If I had more time, I would study every day.",
    difficulty: "advanced",
  },
];

export const coachWords: CoachWord[] = [
  { word: "essere", translation: "to be", frequencyRank: 1 },
  { word: "avere", translation: "to have", frequencyRank: 2 },
  { word: "casa", translation: "house", frequencyRank: 25 },
  { word: "mangiare", translation: "to eat", frequencyRank: 62 },
  { word: "scuola", translation: "school", frequencyRank: 108 },
  { word: "andare", translation: "to go", frequencyRank: 14 },
];
