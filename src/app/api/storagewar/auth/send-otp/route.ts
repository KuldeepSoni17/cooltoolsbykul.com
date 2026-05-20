import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { hasStorageWarBackend } from "@/lib/storagewar/auth";
import { normalizePhone } from "@/lib/storagewar/constants";
import { sendOtp } from "@/lib/storagewar/otp";

export async function POST(req: NextRequest) {
  if (!hasStorageWarBackend()) {
    return jsonError("Backend not configured. Set Supabase env vars.", 503);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(String(body.phone ?? ""));
    if (!phone) return jsonError("Enter a valid phone number with country code (e.g. +91 98765 43210).");

    const result = await sendOtp(phone);
    if (!result.ok) return jsonError(result.error ?? "Could not send verification code.", 500);

    return jsonOk({
      ok: true,
      message: result.devCode
        ? "Enter the code shown below (SMS not configured yet)."
        : "Verification code sent to your phone.",
      devCode: result.devCode,
    });
  } catch (e) {
    console.error("[StorageWar] send-otp", e);
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(
      msg.includes("fetch failed")
        ? "Database connection failed. Check Supabase URL/keys and that scripts/storagewar-schema.sql was run."
        : msg,
      500,
    );
  }
}
