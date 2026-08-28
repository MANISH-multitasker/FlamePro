'use client'

import Link from "next/link"
import FluidText from "@/components/fluid-text"

export default function Footer() {
  return (
    <footer className="absolute left-0 right-0 border-t border-primary/30 py-5">
      <div className="text-sm text-foreground/60 flex flex-col items-center text-center">

        {/* Logo */}
        <img
          src="./logo.png"
          alt="Flame City Roleplay Logo"
          className="h-6 sm:h-8"
        />

        {/* Copyright */}
        <p className="mt-3">
          &copy; 2025 Flamecity Roleplay. All rights reserved.
        </p>

        {/* Developer Credit */}
        <div className="mb-3 mt-2 flex items-center justify-center gap-2">
          <span>Developed By</span>
          <div className="inline-flex items-center justify-center">
            <FluidText
              text="Manish Rao"
              color="#FFFFFF"
              paletteColors={["#EF4444", "#DC2626", "#B91C1C", "#F87171", "#FF0055"]}
              font={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                lineHeight: "1.2em",
                textAlign: "center",
              }}
              style={{ width: "115px", height: "26px" }}
            />
          </div>
        </div>

        {/* Footer Links */}
        {/* <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div> */}

      </div>
    </footer>
  )
}
