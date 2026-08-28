"use server";

import { prisma } from "@/lib/db";
import { ApplicationStatus, FormType, AdminPanel } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isMasterOrDev } from "@/lib/admin-auth";

/**
 * Ensures the caller is authenticated via Discord and has APPLICATION admin permission
 * granted by the Master Admin (or is the Master Admin / Developer).
 */
async function requireApplicationAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in with Discord");
  }

  const discordAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "discord",
    },
  });

  if (!discordAccount) {
    throw new Error("Unauthorized: Discord account not linked");
  }

  // Master Admin / Developer Discord ID bypass
  if (isMasterOrDev(discordAccount.accountId)) {
    return;
  }

  const permission = await prisma.adminPermission.findUnique({
    where: {
      discordId_panel: {
        discordId: discordAccount.accountId,
        panel: "APPLICATION",
      },
    },
  });

  if (!permission) {
    throw new Error("Unauthorized: You do not have permission to access the Application Admin panel.");
  }
}

/**
 * Check if the currently logged-in user has permission for a specific panel.
 */
export async function checkMyPermission(panel: AdminPanel): Promise<{ hasAccess: boolean }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { hasAccess: false };
    }

    const discordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    });

    if (!discordAccount) {
      return { hasAccess: false };
    }

    if (isMasterOrDev(discordAccount.accountId)) {
      return { hasAccess: true };
    }

    const permission = await prisma.adminPermission.findUnique({
      where: {
        discordId_panel: {
          discordId: discordAccount.accountId,
          panel,
        },
      },
    });

    return { hasAccess: !!permission };
  } catch (error) {
    console.error("Error checking permission:", error);
    return { hasAccess: false };
  }
}

const DISCORD_APPOINTMENT_CHANNEL = "1488262212866019348";

const TitleByFormType: Record<FormType, string> = {
  REGIONAL_STAFF: "FLAME CITY STAFF",
  PD: "SAN ANDREAS STATE POLICE",
  EMS: "LOS SANTOS EMERGENCY MEDICAL SERVICES",
  STREAMER: "SAN ANDREAS STREAMER APPLICATION",
};

function getWebhookUrl(formType: FormType) {
  const webhookByFormType: Record<FormType, string | undefined> = {
    REGIONAL_STAFF: process.env.DISCORD_WEBHOOK_URL_REGIONAL_STAFF || process.env.DISCORD_WEBHOOK_URL,
    PD: process.env.DISCORD_WEBHOOK_URL_PD || process.env.DISCORD_WEBHOOK_URL,
    EMS: process.env.DISCORD_WEBHOOK_URL_EMS || process.env.DISCORD_WEBHOOK_URL,
    STREAMER: process.env.DISCORD_WEBHOOK_URL_STREAMER || process.env.DISCORD_WEBHOOK_URL,
  };

  const webhookUrl = webhookByFormType[formType] || process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error(`Missing Discord webhook URL for form type: ${formType}`);
  }

  return webhookUrl;
}

export async function getPendingForms() {
  await requireApplicationAdmin();

  try {
    return await prisma.application.findMany({
      where: {
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.log("Error fetching pending forms:", error);
    throw new Error("Failed to fetch pending forms.");
  }
}

export async function reviewApplication(
  id: string,
  status: typeof ApplicationStatus.ACCEPTED | typeof ApplicationStatus.REJECTED,
  formType: FormType,
  userId: string,
) {
  await requireApplicationAdmin();

  console.log("[reviewApplication] called", {
    id,
    status,
    formType,
    title: TitleByFormType[formType],
  });

  try {
    await prisma.application.update({
      where: { id },
      data: { status },
    });

    if (status === ApplicationStatus.ACCEPTED) {
      await sendSuccessMessageToDiscord(userId, formType);
    } else {
      await sendRejectionMessageToDiscord(userId, formType);
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.log("Error reviewing application:", error);
    throw new Error("Failed to review application.");
  }
}

async function getDiscordId(userId: string) {
  const discordAccount = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "discord",
    },
  });

  if (!discordAccount) {
    throw new Error("Discord account not found");
  }

  return discordAccount.accountId;
}

async function postDiscordWebhook(
  webhookUrl: string,
  payload: {
    content: string;
    embeds?: Array<Record<string, unknown>>;
  },
) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed with status ${response.status}`);
  }
}

async function sendSuccessMessageToDiscord(userId: string, formType: FormType) {
  console.log("[sendSuccessMessageToDiscord]", TitleByFormType[formType]);

  const discordId = await getDiscordId(userId);
  const webhookUrl = getWebhookUrl(formType);

  if (formType === "REGIONAL_STAFF") {
    await postDiscordWebhook(webhookUrl, {
      content: `<@${discordId}> Congratulations! 🎉 You have been selected as @Support Staff.`,
    });
    return;
  }

  await postDiscordWebhook(webhookUrl, {
    content: `<@${discordId}>`,
    embeds: [
      {
        title: TitleByFormType[formType],
        description: `🎉 **Congratulations!**

<@${discordId}>

${formType !== "REGIONAL_STAFF" ? `You have been **ACCEPTED** for an interview in the ${formType === "PD" ? "SASP" : "LOS SANTOS EMS"}.` : "You have been selected for the staffing service in Flame city."}

Please take an appointment for your interview in <#${DISCORD_APPOINTMENT_CHANNEL}>`,
        ...(formType !== "REGIONAL_STAFF" && {
          image: {
            url:
              formType === "EMS"
                ? "https://res.cloudinary.com/dinmal6os/image/upload/v1786643245/Flame-City-DOJ-Approved_dkafnh.png"
                : "https://res.cloudinary.com/dinmal6os/image/upload/v1786475856/Screenshot_2026-08-12_004527_c0dqte.png",
          },
        }),
        footer: {
          text: "Flame City Roleplay",
        },
      },
    ],
  });
}

async function sendRejectionMessageToDiscord(userId: string, formType: FormType) {
  console.log("[sendRejectionMessageToDiscord]", TitleByFormType[formType]);

  const discordId = await getDiscordId(userId);
  const webhookUrl = getWebhookUrl(formType);

  if (formType === "REGIONAL_STAFF") {
    await postDiscordWebhook(webhookUrl, {
      content: `<@${discordId}> Thank you for applying. Unfortunately, you have not been selected for the @Support Staff position at this time.`,
    });
    return;
  }

  await postDiscordWebhook(webhookUrl, {
    content: `<@${discordId}>`,
    embeds: [
      {
        title: TitleByFormType[formType],
        description: `📋 **We appreciate your interest in joining the ${formType === "PD" ? "SASP" : formType === "REGIONAL_STAFF" ? "FLAME CITY STAFF" : "LOS SANTOS EMS"}**

<@${discordId}>

After reviewing your application, we regret to inform you that it has been **REJECTED**.

For any questions, please visit <#${DISCORD_APPOINTMENT_CHANNEL}>`,
        ...(formType !== "REGIONAL_STAFF" && {
          image: {
            url:
              formType === "EMS"
                ? "https://res.cloudinary.com/dinmal6os/image/upload/v1786643245/Flame-City-DOJ-Rejected_cz7k87.png"
                : "https://res.cloudinary.com/dinmal6os/image/upload/v1786475888/Screenshot_2026-08-12_004757_cmnb90.png",
          },
        }),
        footer: {
          text: "Flame City Roleplay",
        },
      },
    ],
  });
}
