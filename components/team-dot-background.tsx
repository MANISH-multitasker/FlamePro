"use client"

import React, { useEffect, useRef } from "react"

interface Dot {
  x: number
  y: number
  baseOpacity: number
  currentOpacity: number
  size: number
  currentSize: number
  pulseSpeed: number
  pulseOffset: number
}

export function TeamDotBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let dots: Dot[] = []
    const spacing = 36 // Clean matrix spacing matching reference design
    const radius = 200 // Mouse cursor interaction radius
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0

    const initDots = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)

      dots = []
      const cols = Math.ceil(width / spacing) + 1
      const rows = Math.ceil(height / spacing) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing
          const y = r * spacing
          const baseOpacity = 0.22 + (Math.sin(c * 0.5) * Math.cos(r * 0.5)) * 0.06
          dots.push({
            x,
            y,
            baseOpacity,
            currentOpacity: baseOpacity,
            size: 1.6,
            currentSize: 1.6,
            pulseSpeed: 0.015 + (Math.sin(c + r) * 0.008),
            pulseOffset: (c * 0.3 + r * 0.4) % (Math.PI * 2),
          })
        }
      }
    }

    initDots()

    const handleResize = () => {
      initDots()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    let time = 0

    const render = () => {
      time += 0.025
      ctx.clearRect(0, 0, width, height)

      const mouse = mouseRef.current

      // If mouse is active, draw soft radial light aura under cursor
      if (mouse.active) {
        const glowGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          radius * 1.2
        )
        glowGradient.addColorStop(0, "rgba(168, 85, 247, 0.12)")
        glowGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.05)")
        glowGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, radius * 1.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw each dot with interactive distance calculation
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        // Ambient pulse
        const ambientPulse = Math.sin(time * 2 + dot.pulseOffset) * 0.06
        let targetOpacity = dot.baseOpacity + ambientPulse
        let targetSize = dot.size

        if (mouse.active) {
          const dx = mouse.x - dot.x
          const dy = mouse.y - dot.y
          const distSq = dx * dx + dy * dy

          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq)
            const factor = 1 - dist / radius
            // Near cursor: power curve for sharp glowing center
            const eased = factor * factor
            targetOpacity = Math.min(1.0, dot.baseOpacity + eased * 0.9)
            targetSize = dot.size + eased * 2.2
          }
        }

        // Smooth easing towards target
        dot.currentOpacity += (targetOpacity - dot.currentOpacity) * 0.18
        dot.currentSize += (targetSize - dot.currentSize) * 0.18

        const isGlow = dot.currentOpacity > 0.45

        // Dot color: bright violet/purple glow when active
        if (isGlow) {
          // Outer glow ring
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.currentSize * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(168, 85, 247, ${dot.currentOpacity * 0.28})`
          ctx.fill()

          // Core bright dot
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(233, 213, 255, ${Math.min(1, dot.currentOpacity * 1.2)})`
          ctx.fill()
        } else {
          // Ambient dot
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(168, 85, 247, ${dot.currentOpacity})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Interactive canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Atmospheric ambient glow spots */}
      <div className="absolute top-[15%] left-[20%] w-[550px] h-[550px] bg-purple-600/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] bg-violet-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}
