"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Users, Star, TrendingUp, Code, Shield, Zap } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export default function FeaturesSection() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef([])

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

      // Cards animation
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
            scale: 0.8,
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
            delay: index * 0.12,
            ease: "back.out",
          },
        )

        // Hover animation
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            duration: 0.3,
            y: -8,
            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            duration: 0.3,
            y: 0,
            boxShadow: "0 10px 25px rgba(147, 51, 234, 0.15)",
          })
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
  {
    icon: Shield,
    title: "Dependable Staff",
    description:
      "Tired of roleplay sessions being cut short due to interruptions? Our trained staff members are always available to guide, support, and resolve issues professionally, ensuring a smooth experience for every player.",
  },
  {
    icon: Code,
    title: "Continuous Development",
    description:
      "Our development team works tirelessly to deliver new improvements almost every day. From custom features to performance refinements, Flamecity evolves constantly to offer a seamless experience.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Flamecity thrives on the creativity and diversity of its players. From storytelling to exploration, we encourage a welcoming space where every member’s contribution enriches the community.",
  },
  {
    icon: Zap,
    title: "Exclusive Content",
    description:
      "Enjoy a wide variety of custom gameplay additions designed to keep your journey exciting. Frequent updates, unique mechanics, and tailor-made scripts ensure every moment feels fresh and engaging.",
  },
  {
    icon: Star,
    title: "Premium Roleplay Standards",
    description:
      "We uphold a high standard of roleplay to help you fully immerse yourself in the world you’ve imagined. With structured moderation and attentive staff, the environment stays respectful and captivating.",
  },
  {
    icon: TrendingUp,
    title: "Fair & Realistic Economy",
    description:
      "Our economic system is carefully balanced to ensure fairness for both newcomers and veterans. Built on real-world principles, it offers a grounded and rewarding in-game financial experience.",
  },
];


  return (
    <section ref={sectionRef} className="relative py-20 px-10 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto">
        {/* Title */}
        <h2
          ref={titleRef}
          className="text-5xl md:text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500"
        >
          WHAT WE OFFER
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="group relative p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/40 hover:border-purple-500/60 transition-all duration-300 shadow-lg shadow-purple-900/15 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-400/0 to-purple-600/0 group-hover:via-purple-500/10 transition-all duration-300 pointer-events-none" />

                <div className="relative z-10 flex gap-4">
                  {/* Icon container */}
                  <div className="flex-shrink-0 pt-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/30 to-purple-700/30 flex items-center justify-center border border-purple-600/50 group-hover:border-purple-500/80 transition-all duration-300">
                      <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-200 mb-2 group-hover:text-purple-100 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed group-hover:text-foreground/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  {/* Chevron icon */}
                  <div className="flex-shrink-0 flex items-start pt-1">
                    <svg
                      className="w-5 h-5 text-purple-600 group-hover:text-purple-400 transition-all duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
