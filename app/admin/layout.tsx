import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isMasterOrDev } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      redirect("/applications");
    }

    const discordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    });

    if (!discordAccount) {
      redirect("/applications");
    }

    // Master Admin / Dev has access to all panels
    if (isMasterOrDev(discordAccount.accountId)) {
      return <>{children}</>;
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
      redirect("/applications");
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/applications");
  }

  return <>{children}</>;
}
