"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  RefreshCw,
  Search,
  Radio,
  Sparkles,
  Users,
  Video,
  Flame,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

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

const CORS_PROXY = "https://corsproxy.io/?";
const YT_API = "https://www.googleapis.com/youtube/v3";
const CACHE_KEY = "flame_live_streams_cache";

function formatViewers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

/* ═══════════════════════════════════════════════════════════════════════
   STREAM FETCHING LOGIC
   ═══════════════════════════════════════════════════════════════════════ */

async function fetchYouTubeStreams(apiKey: string, keywords: string[]): Promise<LiveStreamItem[]> {
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

    const res = await fetch(searchUrl.toString());
    const data = await res.json();

    if (!data.items || data.items.length === 0) return [];

    const videoIds = data.items.map((i: any) => i.id.videoId).join(",");
    const videosUrl = new URL(`${YT_API}/videos`);
    videosUrl.searchParams.set("part", "snippet,liveStreamingDetails,statistics");
    videosUrl.searchParams.set("id", videoIds);
    videosUrl.searchParams.set("key", apiKey);

    const vidRes = await fetch(videosUrl.toString());
    const vidData = await vidRes.json();

    return (vidData.items || []).map((v: any) => ({
      id: v.id,
      platform: "youtube" as const,
      channelId: v.snippet.channelId,
      channelName: v.snippet.channelTitle,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
      viewers: parseInt(v.liveStreamingDetails?.concurrentViewers || "0", 10),
      isLive: true,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      tags: v.snippet.tags ? v.snippet.tags.slice(0, 3) : ["FlameCity", "FiveM"],
      source: "search",
    }));
  } catch (err) {
    console.warn("YouTube search error:", err);
    return [];
  }
}

async function fetchYouTubeChannelStream(apiKey: string, channelId: string, name: string): Promise<LiveStreamItem | null> {
  try {
    const searchUrl = new URL(`${YT_API}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("eventType", "live");
    searchUrl.searchParams.set("channelId", channelId);
    searchUrl.searchParams.set("maxResults", "1");
    searchUrl.searchParams.set("key", apiKey);

    const res = await fetch(searchUrl.toString());
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const videoId = data.items[0].id.videoId;
    const vidRes = await fetch(`${YT_API}/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}&key=${apiKey}`);
    const vidData = await vidRes.json();
    if (!vidData.items || vidData.items.length === 0) return null;

    const v = vidData.items[0];
    return {
      id: v.id,
      platform: "youtube" as const,
      channelId: v.snippet.channelId,
      channelName: v.snippet.channelTitle || name,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
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

async function fetchKickChannel(username: string): Promise<LiveStreamItem | null> {
  try {
    const targetUrl = `https://kick.com/api/v2/channels/${username}`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(targetUrl);
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
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

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function MediaStreamsSection() {
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<"all" | "youtube" | "kick">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"viewers-desc" | "viewers-asc" | "name-asc" | "name-desc">("viewers-desc");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const sectionRef = useRef<HTMLElement | null>(null);

  /* ─── Fetch Streams ─────────────────────────────────────────────── */
  const loadAllStreams = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setIsRefreshing(true);

    try {
      // 1. Check local cache first for instant UX
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached && showLoadingSpinner) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setStreams(parsed);
              setLoading(false);
            }
          } catch {}
        }
      }

      // 2. Fetch aggregated streams from our server endpoint
      const res = await fetch("/api/public-streams", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const liveItems = data.streams || [];
        setStreams(liveItems);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

        if (typeof window !== "undefined" && liveItems.length > 0) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(liveItems));
        }
      }
    } catch (err) {
      console.error("Failed to load live streams:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllStreams(true);
    const timer = setInterval(() => loadAllStreams(false), 3 * 60 * 1000); // refresh every 3 min
    return () => clearInterval(timer);
  }, []);

  /* ─── Filtering & Sorting ───────────────────────────────────────── */
  const filteredStreams = useMemo(() => {
    let list = [...streams];

    if (platformFilter !== "all") {
      list = list.filter((s) => s.platform === platformFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.channelName.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case "viewers-desc":
        list.sort((a, b) => b.viewers - a.viewers);
        break;
      case "viewers-asc":
        list.sort((a, b) => a.viewers - b.viewers);
        break;
      case "name-asc":
        list.sort((a, b) => a.channelName.localeCompare(b.channelName));
        break;
      case "name-desc":
        list.sort((a, b) => b.channelName.localeCompare(a.channelName));
        break;
    }

    return list;
  }, [streams, platformFilter, searchQuery, sortBy]);

  const totalViewers = useMemo(() => {
    return streams.reduce((acc, curr) => acc + (curr.viewers || 0), 0);
  }, [streams]);

  const scrollToStreams = (platform: "youtube" | "kick") => {
    setPlatformFilter(platform);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 px-6 sm:px-10 bg-background overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-purple-700/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto">
        {/* ═══════════ HEADER HERO CONTENT ═══════════ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Live Broadcasts</span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 tracking-tight leading-tight uppercase">
              Watch FlameCity <span className="italic text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">Live</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-foreground/75 font-medium tracking-wide leading-relaxed">
              Catch our community streamers live in Los Santos and experience the next generation of FiveM roleplay action in real time.
            </p>

            {/* Platform Quick Jump Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => scrollToStreams("youtube")}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 border border-red-500/40 transition-all hover:scale-105"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube Streams</span>
              </button>

              <button
                onClick={() => scrollToStreams("kick")}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-600 hover:to-green-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/40 border border-green-500/40 transition-all hover:scale-105"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M1.333 0v24h5.338v-6l2.668-2.667L12.006 24h6.67l-5.336-10.667L18.676 8h-6.67L9.34 10.667V0z" />
                </svg>
                <span>Kick Streams</span>
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-2xl border border-purple-700/40 bg-gradient-to-br from-purple-950/40 via-purple-900/20 to-purple-950/10 p-6 sm:p-7 shadow-xl shadow-purple-950/30 min-w-[240px] text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">Live Now</span>
            </div>

            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-4xl font-black text-white">{streams.length}</span>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Streams</span>
            </div>

            <div className="h-[1px] bg-purple-500/20 my-3" />

            <p className="text-[11px] font-semibold text-white/45 uppercase tracking-wider mb-1">Total Viewers</p>
            <p className="text-2xl font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {formatViewers(totalViewers)}
            </p>
          </div>
        </div>

        {/* ═══════════ FILTER & SEARCH BAR ═══════════ */}
        <div className="rounded-2xl border border-purple-700/40 bg-purple-950/25 backdrop-blur-md p-4 sm:p-5 mb-10 shadow-lg shadow-purple-950/20 flex flex-wrap items-center justify-between gap-4">
          {/* Platform Filters */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">Platform</label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPlatformFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  platformFilter === "all"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                ALL
              </button>

              <button
                onClick={() => setPlatformFilter("youtube")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  platformFilter === "youtube"
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </button>

              <button
                onClick={() => setPlatformFilter("kick")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  platformFilter === "kick"
                    ? "bg-emerald-600 text-white shadow-lg shadow-green-900/40"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M1.333 0v24h5.338v-6l2.668-2.667L12.006 24h6.67l-5.336-10.667L18.676 8h-6.67L9.34 10.667V0z" />
                </svg>
                <span>Kick</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">Search Streamers</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, creator, or tags..."
                className="w-full rounded-xl border border-purple-700/30 bg-black/40 pl-4 pr-10 py-2 text-xs text-foreground placeholder:text-foreground/35 outline-none focus:border-purple-500/70 transition-colors"
              />
              <Search size={14} className="absolute right-3 text-foreground/40 pointer-events-none" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-purple-700/30 bg-black/40 px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500/70 transition-colors cursor-pointer"
            >
              <option value="viewers-desc">Viewers (High to Low)</option>
              <option value="viewers-asc">Viewers (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>

          {/* Refresh & Count */}
          <div className="flex items-center gap-3 pt-4 sm:pt-0">
            <button
              onClick={() => loadAllStreams(false)}
              disabled={isRefreshing}
              title="Refresh Live Streams"
              className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-800/30 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-purple-400" : ""} />
            </button>
            <div className="text-right">
              <div className="text-xs font-bold text-purple-300">
                <span className="text-white font-black text-sm">{filteredStreams.length}</span> Showing
              </div>
              {lastUpdated && <div className="text-[10px] text-white/40">{lastUpdated}</div>}
            </div>
          </div>
        </div>

        {/* ═══════════ STREAMS GRID ═══════════ */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-150" />
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce delay-300" />
            </div>
            <p className="text-purple-300/70 text-sm font-semibold tracking-wider uppercase">
              Fetching Live Community Broadcasts...
            </p>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="rounded-2xl border border-purple-700/30 bg-purple-950/15 py-20 px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-4">
              <Video size={28} />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Streams Live Right Now</h3>
            <p className="mt-1 text-sm text-foreground/50 max-w-md mx-auto">
              Our community streamers are currently offline. Check back soon or join our Discord to see when members go live!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((s, idx) => (
              <motion.a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-purple-700/40 bg-gradient-to-b from-purple-950/40 via-purple-900/15 to-[#080411] shadow-lg shadow-purple-950/20 hover:border-purple-500/80 hover:shadow-purple-700/30 transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Thumbnail container */}
                <div className="relative w-full aspect-video overflow-hidden bg-black/60">
                  {s.thumbnail ? (
                    <img
                      src={s.thumbnail}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950 to-black">
                      <Flame size={32} className="text-purple-500/40" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* LIVE Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md shadow-red-950/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </div>

                  {/* Platform Badge */}
                  <div
                    className={`absolute top-2.5 right-2.5 flex items-center justify-center h-6 w-6 rounded-lg shadow-md ${
                      s.platform === "youtube" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
                    }`}
                  >
                    {s.platform === "youtube" ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                        <path d="M1.333 0v24h5.338v-6l2.668-2.667L12.006 24h6.67l-5.336-10.667L18.676 8h-6.67L9.34 10.667V0z" />
                      </svg>
                    )}
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-white font-mono text-[11px] font-bold">
                    <Eye size={12} className="text-emerald-400" />
                    <span>{formatViewers(s.viewers)}</span>
                  </div>
                </div>

                {/* Body info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-emerald-400">
                      {s.channelName}
                    </p>
                  </div>

                  {s.tags && s.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-700/20 text-[10px] font-medium text-purple-300/80"
                        >
                          #{tag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* ═══════════ CTA BANNER: STREAMER PROGRAM ═══════════ */}
        <div className="mt-16 rounded-3xl border border-purple-700/40 bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-[#0c061a] p-8 sm:p-10 shadow-2xl shadow-purple-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-950/30">
              <Sparkles size={30} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                Want to join our <span className="text-emerald-400">Streamer Program</span>?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                We're always looking for passionate creators. Apply today to get verified creator perks and represent Flame City Roleplay!
              </p>
            </div>
          </div>

          <Link
            href="/applications"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-purple-900/40 border border-purple-400/40 transition-all hover:scale-105 whitespace-nowrap"
          >
            <span>Apply Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
