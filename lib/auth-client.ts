import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_CLIENT_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),
})