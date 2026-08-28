"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRouter } from "next/navigation"


gsap.registerPlugin(ScrollTrigger)

export default function AboutUs() {
  const router = useRouter()
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const buttonsRef = useRef([])
  const statsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          x: -100,
          skewY: 10,
        },
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
        },
      )

      // Description animation
      gsap.fromTo(
        descriptionRef.current,
        {
          opacity: 0,
          y: 30,
          filter: "blur(10px)",
        },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center+=100",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          delay: 0.2,
          ease: "power2.out",
        },
      )

      // Buttons animation
      buttonsRef.current.forEach((btn, index) => {
        gsap.fromTo(
          btn,
          {
            opacity: 0,
            y: 40,
            scale: 0.8,
          },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center+=150",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 0.3 + index * 0.15,
            ease: "back.out",
          },
        )
      })

      // Stats animation
      statsRef.current.forEach((stat, index) => {
        gsap.fromTo(
          stat,
          {
            opacity: 0,
            y: 50,
            scale: 0.7,
          },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center+=200",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: index * 0.15,
            ease: "back.out",
          },
        )

        // Hover animation
        stat.addEventListener("mouseenter", () => {
          gsap.to(stat, {
            duration: 0.3,
            y: -10,
            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)",
          })
        })

        stat.addEventListener("mouseleave", () => {
          gsap.to(stat, {
            duration: 0.3,
            y: 0,
            boxShadow: "0 10px 25px rgba(147, 51, 234, 0.2)",
          })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const stats = [
    { number: "100+", label: "Active Players" },
    { number: "24/7", label: "Server Uptime" },
    { number: "10+", label: "Unique Jobs" },
  ]

  return (
    <section ref={sectionRef} className="relative py-20 px-10 overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto">
        {/* Hero Content */}
        <div className="mb-20">
          <h2
            ref={titleRef}
            className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 leading-tight tracking-tighter"
          >
            ABOUT US
          </h2>

          <p ref={descriptionRef} className="text-foreground/80 leading-relaxed mb-10 text-sm md:text-base max-w-2xl">
        Flamecity Roleplay is a community built with quality and performance at its core. Everything we offer is created by the Flamecity development team specifically for our players. We work closely with our community to introduce new features and content, shaping a future that everyone can enjoy and feel proud of.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
            onClick={() => window.open("https://discord.gg/qVBGV2Yesp", "_blank")}
              ref={(el) => {
                if (el) buttonsRef.current[0] = el
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-700/50 border border-purple-600/50"
            >
              Join our Discord
            </button>
            <button
             onClick={() => router.push("/rules")}
              ref={(el) => {
                if (el) buttonsRef.current[1] = el
              }}
              className="px-8 py-3 border-2 border-purple-700/60 text-purple-400 hover:bg-purple-700/20 hover:border-purple-400 font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Read the Rules
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) statsRef.current[index] = el
              }}
              className="relative p-8 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/40 hover:border-purple-500/60 transition-all duration-300 shadow-lg shadow-purple-900/20 hover:shadow-purple-600/30 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/0 to-purple-600/0 group-hover:via-purple-500/10 transition-all duration-300 pointer-events-none" />

              <div className="relative z-10">
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-foreground/70 font-semibold text-sm md:text-base">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
