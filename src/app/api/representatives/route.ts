import { NextRequest, NextResponse } from "next/server";

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

const STATE_ASSEMBLY_QID: Record<string, string> = {
  Karnataka: "Q15209",
  Maharashtra: "Q1191",
  Delhi: "Q1353",
  "Tamil Nadu": "Q1445",
  Telangana: "Q677037",
};

async function sparqlQuery(query: string) {
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(
    query
  )}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "WhosResponsible/1.0 (civic-accountability-app)",
    },
  });
  if (!res.ok) throw new Error(`Wikidata error: ${res.status}`);
  const data = await res.json();
  return data.results.bindings as Array<Record<string, { value: string }>>;
}

export async function GET(req: NextRequest) {
  const constituency = req.nextUrl.searchParams.get("constituency") ?? "";
  const state = req.nextUrl.searchParams.get("state") ?? "";

  const representatives: Array<Record<string, string | null>> = [];

  try {
    const mpQuery = `
      SELECT ?person ?personLabel ?partyLabel ?image WHERE {
        ?person wdt:P39 ?pos .
        ?pos wdt:P279* wd:Q2490594 .
        ?person wdt:P1268 ?const .
        ?const rdfs:label ?constLabel .
        FILTER(CONTAINS(LCASE(?constLabel), LCASE("${constituency}")))
        OPTIONAL { ?person wdt:P18 ?image }
        OPTIONAL { ?person wdt:P102 ?party }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 1
    `;
    const mpResults = await sparqlQuery(mpQuery);
    if (mpResults.length > 0) {
      const r = mpResults[0];
      representatives.push({
        type: "MP (Lok Sabha)",
        name: r.personLabel?.value ?? "Unknown",
        party: r.partyLabel?.value ?? "",
        photo: r.image?.value ?? null,
        wikidataUrl: r.person?.value ?? null,
        constituency,
      });
    }
  } catch (e) {
    console.error("MP query failed:", e);
  }

  const stateQid = STATE_ASSEMBLY_QID[state];
  if (stateQid) {
    try {
      const mlaQuery = `
        SELECT ?person ?personLabel ?partyLabel ?image WHERE {
          ?person wdt:P39 ?pos .
          ?pos wdt:P279* wd:Q19312764 .
          ?person wdt:P1268 ?const .
          ?const wdt:P131* wd:${stateQid} .
          ?const rdfs:label ?constLabel .
          FILTER(CONTAINS(LCASE(?constLabel), LCASE("${constituency}")))
          FILTER NOT EXISTS { ?pos pq:P582 ?end }
          OPTIONAL { ?person wdt:P18 ?image }
          OPTIONAL { ?person wdt:P102 ?party }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        } LIMIT 1
      `;
      const mlaResults = await sparqlQuery(mlaQuery);
      if (mlaResults.length > 0) {
        const r = mlaResults[0];
        representatives.push({
          type: "MLA",
          name: r.personLabel?.value ?? "Unknown",
          party: r.partyLabel?.value ?? "",
          photo: r.image?.value ?? null,
          wikidataUrl: r.person?.value ?? null,
          constituency,
          state,
        });
      }
    } catch (e) {
      console.error("MLA query failed:", e);
    }
  }

  if (representatives.length === 0) {
    representatives.push({
      type: "Representative lookup",
      name: "Data unavailable from Wikidata",
      note: `Try india.gov.in/directory for ${state} representatives`,
      wikidataUrl: "https://www.india.gov.in/directory/whos-who/mla",
      constituency,
    });
  }

  return NextResponse.json({ representatives });
}
