import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const YT_API = "https://www.googleapis.com/youtube/v3";
const CORS_PROXY = "https://corsproxy.io/?";

export interface LiveStreamItem {
  id: string;
  platform: "youtube" | "kick";
  channelId: string;
  channelName: string;
  title: string;
  thumbnail: string;
  viewers: number;
  isLive: boolean;
  url: string;
  tags: string[];
  source?: string;
}

async function searchYouTube(apiKey: string, keywords: string[]): Promise<LiveStreamItem[]> {
  try {
    const q = keywords.join(" ");
    const searchUrl = new URL(`${YT_API}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("maxResults", "20");
    searchUrl.searchParams.set("order", "viewCount");
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString(), { cache: "no-store" });
    const data = await res.json();

    if (data.error) {
      console.error("YouTube Search API Error:", data.error.message || data.error);
      return [];
    }

    if (!data.items || data.items.length === 0) return [];

    const videoIds = data.items.map((i: any) => i.id?.videoId).filter(Boolean).join(",");
    if (!videoIds) return [];

    const vidUrl = new URL(`${YT_API}/videos`);
    vidUrl.searchParams.set("part", "snippet,liveStreamingDetails,statistics");
    vidUrl.searchParams.set("id", videoIds);
    vidUrl.searchParams.set("key", apiKey);

    const vidRes = await fetch(vidUrl.toString(), { cache: "no-store" });
    const vidData = await vidRes.json();

    return (vidData.items || []).map((v: any) => ({
      id: v.id,
      platform: "youtube" as const,
      channelId: v.snippet.channelId,
      channelName: v.snippet.channelTitle,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url || "",
      viewers: parseInt(v.liveStreamingDetails?.concurrentViewers || "0", 10),
      isLive: true,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      tags: v.snippet.tags ? v.snippet.tags.slice(0, 3) : ["FlameCity", "FiveM"],
      source: "search",
    }));
  } catch (err: any) {
    console.error("YouTube search fetch failed:", err?.message || err);
    return [];
  }
}

async function checkYouTubeChannel(apiKey: string, channelId: string, name: string): Promise<LiveStreamItem | null> {
  try {
    const searchUrl = new URL(`${YT_API}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString(), { cache: "no-store" });
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const videoId = data.items[0].id?.videoId;
    if (!videoId) return null;

    const vidRes = await fetch(`${YT_API}/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}&key=${apiKey}`, { cache: "no-store" });
    const vidData = await vidRes.json();
    if (!vidData.items || vidData.items.length === 0) return null;

    const v = vidData.items[0];
    return {
      id: v.id,
      platform: "youtube" as const,
      channelId: v.snippet.channelId,
      channelName: v.snippet.channelTitle || name,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url || "",
      viewers: parseInt(v.liveStreamingDetails?.concurrentViewers || "0", 10),
      isLive: true,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      tags: v.snippet.tags ? v.snippet.tags.slice(0, 3) : ["FlameCity"],
      source: "channel",
    };
  } catch {
    return null;
  }
}

async function checkKickChannel(username: string): Promise<LiveStreamItem | null> {
  try {
    const targetUrl = `https://kick.com/api/v2/channels/${username}`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(targetUrl);
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    if (data.livestream && data.livestream.is_live) {
      return {
        id: `kick-${username}`,
        platform: "kick" as const,
        channelId: username,
        channelName: data.user?.username || username,
        title: data.livestream.session_title || `${username} is live on Flame City`,
        thumbnail: data.livestream.thumbnail?.url || "",
        viewers: data.livestream.viewer_count || 0,
        isLive: true,
        url: `https://kick.com/${username}`,
        tags: (data.livestream.categories || []).map((c: any) => c.name).slice(0, 3),
        source: "kick",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [config, channels] = await Promise.all([
      prisma.streamerConfig.findUnique({ where: { id: 1 } }),
      prisma.streamerChannel.findMany({
        where: { status: "active" },
        orderBy: { addedAt: "desc" },
      }),
    ]);

    const keywords = (config?.keywords as string[]) || ["Flame City", "FlameCity", "FlameRP"];
    const ytApiKey = config?.ytApiKey || "AIzaSyAYvjR4F5-axVZBtxOlIrYnB4nubTDU8mA";

    const allStreams: LiveStreamItem[] = [];

    // 1. YouTube Keywords Search
    if (ytApiKey) {
      const searchResults = await searchYouTube(ytApiKey, keywords);
      allStreams.push(...searchResults);
    }

    // 2. YouTube Added Channels
    const ytChannels = (channels || []).filter((c) => c.platform === "youtube");
    for (const ch of ytChannels) {
      const res = await checkYouTubeChannel(ytApiKey, ch.channelId, ch.name);
      if (res) allStreams.push(res);
    }

    // 3. Kick Channels
    const kickChannels = (channels || []).filter((c) => c.platform === "kick");
    const kickPromises = kickChannels.map((c) => checkKickChannel(c.channelId));
    const kickResults = await Promise.allSettled(kickPromises);
    kickResults.forEach((r) => {
      if (r.status === "fulfilled" && r.value) {
        allStreams.push(r.value);
      }
    });

    // Deduplicate
    const uniqueMap = new Map<string, LiveStreamItem>();
    allStreams.forEach((s) => uniqueMap.set(`${s.platform}:${s.id}`, s));
    const finalList = Array.from(uniqueMap.values());

    return NextResponse.json({
      streams: finalList,
      keywords,
      channelsCount: (channels || []).length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in public-streams API:", error);
    return NextResponse.json({
      streams: [],
      keywords: ["Flame City", "FlameCity", "FlameRP"],
      channelsCount: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}
