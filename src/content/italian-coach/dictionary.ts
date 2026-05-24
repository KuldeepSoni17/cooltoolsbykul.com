/**
 * Legacy game challenge data and seed re-exports.
 * The real vocab now lives in `./vocab.ts`.
 */

export const craftChallenges = [
  { scrambled: ["voglio", "io", "acqua"], answer: "Io voglio acqua", english: "I want water" },
  { scrambled: ["oggi", "tè", "voglio"], answer: "Oggi voglio tè", english: "Today I want tea" },
  { scrambled: ["pizza", "mangio", "io"], answer: "Io mangio pizza", english: "I eat pizza" },
  { scrambled: ["caffè", "bevi", "tu"], answer: "Tu bevi caffè", english: "You drink coffee" },
  { scrambled: ["andiamo", "domani", "noi"], answer: "Domani noi andiamo", english: "Tomorrow we go" },
  { scrambled: ["è", "grande", "la", "casa"], answer: "La casa è grande", english: "The house is big" },
  { scrambled: ["leggono", "loro", "libro", "il"], answer: "Loro leggono il libro", english: "They read the book" },
  { scrambled: ["mangiamo", "la", "noi", "pizza"], answer: "Noi mangiamo la pizza", english: "We eat the pizza" },
  { scrambled: ["amico", "il", "mio", "è", "felice"], answer: "Il mio amico è felice", english: "My friend is happy" },
];

export const combatChallenges = [
  { english: "I want water", italian: "Io voglio acqua", hint: "voglio = io form of volere" },
  { english: "We want coffee", italian: "Noi vogliamo caffè", hint: "vogliamo = noi form" },
  { english: "They eat pizza", italian: "Loro mangiano la pizza", hint: "mangiano = loro form" },
  { english: "You (sg) drink wine", italian: "Tu bevi vino", hint: "bevi = tu form" },
  { english: "She reads the book", italian: "Lei legge il libro", hint: "legge = lui/lei form" },
  { english: "We go to the market", italian: "Noi andiamo al mercato", hint: "andiamo = noi form of andare" },
  { english: "I have a friend", italian: "Io ho un amico", hint: "ho = io form of avere" },
  { english: "The house is big", italian: "La casa è grande", hint: "feminine: la casa" },
  { english: "They live in Italy", italian: "Loro vivono in Italia", hint: "vivono = loro form of vivere" },
];

export const infiniteBuilderSets = [
  { words: ["io", "voglio", "tè", "caffè", "oggi"], minValid: 4 },
  { words: ["noi", "mangiamo", "pizza", "pasta", "oggi"], minValid: 3 },
  { words: ["loro", "leggono", "libro", "domani", "il"], minValid: 2 },
  { words: ["lei", "ama", "amico", "molto", "il"], minValid: 2 },
];
