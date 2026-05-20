import { jsonError, jsonOk } from "@/lib/storagewar/api-utils";
import { getSessionUser, hasStorageWarBackend } from "@/lib/storagewar/auth";

export async function GET() {
  if (!hasStorageWarBackend()) {
    return jsonOk({ user: null, backend: false });
  }
  const user = await getSessionUser();
  if (!user) return jsonOk({ user: null, backend: true });
  return jsonOk({ user, backend: true });
}
