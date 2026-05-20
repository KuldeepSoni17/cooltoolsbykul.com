import { supabaseAdmin } from "@/lib/supabase-server";
import { OTP_TTL_MINUTES } from "./constants";

function generateCode(): string {
  // Fixed test code when explicitly set (e.g. STORAGEWAR_TEST_OTP=123456)
  const testOtp = process.env.STORAGEWAR_TEST_OTP?.trim();
  if (testOtp && /^\d{4,8}$/.test(testOtp)) return testOtp;
  return String(Math.floor(100000 + Math.random() * 900000));
}

function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; devCode?: string; error?: string }> {
  const code = generateCode();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + OTP_TTL_MINUTES);

  const { error: dbError } = await supabaseAdmin.from("sw_otp").upsert({
    phone,
    code,
    expires_at: expires.toISOString(),
  });

  if (dbError) {
    console.error("[StorageWar] OTP DB error", dbError);
    return {
      ok: false,
      error:
        dbError.code === "42P01"
          ? "Database not ready — run scripts/storagewar-schema.sql in Supabase."
          : dbError.message,
    };
  }

  if (twilioConfigured()) {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE_NUMBER!;
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
      return { ok: false, error: "SMS delivery failed. Try again later." };
    }
    return { ok: true };
  }

  // No SMS — show code in app so you can test without Twilio
  console.log(`[StorageWar] OTP for ${phone}: ${code} (SMS not configured — shown in app)`);
  return { ok: true, devCode: code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const trimmed = code.trim();
  const testOtp = process.env.STORAGEWAR_TEST_OTP?.trim();
  if (testOtp && trimmed === testOtp) return true;

  const { data } = await supabaseAdmin
    .from("sw_otp")
    .select("code, expires_at")
    .eq("phone", phone)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.expires_at) < new Date()) return false;
  if (data.code !== trimmed) return false;

  await supabaseAdmin.from("sw_otp").delete().eq("phone", phone);
  return true;
}
