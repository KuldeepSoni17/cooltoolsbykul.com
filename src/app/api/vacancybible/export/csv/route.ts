import { getJobs } from "@/lib/vacancybible/store";

function csvEscape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }
  const jobs = getJobs(sessionId);
  const header = [
    "company",
    "role",
    "location",
    "total_comp_lpa",
    "domain",
    "source_url",
    "ats_platform",
  ];
  const rows = jobs.map((job) =>
    [
      job.companyName.value ?? "",
      job.exactRoleTitle.value ?? "",
      job.location.value ?? "",
      job.totalCompLpa.value ?? "",
      job.domain.value ?? "",
      job.sourceUrl,
      job.atsPlatform,
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );
  const csv = `${header.join(",")}\n${rows.join("\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vacancybible-${sessionId}.csv"`,
    },
  });
}
