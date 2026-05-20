export const SESSION_COOKIE = "sw_session";
export const SESSION_DAYS = 30;
export const OTP_TTL_MINUTES = 10;

/** In-game currency: Vault Coins (VC) */
export const INITIAL_COINS = 5000;
export const EVAL_FEE_COINS = 75;

export const COIN_PACKAGES = [
  { id: "starter", name: "Daily Stipend", priceCents: 0, coins: 500, bonus: 0, stripePriceId: null },
  { id: "bronze", name: "Bronze Cache", priceCents: 499, coins: 1500, bonus: 100, stripePriceId: null },
  { id: "silver", name: "Silver Vault", priceCents: 999, coins: 3500, bonus: 350, stripePriceId: null },
  { id: "gold", name: "Gold Reserve", priceCents: 1999, coins: 8000, bonus: 1000, stripePriceId: null },
] as const;

export type CoinPackageId = (typeof COIN_PACKAGES)[number]["id"];

/** Buyback when player redeems a full collection to the house */
export const COLLECTION_BUYBACK: Record<string, number> = {
  "victorian-stamps": 4000,
  "historical-docs": 4800,
  "colonial-coins": 3600,
  "pioneer-era": 3000,
};

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits.startsWith("1") && digits.length === 11 ? `+${digits}` : `+${digits}`;
}
