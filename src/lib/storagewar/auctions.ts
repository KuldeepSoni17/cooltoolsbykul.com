import { supabaseAdmin } from "@/lib/supabase-server";

const AUCTION_LABELS = [
  { label: "Unit #12 — Dusty Corner", desc: "Cramped 5×5, smells like mothballs.", hint: "Might be junk… might not.", base: 180 },
  { label: "Unit #27 — Climate Controlled", desc: "Premium row, keypad lock intact.", hint: "Previous owner was a retired professor.", base: 420 },
  { label: "Unit #44 — Estate Clearance", desc: "Full garage bay, tarps and crates.", hint: "Family sold everything after probate.", base: 750 },
  { label: "Unit #8 — Abandoned Luxury", desc: "Climate controlled, velvet drapes visible.", hint: "Owner fled overseas — left in a hurry.", base: 1200 },
];

function randomArtifacts() {
  const templates = [
    "stamp-wilding", "doc-postcard", "coin-wheat", "stamp-zeppelin",
    "doc-shipping-log", "coin-halfpenny", "stamp-first-flight", "doc-diary",
  ];
  const count = 1 + Math.floor(Math.random() * 3);
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(templates[Math.floor(Math.random() * templates.length)]);
  }
  return picked.map((templateId) => ({
    instanceId: crypto.randomUUID(),
    templateId,
    trueValue: 50 + Math.floor(Math.random() * 800),
    condition: 0.6 + Math.random() * 0.35,
    evaluated: false,
    onShowcase: false,
    listedOnMarket: false,
  }));
}

export async function ensureLiveAuctions(min = 4) {
  const { count } = await supabaseAdmin
    .from("sw_auctions")
    .select("id", { count: "exact", head: true })
    .eq("status", "auction")
    .gt("ends_at", new Date().toISOString());

  const need = min - (count ?? 0);
  if (need <= 0) return;

  const rows = Array.from({ length: need }, () => {
    const tier = AUCTION_LABELS[Math.floor(Math.random() * AUCTION_LABELS.length)];
    const ends = new Date();
    ends.setMinutes(ends.getMinutes() + 8 + Math.floor(Math.random() * 12));
    return {
      label: tier.label,
      description: tier.desc,
      hint: tier.hint,
      base_price: tier.base,
      current_bid: Math.round(tier.base * 0.6),
      artifacts: randomArtifacts(),
      status: "auction",
      ends_at: ends.toISOString(),
    };
  });

  await supabaseAdmin.from("sw_auctions").insert(rows);
}

