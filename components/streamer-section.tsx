"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function StremerSection() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const streamersRef = useRef([])

  const streamers = [
    {
      name: "RakaZone Gaming",
      image: "https://yt3.googleusercontent.com/ytc/AIdro_l5r_8RrLxgC7ZRGUcgy19D0omYu4GwYyR9mKbn9wVcxxo=s160-c-k-c0x00ffffff-no-rj",
      youtubeUrl: "https://www.youtube.com/rakazonegaming",
    },
    {
      name: "TbOne",
      image: "https://yt3.googleusercontent.com/Yp7KsP2BOw00iiuLkdswtkXND2ykVeDjbq_ek3Ys-y5w0kSZ62Do5bW-fsTVPnlZs6TDnnRSFw=s160-c-k-c0x00ffffff-no-rj",
      youtubeUrl: "https://www.youtube.com/@TbOnetv",
    },
    {
      name: "QAYZER GAMING",
      image: "https://yt3.googleusercontent.com/1cd2ocspJlhqU7gGkVDReum1LjvGURbNNH7mZiBmoOEqSiImDNb1FDO8M9gsveHzrNlITh5J=s160-c-k-c0x00ffffff-no-rj",
      youtubeUrl: "https://www.youtube.com/@QAYZERGAMING",
    },
    {
      name: "Raman Chopra",
      image: "https://yt3.googleusercontent.com/lfPbstEOr172QNuTYiUx6zaBdmak6uWdEtcX0R9ImJM-tneoEpcMfJMYK7lTgVnDZQV0EKZOPg=s160-c-k-c0x00ffffff-no-rj",
      youtubeUrl: "https://www.youtube.com/@RamanChopra",
    },
  ]

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

      // Streamer cards animation
      streamersRef.current.forEach((streamer, index) => {
        gsap.fromTo(
          streamer,
          {
            opacity: 0,
            y: 50,
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
            delay: index * 0.15,
            ease: "back.out",
          },
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 px-10 overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto">
        {/* Hero Content */}
        <div className="mb-20">
            <h2
              ref={titleRef}
              className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-300 leading-tight tracking-tighter"
            >
              FEATURED STREAMERS
            </h2>

          <p ref={descriptionRef} className="text-foreground/80 leading-relaxed mb-10 text-sm md:text-base max-w-2xl">
            Watch the most talented Flamecity roleplayers showcase their skills. From thrilling heists to immersive
            roleplay moments, discover what makes our community exceptional.
          </p>
        </div>

        {/* Streamers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 justify-items-center">
          {streamers.map((streamer, idx) => (
            <div
              key={idx}
              ref={(el) => {
                if (el) streamersRef.current[idx] = el
              }}
              className="relative group flex flex-col items-center text-center transition-all duration-300 w-full max-w-xs"
            >
           

              <div className="relative mb-6 group">
                {/* <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-full opacity-100 blur-lg animate-pulse" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-80 blur-md" /> */}

                <img
                  src={streamer.image || "/placeholder.svg?height=200&width=200&query=streamer profile"}
                  alt={streamer.name}
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-purple-400/80 shadow-2xl"
                />
              </div>

              {/* Name and Role */}
              <h3 className="text-2xl font-bold text-white mb-1">{streamer.name}</h3>
              <p className="text-foreground/70 text-sm font-medium mb-6">Streamer</p>

              {/* YouTube Button */}
              <a
                href={streamer.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg transition-all duration-300 border border-red-600/50 flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
