
import { NextResponse } from "next/server";
import { BLACKLISTED_CHANNELS } from "@/data/blacklist";
import { BLACKLISTED_TITLES } from "@/data/blacklistedtitle";
import { PRIORITY_CHANNELS } from "@/data/priochannel";

const PHP_API_URL = "https://steelblue-caterpillar-427388.hostingersite.com/api.php";

export async function GET() {
  try {
    const res = await fetch(PHP_API_URL, { cache: "no-store" });

    if (!res.ok) {
      console.error("PHP API Error:", res.status);
      return NextResponse.json({ items: [] });
    }

    const json = await res.json();
    const items = json.items || [];

    // 1. Apply blacklist filters
    let filtered = items.filter(item => {
      const channelId = item?.snippet?.channelId;
      const title = item?.snippet?.title?.toLowerCase() || "";

      if (BLACKLISTED_CHANNELS.includes(channelId)) return false;

      for (const word of BLACKLISTED_TITLES) {
        if (title.includes(word.toLowerCase())) return false;
      }

      return true;
    });

    // 2. Sort so priority channels appear FIRST
    filtered = filtered.sort((a, b) => {
      const aPriority = PRIORITY_CHANNELS.includes(a.snippet.channelId);
      const bPriority = PRIORITY_CHANNELS.includes(b.snippet.channelId);

      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;

      return 0;
    });

    return NextResponse.json({ items: filtered });

  } catch (err) {
    console.error("API Fetch Error:", err);
    return NextResponse.json({ items: [] });
  }
}


