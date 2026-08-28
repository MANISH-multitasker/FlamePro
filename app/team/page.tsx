"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  X,
  Plus,
  Trash2,
  Pencil,
  Users,
  Globe,
  Instagram,
  Youtube,
  ChevronRight,
  Upload,
  User,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { TeamDotBackground } from "@/components/team-dot-background"
import { checkTeamPermission } from "./actions"

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface Platform {
  type: "youtube" | "discord" | "instagram" | "kick" | "globe"
  url: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  description: string
  image: string
  platforms: Platform[]
  hidden?: boolean
}

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "flamecity_team_members"

const PLATFORM_OPTIONS = [
  { value: "youtube" as const, label: "YouTube" },
  { value: "discord" as const, label: "Discord" },
  { value: "instagram" as const, label: "Instagram" },
  { value: "kick" as const, label: "Kick" },
  { value: "globe" as const, label: "Other (Globe)" },
]

const HEX_CLIP = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)"

/* Cyberpunk card clip-path — beveled top-left & bottom-right corners */
const CARD_CLIP = "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"

/* ═══════════════════════════════════════════════════════════════════════
   PLATFORM ICONS
   ═══════════════════════════════════════════════════════════════════════ */

function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

function KickIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.333 2H12v6.667L8.667 12 12 15.333V22h3.333v-8L12 10.667 15.333 7.333V2zM8.667 2H5.333v20h3.334V2z" />
    </svg>
  )
}

function PlatformIcon({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  switch (type) {
    case "youtube":
      return <Youtube className={className} />
    case "discord":
      return <DiscordIcon className={className} />
    case "instagram":
      return <Instagram className={className} />
    case "kick":
      return <KickIcon className={className} />
    case "globe":
      return <Globe className={className} />
    default:
      return <Globe className={className} />
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function TeamPage() {
  /* ─── State ──────────────────────────────────────────────────────── */
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formImage, setFormImage] = useState("")
  const [formPlatforms, setFormPlatforms] = useState<Platform[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  // New platform input
  const [newPlatformType, setNewPlatformType] = useState<Platform["type"]>(
    "discord"
  )
  const [newPlatformUrl, setNewPlatformUrl] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ─── Fetch Team Members from API ───────────────────────────────── */
  const fetchMembers = async (token: string | null = adminToken) => {
    try {
      const headers: Record<string, string> = {}
      let url = "/api/team"
      if (token) {
        headers["x-admin-password"] = token
        url += "?all=true"
      }
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setTeamMembers(data)
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()

    // Auto-check if user has TEAM permission from master admin
    checkTeamPermission().then((res) => {
      if (res.hasAccess && res.token) {
        setAdminToken(res.token)
        setIsAuthenticated(true)
        // Re-fetch with admin access to see hidden members
        fetchMembers(res.token)
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─── Handlers ──────────────────────────────────────────────────── */

  const handlePasswordSubmit = async () => {
    if (!password) return
    try {
      const res = await verifyTeamAdminPassword(password)
      if (res.success && res.token) {
        setAdminToken(res.token)
        setIsAuthenticated(true)
        setShowPasswordModal(false)
        setShowAdminPanel(true)
        setPassword("")
        setPasswordError("")
        // Fetch all including hidden
        await fetchMembers(res.token)
      } else {
        setPasswordError("Incorrect password")
      }
    } catch {
      setPasswordError("Error verifying password")
    }
  }

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setShowAdminPanel(true)
    } else {
      setShowPasswordModal(true)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxSize = 300
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, width, height)
        setFormImage(canvas.toDataURL("image/jpeg", 0.8))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleAddPlatform = () => {
    if (!newPlatformUrl.trim()) return
    setFormPlatforms([
      ...formPlatforms,
      { type: newPlatformType, url: newPlatformUrl.trim() },
    ])
    setNewPlatformUrl("")
  }

  const handleRemovePlatform = (index: number) => {
    setFormPlatforms(formPlatforms.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setFormName("")
    setFormRole("")
    setFormDescription("")
    setFormImage("")
    setFormPlatforms([])
    setEditingId(null)
    setNewPlatformUrl("")
  }

  const handleSubmitMember = async () => {
    if (!formName.trim() || !formRole.trim()) return

    const payload = {
      name: formName.trim(),
      role: formRole.trim(),
      description: formDescription.trim(),
      image: formImage,
      platforms: formPlatforms,
    }

    try {
      const url = editingId ? `/api/team/${editingId}` : "/api/team"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-password": adminToken } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        resetForm()
        await fetchMembers()
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Failed to save team member")
      }
    } catch (err) {
      console.error("Error saving team member:", err)
      alert("Error saving team member")
    }
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingId(member.id)
    setFormName(member.name)
    setFormRole(member.role)
    setFormDescription(member.description)
    setFormImage(member.image)
    // Handle parsing in case platforms is returned as a JSON string from backend or is already array
    const platList = typeof member.platforms === "string"
      ? JSON.parse(member.platforms)
      : member.platforms
    setFormPlatforms([...(platList || [])])
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return

    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "DELETE",
        headers: {
          ...(adminToken ? { "x-admin-password": adminToken } : {}),
        },
      })

      if (res.ok) {
        await fetchMembers()
      } else {
        alert("Failed to delete team member")
      }
    } catch (err) {
      console.error("Error deleting team member:", err)
    }
  }

  const handleToggleHide = async (id: string) => {
    const member = teamMembers.find((m) => m.id === id)
    if (!member) return

    try {
      const res = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-password": adminToken } : {}),
        },
        body: JSON.stringify({ hidden: !member.hidden }),
      })

      if (res.ok) {
        await fetchMembers()
      } else {
        alert("Failed to toggle visibility")
      }
    } catch (err) {
      console.error("Error toggling visibility:", err)
    }
  }

  const visibleMembers = teamMembers.filter((m) => !m.hidden)

  /* ─── Render ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          ANIMATED INTERACTIVE PURPLE DOT BACKGROUND
          ═══════════════════════════════════════════════════════════════ */}
      <TeamDotBackground />

      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════════════ */}
      <Navigation />

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-32 pb-14 text-center px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="h-[1px] w-10 sm:w-20 bg-gradient-to-r from-transparent to-purple-500/60" />
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-purple-400 font-bold">
            THE MINDS BEHIND FLAME CITY
          </p>
          <div className="h-[1px] w-10 sm:w-20 bg-gradient-to-l from-transparent to-purple-500/60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center justify-center mb-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic tracking-wider leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-3">
            TEAM BEHIND
          </h1>
          <img
            src="/flame-city-text.png"
            alt="Flame City"
            className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_35px_rgba(168,85,247,0.7)]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-white/60 max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
        >
          A passionate and dedicated team working 24/7 to bring you the most
          immersive roleplay experience in Los Santos.
        </motion.p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TEAM CARDS GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          /* Skeleton loader — avoids layout shift while data fetches */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="relative animate-pulse"
                style={{ clipPath: CARD_CLIP }}
              >
                <div className="bg-purple-900/10 border border-purple-500/10 p-6 text-center" style={{ clipPath: CARD_CLIP }}>
                  <div className="mx-auto mb-5 h-5 w-24 rounded bg-white/5" />
                  <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-white/5" />
                  <div className="h-4 w-3/4 mx-auto rounded bg-white/5 mb-2" />
                  <div className="h-3 w-full mx-auto rounded bg-white/5 mb-1" />
                  <div className="h-3 w-2/3 mx-auto rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 mx-auto text-purple-500/30 mb-4" />
            <p className="text-white/30 text-lg">
              Team members coming soon
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="relative group"
              >
                {/* ─── Cyberpunk Card ─── */}
                <div className="relative" style={{ clipPath: CARD_CLIP }}>
                  {/* Animated border layer */}
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-600/20 to-purple-800/40 transition-all duration-500 group-hover:from-purple-400/70 group-hover:via-violet-500/40 group-hover:to-purple-600/70"
                  />

                  {/* Card inner content */}
                  <div
                    className="relative m-[1.5px] bg-[#0a0a18]/95 backdrop-blur-sm p-6 text-center h-full transition-all duration-500"
                    style={{ clipPath: CARD_CLIP }}
                  >
                    {/* Corner accent lines */}
                    <div className="absolute top-0 left-[20px] w-12 h-px bg-gradient-to-r from-purple-500/50 to-transparent transition-all duration-500 group-hover:from-purple-400 group-hover:w-20" />
                    <div className="absolute top-[20px] left-0 h-12 w-px bg-gradient-to-b from-purple-500/50 to-transparent transition-all duration-500 group-hover:from-purple-400 group-hover:h-20" />
                    <div className="absolute bottom-0 right-[20px] w-12 h-px bg-gradient-to-l from-purple-500/50 to-transparent transition-all duration-500 group-hover:from-purple-400 group-hover:w-20" />
                    <div className="absolute bottom-[20px] right-0 h-12 w-px bg-gradient-to-t from-purple-500/50 to-transparent transition-all duration-500 group-hover:from-purple-400 group-hover:h-20" />

                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/[0.03] transition-all duration-500 pointer-events-none" style={{ clipPath: CARD_CLIP }} />

                    {/* Decorative dots */}
                    <div className="absolute top-3 right-3 grid grid-cols-2 gap-0.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-white/15 group-hover:bg-purple-400/30 transition-colors duration-500"
                        />
                      ))}
                    </div>

                    {/* Role Badge */}
                    <div className="mb-5">
                      <span className="inline-block px-4 py-1.5 text-[11px] tracking-[0.15em] uppercase font-semibold bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 text-purple-300" style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}>
                        {member.role}
                      </span>
                    </div>

                    {/* Hexagonal Avatar */}
                    <div className="relative w-28 h-28 mx-auto mb-5">
                      {/* Glow effect */}
                      <div className="absolute inset-[-8px] bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-400/30 transition-all duration-500" />
                      {/* Hex border */}
                      <div
                        className="absolute inset-0 bg-gradient-to-b from-purple-400 via-purple-600 to-purple-800 group-hover:from-purple-300 group-hover:via-purple-500 group-hover:to-purple-700 transition-all duration-500"
                        style={{ clipPath: HEX_CLIP }}
                      />
                      {/* Hex image */}
                      <div
                        className="absolute inset-[3px] bg-[#0a0a18] overflow-hidden"
                        style={{ clipPath: HEX_CLIP }}
                      >
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-purple-900/30">
                            <User className="w-10 h-10 text-purple-400/50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-bold text-white mb-2">
                      {member.name}
                    </h3>

                    {/* Description */}
                    {member.description && (
                      <p className="text-white/40 text-xs leading-relaxed mb-4 px-2">
                        {member.description}
                      </p>
                    )}

                    {/* Platform Icons */}
                    {member.platforms.length > 0 && (
                      <div className="flex gap-2.5 justify-center mt-auto pt-2">
                        {member.platforms.map((platform, i) => (
                          <a
                            key={i}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center text-white/50 border border-purple-500/20 hover:text-white hover:border-purple-400/60 hover:bg-purple-500/10 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)] transition-all duration-300"
                            style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
                          >
                            <PlatformIcon
                              type={platform.type}
                              className="w-3.5 h-3.5"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA – "WANT TO JOIN OUR TEAM?"
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0d0d1a]/80 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-600/15 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-wide">
                WANT TO JOIN OUR TEAM?
              </h3>
              <p className="text-white/40 text-sm mt-0.5">
                We&apos;re always looking for passionate and talented
                individuals to be part of the Flame City Roleplay family.
              </p>
            </div>
          </div>
          <Link
            href="/applications"
            className="flex items-center gap-2 px-6 py-3 border border-purple-500/40 rounded-full text-sm font-semibold tracking-wider text-white hover:bg-purple-500/10 hover:border-purple-500/60 transition-all duration-200 whitespace-nowrap group"
          >
            VIEW OPEN POSITIONS
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {isAuthenticated && (
        <div className="relative z-10 flex justify-end px-8 pb-1">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-purple-500/30 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-purple-500/10 transition-colors"
          >
            <Lock size={14} className="text-purple-400" />
            Team Management
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <Footer />

      {/* ═══════════════════════════════════════════════════════════════
          ADMIN PANEL
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4 pt-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-[#0a0a15] border border-purple-500/25 rounded-xl w-full max-w-3xl my-6 shadow-2xl"
            >
              {/* ─── Panel Header ─── */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/15">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Team Management
                </h2>
                <button
                  onClick={() => {
                    setShowAdminPanel(false)
                    resetForm()
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* ─── ADD / EDIT FORM ─── */}
                <div>
                  <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                    {editingId ? "Edit Member" : "Add New Member"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                    {/* Image Upload */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 border-2 border-dashed border-purple-500/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors overflow-hidden"
                      >
                        {formImage ? (
                          <img
                            src={formImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-purple-500/40 mb-1" />
                            <span className="text-[10px] text-white/30">
                              Upload
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Text Fields */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Member name *"
                        className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/15 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors"
                      />
                      <input
                        type="text"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="Role (e.g. Founder & Owner 🔥) *"
                        className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/15 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors"
                      />
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Short description..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/15 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* ─── Platform Links ─── */}
                  <div className="mt-5">
                    <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">
                      Platform Links
                    </p>

                    {/* Existing platforms */}
                    {formPlatforms.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {formPlatforms.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2"
                          >
                            <PlatformIcon
                              type={p.type}
                              className="w-4 h-4 text-purple-400 flex-shrink-0"
                            />
                            <span className="text-xs text-white/60 capitalize flex-shrink-0">
                              {p.type === "globe" ? "Other" : p.type}
                            </span>
                            <span className="text-xs text-white/30 truncate flex-1">
                              {p.url}
                            </span>
                            <button
                              onClick={() => handleRemovePlatform(i)}
                              className="text-red-400/60 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new platform */}
                    <div className="flex gap-2">
                      <select
                        value={newPlatformType}
                        onChange={(e) =>
                          setNewPlatformType(
                            e.target.value as Platform["type"]
                          )
                        }
                        className="px-3 py-2 bg-white/5 border border-purple-500/15 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/40 transition-colors"
                      >
                        {PLATFORM_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-[#0a0a15]"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={newPlatformUrl}
                        onChange={(e) => setNewPlatformUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-purple-500/15 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-purple-500/40 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddPlatform()
                          }
                        }}
                      />
                      <button
                        onClick={handleAddPlatform}
                        className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/25 rounded-lg text-purple-300 text-sm transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Submit / Cancel */}
                  <div className="flex gap-3 mt-6">
                    {editingId && (
                      <button
                        onClick={resetForm}
                        className="px-5 py-2.5 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={handleSubmitMember}
                      disabled={!formName.trim() || !formRole.trim()}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/30 disabled:text-white/30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {editingId ? "Update Member" : "Add Member"}
                    </button>
                  </div>
                </div>

                {/* ─── EXISTING MEMBERS LIST ─── */}
                {teamMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                      Current Members ({teamMembers.length})
                    </h3>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`flex items-center gap-4 border rounded-lg px-4 py-3 ${member.hidden
                              ? "bg-yellow-900/[0.06] border-yellow-500/15 opacity-60"
                              : "bg-white/[0.03] border-purple-500/10"
                            }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-900/30 flex-shrink-0">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-400/40" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-white/30 truncate">
                              {member.role}
                              {member.hidden && (
                                <span className="ml-2 text-[10px] text-yellow-500/60 uppercase tracking-wider">hidden</span>
                              )}
                            </p>
                          </div>
                          {/* Platform count */}
                          <span className="text-xs text-white/20 hidden sm:block">
                            {member.platforms.length} link
                            {member.platforms.length !== 1 ? "s" : ""}
                          </span>
                          {/* Actions */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-1.5 text-white/30 hover:text-purple-400 transition-colors rounded"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleHide(member.id)}
                              className={`p-1.5 transition-colors rounded ${member.hidden
                                  ? "text-yellow-500/60 hover:text-yellow-400"
                                  : "text-white/30 hover:text-emerald-400"
                                }`}
                              title={member.hidden ? "Show on page" : "Hide from page"}
                            >
                              {member.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 text-white/30 hover:text-red-400 transition-colors rounded"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
