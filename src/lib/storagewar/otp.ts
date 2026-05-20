import { supabaseAdmin } from "@/lib/supabase-server";
import { OTP_TTL_MINUTES } from "./constants";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; devCode?: string }> {
  const code = generateCode();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + OTP_TTL_MINUTES);

  await supabaseAdmin.from("sw_otp").upsert({
    phone,
    code,
    expires_at: expires.toISOString(),
  });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Storage War code: ${code}. Expires in ${OTP_TTL_MINUTES} minutes.`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!res.ok) {
      console.error("[StorageWar] Twilio error", await res.text());
      return { ok: false };
    }
    return { ok: true };
  }

  // Dev / no Twilio: expose code only when explicitly allowed
  if (process.env.STORAGEWAR_DEV_OTP === "true") {
    console.log(`[StorageWar] OTP for ${phone}: ${code}`);
    return { ok: true, devCode: code };
  }

  console.log(`[StorageWar] OTP for ${phone}: ${code} (Twilio not configured)`);
  return { ok: true };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("sw_otp")
    .select("code, expires_at")
    .eq("phone", phone)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.expires_at) < new Date()) return false;
  if (data.code !== code.trim()) return false;

  await supabaseAdmin.from("sw_otp").delete().eq("phone", phone);
  return true;
}
