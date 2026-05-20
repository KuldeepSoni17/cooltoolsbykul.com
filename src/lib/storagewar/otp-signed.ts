import { createHmac, timingSafeEqual } from "crypto";
import { OTP_TTL_MINUTES } from "./constants";

function otpSecret(): string {
  return (
    process.env.STORAGEWAR_OTP_SECRET ??
    process.env.ADMIN_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "storagewar-dev-secret-change-me"
  );
}

export function createOtpToken(phone: string, code: string): string {
  const expiresAt = Date.now() + OTP_TTL_MINUTES * 60 * 1000;
  const payload = JSON.stringify({ phone, code, expiresAt });
  const sig = createHmac("sha256", otpSecret()).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64url");
}

export function verifyOtpToken(phone: string, code: string, token: string): boolean {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as {
      payload: string;
      sig: string;
    };
    const expected = createHmac("sha256", otpSecret()).update(parsed.payload).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parsed.sig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

    const data = JSON.parse(parsed.payload) as { phone: string; code: string; expiresAt: number };
    if (data.phone !== phone) return false;
    if (data.code !== code.trim()) return false;
    if (Date.now() > data.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}
