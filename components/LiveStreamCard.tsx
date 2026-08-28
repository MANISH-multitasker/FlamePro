"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eye, Heart } from "lucide-react";

export default function LiveStreamCard({ stream }) {
  const { title, channelTitle, thumbnails, channelId } = stream.snippet;
  const videoId = stream.id.videoId;

  const [channelLogo, setChannelLogo] = useState(null);
  const [viewers, setViewers] = useState(null);
  const [likes, setLikes] = useState(null);

  const key = process.env.NEXT_PUBLIC_YT_API_KEY;


  useEffect(() => {
    async function fetchLogo() {
      try {
        const res = await fetch(`/api/channel-logo/${channelId}`);
        const json = await res.json();
        if (json.logo) {
          setChannelLogo(json.logo);
        }
      } catch (e) {
        console.error("Channel logo error:", e);
      }
    }

    if (channelId) fetchLogo();
  }, [channelId]);

  // Fetch Real-Time Stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,statistics&id=${videoId}&key=${key}`
        );

        const json = await res.json();
        const details = json.items?.[0];

        if (!details) return;

        setViewers(details.liveStreamingDetails?.concurrentViewers ?? 0);
        setLikes(details.statistics?.likeCount ?? 0);
      } catch (e) {
        console.error("Stats error:", e);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 20000);

    return () => clearInterval(interval);
  }, [videoId]);

  return (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      className="block bg-[#15072a] border border-purple-600/30 rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-500/30 hover:-translate-y-2 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 md:h-52 lg:h-56 overflow-hidden">
        <Image
          src={thumbnails.high.url}
          fill
          alt={title}
          className="object-cover"
        />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md">
          LIVE
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Channel */}
        <div className="flex items-center gap-3 mb-3">
          {channelLogo ? (
            <Image
              src={channelLogo}
              width={40}
              height={40}
              className="rounded-full"
              alt={channelTitle}
            />
          ) : (
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {channelTitle[0]}
            </div>
          )}

          <p className="text-purple-200 font-semibold text-sm">{channelTitle}</p>
        </div>

        {/* Title */}
        <p className="text-purple-100 font-medium text-[15px] leading-snug line-clamp-2">
          {title}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-purple-300/90 text-sm">
          <div className="flex items-center gap-1">
            <Eye size={18} /> {viewers ?? "--"}
          </div>
          <div className="flex items-center gap-1">
            <Heart size={18} /> {likes ?? "--"}
          </div>
        </div>
      </div>
    </a>
  );
}



