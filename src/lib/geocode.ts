export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  pinCode: string;
  formattedAddress: string;
}

export async function geocodeAddress(
  address: string
): Promise<LocationData | null> {
  try {
    const res = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
