'use client'
import { BackgroundBeams } from "@/components/bgflame";
import { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import { Button } from "@/components/neon-button"

export default function HeroSection() {

  const [playerCount, setPlayerCount] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const apiUrl = "https://servers-frontend.fivem.net/api/servers/single/gmy9go"

    function updatePlayerCount() {
      fetch(apiUrl)
        .then((res) => res.json())
        .then((json) => {
          const data = json?.Data;

          if (data?.clients !== undefined && data?.sv_maxclients !== undefined) {
            setPlayerCount(`${data.clients}/${data.sv_maxclients}`);
            setIsOnline(true);
          } else {
            setPlayerCount(null);
            setIsOnline(false);
          }
        })
        .catch(() => {
          setPlayerCount(null);
          setIsOnline(false);
        });
    }

    updatePlayerCount();
    const interval = setInterval(updatePlayerCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-dvh flex items-center justify-center p-6 overflow-hidden">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://r2.fivemanage.com/vSgbk1zUCvPYJUM2qKhxY/flamecity.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="bg-background/70 absolute inset-0 backdrop-blur-md"></div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-8 text-white">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src="./logo.png"
            className="mx-auto drop-shadow-[0_10px_20px_rgba(128,0,255,0.6)]"
            alt="FlameCity"
          />
        </motion.div>


        {/* Status Box */}
        <div className="flex items-center justify-center gap-5">

          {/* Pulse Orb */}
          <div className="relative">
            {/* Ping animation */}
            <div
              className={`w-4 h-4 rounded-full absolute opacity-75 animate-ping
              ${isOnline ? "bg-green-400" : "bg-red-400"}`}
            ></div>

            {/* Solid orb */}
            <div
              className={`w-4 h-4 rounded-full relative
              ${isOnline ? "bg-green-500" : "bg-red-500"}`}
            ></div>
          </div>

          {/* Text */}
          <div className="text-left">
            {isOnline && (
              <>
                <p className="text-sm text-white/70 tracking-wide">Players Online</p>

                <motion.p
                  key={playerCount}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-bold text-white drop-shadow"
                >
                  {playerCount}
                </motion.p>
              </>

            )}


            {!isOnline && (
              <p className="text-sm text-red-400 tracking-wide font-semibold">
                Server Offline
              </p>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.href = "fivem://connect/7gxpxr"}
                className="cursor-pointer"
              >
                Play Now
              </Button>
            </div>
          </motion.div>

        </div>

      </div>

      <BackgroundBeams />
    </div>
  )
}
