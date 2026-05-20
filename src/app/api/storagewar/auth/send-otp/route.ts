import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { hasStorageWarBackend } from "@/lib/storagewar/auth";
import { normalizePhone } from "@/lib/storagewar/constants";
import { sendOtp } from "@/lib/storagewar/otp";

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) {
    return jsonError("Backend not configured. Set Supabase env vars.", 503);
  }

  const body = await req.json().catch(() => ({}));
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return jsonError("Enter a valid phone number with country code.");

  const result = await sendOtp(phone);
  if (!result.ok) return jsonError("Could not send verification code.", 500);

  return jsonOk({
    ok: true,
    message: "Verification code sent.",
    devCode: result.devCode,
  });
}
