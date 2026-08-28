"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
type Partner = {
  id: string;
  name: string;
  logo: string;
  websiteUrl: string;
  description?: string;
  hidden?: boolean;
  sortOrder?: number;
};

export default function PartnerTicker() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/public-partners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPartners(data);
        }
      })
      .catch(() => {
        // Fallback default
        setPartners([
          {
            id: "default-swiftsnip",
            name: "SwiftSnip",
            logo: "/swiftsnip-partner.png",
            websiteUrl: "https://swiftsnip.in/",
            description: "#1 Stream Clipping Tool for YouTube, Twitch & Kick",
          },
        ]);
      });
  }, []);

  if (partners.length === 0) {
    return null;
  }

  const marqueeItem = (partner: Partner, keyPrefix: string) => (
    <a
      key={`${keyPrefix}-${partner.id}`}
      href={partner.websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`${partner.name} — Visit Website`}
      className="inline-flex items-center gap-4 px-6 py-1 hover:text-white transition-colors group flex-shrink-0"
    >
      {partner.logo && (
        <img
          src={partner.logo}
          alt={partner.name}
          className="h-5 sm:h-6 w-auto max-w-[90px] object-contain drop-shadow-[0_2px_8px_rgba(239,68,68,0.3)] group-hover:scale-105 transition-transform"
        />
      )}
      <span className="font-extrabold tracking-wider text-red-400 group-hover:text-red-300 transition-colors uppercase text-xs sm:text-sm">
        {partner.name}
      </span>
      {partner.description && (
        <>
          <span className="text-white/30">•</span>
          <span className="text-white/80 group-hover:text-white text-xs sm:text-sm font-medium tracking-wide">
            {partner.description}
          </span>
        </>
      )}
      <span className="text-white/30">•</span>
      <span className="text-purple-400/90 font-mono text-xs underline underline-offset-2 opacity-80 group-hover:opacity-100">
        {partner.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
      </span>
      <span className="text-purple-500/40 ml-2">✦</span>
    </a>
  );

  return (
    <aside
      aria-label="Official Partners"
      className="fixed bottom-0 left-0 right-0 z-40 h-12 sm:h-14 bg-[#080411]/92 backdrop-blur-lg border-t border-purple-500/30 shadow-[0_-8px_30px_rgba(147,51,234,0.18)] flex items-center select-none overflow-hidden"
    >
      {/* Top glowing edge line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80 pointer-events-none" />

      {/* Left Pinned Badge: Official Partners */}
      <div className="relative z-20 flex-shrink-0 flex items-center gap-2 px-3 sm:px-5 h-full bg-gradient-to-r from-[#080411] via-[#0c061a] to-transparent pr-5 sm:pr-7 border-r border-purple-500/20">
        <div className="flex items-center justify-center h-6 sm:h-7 px-2.5 rounded-full bg-red-600/15 border border-red-500/40 text-[10px] sm:text-xs font-black tracking-widest text-red-400 uppercase whitespace-nowrap shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <Sparkles size={11} className="mr-1 text-red-400 animate-pulse" />
          Official Partners
        </div>
      </div>

      {/* Center Floating Marquee (Right to Left) */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {partners.map((p) => marqueeItem(p, "set1"))}
          {partners.map((p) => marqueeItem(p, "set2"))}
          {partners.map((p) => marqueeItem(p, "set3"))}
          {partners.map((p) => marqueeItem(p, "set4"))}
        </div>
      </div>

      {/* Right Pinned Indicator */}
      <div className="relative z-20 flex-shrink-0 hidden md:flex items-center px-4 h-full bg-gradient-to-l from-[#080411] via-[#0c061a] to-transparent pl-6 border-l border-purple-500/20">
        <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
          <span>Click to visit</span>
          <ExternalLink size={11} />
        </span>
      </div>
    </aside>
  );
}
