import { cookies, headers } from "next/headers";

/**
 * Hardcoded Developer Discord ID.
 * This role is permanent and non-removable without changing the code directly.
 */
export const DEV_DISCORD_ID = "745139762909675561";

/**
 * Helper to check if a Discord account ID belongs to either the hardcoded Developer
 * or the Master Admin ID configured in .env.
 */
export function isMasterOrDev(discordId?: string | null): boolean {
  if (!discordId) return false;
  const id = discordId.trim();
  if (id === DEV_DISCORD_ID) return true;
  if (process.env.MASTER_ADMIN_DISCORD_ID?.trim() === id) return true;
  if (process.env.ADMIN_DISCORD_ID?.trim() === id) return true;
  return false;
}

/** Reads the admin password fresh from env on every call — never cached. */
export function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (!pw) {
    throw new Error(
      "[admin-auth] ADMIN_PASSWORD is not set in your environment variables. " +
      'Add ADMIN_PASSWORD="your-secure-password" to your .env file.'
    );
  }
  return pw;
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const adminPassword = getAdminPassword();

    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("admin_auth")?.value;
    if (adminCookie === adminPassword) {
      return true;
    }

    const reqHeaders = await headers();
    const headerPass = reqHeaders.get("x-admin-password");
    if (headerPass === adminPassword) {
      return true;
    }
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("checkIsAdmin error:", err);
  }

  return false;
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function setAdminAuth(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();
  if (password === adminPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", adminPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return true;
  }
  return false;
}

export async function clearAdminAuth() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
}
