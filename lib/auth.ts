import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { genericOAuth } from "better-auth/plugins"

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  secret: process.env.BETTER_AUTH_SECRET || "flamecity-fallback-secret-2025",
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || "missing_client_id",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "missing_client_secret",
    },
  },
   plugins: [
        genericOAuth({ 
            config: [ 
                { 
                    providerId: "steam", 
                    clientId: "test-client-id", 
                    clientSecret: "test-client-secret", 
                    discoveryUrl: "https://auth.example.com/.well-known/openid-configuration", 
                    // ... other config options
                }, 
                // Add more providers as needed
            ] 
        }) 
    ]
});
export type Session = typeof auth.$Infer.Session