"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { authClient } from "@/lib/auth-client"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { checkMyPermission } from "@/app/admin/actions"

gsap.registerPlugin(ScrollTrigger)

type ApplicationCard = {
  title: string
  description: string
  href?: string
  isOpen: boolean
  closedReason?: string
  buttonText?: string
  requiresAuth?: boolean
}

const applications: ApplicationCard[] = [
  {
    title: "GET WHITELIST",
    description:
      "Take our official Whitelist Quiz to join Flame City Roleplay. Test your knowledge of server rules, roleplay etiquette, and key concepts to get verified.",
    href: "https://quiz.flamecityroleplay.com/",
    isOpen: true,
    buttonText: "Start Quiz",
    requiresAuth: false,
  },
  {
    title: "Staff Application",
    description:
      "Thank you for your interest in joining the Regional Staff Team. Regional Staff play an important role in supporting players, maintaining a positive environment, and helping the server grow.",
    href: "/applications/regionalStaff",
    isOpen: true,
    requiresAuth: true,
  },
  {
    title: "EMS Application",
    description:
      "Become part of the Emergency Medical Services and provide life-saving care to citizens. We are looking for compassionate and professional responders.",
    href: "/applications/ems",
    isOpen: true,
    requiresAuth: true,
  },
  {
    title: "PD Application",
    description:
      "Join the Police Department recruitment and serve with honor, integrity, and discipline while helping keep the city safe.",
    href: "/applications/pd",
    isOpen: true,
    requiresAuth: true,
  },
  // {
  //   title: "Streamers Application",
  //   description:
  //     "The Moore Streamers Program supports creators who produce immersive, high-quality roleplay content while helping grow the city community.",
  //   href: "/applications/streamers",
  //   isOpen: true,
  //   requiresAuth: true,
  // },
]

function ApplicationsPage() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const labelRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const buttonsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([])

  const [hasAppPermission, setHasAppPermission] = useState(false)

  // Check if user has APPLICATION permission from master admin
  useEffect(() => {
    checkMyPermission("APPLICATION").then((res) => {
      if (res.hasAccess) setHasAppPermission(true)
    }).catch(() => {})
  }, [])

  const handleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "discord",
      })
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  

  useEffect(() => {
    const hoverCleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
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

      gsap.fromTo(
        labelRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top center+=130",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
      )

      cardsRef.current.forEach((card, index) => {
        if (!card) return

        gsap.fromTo(
          card,
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
            delay: index * 0.12,
            ease: "back.out",
          },
        )

        const handleEnter = () => {
          gsap.to(card, {
            duration: 0.3,
            y: -10,
            boxShadow: "0 20px 40px rgba(147, 51, 234, 0.35)",
          })
        }

        const handleLeave = () => {
          gsap.to(card, {
            duration: 0.3,
            y: 0,
            boxShadow: "0 10px 25px rgba(147, 51, 234, 0.2)",
          })
        }

        card.addEventListener("mouseenter", handleEnter)
        card.addEventListener("mouseleave", handleLeave)

        hoverCleanups.push(() => {
          card.removeEventListener("mouseenter", handleEnter)
          card.removeEventListener("mouseleave", handleLeave)
        })
      })

      buttonsRef.current.forEach((btn, index) => {
        if (!btn) return

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
              start: "top center+=220",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 0.3 + index * 0.08,
            ease: "back.out",
          },
        )
      })
    }, sectionRef)

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup())
      ctx.revert()
    }
  }, [])


  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-background px-6 py-20 sm:px-10">
      <Navigation />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mx-auto mb-14 max-w-3xl text-center">
          <h2
            ref={titleRef}
            className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-purple-300 to-purple-500 leading-tight tracking-tighter"
          >
            APPLY FOR ROLES
          </h2>
          <p ref={descriptionRef} className="mt-5 text-sm text-foreground/65 sm:text-base">
            Join whitelist factions, staff positions, and request special server permissions.
          </p>
        </header>

        <div ref={labelRef} className="mb-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-purple-300">
          <span className="inline-block h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_12px_hsl(var(--accent))]" />
          Available Whitelists
        </div>

        {!session?.user && (
          <div className="mb-10 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-purple-950/60 p-6 md:p-8 backdrop-blur-md text-center shadow-xl shadow-purple-950/50">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#5865F2]/20 flex items-center justify-center border border-[#5865F2]/30">
              <svg className="w-6 h-6 fill-[#5865F2]" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sign in to Access Application Forms</h3>
            <p className="text-sm text-foreground/60 max-w-md mx-auto mb-5">
              Connect with your Discord account to fill out and submit whitelist faction and staff applications.
            </p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#5865F2]/30 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Connect Discord to Apply
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application, index) => (
            <article
              key={application.title}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className="group relative p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-700/40 flex min-h-88 flex-col hover:border-purple-500/60 transition-all duration-300 shadow-lg shadow-purple-900/15 cursor-pointer overflow-hidden"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-r from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex h-full flex-col items-center">
                <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight text-foreground">{application.title}</h2>

                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-foreground/55">{application.description}</p>

                {application.closedReason ? (
                  <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-foreground/55">
                    {application.closedReason}
                  </div>
                ) : (
                  <div className="mt-6" />
                )}

                <div className="mt-auto pt-6">
                  {application.isOpen && application.href ? (
                    !application.requiresAuth || session?.user ? (
                      application.href.startsWith("http") ? (
                        <a
                          href={application.href}
                          ref={(el) => {
                            buttonsRef.current[index] = el
                          }}
                          className="px-14 sm:px-16 md:px-24 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-700/50 border border-purple-600/50 inline-block text-center"
                        >
                          {application.buttonText || "Start Application"}
                        </a>
                      ) : (
                        <Link
                          href={application.href}
                          ref={(el) => {
                            buttonsRef.current[index] = el
                          }}
                          className="px-14 sm:px-16 md:px-24 py-3 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-700/50 border border-purple-600/50 inline-block text-center"
                        >
                          {application.buttonText || "Start Application"}
                        </Link>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleLogin}
                        ref={(el) => {
                          buttonsRef.current[index] = el
                        }}
                        className="px-10 sm:px-14 md:px-16 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#5865F2]/40 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Login to Apply
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled
                      ref={(el) => {
                        buttonsRef.current[index] = el
                      }}
                      className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-foreground/10 bg-foreground/4 px-4 py-3 text-sm font-black uppercase tracking-wide text-foreground/35"
                    >
                      Intake Closed
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {hasAppPermission && (
        <div className="relative z-10 flex justify-end px-8 pt-16 pb-1">
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/30 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-purple-500/10 transition-colors"
          >
            <Lock size={14} className="text-purple-400" />
            Admin Panel
          </button>
        </div>
      )}

      <Footer />
    </section>
  )
}

export default ApplicationsPage