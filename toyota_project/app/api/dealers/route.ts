// In your api/dealers/route.ts file

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // --- 1. RECEIVE 'make' FROM THE REQUEST ---
    const { lat, lng, make, radiusMeters = 10000 } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat and lng are required numbers" }, { status: 400 });
    }

    // --- 2. ADD VALIDATION FOR 'make' ---
    if (typeof make !== "string" || make.trim() === "") {
      return NextResponse.json({ error: "'make' is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
    }

    // --- 3. CREATE A DYNAMIC SEARCH QUERY ---
    const searchQuery = `${make} Dealer`;

    // Nearby Search: [Make] Dealer within radius
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    
    // --- 4. USE THE DYNAMIC QUERY ---
    url.searchParams.set("keyword", searchQuery);
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", String(radiusMeters));
    url.searchParams.set("key", apiKey);

    // Add a fetch timeout to avoid hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(url.toString(), { cache: "no-store", signal: controller.signal });
    } catch (e: any) {
      if (e?.name === "AbortError") {
        return NextResponse.json({ error: "Timeout expired" }, { status: 504 });
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Google Places error", details: text }, { status: 502 });
    }

    const data = await res.json();

    const dealers = (data.results || []).slice(0, 5).map((r: any) => ({
      name: r.name,
      address: r.vicinity ?? r.formatted_address ?? "",
      rating: typeof r.rating === "number" ? r.rating : null,
      place_id: r.place_id,
      location: r.geometry?.location ?? null,
      isOpen: r.opening_hours?.open_now ?? null,
    }));

    return NextResponse.json({ success: true, dealers });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch dealers", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}