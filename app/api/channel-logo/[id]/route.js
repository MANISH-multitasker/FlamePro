import { NextResponse } from "next/server";

const PHP_LOGO_URL =
  "https://steelblue-caterpillar-427388.hostingersite.com/getlogo.php";

export async function GET(_req, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ logo: null }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${PHP_LOGO_URL}?id=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
        headers: {
          // ✅ THIS IS THE KEY FIX
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("PHP logo API error:", res.status, text);
      return NextResponse.json({ logo: null }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ logo: data.logo ?? null });

  } catch (e) {
    console.error("Channel logo fetch failed:", e);
    return NextResponse.json({ logo: null }, { status: 500 });
  }
}
