import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resetUserQuota } from "@/lib/creem"

// 注意：此路由仅用于测试目的，生产环境中应该移除
// Note: This route is for testing purposes only and should be removed in production
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // 检查是否是管理员
    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await resetUserQuota(userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "User quota reset successfully" })
  } catch (error) {
    console.error("Error resetting user quota:", error)
    return NextResponse.json({ error: "Failed to reset user quota" }, { status: 500 })
  }
}
