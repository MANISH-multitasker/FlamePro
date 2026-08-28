import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isMasterOrDev } from "@/lib/admin-auth";

export default async function MasterAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      redirect("/");
    }

    const discordAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "discord",
      },
    });

    if (!discordAccount || !isMasterOrDev(discordAccount.accountId)) {
      redirect("/");
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/");
  }

  return <>{children}</>;
}
