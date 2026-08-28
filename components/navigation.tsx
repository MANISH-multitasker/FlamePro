"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { DiscordLogo } from "@/components/discord-logo";
import {
  Home,
  ScrollText,
  Send,
  Info,
  Menu,
  X,
  Youtube,
  Instagram,
  Users,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { checkIsMasterAdmin } from "@/app/master-admin/actions";


export default function Navigation() {
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (session?.user) {
      checkIsMasterAdmin()
        .then((res) => setIsMasterAdmin(res))
        .catch(() => setIsMasterAdmin(false));
    } else {
      setIsMasterAdmin(false);
    }
  }, [session?.user]);

  const handleLogin = async () => {
    console.log("before discord")
    try {
      await authClient.signIn.social({
        provider: "discord",
      });
      console.log("AFTER DISCORD");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  const handleLogout = async () => {
     authClient.signOut()
     setIsMasterAdmin(false)
  }

  const navItems = [
    ...(isMasterAdmin
      ? [{ href: "/master-admin", icon: Crown, label: "Admin" }]
      : []),
    { href: "/", icon: Home, label: "Home" },
    { href: "/rules", icon: ScrollText, label: "Rules" },
    { href: "/applications", icon: ScrollText, label: "Applications" },
    {
      href: "/team",
      icon: Users,
      label: "Team",
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || session?.user,
  );

  // Detect scroll background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-5 right-5 z-50 transition-all duration-500 
        ${
          isScrolled
            ? "bg-background/60 backdrop-blur-sm border border-primary/30 rounded-b-2xl"
            : "bg-transparent border-transparent"
        }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <motion.img
                src="/logo.png"
                alt="Flame City Roleplay Logo"
                className="h-6 sm:h-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              />
            </motion.div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="flex gap-8">
            <div className="hidden md:flex items-center gap-1 relative">
              {visibleItems.map(({ href, icon: Icon, label }, i) => {
                const isActive = pathname === href;

                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                    className="relative"
                  >
                    <Button
                      variant="nav"
                      size="sm"
                      asChild
                      className={`relative px-6 py-2 rounded-full transition-colors
    ${isActive ? "text-primary" : "text-white/80 hover:text-primary"}
  `}
                    >
                      <Link
                        href={href}
                      >
                        <Icon className="mr-1 h-4 w-4" />
                        {label}
                      </Link>
                    </Button>

                    {/* LAMP ACTIVE EFFECT */}
                    {isActive && (
                      <motion.div
                        layoutId="lamp"
                        className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-t-full">
                          <div className="absolute w-12 h-6 bg-primary/20 rounded-full] blur-md -top-2 -left-2" />
                          <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                          <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.15 + visibleItems.length * 0.05,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={session?.user ? handleLogout : handleLogin}
                  className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-full transition-colors"
                >
                  {isPending ? "Loading..." : session?.user ? "Logout" : "Login"}
                </button>
              </motion.div>
              <motion.div
                className="ml-5 flex items-center space-x-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + visibleItems.length * 0.05, duration: 0.4, ease: "easeOut" }}
              >
                <Link
                  href="https://discord.gg/xwJ4HMExj7"
                  className="text-blue-300 hover:text-blue-500 transition-colors"
                >
                  <DiscordLogo />
                </Link>
                <Link
                  href="https://www.youtube.com/@flame_city_roleplay"
                  className="text-red-400 hover:text-red-500 transition-colors"
                >
                  <Youtube size={20} />
                </Link>
                <Link
                  href="https://www.instagram.com/flamecityroleplay"
                  className="text-pink-400 hover:text-pink-500 transition-colors"
                >
                  <Instagram size={18} />
                </Link>
              </motion.div>
            </div>

            {/* DISCORD BUTTON */}
            {/* <motion.div 
              className="hidden md:flex"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                className="bg-[transparent] text-white hover:text-[#5865F2]/90 hover:bg-[transparent] border border-white hover:border-[#5865F2]"
                onClick={() => window.open("https://discord.gg/wnH3x7mekR", "_blank")}
              >
                <DiscordLogo className="mr-1 h-5 w-5" /> Join Discord
              </Button>
            </motion.div> */}

            {/* <motion.div 
             className="flex items-center space-x-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="https://discord.gg/wnH3x7mekR"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <DiscordLogo/>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={18} />
              </Link>
            </motion.div> */}
          </div>

          {/* MOBILE MENU BUTTON */}
          <motion.button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="md:hidden absolute top-16 left-0 w-full bg-background/50 backdrop-blur-lg border-b border-border shadow-lg"
            >
              <div className="flex flex-col items-center py-4 space-y-4 ">
                {visibleItems.map(({ href, icon: Icon, label }, i) => {
                  const isActive = pathname === href;

                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                      <Link
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 text-lg px-4 py-2 rounded-full
                          ${isActive ? "text-primary bg-primary/10" : "hover:text-primary"}
                        `}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </Link>

                      {/* Mobile active lamp effect */}
                      {isActive && (
                        <motion.div
                          layoutId="lamp-mobile"
                          className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                        />
                      )}
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: visibleItems.length * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (session?.user) {
                        handleLogout();
                      } else {
                        handleLogin();
                      }
                      setIsOpen(false);
                    }}
                    className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-full transition-colors"
                  >
                    {isPending ? "Loading..." : session?.user ? "Logout" : "Login"}
                  </button>
                </motion.div>

                {/* Discord in Mobile */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (visibleItems.length + 1) * 0.1 }}
                >
                  
                  <Button
                    size="lg"
                    className="bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
                    onClick={() =>
                      window.open("https://discord.gg/wnH3x7mekR", "_blank")
                    }
                  >
                    <DiscordLogo className="mr-2 h-5 w-5" /> Join Discord
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
