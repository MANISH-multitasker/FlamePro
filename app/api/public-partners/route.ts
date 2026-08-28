import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const partners = await prisma.companyPartner.findMany({
      where: { hidden: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (!partners || partners.length === 0) {
      return NextResponse.json([
        {
          id: "default-swiftsnip",
          name: "SwiftSnip",
          logo: "/swiftsnip-partner.png",
          websiteUrl: "https://swiftsnip.in/",
          description: "#1 Stream Clipping Tool for YouTube, Twitch & Kick",
          hidden: false,
          sortOrder: 0,
        },
      ]);
    }

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error in public-partners API:", error);
    return NextResponse.json([
      {
        id: "default-swiftsnip",
        name: "SwiftSnip",
        logo: "/swiftsnip-partner.png",
        websiteUrl: "https://swiftsnip.in/",
        description: "#1 Stream Clipping Tool for YouTube, Twitch & Kick",
        hidden: false,
        sortOrder: 0,
      },
    ]);
  }
}
