// utils/getCoordinates.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCoordinates(cityName: string) {
  // 1. Check cache
  const { data: cached, error: cacheError } = await supabase
    .from("locations_cache")
    .select("*")
    .eq("city_name", cityName)
    .maybeSingle();

  if (cached) {
    return { lat: cached.lat, lng: cached.lng };
  }

  // 2. Call OpenCage API
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  const res = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${apiKey}`
  );
  const json = await res.json();

  if (!json.results.length) throw new Error(`No coordinates found for ${cityName}`);

  const { lat, lng } = json.results[0].geometry;

  // 3. Save to cache
  await supabase
    .from("locations_cache")
    .insert([{ city_name: cityName, lat, lng }]);

  return { lat, lng };
}
