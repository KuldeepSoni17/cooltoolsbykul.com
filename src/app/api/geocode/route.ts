import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "No address" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=in&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "WhosResponsible/1.0 (civic-accountability-app)",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: 502 }
    );
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
  }>;
  if (!data.length) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const result = data[0];
  const addr = result.address ?? {};
  const city =
    addr.city ?? addr.town ?? addr.village ?? addr.suburb ?? addr.county ?? "";
  const state = addr.state ?? "";
  const pinCode = addr.postcode ?? "";

  return NextResponse.json({
    lat: Number(result.lat),
    lng: Number(result.lon),
    city,
    state,
    pinCode,
    formattedAddress: result.display_name,
  });
}
