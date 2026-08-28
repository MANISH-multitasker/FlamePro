"use server"

import { getAdminPassword, isMasterOrDev } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * Check if the currently logged-in user has TEAM panel permission
 * granted by the master admin (or is the master admin / developer).
 * Returns the admin token only if permission exists.
 */
export async function checkTeamPermission(): Promise<{
  hasAccess: boolean
  token?: string
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return { hasAccess: false }
    }

    const discordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    })

    if (!discordAccount) {
      return { hasAccess: false }
    }

    // Master Admin / Developer has automatic access
    if (isMasterOrDev(discordAccount.accountId)) {
      const adminPassword = getAdminPassword()
      return { hasAccess: true, token: adminPassword }
    }

    // Check if they have TEAM permission granted by Master Admin
    const permission = await prisma.adminPermission.findUnique({
      where: {
        discordId_panel: {
          discordId: discordAccount.accountId,
          panel: "TEAM",
        },
      },
    })

    if (permission) {
      const adminPassword = getAdminPassword()
      return { hasAccess: true, token: adminPassword }
    }

    return { hasAccess: false }
  } catch (error) {
    console.error("Error checking team permission:", error)
    return { hasAccess: false }
  }
}
