import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function isAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (!adminPassword) return false
  return req.headers.get("x-admin-password") === adminPassword
}

/** GET /api/team — public: returns visible members; with admin header: returns all */
export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get("all") === "true" && isAdmin(req)

    const members = await prisma.teamMember.findMany({
      where: showAll ? {} : { hidden: false },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })

    return NextResponse.json(members)
  } catch (err) {
    console.error("GET /api/team error:", err)
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}

/** POST /api/team — admin only: create a new team member */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, role, description, image, platforms } = body

    if (!name?.trim() || !role?.trim()) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 })
    }

    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        description: description?.trim() ?? "",
        image: image ?? "",
        platforms: platforms ?? [],
        hidden: false,
        sortOrder: 0,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (err) {
    console.error("POST /api/team error:", err)
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}
