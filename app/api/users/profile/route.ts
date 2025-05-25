import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { name, email, bio } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const { data: existingUser } = await supabase.from("users").select().eq("email", email).single()

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
      }
    }

    // Update user profile
    const { error } = await supabase
      .from("users")
      .update({
        name,
        email,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
