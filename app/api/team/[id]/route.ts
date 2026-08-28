import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

function isAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (!adminPassword) return false
  return req.headers.get("x-admin-password") === adminPassword
}

/** PUT /api/team/[id] — admin only: update a team member */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { name, role, description, image, platforms } = body

    if (!name?.trim() || !role?.trim()) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 })
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: name.trim(),
        role: role.trim(),
        description: description?.trim() ?? "",
        image: image ?? "",
        platforms: platforms ?? [],
      },
    })

    return NextResponse.json(member)
  } catch (err) {
    console.error("PUT /api/team/[id] error:", err)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

/** PATCH /api/team/[id] — admin only: toggle hidden status */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const member = await prisma.teamMember.update({
      where: { id },
      data: { hidden: body.hidden },
    })

    return NextResponse.json(member)
  } catch (err) {
    console.error("PATCH /api/team/[id] error:", err)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

/** DELETE /api/team/[id] — admin only: delete a team member */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.teamMember.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/team/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}
