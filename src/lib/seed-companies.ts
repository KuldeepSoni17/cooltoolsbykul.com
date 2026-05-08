import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase-server";

type CompanyRow = {
  slug: string;
  greenhouse_url: string;
  api_url: string;
};

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cols.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cols.push(current);
  return cols.map((c) => c.trim());
}

function parseCSV(filePath: string): CompanyRow[] {
  if (!fs.existsSync(filePath)) {
    console.log(`[SeedCompanies] File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      return {
        slug: cols[0] ?? "",
        greenhouse_url: cols[1] ?? "",
        api_url: cols[2] ?? "",
      };
    })
    .filter((r) => r.slug.length > 0);
}

function resolveExtractorsBase(): string {
  const candidates = [
    path.join(process.cwd(), "jobExtractors"),
    path.join(process.cwd(), "JobExtracters"),
    path.join(process.cwd(), "VacancyBible", "jobExtractors"),
    path.join(process.cwd(), "VacancyBible", "JobExtracters"),
    path.join(process.cwd(), "..", "VacancyBible", "jobExtractors"),
    path.join(process.cwd(), "..", "VacancyBible", "JobExtracters"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  return candidates[0];
}

export async function seedCompanies(): Promise<{ greenhouse: number; total: number }> {
  const base = resolveExtractorsBase();
  const greenhouseRows = parseCSV(path.join(base, "greenhouse_companies.csv"));
  console.log(`[SeedCompanies] Parsed greenhouse rows: ${greenhouseRows.length}`);

  const records = greenhouseRows.map((row) => ({
    slug: row.slug,
    name: row.slug.replace(/-/g, " ").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    ats_platform: "greenhouse",
    careers_url: row.greenhouse_url,
    api_url: row.api_url,
    slug_status: "unknown",
    is_active: true,
  }));

  let saved = 0;
  const BATCH = 500;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { data, error } = await supabaseAdmin
      .from("companies")
      .upsert(batch, { onConflict: "slug,ats_platform", ignoreDuplicates: true })
      .select("id");
    if (error) {
      console.error(`[SeedCompanies] Batch ${i} failed: ${error.message}`);
      continue;
    }
    const count = data?.length ?? 0;
    saved += count;
    console.log(`[SeedCompanies] Batch ${i}-${i + BATCH}: ${count}`);
  }

  return { greenhouse: greenhouseRows.length, total: saved };
}

if (require.main === module) {
  seedCompanies()
    .then((result) => {
      console.log("[SeedCompanies] done", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("[SeedCompanies] failed", error);
      process.exit(1);
    });
}
