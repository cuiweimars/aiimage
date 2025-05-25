import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserQuotaUsage } from "@/lib/creem"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const result = await getUserQuotaUsage(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching quota usage:", error)
    return NextResponse.json({ error: "Failed to fetch quota usage" }, { status: 500 })
  }
}
