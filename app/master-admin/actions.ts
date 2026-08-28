"use server";

import { prisma } from "@/lib/db";
import { AdminPanel } from "@/lib/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { DEV_DISCORD_ID, isMasterOrDev } from "@/lib/admin-auth";

/**
 * Check if the current user is the master admin or developer.
 */
export async function requireMasterAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Not logged in");
  }

  const discordAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "discord",
    },
  });

  if (!discordAccount || !isMasterOrDev(discordAccount.accountId)) {
    throw new Error("Unauthorized — not the master admin or developer");
  }

  return { discordId: discordAccount.accountId };
}

/**
 * Check if current user is the master admin (non-throwing version).
 */
export async function checkIsMasterAdmin(): Promise<boolean> {
  try {
    await requireMasterAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Grant panel permission to a Discord user with Name and Reason.
 */
export async function grantPermission(
  discordId: string,
  name: string,
  reason: string,
  panel: AdminPanel
) {
  await requireMasterAdmin();

  if (!discordId?.trim()) {
    throw new Error("Discord ID is required");
  }
  if (!name?.trim()) {
    throw new Error("Name is required");
  }
  if (!reason?.trim()) {
    throw new Error("Reason is required");
  }

  try {
    const permission = await prisma.adminPermission.upsert({
      where: {
        discordId_panel: {
          discordId: discordId.trim(),
          panel,
        },
      },
      update: {
        name: name.trim(),
        reason: reason.trim(),
      },
      create: {
        discordId: discordId.trim(),
        name: name.trim(),
        reason: reason.trim(),
        panel,
      },
    });

    revalidatePath("/master-admin");
    return { success: true, permission };
  } catch (error) {
    console.error("Error granting permission:", error);
    throw new Error("Failed to grant permission.");
  }
}

/**
 * Revoke permission with Discord ID confirmation, Reason, and Removed By name.
 * Also saves to audit log table `AdminPermissionRevocation`.
 */
export async function revokePermission(
  id: string,
  confirmDiscordId: string,
  reason: string,
  removedBy: string
) {
  await requireMasterAdmin();

  if (!confirmDiscordId?.trim()) {
    throw new Error("Confirmation Discord ID is required");
  }
  if (!reason?.trim()) {
    throw new Error("Revocation reason is required");
  }
  if (!removedBy?.trim()) {
    throw new Error("Removed By name is required");
  }

  try {
    const existing = await prisma.adminPermission.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Permission not found");
    }

    if (existing.discordId === DEV_DISCORD_ID || confirmDiscordId.trim() === DEV_DISCORD_ID) {
      throw new Error("The Developer role is permanent and cannot be revoked without changing the codebase directly.");
    }

    if (existing.discordId !== confirmDiscordId.trim()) {
      throw new Error("Provided Discord ID does not match the permission's Discord ID");
    }

    // Create revocation audit record
    await prisma.adminPermissionRevocation.create({
      data: {
        discordId: existing.discordId,
        name: existing.name || "Unknown",
        panel: existing.panel,
        reason: reason.trim(),
        removedBy: removedBy.trim(),
      },
    });

    // Delete active permission
    await prisma.adminPermission.delete({ where: { id } });

    revalidatePath("/master-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error revoking permission:", error);
    throw new Error(error?.message || "Failed to revoke permission.");
  }
}

export async function getPermissions() {
  await requireMasterAdmin();

  try {
    return await prisma.adminPermission.findMany({
      orderBy: { grantedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw new Error("Failed to fetch permissions.");
  }
}

export async function getRevocationHistory() {
  await requireMasterAdmin();

  try {
    return await prisma.adminPermissionRevocation.findMany({
      orderBy: { revokedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching revocation history:", error);
    throw new Error("Failed to fetch revocation history.");
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   OFFICIAL PARTNERS MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

export async function getPartners() {
  await requireMasterAdmin();

  try {
    return await prisma.companyPartner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw new Error("Failed to fetch partners.");
  }
}

export async function getPublicPartners() {
  try {
    const partners = await prisma.companyPartner.findMany({
      where: { hidden: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // If no partners exist in DB yet, seed default SwiftSnip partner
    if (partners.length === 0) {
      return [
        {
          id: "default-swiftsnip",
          name: "SwiftSnip",
          logo: "/swiftsnip-partner.png",
          websiteUrl: "https://swiftsnip.in/",
          description: "#1 Stream Clipping Tool for YouTube, Twitch & Kick",
          hidden: false,
          sortOrder: 0,
        },
      ];
    }

    return partners;
  } catch (error) {
    console.error("Error fetching public partners:", error);
    return [
      {
        id: "default-swiftsnip",
        name: "SwiftSnip",
        logo: "/swiftsnip-partner.png",
        websiteUrl: "https://swiftsnip.in/",
        description: "#1 Stream Clipping Tool for YouTube, Twitch & Kick",
        hidden: false,
        sortOrder: 0,
      },
    ];
  }
}

export async function addPartner(data: {
  name: string;
  logo: string;
  websiteUrl: string;
  description?: string;
}) {
  await requireMasterAdmin();

  if (!data.name?.trim()) {
    throw new Error("Partner name is required");
  }
  if (!data.websiteUrl?.trim()) {
    throw new Error("Partner website URL is required");
  }

  try {
    const partner = await prisma.companyPartner.create({
      data: {
        name: data.name.trim(),
        logo: data.logo?.trim() || "/swiftsnip-partner.png",
        websiteUrl: data.websiteUrl.trim(),
        description: data.description?.trim() || "",
        hidden: false,
      },
    });

    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true, partner };
  } catch (error: any) {
    console.error("Error adding partner:", error);
    throw new Error(error?.message || "Failed to add partner.");
  }
}

export async function updatePartner(
  id: string,
  data: {
    name?: string;
    logo?: string;
    websiteUrl?: string;
    description?: string;
    hidden?: boolean;
  }
) {
  await requireMasterAdmin();

  try {
    const partner = await prisma.companyPartner.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true, partner };
  } catch (error: any) {
    console.error("Error updating partner:", error);
    throw new Error(error?.message || "Failed to update partner.");
  }
}

export async function deletePartner(id: string) {
  await requireMasterAdmin();

  try {
    await prisma.companyPartner.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting partner:", error);
    throw new Error(error?.message || "Failed to delete partner.");
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   STREAMERS & MEDIA MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════ */

export async function getStreamerChannels() {
  await requireMasterAdmin();

  try {
    return await prisma.streamerChannel.findMany({
      orderBy: { addedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching streamer channels:", error);
    throw new Error("Failed to fetch streamer channels.");
  }
}

export async function getPublicStreamerConfig() {
  try {
    const [config, channels] = await Promise.all([
      prisma.streamerConfig.findUnique({ where: { id: 1 } }),
      prisma.streamerChannel.findMany({
        where: { status: "active" },
        orderBy: { addedAt: "desc" },
      }),
    ]);

    const keywords = (config?.keywords as string[]) || ["Flame City", "FlameCity", "FlameRP"];
    const ytApiKey = config?.ytApiKey || "AIzaSyAYvjR4F5-axVZBtxOlIrYnB4nubTDU8mA";
    const interval = config?.interval || 3;

    return {
      ytApiKey,
      keywords,
      interval,
      channels: channels || [],
    };
  } catch (error) {
    console.error("Error fetching streamer public config:", error);
    return {
      ytApiKey: "AIzaSyAYvjR4F5-axVZBtxOlIrYnB4nubTDU8mA",
      keywords: ["Flame City", "FlameCity", "FlameRP"],
      interval: 3,
      channels: [],
    };
  }
}

export async function getStreamerConfig() {
  await requireMasterAdmin();

  try {
    let config = await prisma.streamerConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await prisma.streamerConfig.create({
        data: {
          id: 1,
          ytApiKey: "AIzaSyAYvjR4F5-axVZBtxOlIrYnB4nubTDU8mA",
          keywords: ["Flame City", "FlameCity", "FlameRP"],
          interval: 3,
        },
      });
    }
    return {
      ...config,
      keywords: (config.keywords as string[]) || ["Flame City", "FlameCity", "FlameRP"],
    };
  } catch (error) {
    console.error("Error fetching streamer config:", error);
    throw new Error("Failed to fetch streamer config.");
  }
}

export async function updateStreamerConfig(data: {
  ytApiKey?: string;
  keywords?: string[];
  interval?: number;
}) {
  await requireMasterAdmin();

  try {
    const updated = await prisma.streamerConfig.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ytApiKey: data.ytApiKey ?? "AIzaSyAYvjR4F5-axVZBtxOlIrYnB4nubTDU8mA",
        keywords: data.keywords ?? ["Flame City", "FlameCity", "FlameRP"],
        interval: data.interval ?? 3,
      },
      update: {
        ...(data.ytApiKey !== undefined ? { ytApiKey: data.ytApiKey } : {}),
        ...(data.keywords !== undefined ? { keywords: data.keywords } : {}),
        ...(data.interval !== undefined ? { interval: data.interval } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true, config: updated };
  } catch (error: any) {
    console.error("Error updating streamer config:", error);
    throw new Error(error?.message || "Failed to update streamer config.");
  }
}

export async function addStreamerChannel(data: {
  platform: "youtube" | "kick";
  channelId: string;
  name: string;
  avatar?: string;
}) {
  await requireMasterAdmin();

  if (!data.channelId?.trim()) {
    throw new Error("Channel ID or handle is required");
  }

  try {
    const channel = await prisma.streamerChannel.upsert({
      where: {
        platform_channelId: {
          platform: data.platform,
          channelId: data.channelId.trim(),
        },
      },
      create: {
        platform: data.platform,
        channelId: data.channelId.trim(),
        name: data.name?.trim() || data.channelId.trim(),
        avatar: data.avatar || "",
        status: "active",
      },
      update: {
        name: data.name?.trim() || data.channelId.trim(),
        avatar: data.avatar || "",
        status: "active",
      },
    });

    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true, channel };
  } catch (error: any) {
    console.error("Error adding streamer channel:", error);
    throw new Error(error?.message || "Failed to add streamer channel.");
  }
}

export async function updateStreamerChannelStatus(
  id: string,
  status: "active" | "suspended" | "hidden"
) {
  await requireMasterAdmin();

  try {
    const channel = await prisma.streamerChannel.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true, channel };
  } catch (error: any) {
    console.error("Error updating streamer channel status:", error);
    throw new Error(error?.message || "Failed to update streamer status.");
  }
}

export async function deleteStreamerChannel(id: string) {
  await requireMasterAdmin();

  try {
    await prisma.streamerChannel.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/master-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting streamer channel:", error);
    throw new Error(error?.message || "Failed to delete streamer channel.");
  }
}

export async function getStreamHistory() {
  await requireMasterAdmin();

  try {
    return await prisma.streamHistoryLog.findMany({
      orderBy: { detectedAt: "desc" },
      take: 100,
    });
  } catch (error) {
    console.error("Error fetching stream history:", error);
    throw new Error("Failed to fetch stream history.");
  }
}

export async function clearStreamHistory() {
  await requireMasterAdmin();

  try {
    await prisma.streamHistoryLog.deleteMany({});
    revalidatePath("/master-admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error clearing stream history:", error);
    throw new Error(error?.message || "Failed to clear stream history.");
  }
}


