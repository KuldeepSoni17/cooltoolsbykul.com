import { createHmac, timingSafeEqual, createHash } from "crypto";
import type { SwUser } from "./auth";
import { INITIAL_COINS, SESSION_DAYS } from "./constants";

const PREFIX = "sig.";

function secret(): string {
  return (
    process.env.STORAGEWAR_OTP_SECRET ??
    process.env.ADMIN_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "storagewar-session-secret"
  );
}

export function userIdFromPhone(phone: string): string {
  const hex = createHash("sha256").update(phone).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function createSignedSession(user: SwUser): string {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ user, expiresAt });
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  const token = Buffer.from(JSON.stringify({ payload, sig })).toString("base64url");
  return `${PREFIX}${token}`;
}

export function parseSignedSession(token: string): SwUser | null {
  if (!token.startsWith(PREFIX)) return null;
  try {
    const raw = token.slice(PREFIX.length);
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      payload: string;
      sig: string;
    };
    const expected = createHmac("sha256", secret()).update(parsed.payload).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parsed.sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const data = JSON.parse(parsed.payload) as { user: SwUser; expiresAt: number };
    if (Date.now() > data.expiresAt) return null;
    return data.user;
  } catch {
    return null;
  }
}

export function buildFallbackUser(phone: string, displayName: string): SwUser {
  return {
    id: userIdFromPhone(phone),
    phone,
    display_name: displayName,
    coins: INITIAL_COINS,
    reward_points: 0,
    game_state: {},
  };
}
