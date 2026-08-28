"use client";

import { useEffect, useState, useRef } from "react";
import LiveStreamCard from "@/components/LiveStreamCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LiveStreamsSection() {
    const [streams, setStreams] = useState([]);
    const [loading, setLoading] = useState(true);

    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const cardsRef = useRef([]); // ⭐ Collects card refs

    // Reset card refs
    cardsRef.current = [];

    useEffect(() => {
        async function loadStreams() {
            try {
                const res = await fetch("/api/livestreams");
                const json = await res.json();
                setStreams(json.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadStreams();
    }, []);

    // ⭐ Title GSAP Animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current,
                { opacity: 0, x: -100, skewY: 10 },
                {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top center+=100",
                        toggleActions: "play none none reverse",
                    },
                    opacity: 1,
                    x: 0,
                    skewY: 0,
                    duration: 1,
                    ease: "power3.out",
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // ⭐ LiveStreamCard GSAP Animation (Stagger)
    useEffect(() => {
        if (!streams.length) return;

        const ctx = gsap.context(() => {
            gsap.from(cardsRef.current, {
                opacity: 0,
                y: 40,
                scale: 0.9,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.12,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top center+=150",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [streams]);

    return (
        <section ref={sectionRef} className="py-20 px-10 bg-background relative">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-8xl mx-auto">

                {/* Title */}
                <h2
                    ref={titleRef}
                    className="mb-10 text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300 leading-tight tracking-tighter"
                >
                    CURRENTLY LIVE
                </h2>

                {/* Loading Animation */}
                {loading && (
                    <div className="flex flex-col mb-10">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce delay-300"></div>
                        </div>
                        <p className="text-purple-300/60 text-lg mt-3">Checking live streams...</p>
                    </div>
                )}

                {!loading && streams.length === 0 && (
                    <p className="text-foreground/80 leading-relaxed mb-10 text-sm md:text-base max-w-2xl">
                        No one is currently live with{" "}
                        <span className="font-semibold">#flamecityroleplay</span>
                    </p>
                )}

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {streams.map((s, index) => (
                        <div
                            key={s.id.videoId}
                            ref={(el) => (cardsRef.current[index] = el)}
                        >
                            <LiveStreamCard stream={s} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
