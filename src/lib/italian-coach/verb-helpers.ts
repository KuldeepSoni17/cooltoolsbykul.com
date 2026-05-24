import type { Verb } from "./types";

/** Regular -are verb (parlare → parl-o, parl-i, …) */
export function verbAre(id: string, infinitive: string, stem: string, english: string): Verb {
  return {
    id,
    infinitive,
    english,
    present: {
      io: `${stem}o`,
      tu: `${stem}i`,
      lui_lei: `${stem}a`,
      noi: `${stem}iamo`,
      voi: `${stem}ate`,
      loro: `${stem}ano`,
    },
  };
}

/** Regular -ere verb (vedere → ved-o, …) */
export function verbEre(id: string, infinitive: string, stem: string, english: string): Verb {
  return {
    id,
    infinitive,
    english,
    present: {
      io: `${stem}o`,
      tu: `${stem}i`,
      lui_lei: `${stem}e`,
      noi: `${stem}iamo`,
      voi: `${stem}ete`,
      loro: `${stem}ono`,
    },
  };
}

/** Regular -ire verb (dormire → dorm-o, …) */
export function verbIre(id: string, infinitive: string, stem: string, english: string): Verb {
  return {
    id,
    infinitive,
    english,
    present: {
      io: `${stem}o`,
      tu: `${stem}i`,
      lui_lei: `${stem}e`,
      noi: `${stem}iamo`,
      voi: `${stem}ite`,
      loro: `${stem}ono`,
    },
  };
}

/** -ire with -isc- insertion (capire → capisco, …) */
export function verbIreSc(id: string, infinitive: string, stem: string, english: string): Verb {
  return {
    id,
    infinitive,
    english,
    present: {
      io: `${stem}isco`,
      tu: `${stem}isci`,
      lui_lei: `${stem}isce`,
      noi: `${stem}iamo`,
      voi: `${stem}ite`,
      loro: `${stem}iscono`,
    },
  };
}
