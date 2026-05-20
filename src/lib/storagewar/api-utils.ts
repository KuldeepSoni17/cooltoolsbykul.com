import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requireBackend() {
  const { hasStorageWarBackend } = require("./auth");
  if (!hasStorageWarBackend()) {
    return jsonError("Storage War backend is not configured.", 503);
  }
  return null;
}
